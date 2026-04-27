import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { userOrderApi, userOrderTrackingApi } from "../api/user.api";
import type { TrackingResult } from "../api/user.api";

type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";
type PaymentMethod = "razorpay" | "cod";

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

interface Order {
  _id: string;
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

const ORDER_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "placed", label: "Order Placed", icon: <CheckCircle2 size={16} /> },
  { key: "processing", label: "Processing", icon: <Clock size={16} /> },
  { key: "shipped", label: "Shipped", icon: <Truck size={16} /> },
  { key: "delivered", label: "Delivered", icon: <Package size={16} /> },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  placed: {
    label: "Order Placed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle2 size={13} />,
  },
  processing: {
    label: "Processing",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock size={13} />,
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <Truck size={13} />,
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={13} />,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle size={13} />,
  },
};

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-neutral-100 text-neutral-600" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700" },
};

function formatDate(iso: string, short = false) {
  return new Date(iso).toLocaleDateString(
    "en-IN",
    short
      ? { day: "numeric", month: "short", year: "numeric" }
      : {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="ml-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
    >
      {copied ? (
        <Check size={13} className="text-green-600" />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}

function SectionCard({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5 text-neutral-800">
          <span className="text-neutral-400">{icon}</span>
          <span className="text-sm font-semibold tracking-wide">{title}</span>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-neutral-400" />
        ) : (
          <ChevronDown size={16} className="text-neutral-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-neutral-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<TrackingResult | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const isDevelopment = import.meta.env.VITE_NODE_ENV === "developement";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userOrderApi.getById(orderId!);
        setOrder(res?.data ?? null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);
useEffect(() => {
  const fetchTracking = async () => {
    setTrackLoading(true);
    setTrackError(null);
    try {
      if (isDevelopment) {
        // dev: fake data, no awbCode check needed
        await userOrderTrackingApi.trackByAwb("788830567028");
        setTracking({
          awb: "141123221084922",
          currentStatus: "Delivered",
          currentLocation: "Chittoor",
          etd: "2022-07-20 19:28:00",
          activities: [
            { date: "2022-07-19 11:37:00", activity: "Delivered",                   location: "MADANPALLI, Madanapalli, ANDHRA PRADESH", status: "DLVD" },
            { date: "2022-07-19 08:57:00", activity: "Out for Delivery",             location: "MADANPALLI, Madanapalli, ANDHRA PRADESH", status: "OFD"  },
            { date: "2022-07-19 07:33:00", activity: "Reached at Destination",       location: "MADANPALLI, Madanapalli, ANDHRA PRADESH", status: "RAD"  },
            { date: "2022-07-18 21:02:00", activity: "InTransit",                    location: "BLR/FC1, BANGALORE, KARNATAKA",           status: "IT"   },
            { date: "2022-07-18 20:28:00", activity: "Picked Shipment InScan",       location: "BLR/FC1, BANGALORE, KARNATAKA",           status: "PKD"  },
            { date: "2022-07-18 13:50:00", activity: "PickDone",                     location: "RTO/CHD, BANGALORE, KARNATAKA",           status: "PUD"  },
            { date: "2022-07-18 10:04:00", activity: "Out for Pickup",               location: "RTO/CHD, BANGALORE, KARNATAKA",           status: "OFP"  },
            { date: "2022-07-18 09:51:00", activity: "Pending Manifest Data Received", location: "RTO/CHD, BANGALORE, KARNATAKA",         status: "DRC"  },
          ],
        });
      } else {
        // prod: real awbCode required
        if (!order?.awbCode) return;
        const res = await userOrderTrackingApi.trackByAwb(order.awbCode);
        setTracking(res?.data ?? null);
      }
    } catch (err: unknown) {
      setTrackError(err instanceof Error ? err.message : "Could not fetch tracking.");
    } finally {
      setTrackLoading(false);
    }
  };

  fetchTracking();
}, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-neutral-300" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-neutral-500 text-sm text-center">
          {error ?? "Order not found."}
        </p>
        <Link
          to="/account"
          className="text-sm font-medium text-neutral-900 underline underline-offset-2"
        >
          Back to Account
        </Link>
      </div>
    );
  }

  const shouldShow = isDevelopment 
  ? (order.awbCode || tracking) 
  : order.awbCode;

  const isCancelled = order.orderStatus === "cancelled";
  const currentStep = isCancelled
    ? -1
    : ORDER_STEPS.findIndex((s) => s.key === order.orderStatus);
  const statusCfg = STATUS_CONFIG[order.orderStatus];
  const paymentCfg = PAYMENT_CONFIG[order.paymentStatus];
  const discount = order.discount?.amount ? Number(order.discount.amount) : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/account"
            className="p-2 -ml-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 font-mono truncate">
              #{order._id.slice(-10).toUpperCase()}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusCfg.className}`}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-neutral-400 -mb-1"
        >
          Placed on {formatDate(order.createdAt)}
        </motion.div>

        {!isCancelled ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-neutral-100 p-5"
          >
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-5">
              Order Progress
            </p>
            <div className="flex items-start">
              {ORDER_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                const isLast = i === ORDER_STEPS.length - 1;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          done
                            ? active
                              ? "bg-neutral-900 text-white ring-4 ring-neutral-900/10"
                              : "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-300"
                        }`}
                      >
                        {step.icon}
                      </motion.div>
                      <span
                        className={`text-[10px] font-medium text-center leading-tight max-w-[52px] ${done ? "text-neutral-800" : "text-neutral-400"}`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="flex-1 h-0.5 mt-4 mx-1.5 rounded-full overflow-hidden bg-neutral-100">
                        <motion.div
                          className="h-full bg-neutral-900"
                          initial={{ width: 0 }}
                          animate={{ width: i < currentStep ? "100%" : "0%" }}
                          transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {order.shiprocketStatus && (
              <div className="mt-5 pt-4 border-t border-neutral-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-neutral-500">
                    Live:{" "}
                    <span className="font-medium text-neutral-800">
                      {order.shiprocketStatus}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3 text-red-700 text-sm font-medium"
          >
            <XCircle size={18} className="shrink-0" />
            This order has been cancelled.
          </motion.div>
        )}

        {/* Live shipment tracking — only shown if AWB exists */}
        {/* for production im using forced hardcoded data in here */}
        {shouldShow && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SectionCard title="Shipment Tracking" icon={<Truck size={16} />}>
              <div className="pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">AWB</span>
                    <span className="font-mono text-xs bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-lg text-neutral-800">
                      {order.awbCode ?? tracking?.awb}
                    </span>
                    <CopyButton text={order.awbCode ?? tracking?.awb ?? ""} />
                  </div>
                  {tracking?.currentStatus && (
                    <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-medium">
                      {tracking.currentStatus}
                    </span>
                  )}
                </div>

                {tracking && (tracking.currentLocation || tracking.etd) && (
                  <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                    {tracking.currentLocation && (
                      <span>
                        📍{" "}
                        <span className="font-medium text-neutral-700">
                          {tracking.currentLocation}
                        </span>
                      </span>
                    )}
                    {tracking.etd && (
                      <span>
                        🗓 ETA:{" "}
                        <span className="font-medium text-neutral-700">
                          {formatDate(tracking.etd, true)}
                        </span>
                      </span>
                    )}
                  </div>
                )}

                {trackLoading && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
                    <Loader2 size={14} className="animate-spin" />
                    Fetching live tracking…
                  </div>
                )}
                {trackError && !trackLoading && (
                  <p className="text-xs text-red-500 italic">{trackError}</p>
                )}
                {!trackLoading &&
                tracking?.activities &&
                tracking.activities.length > 0 ? (
                  <div className="relative pl-5">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-100" />
                    {[...tracking.activities]
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      )
                      .map((entry, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="relative mb-5 last:mb-0"
                        >
                          <div
                            className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full border-2 ${
                              i === 0
                                ? "bg-neutral-900 border-neutral-900"
                                : "bg-white border-neutral-200"
                            }`}
                          />
                          <p
                            className={`text-sm leading-snug ${i === 0 ? "font-semibold text-neutral-900" : "text-neutral-600"}`}
                          >
                            {entry.activity}
                          </p>
                          {entry.status && entry.status !== entry.activity && (
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {entry.status}
                            </p>
                          )}
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {entry.location && <span>{entry.location} · </span>}
                            {entry.date ? formatDate(entry.date, true) : ""}
                          </p>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  !trackLoading &&
                  !trackError && (
                    <p className="text-xs text-neutral-400 italic">
                      Tracking details will appear here once the shipment is
                      picked up.
                    </p>
                  )
                )}
              </div>
            </SectionCard>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <SectionCard title="Items Ordered" icon={<Package size={16} />}>
            <div className="pt-4 space-y-3">
              {order.items.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package
                        size={20}
                        className="m-auto mt-5 text-neutral-300"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Size: {item.sizeLabel} · Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-neutral-900">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-neutral-400">
                      ₹{item.price.toLocaleString("en-IN")} each
                    </p>
                  </div>
                </motion.div>
              ))}
              <div className="pt-3 mt-1 border-t border-neutral-100 space-y-2">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Subtotal</span>
                  <span>₹{order.baseAmount?.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">
                      Discount
                      {order.discount?.code ? ` (${order.discount.code})` : ""}
                    </span>
                    <span className="text-green-600 font-medium">
                      −₹{discount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Total Paid</span>
                  <span>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SectionCard
            title="Delivery Address"
            icon={<MapPin size={16} />}
            defaultOpen={false}
          >
            <div className="pt-4 space-y-0.5 text-sm">
              <p className="font-semibold text-neutral-900">
                {order.shippingAddress?.fullName}
              </p>
              <p className="text-neutral-500">{order.shippingAddress?.phone}</p>
              <p className="text-neutral-500 mt-1">
                {[
                  order.shippingAddress?.houseNo,
                  order.shippingAddress?.addressLine1,
                  order.shippingAddress?.addressLine2,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="text-neutral-500">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
                {order.shippingAddress?.pincode}
              </p>
            </div>
          </SectionCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <SectionCard
            title="Payment Details"
            icon={<CreditCard size={16} />}
            defaultOpen={false}
          >
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Method</span>
                <span className="font-medium text-neutral-900 uppercase">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Status</span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${paymentCfg.className}`}
                >
                  {paymentCfg.label}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Payment ID</span>
                  <div className="flex items-center">
                    <span className="font-mono text-xs text-neutral-600 truncate max-w-[140px]">
                      {order.razorpayPaymentId}
                    </span>
                    <CopyButton text={order.razorpayPaymentId} />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center text-xs text-neutral-400 pb-4"
        >
          Need help?{" "}
          <a
            href="mailto:support@tuberose.in"
            className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
          >
            Contact support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
