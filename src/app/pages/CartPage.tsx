import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const getThumbnailUrl = (images: { url: string; isThumbnail: boolean }[]): string => {
  return (
    images?.find((img) => img.isThumbnail)?.url ??
    images?.[0]?.url ??
    '/placeholder.png'
  );
};

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();

  const shippingThreshold = 499;
  const shippingCost      = subtotal >= shippingThreshold ? 0 : 99;
  const total             = subtotal + shippingCost;
  const progress          = Math.min((subtotal / shippingThreshold) * 100, 100);

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
            <ShoppingBag size={64} className="mx-auto mb-6 text-neutral-200" strokeWidth={1} />
            <h2 className="text-2xl mb-4 font-light">Your cart is empty</h2>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything yet. Discover our collection of science-backed skincare.
            </p>
            <Link to="/shop">
              <motion.button
                whileHover={{ x: 4 }}
                className="bg-neutral-900 text-white px-8 py-4 text-sm font-medium inline-flex items-center gap-2 group rounded-full"
              >
                Continue Shopping
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Free shipping progress */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
                <p className="text-sm font-medium mb-2">
                  {subtotal >= shippingThreshold
                    ? "🎉 You've unlocked free shipping!"
                    : `Add ₹${(shippingThreshold - subtotal).toLocaleString('en-IN')} more for free shipping`}
                </p>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neutral-900 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Items */}
              <AnimatePresence>
                {items.map((item) => {
                  const thumbnail   = getThumbnailUrl(item.product.image);
                  const lineTotal   = item.finalPrice * item.quantity;
                  const sizeVariant = item.product.sizes.find((s) => s.label === item.sizeLabel);
                  const maxStock    = sizeVariant?.stock ?? 99;

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
                      {/* Image */}
                      <Link to={`/product/${item.product._id}`} className="shrink-0">
                        <div className="w-20 h-28 bg-neutral-100 rounded-xl overflow-hidden">
                          <img
                            src={thumbnail}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <Link to={`/product/${item.product._id}`}>
                            <h3 className="text-base font-medium text-neutral-900 hover:underline underline-offset-2 line-clamp-2">
                              {item.product.title}
                            </h3>
                          </Link>
                          <p className="font-semibold text-neutral-900 shrink-0">
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Size + unit price */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                            {item.sizeLabel}
                          </span>
                          <span className="text-xs text-neutral-400">
                            ₹{item.finalPrice?.toLocaleString('en-IN')} each
                          </span>
                          {sizeVariant?.basePrice && sizeVariant.basePrice > item.finalPrice && (
                            <span className="text-xs text-neutral-400 line-through">
                              ₹{sizeVariant.basePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Quantity + remove */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-neutral-200 rounded-full">
                            <button
                              onClick={() =>
                                updateQuantity(item.product._id, item.sizeLabel, item.quantity - 1)
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
                                updateQuantity(item.product._id, item.sizeLabel, item.quantity + 1)
                              }
                              disabled={item.quantity >= maxStock}
                              className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-black transition-colors disabled:opacity-30"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product._id, item.sizeLabel)}
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

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 sticky top-24">
                <h3 className="text-xl font-medium mb-6">Order Summary</h3>
                <div className="space-y-3 text-sm text-neutral-600 border-b border-neutral-100 pb-5 mb-5">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-neutral-900 font-medium">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "text-green-600 font-medium" : "text-neutral-900 font-medium"}>
                      {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-medium text-neutral-900">Total</span>
                  <span className="text-2xl font-semibold text-neutral-900">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                <button className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2" 
                onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>
                <div className="mt-6 flex flex-col gap-1.5 text-xs text-neutral-400 text-center">
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