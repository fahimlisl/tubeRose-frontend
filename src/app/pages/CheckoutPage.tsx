import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Plus, ChevronRight, ShieldCheck, Loader2,
  Check, Tag, Banknote, CreditCard, Save, X,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { orderApi, IShippingAddressPayload } from "../api/order.api";
import { userProfileApi, pincodeApi } from "../api/user.api";
import { AuthModal } from "../components/Authmodal.tsx";
import { toast } from "sonner";

declare global {
  interface Window { Razorpay: any; }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const emptyAddress = (): IShippingAddressPayload => ({
  fullName: "", phone: "", houseNo: "",
  addressLine1: "", addressLine2: "",
  city: "", state: "", pincode: "",
});

interface ServiceabilityResult {
  serviceable: boolean;
  cod: boolean;
  courierName: string;
  estimatedDays: number;
}

interface LocationState {
  discount?: { code: string; amount: number };
  walletUsage?: { deduction: number };
  shippingCost?: number;
}

type PaymentMethod = "online" | "cod";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth() as any;

  const discount = (location.state as LocationState)?.discount ?? null;
  const discountAmount = discount ? Number(discount.amount) : 0;
  const walletUsage = (location.state as LocationState)?.walletUsage ?? null;
  const walletDeduction = walletUsage?.deduction ?? 0;
  const shippingCost =
    (location.state as LocationState)?.shippingCost ?? (subtotal >= 499 ? 0 : 99);
  const total = subtotal + shippingCost - discountAmount - walletDeduction;

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState<IShippingAddressPayload>(emptyAddress());
  const [savingAddress, setSavingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [serviceability, setServiceability] = useState<ServiceabilityResult | null>(null);
  const [serviceabilityLoading, setServiceabilityLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items.length]);

  const fetchProfile = () => {
    if (!user) return;
    setProfileLoading(true);
    userProfileApi
      .get()
      .then((res) => setProfile(res?.data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const savedAddresses: IShippingAddressPayload[] = profile?.addresses ?? [];

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setShowNewForm(true);
      setSelectedIdx(null);
      return;
    }
    const defaultIdx = savedAddresses.findIndex((a: any) => a.isDefault);
    setSelectedIdx(defaultIdx >= 0 ? defaultIdx : 0);
    setShowNewForm(false);
  }, [savedAddresses.length]);

  const activePincode =
    selectedIdx !== null && !showNewForm
      ? (savedAddresses[selectedIdx] as any)?.pincode ?? null
      : null;

  useEffect(() => {
    setServiceability(null);
    setPaymentMethod("online");

    if (!activePincode || !/^\d{6}$/.test(activePincode)) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setServiceabilityLoading(true);
      try {
        const res = await pincodeApi.check(activePincode);
        const d = res.data;
        if (!d.serviceable) {
          setServiceability({ serviceable: false, cod: false, courierName: "", estimatedDays: 0 });
          toast.error("Delivery not available at this pincode.");
        } else {
          setServiceability({
            serviceable: true,
            cod: d.bestOption?.cod ?? false,
            courierName: d.bestOption?.courierName ?? "",
            estimatedDays: d.bestOption?.estimatedDays ?? 0,
          });
        }
      } catch {
        setServiceability(null);
        toast.error("Could not verify delivery at this pincode.");
      } finally {
        setServiceabilityLoading(false);
      }
    }, 500);
  }, [activePincode]);

  const activeAddress: IShippingAddressPayload | null =
    selectedIdx !== null && !showNewForm ? savedAddresses[selectedIdx] : null;

  const isAddressConfirmed = activeAddress !== null;

  const isNewAddressValid = (): boolean => {
    const { fullName, phone, addressLine1, city, state, pincode } = newAddress;
    return !!(fullName && phone && addressLine1 && city && state && pincode);
  };

  const handleSaveNewAddress = async () => {
    if (!isNewAddressValid()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSavingAddress(true);
    try {
      await userProfileApi.addAddress(newAddress);
      toast.success("Address saved!");
      setNewAddress(emptyAddress());
      setShowNewForm(false);
      // refetch profile so new address appears and gets auto-selected
      await fetchProfile();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const initiateOnlinePayment = async () => {
    if (!activeAddress) { toast.error("Please select a delivery address."); return; }
    if (items.length === 0) { toast.error("Your cart is empty."); return; }
    setIsPlacingOrder(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please refresh and try again.");
        setIsPlacingOrder(false);
        return;
      }
      const cartCategories = [...new Set(items.map((item: any) => item.product.category))];
      const createRes = await orderApi.create(
        activeAddress,
        discount ?? undefined,
        cartCategories,
        walletDeduction > 0,
      );
      const {
        razorpayOrderId, amount, baseAmount,
        shippingCost: serverShipping, orderItems,
        shippingAddress, walletDeduction: serverWalletDeduction,
      } = createRes.data;

      const finalAmountToPay = amount;
      const finalWalletDeduction = serverWalletDeduction ?? walletDeduction;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: finalAmountToPay * 100,
        currency: "INR",
        name: "TubeRose",
        description: `Skincare Order — ₹${finalAmountToPay.toLocaleString("en-IN")}`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
          email: user?.email ?? "",
        },
        theme: { color: "#171717" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await orderApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              shippingAddress, orderItems, baseAmount,
              shippingCost: serverShipping,
              totalAmount: finalAmountToPay,
              cartCategories,
              ...(discount ? { discount } : {}),
              ...(finalWalletDeduction > 0
                ? { walletUsage: true, walletDeduction: finalWalletDeduction }
                : {}),
            });
            await clearCart();
            toast.success("Order placed successfully! 🎉");
            navigate(`/order/${verifyRes.data.orderId}`);
          } catch (err: any) {
            toast.error(err?.message ?? "Payment verification failed. Contact support.");
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
  const initiateCodOrder = async () => {
    if (!activeAddress) { toast.error("Please select a delivery address."); return; }
    if (!serviceability?.cod) { toast.error("COD is not available at your pincode."); return; }
    if (items.length === 0) { toast.error("Your cart is empty."); return; }
    setIsPlacingOrder(true);
    try {
      const cartCategories = [...new Set(items.map((item: any) => item.product.category))];
      const res = await orderApi.createCod({
        shippingAddress: activeAddress,
        discount: discount ?? undefined,
        cartCategories,
        walletUsage: walletDeduction > 0,
      });
      await clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate(`/order/${res.data.orderId}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePayClick = () => {
    if (!user) { setShowAuthModal(true); return; }
    if (paymentMethod === "cod") initiateCodOrder();
    else initiateOnlinePayment();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setTimeout(() => {
      if (paymentMethod === "cod") initiateCodOrder();
      else initiateOnlinePayment();
    }, 300);
  };

  return (
    <>
      <div className="pt-32 pb-32 min-h-screen bg-neutral-50/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-light mb-12">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
                <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                  <MapPin size={20} /> Delivery Address
                </h2>

                {profileLoading && (
                  <div className="flex items-center gap-2 text-sm text-neutral-400 mb-5">
                    <Loader2 size={15} className="animate-spin" />
                    Loading saved addresses…
                  </div>
                )}

                {!profileLoading && savedAddresses.length > 0 && !showNewForm && (
                  <div className="space-y-3 mb-5">
                    {savedAddresses.map((addr: any, idx: number) => (
                      <motion.button
                        key={idx}
                        onClick={() => {
                          setSelectedIdx(idx);
                          setServiceability(null);
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedIdx === idx
                            ? "border-neutral-900 bg-neutral-50"
                            : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-sm">{addr.fullName}</p>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full shrink-0">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-500">
                              {addr.houseNo ? `${addr.houseNo}, ` : ""}
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                            <p className="text-sm text-neutral-500 mt-0.5">{addr.phone}</p>
                          </div>
                          {selectedIdx === idx && (
                            <Check size={18} className="text-neutral-900 shrink-0 mt-0.5" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {!profileLoading && !showNewForm && (
                  <button
                    onClick={() => {
                      setShowNewForm(true);
                      setSelectedIdx(null);
                      setServiceability(null);
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors mt-2"
                  >
                    <Plus size={16} /> Add a new address
                  </button>
                )}

                <AnimatePresence>
                  {showNewForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {savedAddresses.length > 0 && (
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-neutral-700">New Address</p>
                          <button
                            onClick={() => {
                              setShowNewForm(false);
                              const defaultIdx = savedAddresses.findIndex((a: any) => a.isDefault);
                              setSelectedIdx(defaultIdx >= 0 ? defaultIdx : 0);
                            }}
                            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                          >
                            <X size={13} /> Cancel
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(
                          [
                            { key: "fullName",     label: "Full Name *",              col: 1 },
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

                      <button
                        onClick={handleSaveNewAddress}
                        disabled={savingAddress || !isNewAddressValid()}
                        className="mt-5 flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingAddress
                          ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                          : <><Save size={15} /> Save Address</>
                        }
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isAddressConfirmed && serviceabilityLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-4 flex items-center gap-2 text-sm text-neutral-400"
                    >
                      <Loader2 size={14} className="animate-spin" />
                      Checking delivery availability…
                    </motion.div>
                  )}
                  {isAddressConfirmed && !serviceabilityLoading && serviceability && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`mt-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
                        serviceability.serviceable
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      {serviceability.serviceable ? (
                        <>
                          <Check size={15} className="shrink-0" />
                          <span>
                            Delivery via <strong>{serviceability.courierName}</strong> in{" "}
                            {serviceability.estimatedDays} day{serviceability.estimatedDays !== 1 ? "s" : ""}.
                            {" "}{serviceability.cod
                              ? "Cash on Delivery available."
                              : "COD not available at this pincode."}
                          </span>
                        </>
                      ) : (
                        <span>Delivery not available at this pincode.</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {isAddressConfirmed && !serviceabilityLoading && serviceability?.serviceable && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100"
                  >
                    <h2 className="text-xl font-medium mb-6">Payment Method</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      <button
                        onClick={() => setPaymentMethod("online")}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          paymentMethod === "online"
                            ? "border-neutral-900 bg-neutral-50"
                            : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          paymentMethod === "online" ? "bg-neutral-900" : "bg-neutral-100"
                        }`}>
                          <CreditCard size={18} className={paymentMethod === "online" ? "text-white" : "text-neutral-500"} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-neutral-900">Pay Online</p>
                          <p className="text-xs text-neutral-500">UPI, Card, Net Banking</p>
                        </div>
                        {paymentMethod === "online" && (
                          <Check size={16} className="text-neutral-900 ml-auto shrink-0" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (!serviceability?.cod) return;
                          setPaymentMethod("cod");
                        }}
                        disabled={!serviceability?.cod}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          !serviceability?.cod
                            ? "opacity-40 cursor-not-allowed border-neutral-200"
                            : paymentMethod === "cod"
                              ? "border-neutral-900 bg-neutral-50"
                              : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          paymentMethod === "cod" ? "bg-neutral-900" : "bg-neutral-100"
                        }`}>
                          <Banknote size={18} className={paymentMethod === "cod" ? "text-white" : "text-neutral-500"} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-neutral-900">Cash on Delivery</p>
                          <p className="text-xs text-neutral-500">
                            {serviceability?.cod ? "Pay when delivered" : "Not available at your pincode"}
                          </p>
                        </div>
                        {paymentMethod === "cod" && (
                          <Check size={16} className="text-neutral-900 ml-auto shrink-0" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
                <h2 className="text-xl font-medium mb-6">
                  Order Items
                  <span className="text-sm font-normal text-neutral-400 ml-2">({items.length})</span>
                </h2>
                <div className="space-y-4">
                  {items.map((item: any) => {
                    const thumbnail =
                      item.product.image?.find((img: any) => img.isThumbnail)?.url ??
                      item.product.image?.[0]?.url ?? "";
                    return (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden shrink-0">
                          <img src={thumbnail} alt={item.product.title} className="w-full h-full object-cover" />
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
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 sticky top-24 space-y-6">
                <h3 className="text-xl font-medium">Payment Summary</h3>

                {discount && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <Tag size={14} className="text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green-800 font-mono">{discount.code}</p>
                      <p className="text-xs text-green-600">
                        −₹{discountAmount.toLocaleString("en-IN")} discount applied
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-sm text-neutral-600 border-b border-neutral-100 pb-5">
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
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">Discount ({discount?.code})</span>
                      <span className="text-green-600 font-medium">
                        −₹{discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {walletDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">Wallet</span>
                      <span className="text-green-600 font-medium">
                        −₹{walletDeduction.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-neutral-900">Total</span>
                  <div className="text-right">
                    {discountAmount > 0 && (
                      <p className="text-xs text-neutral-400 line-through">
                        ₹{(subtotal + shippingCost).toLocaleString("en-IN")}
                      </p>
                    )}
                    <span className="text-2xl font-semibold text-neutral-900">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {paymentMethod === "cod" && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <Banknote size={14} className="text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800">
                      Pay <strong>₹{total.toLocaleString("en-IN")}</strong> in cash when your order arrives.
                    </p>
                  </div>
                )}

                {!isAddressConfirmed && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-500 text-center">
                    Save and select a delivery address to continue
                  </div>
                )}

                {!user && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-500 text-center">
                    You'll be asked to sign in before payment
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayClick}
                  disabled={isPlacingOrder || !isAddressConfirmed || !serviceability?.serviceable}
                  className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : paymentMethod === "cod" ? (
                    <><Banknote size={16} /> Place Order (COD)</>
                  ) : (
                    <>Pay ₹{total.toLocaleString("en-IN")} <ChevronRight size={16} /></>
                  )}
                </motion.button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
                  <ShieldCheck size={13} />
                  {paymentMethod === "cod" ? "Order secured by Tuberose" : "Secured by Razorpay"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
} 