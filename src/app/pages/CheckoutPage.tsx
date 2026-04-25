import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, ChevronRight, ShieldCheck, Loader2, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { orderApi, IShippingAddressPayload } from '../api/order.api';
import { toast } from 'sonner';
declare global {
  interface Window { Razorpay: any; }
}
const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script    = document.createElement("script");
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });

const emptyAddress = (): IShippingAddressPayload => ({
  fullName:     "",
  phone:        "",
  houseNo:      "",
  addressLine1: "",
  addressLine2: "",
  city:         "",
  state:        "",
  pincode:      "",
});

export function CheckoutPage() {
  const navigate       = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user }       = useAuth() as any;

  const shippingCost   = subtotal >= 499 ? 0 : 99;
  const total          = subtotal + shippingCost;

  const savedAddresses: IShippingAddressPayload[] = user?.addresses ?? [];
  const [selectedIdx, setSelectedIdx]     = useState<number | null>(
    savedAddresses.length > 0 ? 0 : null
  );
  const [showNewForm, setShowNewForm]     = useState(savedAddresses.length === 0);
  const [newAddress, setNewAddress]       = useState<IShippingAddressPayload>(emptyAddress());
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const activeAddress: IShippingAddressPayload | null = showNewForm
    ? newAddress
    : selectedIdx !== null
      ? savedAddresses[selectedIdx]
      : null;

  const isAddressValid = (): boolean => {
    if (!activeAddress) return false;
    const { fullName, phone, addressLine1, city, state, pincode } = activeAddress;
    return !!(fullName && phone && addressLine1 && city && state && pincode);
  };

  const handleCheckout = async () => {
    if (!isAddressValid()) { toast.error("Please fill in all required address fields."); return; }
    if (items.length === 0) { toast.error("Your cart is empty."); return; }

    setIsPlacingOrder(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please refresh and try again.");
        setIsPlacingOrder(false);
        return;
      }

      const createRes = await orderApi.create(activeAddress!);
      const {
        razorpayOrderId,
        amount,
        baseAmount,
        shippingCost: serverShipping,
        orderItems,
        shippingAddress,
      } = createRes.data;

      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      amount * 100,  // paise
        currency:    "INR",
        name:        "Tuberose",
        description: "Skincare Order",
        order_id:    razorpayOrderId,
        prefill: {
          name:    shippingAddress.fullName,
          contact: shippingAddress.phone,
          email:   user?.email ?? "",
        },
        theme: { color: "#171717" },

        handler: async (response: {
          razorpay_order_id:   string;
          razorpay_payment_id: string;
          razorpay_signature:  string;
        }) => {
          try {
            const verifyRes = await orderApi.verify({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              shippingAddress,
              orderItems,
              baseAmount,
              shippingCost:  serverShipping,
              totalAmount:   amount,
            });

            await clearCart();
            toast.success("Order placed successfully! 🎉");
            navigate(`/order/${verifyRes.data.orderId}`);
          } catch (err: any) {
            toast.error(err?.message ?? "Payment verification failed. Please contact support.");
            setIsPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
            toast.error("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsPlacingOrder(false);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }
  return (
    <div className="pt-32 pb-32 min-h-screen bg-neutral-50/50">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-light mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <MapPin size={20} />
                Delivery Address
              </h2>

              {savedAddresses.length > 0 && (
                <div className="space-y-3 mb-5">
                  {savedAddresses.map((addr, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => { setSelectedIdx(idx); setShowNewForm(false); }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedIdx === idx && !showNewForm
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{addr.fullName}</p>
                          <p className="text-sm text-neutral-500 mt-0.5">
                            {addr.houseNo ? `${addr.houseNo}, ` : ""}
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          <p className="text-sm text-neutral-500 mt-0.5">{addr.phone}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {(addr as any).isDefault && (
                            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                          {selectedIdx === idx && !showNewForm && (
                            <Check size={16} className="text-neutral-900" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowNewForm(!showNewForm);
                  if (!showNewForm) setSelectedIdx(null);
                  else if (savedAddresses.length > 0) setSelectedIdx(0);
                }}
                className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Plus size={16} />
                {showNewForm ? "Cancel — use saved address" : "Add a new address"}
              </button>

              <AnimatePresence>
                {showNewForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                      {(
                        [
                          { key: "fullName",     label: "Full Name *",               col: 1 },
                          { key: "phone",        label: "Phone Number *",            col: 1 },
                          { key: "houseNo",      label: "House / Flat No.",          col: 2 },
                          { key: "addressLine1", label: "Address Line 1 *",          col: 2 },
                          { key: "addressLine2", label: "Address Line 2 (optional)", col: 2 },
                          { key: "city",         label: "City *",                    col: 1 },
                          { key: "state",        label: "State *",                   col: 1 },
                          { key: "pincode",      label: "Pincode *",                 col: 1 },
                        ] as { key: keyof IShippingAddressPayload; label: string; col: number }[]
                      ).map(({ key, label, col }) => (
                        <div key={key} className={col === 2 ? "sm:col-span-2" : ""}>
                          <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                            {label}
                          </label>
                          <input
                            type="text"
                            value={newAddress[key] ?? ""}
                            onChange={(e) =>
                              setNewAddress((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors bg-neutral-50/50"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
              <h2 className="text-xl font-medium mb-6">
                Order Items
                <span className="text-sm font-normal text-neutral-400 ml-2">({items.length})</span>
              </h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const thumbnail =
                    item.product.image?.find((img) => img.isThumbnail)?.url ??
                    item.product.image?.[0]?.url ??
                    "";
                  return (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={thumbnail}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {item.sizeLabel} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">
                        ₹{(item.finalPrice * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 sticky top-24">
              <h3 className="text-xl font-medium mb-6">Payment Summary</h3>

              <div className="space-y-3 text-sm text-neutral-600 border-b border-neutral-100 pb-5 mb-5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-900 font-medium">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-medium" : "text-neutral-900 font-medium"}>
                    {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-medium text-neutral-900">Total</span>
                <span className="text-2xl font-semibold text-neutral-900">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={isPlacingOrder || !isAddressValid()}
                className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{total.toLocaleString("en-IN")}
                    <ChevronRight size={16} />
                  </>
                )}
              </motion.button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
                <ShieldCheck size={13} />
                Secured by Razorpay
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}