import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Package, MapPin, ArrowRight } from 'lucide-react';
import { orderApi } from '../api/order.api';

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    orderApi
      .getById(orderId)
      .then((res) => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 min-h-screen bg-neutral-50/50">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <CheckCircle size={72} className="text-green-500 mx-auto" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-4xl font-light mb-3">Order Placed!</h1>
          <p className="text-neutral-500">
            Thank you for your order. We'll start processing it right away.
          </p>
          {order?.razorpayPaymentId && (
            <p className="text-xs text-neutral-400 mt-2">
              Payment ID: {order.razorpayPaymentId}
            </p>
          )}
        </motion.div>

        {order && (
          <div className="space-y-4">
            {/* Items */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
              <h2 className="font-medium mb-4 flex items-center gap-2">
                <Package size={18} />
                Items Ordered
              </h2>
              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-neutral-700">
                      {item.name}
                      <span className="text-neutral-400 ml-1">
                        ({item.sizeLabel}) × {item.quantity}
                      </span>
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 mt-4 pt-4 flex justify-between font-medium">
                <span>Total Paid</span>
                <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
              <h2 className="font-medium mb-3 flex items-center gap-2">
                <MapPin size={18} />
                Delivering To
              </h2>
              <div className="text-sm text-neutral-600 space-y-0.5">
                <p className="font-medium text-neutral-900">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                <p>{order.shippingAddress?.phone}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link to="/shop" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-neutral-900 text-white py-4 rounded-full text-sm font-medium flex items-center justify-center gap-2"
            >
              Continue Shopping <ArrowRight size={16} />
            </motion.button>
          </Link>
          <Link to="/orders" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full border border-neutral-200 text-neutral-900 py-4 rounded-full text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              View My Orders
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}