import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, RefreshCw, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminOrderApi } from '../../api/admin.api.ts';

type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed';
type PaymentMethod = 'razorpay' | 'cod';

interface OrderItem {
  _id: string;
  product: string;
  name: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  houseNo: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

interface Order {
  _id: string;
  user: OrderUser;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  baseAmount: number;
  totalAmount: number;
  shiprocketShipmentId?: string | null;
  shiprocketStatus?: string;
  awbCode?: string | null;
  discount?: { code: string; amount: string };
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  placed:     'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-amber-50 text-amber-700 border border-amber-200',
  shipped:    'bg-purple-50 text-purple-700 border border-purple-200',
  delivered:  'bg-green-50 text-green-700 border border-green-200',
  cancelled:  'bg-red-50 text-red-700 border border-red-200',
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-neutral-100 text-neutral-600',
  paid:    'bg-green-100 text-green-700',
  failed:  'bg-red-100 text-red-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminOrderApi.getAll();
      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    const matchSearch =
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-full">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Orders</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white text-neutral-700 border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              statusFilter === s
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {s === 'all' ? `All (${orders.length})` : `${s} (${statusCounts[s] ?? 0})`}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={fetchOrders} className="flex items-center gap-1 font-medium hover:text-red-900">
              <RefreshCw size={13} /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-neutral-100">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search by order ID, name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-neutral-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
            <ShoppingBag size={36} className="text-neutral-300" />
            <p className="text-sm">
              {searchTerm || statusFilter !== 'all' ? 'No orders match your filters.' : 'No orders placed yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Payment</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((order, i) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors group"
                    >
                      <td className="p-4">
                        <span className="text-sm font-mono font-medium text-neutral-700">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-neutral-900">{order.user?.name ?? '—'}</p>
                        <p className="text-xs text-neutral-400">{order.user?.email ?? '—'}</p>
                      </td>
                      <td className="p-4 text-sm text-neutral-600">{formatDate(order.createdAt)}</td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-neutral-900">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-neutral-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full w-fit ${PAYMENT_STYLES[order.paymentStatus]}`}>
                            {order.paymentStatus}
                          </span>
                          <span className="text-xs text-neutral-400 uppercase">{order.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            title="View order"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-neutral-100 text-xs text-neutral-400">
            Showing {filtered.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  );
}