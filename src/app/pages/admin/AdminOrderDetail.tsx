import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Loader2, AlertCircle, Package,
  MapPin, CreditCard, Truck, User, Tag,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
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

const ORDER_STEPS: OrderStatus[] = ['placed', 'processing', 'shipped', 'delivered'];

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
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 text-neutral-700">
        {icon}
        <h2 className="font-semibold text-sm uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-neutral-400 shrink-0">{label}</span>
      <span className="text-neutral-800 font-medium text-right">{value}</span>
    </div>
  );
}

export function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminOrderApi.getById(orderId!);
        setOrder(res?.data ?? null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-neutral-600 text-sm">{error ?? 'Order not found.'}</p>
        <Link to="/admin/orders" className="text-sm font-medium text-neutral-700 underline underline-offset-2">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'cancelled';
  const currentStep = isCancelled ? -1 : ORDER_STEPS.indexOf(order.orderStatus);
  const discount = order.discount?.amount ? Number(order.discount.amount) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="p-2 text-neutral-500 hover:bg-neutral-200/50 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-neutral-900 font-mono">
              #{order._id.slice(-10).toUpperCase()}
            </h1>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[order.orderStatus]}`}>
              {order.orderStatus}
            </span>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${PAYMENT_STYLES[order.paymentStatus]}`}>
              {order.paymentStatus}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      {!isCancelled ? (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">Order Progress</h2>
          <div className="flex items-center gap-0">
            {ORDER_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const isLast = i === ORDER_STEPS.length - 1;
              return (
                <React.Fragment key={step}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-xs capitalize font-medium ${done ? 'text-neutral-900' : 'text-neutral-400'}`}>
                      {step}
                    </span>
                  </motion.div>
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mb-5 mx-2 transition-all ${i < currentStep ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 font-medium">
          This order has been cancelled.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          <InfoCard title="Order Items" icon={<Package size={16} />}>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl"
                >
                  <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                    <p className="text-xs text-neutral-500">Size: {item.sizeLabel} · Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-neutral-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-neutral-400">₹{item.price?.toLocaleString('en-IN')} each</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-4 space-y-2">
              <Row label="Subtotal" value={`₹${order.baseAmount?.toLocaleString('en-IN')}`} />
              {discount > 0 && (
                <Row
                  label={`Discount${order.discount?.code ? ` (${order.discount.code})` : ''}`}
                  value={<span className="text-green-600">−₹{discount.toLocaleString('en-IN')}</span>}
                />
              )}
              <div className="flex items-center justify-between text-sm font-semibold pt-1 border-t border-neutral-100">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900 text-base">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Shipping Address" icon={<MapPin size={16} />}>
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold text-neutral-900">{order.shippingAddress?.fullName}</p>
              <p className="text-neutral-600">{order.shippingAddress?.phone}</p>
              <p className="text-neutral-600">
                {[
                  order.shippingAddress?.houseNo,
                  order.shippingAddress?.addressLine1,
                  order.shippingAddress?.addressLine2,
                ].filter(Boolean).join(', ')}
              </p>
              <p className="text-neutral-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
              </p>
            </div>
          </InfoCard>
        </div>

        <div className="space-y-6">
          <InfoCard title="Customer" icon={<User size={16} />}>
            <div className="space-y-2">
              <Row label="Name"  value={order.user?.name} />
              <Row label="Email" value={order.user?.email} />
              <Row label="Phone" value={order.user?.phoneNumber} />
            </div>
          </InfoCard>
          <InfoCard title="Payment" icon={<CreditCard size={16} />}>
            <div className="space-y-2">
              <Row label="Method" value={<span className="uppercase">{order.paymentMethod}</span>} />
              <Row label="Status" value={
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STYLES[order.paymentStatus]}`}>
                  {order.paymentStatus}
                </span>
              } />
              <Row label="Razorpay Order" value={order.razorpayOrderId} />
              <Row label="Razorpay Payment" value={order.razorpayPaymentId} />
            </div>
          </InfoCard>
          <InfoCard title="Shipping" icon={<Truck size={16} />}>
            <div className="space-y-2">
              <Row label="Shiprocket Status" value={order.shiprocketStatus} />
              <Row label="Shipment ID"       value={order.shiprocketShipmentId ?? undefined} />
              <Row label="AWB Code"          value={order.awbCode ?? undefined} />
            </div>
            {!order.shiprocketShipmentId && (
              <p className="text-xs text-neutral-400 italic">Shipment not yet created.</p>
            )}
          </InfoCard>
          {order.discount?.code && (
            <InfoCard title="Discount Applied" icon={<Tag size={16} />}>
              <div className="space-y-2">
                <Row label="Code"   value={<span className="font-mono">{order.discount.code}</span>} />
                <Row label="Amount" value={<span className="text-green-600">−₹{order.discount.amount}</span>} />
              </div>
            </InfoCard>
          )}

        </div>
      </div>
    </div>
  );
}