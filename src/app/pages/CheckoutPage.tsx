import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Plus,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Check,
  Tag,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { orderApi, IShippingAddressPayload } from "../api/order.api";
import { userProfileApi } from "../api/user.api";
import { AuthModal } from "../components/Authmodal.tsx";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const emptyAddress = (): IShippingAddressPayload => ({
  fullName: "",
  phone: "",
  houseNo: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
});

interface LocationState {
  discount?: { code: string; amount: number };
  walletUsage?: { deduction: number };
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth() as any;

  const discount = (location.state as LocationState)?.discount ?? null;
  const discountAmount = discount ? Number(discount.amount) : 0;
  const walletUsage = (location.state as LocationState)?.walletUsage ?? null;
  const walletDeduction = walletUsage?.deduction ?? 0;

  const shippingCost = subtotal >= 499 ? 0 : 99;
  const total = subtotal + shippingCost - discountAmount - walletDeduction;

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(true);
  const [newAddress, setNewAddress] =
    useState<IShippingAddressPayload>(emptyAddress());
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items.length]);
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    userProfileApi
      .get()
      .then((res) => setProfile(res?.data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
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

  const activeAddress: IShippingAddressPayload | null = showNewForm
    ? newAddress
    : selectedIdx !== null
      ? savedAddresses[selectedIdx]
      : null;

  const isAddressValid = (): boolean => {
    if (!activeAddress) return false;
    const { fullName, phone, addressLine1, city, state, pincode } =
      activeAddress;
    return !!(fullName && phone && addressLine1 && city && state && pincode);
  };

  const initiatePayment = async () => {
    if (!isAddressValid()) {
      toast.error("Please fill in all required address fields.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error(
          "Failed to load payment gateway. Please refresh and try again.",
        );
        setIsPlacingOrder(false);
        return;
      }
      const cartCategories = [
        ...new Set(items.map((item: any) => item.product.category)),
      ];

      const createRes = await orderApi.create(
        activeAddress!,
        discount ?? undefined,
        cartCategories,
        walletDeduction > 0 ? true : false,
      );
      const {
        razorpayOrderId,
        amount,
        baseAmount,
        shippingCost: serverShipping,
        orderItems,
        shippingAddress,
        walletDeduction: serverWalletDeduction,
      } = createRes.data;

      const finalAmountToPay = amount;
      const finalWalletDeduction = serverWalletDeduction ?? walletDeduction;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: finalAmountToPay * 100,
        currency: "INR",
        name: "TubeRose",
        description: `Skincare Order - Final Amount: ₹${finalAmountToPay.toLocaleString("en-IN")}`,
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
              shippingAddress,
              orderItems,
              baseAmount,
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
            toast.error(
              err?.message ?? "Payment verification failed. Contact support.",
            );
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

  const handlePayClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    initiatePayment();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setTimeout(() => initiatePayment(), 300);
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
                  <MapPin size={20} />
                  Delivery Address
                </h2>

                {profileLoading && (
                  <div className="flex items-center gap-2 text-sm text-neutral-400 mb-5">
                    <Loader2 size={15} className="animate-spin" />
                    Loading saved addresses…
                  </div>
                )}
                {!profileLoading && savedAddresses.length > 0 && (
                  <div className="space-y-3 mb-5">
                    {savedAddresses.map((addr: any, idx: number) => (
                      <motion.button
                        key={idx}
                        onClick={() => {
                          setSelectedIdx(idx);
                          setShowNewForm(false);
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedIdx === idx && !showNewForm
                            ? "border-neutral-900 bg-neutral-50"
                            : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-sm">
                                {addr.fullName}
                              </p>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full shrink-0">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-500">
                              {addr.houseNo ? `${addr.houseNo}, ` : ""}
                              {addr.addressLine1}
                              {addr.addressLine2
                                ? `, ${addr.addressLine2}`
                                : ""}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                            <p className="text-sm text-neutral-500 mt-0.5">
                              {addr.phone}
                            </p>
                          </div>
                          {selectedIdx === idx && !showNewForm && (
                            <Check
                              size={18}
                              className="text-neutral-900 shrink-0 mt-0.5"
                            />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
                {!profileLoading && (
                  <button
                    onClick={() => {
                      if (showNewForm && savedAddresses.length > 0) {
                        setShowNewForm(false);
                        setSelectedIdx((prev) => prev ?? 0);
                      } else {
                        setShowNewForm(true);
                        setSelectedIdx(null);
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <Plus size={16} />
                    {showNewForm && savedAddresses.length > 0
                      ? "Cancel — use saved address"
                      : "Add a new address"}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                        {(
                          [
                            { key: "fullName", label: "Full Name *", col: 1 },
                            { key: "phone", label: "Phone Number *", col: 1 },
                            {
                              key: "houseNo",
                              label: "House / Flat No.",
                              col: 2,
                            },
                            {
                              key: "addressLine1",
                              label: "Address Line 1 *",
                              col: 2,
                            },
                            {
                              key: "addressLine2",
                              label: "Address Line 2 (optional)",
                              col: 2,
                            },
                            { key: "city", label: "City *", col: 1 },
                            { key: "state", label: "State *", col: 1 },
                            { key: "pincode", label: "Pincode *", col: 1 },
                          ] as {
                            key: keyof IShippingAddressPayload;
                            label: string;
                            col: number;
                          }[]
                        ).map(({ key, label, col }) => (
                          <div
                            key={key}
                            className={col === 2 ? "sm:col-span-2" : ""}
                          >
                            <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                              {label}
                            </label>
                            <input
                              type="text"
                              value={newAddress[key] ?? ""}
                              onChange={(e) =>
                                setNewAddress((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
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
                  <span className="text-sm font-normal text-neutral-400 ml-2">
                    ({items.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {items.map((item: any) => {
                    const thumbnail =
                      item.product.image?.find((img: any) => img.isThumbnail)
                        ?.url ??
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
                          <p className="text-sm font-medium line-clamp-1">
                            {item.product.title}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {item.sizeLabel} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">
                          ₹
                          {(item.finalPrice * item.quantity).toLocaleString(
                            "en-IN",
                          )}
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
                      <p className="text-xs font-semibold text-green-800 font-mono">
                        {discount.code}
                      </p>
                      <p className="text-xs text-green-600">
                        −₹{discountAmount.toLocaleString("en-IN")} discount
                        applied
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
                    <span
                      className={
                        shippingCost === 0
                          ? "text-green-600 font-medium"
                          : "text-neutral-900 font-medium"
                      }
                    >
                      {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">
                        Discount ({discount?.code})
                      </span>
                      <span className="text-green-600 font-medium">
                        −₹{discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-neutral-900">
                    Total
                  </span>
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

                {!user && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-500 text-center">
                    You'll be asked to sign in before payment
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayClick}
                  disabled={isPlacingOrder}
                  className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{total.toLocaleString("en-IN")}{" "}
                      <ChevronRight size={16} />
                    </>
                  )}
                </motion.button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
                  <ShieldCheck size={13} />
                  Secured by Razorpay
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
