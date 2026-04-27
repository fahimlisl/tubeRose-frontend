import React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Tag,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "../hooks/useCart.tsx";
import { userCouponApi } from "../api/user.api.ts";
import type { CouponResult } from "../api/user.api.ts";

const getThumbnailUrl = (
  images: { url: string; isThumbnail: boolean }[],
): string => {
  return (
    images?.find((img) => img.isThumbnail)?.url ??
    images?.[0]?.url ??
    "/placeholder.png"
  );
};

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const shippingThreshold = 499;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 99;
  const discountAmount = couponResult?.discountAmount ?? 0;
  const total = subtotal + shippingCost - discountAmount;
  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);

  const cartCategories = [
    ...new Set(items.map((item) => item.product.category)),
  ];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponResult(null);
    try {
      const res = await userCouponApi.apply({
        code: couponCode.trim().toUpperCase(),
        cartAmount: subtotal,
        cartCategories,
      });
      setCouponResult(res.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to apply coupon. Please try again.";
      setCouponError(errorMessage);
      console.error("Coupon error:", errorMessage);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponResult(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        discount: couponResult
          ? {
              code: couponResult.code,
              amount: couponResult.discountAmount.toString(),
            }
          : undefined,
      },
    });
  };

  return (
    <div className="pt-32 pb-32 min-h-screen bg-neutral-50/50">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-light mb-12">Shopping Cart</h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 bg-white rounded-2xl shadow-sm border border-neutral-100"
          >
            <ShoppingBag
              size={64}
              className="mx-auto mb-6 text-neutral-200"
              strokeWidth={1}
            />
            <h2 className="text-2xl mb-4 font-light">Your cart is empty</h2>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything yet. Discover our collection
              of science-backed skincare.
            </p>
            <Link to="/shop">
              <motion.button
                whileHover={{ x: 4 }}
                className="bg-neutral-900 text-white px-8 py-4 text-sm font-medium inline-flex items-center gap-2 group rounded-full"
              >
                Continue Shopping
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
                <p className="text-sm font-medium mb-2">
                  {subtotal >= shippingThreshold
                    ? "🎉 You've unlocked free shipping!"
                    : `Add ₹${(shippingThreshold - subtotal).toLocaleString("en-IN")} more for free shipping`}
                </p>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neutral-900 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
              <AnimatePresence>
                {items.map((item) => {
                  const thumbnail = getThumbnailUrl(item.product.image);
                  const lineTotal = item.finalPrice * item.quantity;
                  const sizeVariant = item.product.sizes.find(
                    (s) => s.label === item.sizeLabel,
                  );
                  const maxStock = sizeVariant?.stock ?? 99;

                  return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 flex gap-5 items-center"
                    >
                      <Link
                        to={`/product/${item.product._id}`}
                        className="shrink-0"
                      >
                        <div className="w-20 h-28 bg-neutral-100 rounded-xl overflow-hidden">
                          <img
                            src={thumbnail}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <Link to={`/product/${item.product._id}`}>
                            <h3 className="text-base font-medium text-neutral-900 hover:underline underline-offset-2 line-clamp-2">
                              {item.product.title}
                            </h3>
                          </Link>
                          <p className="font-semibold text-neutral-900 shrink-0">
                            ₹{lineTotal.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                            {item.sizeLabel}
                          </span>
                          <span className="text-xs text-neutral-400">
                            ₹{item.finalPrice?.toLocaleString("en-IN")} each
                          </span>
                          {sizeVariant?.basePrice &&
                            sizeVariant.basePrice > item.finalPrice && (
                              <span className="text-xs text-neutral-400 line-through">
                                ₹{sizeVariant.basePrice.toLocaleString("en-IN")}
                              </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-neutral-200 rounded-full">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product._id,
                                  item.sizeLabel,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-black transition-colors disabled:opacity-30"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-7 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product._id,
                                  item.sizeLabel,
                                  item.quantity + 1,
                                )
                              }
                              disabled={item.quantity >= maxStock}
                              className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-black transition-colors disabled:opacity-30"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(item.product._id, item.sizeLabel)
                            }
                            className="text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-sm"
                          >
                            <Trash2 size={15} />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 sticky top-24 space-y-6">
                <h3 className="text-xl font-medium">Order Summary</h3>
                <div className="space-y-3">
                  <AnimatePresence mode="wait">
                    {couponResult ? (
                      <motion.div
                        key="applied"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            size={16}
                            className="text-green-600 shrink-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-green-800 font-mono">
                              {couponResult.code}
                            </p>
                            <p className="text-xs text-green-600">
                              {couponResult.message}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-400 hover:text-green-700 transition-colors ml-2"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="input"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="space-y-2"
                      >
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag
                              size={15}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError(null);
                              }}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleApplyCoupon()
                              }
                              placeholder="Coupon code"
                              className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all font-mono uppercase placeholder:normal-case placeholder:font-sans"
                            />
                          </div>
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                          >
                            {couponLoading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>

                        <AnimatePresence>
                          {couponError && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-red-500 px-1"
                            >
                              {couponError}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                  <AnimatePresence>
                    {discountAmount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between"
                      >
                        <span className="text-green-600">
                          Discount ({couponResult?.code})
                        </span>
                        <span className="text-green-600 font-medium">
                          −₹{discountAmount.toLocaleString("en-IN")}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-neutral-900">
                    Total
                  </span>
                  <div className="text-right">
                    {discountAmount > 0 && (
                      <p className="text-xs text-neutral-400 line-through text-right">
                        ₹{(subtotal + shippingCost).toLocaleString("en-IN")}
                      </p>
                    )}
                    <span className="text-2xl font-semibold text-neutral-900">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>

                <div className="flex flex-col gap-1.5 text-xs text-neutral-400 text-center">
                  <p>Secure checkout powered by Razorpay</p>
                  <p>Free returns within 30 days</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
