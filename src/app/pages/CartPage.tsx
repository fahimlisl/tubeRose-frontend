import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import React from 'react';

export function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const shippingThreshold = 499;
  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);

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
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 mb-6">
                <p className="text-sm font-medium mb-2">
                  {subtotal >= shippingThreshold 
                    ? "🎉 You've unlocked free shipping!" 
                    : `Add ₹${(shippingThreshold - subtotal).toLocaleString('en-IN')} more to unlock free shipping`}
                </p>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-900 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {items.map((item) => (
                <motion.div 
                  layout
                  key={item.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex gap-6 items-center"
                >
                  <Link to={`/product/${item.product.id}`} className="shrink-0">
                    <div className="w-24 h-32 bg-neutral-100 rounded-lg overflow-hidden">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="text-lg font-medium text-neutral-900 hover:underline truncate">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-neutral-500 mt-1">Size: {item.size}</p>
                      </div>
                      <p className="font-medium">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center border border-neutral-200 rounded-full">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-black transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-black transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 sticky top-24">
                <h3 className="text-xl font-medium mb-6">Order Summary</h3>
                <div className="space-y-4 text-sm text-neutral-600 border-b border-neutral-100 pb-6 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-neutral-900 font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-neutral-900 font-medium">
                      {subtotal >= shippingThreshold ? 'Free' : '₹99'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-medium text-neutral-900">Total</span>
                  <span className="text-2xl font-semibold text-neutral-900">
                    ₹{(subtotal + (subtotal >= shippingThreshold ? 0 : 99)).toLocaleString('en-IN')}
                  </span>
                </div>
                <button className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>
                <div className="mt-6 flex flex-col gap-2 text-xs text-neutral-400 text-center">
                  <p>Secure checkout powered by Stripe</p>
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
