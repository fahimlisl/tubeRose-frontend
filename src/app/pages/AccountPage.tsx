import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, MapPin, User as UserIcon, LogOut,
  ChevronRight, Wallet, ExternalLink, Loader2,
  CheckCircle2, Clock, Truck, XCircle, Plus, X,
  TrendingUp, TrendingDown, Gift, ShoppingBag, RefreshCcw, Star
} from 'lucide-react';
import { userProfileApi, userOrderApi } from '../api/user.api';
import { toast } from 'sonner';

interface OrderItem {
  name: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  orderStatus: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  totalAmount: number;
  baseAmount: number;
  createdAt: string;
  awbCode?: string;
  shiprocketStatus?: string;
}

interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  houseNo?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface WalletEntry {
  _id?: string;
  amount: number;
  source: 'referral' | 'order_payment' | 'refund' | 'admin_credit';
  type: 'credit' | 'debit';
  description?: string;
  createdAt: string;
}

interface FullProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber: number;
  ownReferralCode: string;
  usedReferralCode?: string;
  wallet: WalletEntry[];
  addresses: Address[];
}

type TabId = 'orders' | 'profile' | 'addresses' | 'wallet';

const emptyAddress = () => ({
  fullName: '', phone: '', houseNo: '',
  addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '',
});

const sourceConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  referral:      { label: 'Referral Bonus',  icon: <Gift size={16} />,        color: 'bg-purple-50 text-purple-600' },
  order_payment: { label: 'Order Payment',   icon: <ShoppingBag size={16} />, color: 'bg-blue-50 text-blue-600'    },
  refund:        { label: 'Refund',          icon: <RefreshCcw size={16} />,  color: 'bg-green-50 text-green-600'  },
  admin_credit:  { label: 'Store Credit',    icon: <Star size={16} />,        color: 'bg-yellow-50 text-yellow-600'},
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    placed:     { label: 'Placed',     className: 'bg-blue-50 text-blue-700',     icon: <Clock size={12} /> },
    processing: { label: 'Processing', className: 'bg-yellow-50 text-yellow-700', icon: <Loader2 size={12} className="animate-spin" /> },
    shipped:    { label: 'Shipped',    className: 'bg-purple-50 text-purple-700', icon: <Truck size={12} /> },
    delivered:  { label: 'Delivered',  className: 'bg-green-50 text-green-700',   icon: <CheckCircle2 size={12} /> },
    cancelled:  { label: 'Cancelled',  className: 'bg-red-50 text-red-700',       icon: <XCircle size={12} /> },
  };
  const config = map[status] ?? { label: status, className: 'bg-neutral-100 text-neutral-600', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${config.className}`}>
      {config.icon}{config.label}
    </span>
  );
};

export function AccountPage() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab]             = useState<TabId>('orders');
  const [profile, setProfile]                 = useState<FullProfile | null>(null);
  const [orders, setOrders]                   = useState<Order[]>([]);
  const [dataLoading, setDataLoading]         = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress]           = useState(emptyAddress());
  const [savingAddress, setSavingAddress]     = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setDataLoading(true);
      try {
        const res = await userProfileApi.get();
        setProfile(res.data);
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to load profile.');
      } finally {
        setDataLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user || activeTab !== 'orders') return;
    const fetchOrders = async () => {
      setDataLoading(true);
      try {
        const res = await userOrderApi.getAll();
        setOrders(res.data ?? []);
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to load orders.');
      } finally {
        setDataLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab, user]);

  const handleSaveAddress = useCallback(async () => {
    const { fullName, phone, addressLine1, city, state, pincode } = newAddress;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await userProfileApi.addAddress(newAddress);
      setProfile(prev =>
        prev ? { ...prev, addresses: res.data?.addresses ?? prev.addresses } : prev
      );
      setShowAddressForm(false);
      setNewAddress(emptyAddress());
      toast.success('Address saved!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  }, [newAddress]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 size={24} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  const walletTotal = profile?.wallet?.reduce((acc, w) =>
    w.type === 'credit' ? acc + w.amount : acc - w.amount, 0
  ) ?? 0;

  const totalCredited = profile?.wallet
    ?.filter(w => w.type === 'credit')
    .reduce((acc, w) => acc + w.amount, 0) ?? 0;

  const totalSpent = profile?.wallet
    ?.filter(w => w.type === 'debit')
    .reduce((acc, w) => acc + w.amount, 0) ?? 0;

  const tabs = [
    { id: 'orders'    as TabId, label: 'Order History',   icon: Package  },
    { id: 'profile'   as TabId, label: 'Profile Details', icon: UserIcon },
    { id: 'addresses' as TabId, label: 'Saved Addresses', icon: MapPin   },
    { id: 'wallet'    as TabId, label: 'Wallet',          icon: Wallet   },
  ];

  const addressFields = [
    { key: 'fullName'     as const, label: 'Full Name *',               span: 1 },
    { key: 'phone'        as const, label: 'Phone *',                   span: 1 },
    { key: 'houseNo'      as const, label: 'House / Flat No.',          span: 2 },
    { key: 'addressLine1' as const, label: 'Address Line 1 *',          span: 2 },
    { key: 'addressLine2' as const, label: 'Address Line 2 (optional)', span: 2 },
    { key: 'city'         as const, label: 'City *',                    span: 1 },
    { key: 'state'        as const, label: 'State *',                   span: 1 },
    { key: 'pincode'      as const, label: 'Pincode *',                 span: 1 },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-neutral-900 mb-2">
            My Account
          </h1>
          <p className="text-neutral-500">
            Welcome back, {user.name}! Manage your orders and preferences here.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <div className="w-full md:w-64 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{user.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="bg-neutral-50 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Wallet Balance</span>
                <span className="text-sm font-semibold text-neutral-900">
                  ₹{walletTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <nav className="space-y-1 bg-white rounded-2xl p-2 shadow-sm border border-neutral-100">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-sm font-medium ${
                      isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />{tab.label}
                    </div>
                    {isActive && <ChevronRight size={16} className="opacity-70" />}
                  </button>
                );
              })}
              <div className="h-px bg-neutral-100 my-2 mx-3" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />Sign Out
              </button>
            </nav>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 min-h-[500px]"
              >
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Order History</h2>
                    {dataLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-neutral-400" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16 text-neutral-500">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-medium mb-1">No orders yet</p>
                        <p className="text-sm mb-4">Looks like you haven't ordered anything yet.</p>
                        <button
                          onClick={() => navigate('/shop')}
                          className="bg-neutral-900 text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map(order => (
                          <div key={order._id} className="border border-neutral-100 rounded-2xl p-5 hover:border-neutral-200 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-mono text-sm font-semibold text-neutral-900">
                                    #{order._id.slice(-8).toUpperCase()}
                                  </span>
                                  <StatusBadge status={order.orderStatus} />
                                </div>
                                <p className="text-xs text-neutral-500">
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                  })}
                                  {' · '}{order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                </p>
                                {order.awbCode && (
                                  <p className="text-xs text-neutral-400 mt-1">
                                    Tracking: <span className="font-mono">{order.awbCode}</span>
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-semibold text-neutral-900">
                                  ₹{order.totalAmount.toLocaleString('en-IN')}
                                </p>
                                <button
                                  onClick={() => navigate(`/order/complete/${order._id}`)}
                                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center gap-1 mt-1"
                                >
                                  View Details <ExternalLink size={12} />
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {order.items.slice(0, 4).map((item, i) => (
                                <div key={i} className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                                  {item.image
                                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    : <Package size={16} className="m-auto mt-3 text-neutral-300" />
                                  }
                                </div>
                              ))}
                              {order.items.length > 4 && (
                                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-xs font-medium text-neutral-500">
                                  +{order.items.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'profile' && (
                  <div className="max-w-md">
                    <h2 className="text-xl font-semibold mb-6">Profile Details</h2>
                    {dataLoading || !profile ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-neutral-400" />
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {[
                          { label: 'Full Name',     value: profile.name },
                          { label: 'Email Address', value: profile.email },
                          { label: 'Phone Number',  value: `+91 ${profile.phoneNumber}` },
                          { label: 'Referral Code', value: profile.ownReferralCode, mono: true },
                        ].map(({ label, value, mono }) => (
                          <div key={label} className="border-b border-neutral-100 pb-4 last:border-0">
                            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
                              {label}
                            </label>
                            <p className={`text-neutral-900 font-medium ${mono ? 'font-mono tracking-widest' : ''}`}>
                              {value ?? '—'}
                            </p>
                          </div>
                        ))}
                        {profile.usedReferralCode && (
                          <div className="border-b border-neutral-100 pb-4">
                            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
                              Used Referral Code
                            </label>
                            <p className="text-neutral-900 font-mono tracking-widest">
                              {profile.usedReferralCode}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">Saved Addresses</h2>
                      <button
                        onClick={() => setShowAddressForm(prev => !prev)}
                        className="flex items-center gap-1.5 text-sm font-medium bg-neutral-900 text-white px-3 py-2 rounded-xl hover:bg-neutral-800 transition-colors"
                      >
                        {showAddressForm ? <X size={15} /> : <Plus size={15} />}
                        {showAddressForm ? 'Cancel' : 'Add Address'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAddressForm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mb-6"
                        >
                          <div className="border border-neutral-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {addressFields.map(({ key, label, span }) => (
                              <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                                <label className="block text-xs font-medium text-neutral-500 mb-1">{label}</label>
                                <input
                                  type="text"
                                  value={newAddress[key]}
                                  onChange={e => setNewAddress(prev => ({ ...prev, [key]: e.target.value }))}
                                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50"
                                />
                              </div>
                            ))}
                            <div className="sm:col-span-2 flex justify-end">
                              <button
                                onClick={handleSaveAddress}
                                disabled={savingAddress}
                                className="bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center gap-2"
                              >
                                {savingAddress && <Loader2 size={14} className="animate-spin" />}
                                Save Address
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!profile?.addresses?.length ? (
                      <div className="border border-dashed border-neutral-200 rounded-2xl p-10 text-center">
                        <MapPin size={32} className="mx-auto mb-3 text-neutral-300" />
                        <p className="font-medium text-neutral-900 mb-1">No addresses saved</p>
                        <p className="text-sm text-neutral-500">Add an address for faster checkout</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profile.addresses.map((addr, i) => (
                          <div key={addr._id ?? i} className="border border-neutral-100 rounded-2xl p-4 hover:border-neutral-200 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm text-neutral-900">{addr.fullName}</p>
                                  {addr.isDefault && (
                                    <span className="text-xs bg-neutral-900 text-white px-2 py-0.5 rounded-full">Default</span>
                                  )}
                                </div>
                                <p className="text-sm text-neutral-500">
                                  {addr.houseNo ? `${addr.houseNo}, ` : ''}
                                  {addr.addressLine1}
                                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                </p>
                                <p className="text-sm text-neutral-500">
                                  {addr.city}, {addr.state} — {addr.pincode}
                                </p>
                                <p className="text-sm text-neutral-400 mt-1">{addr.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'wallet' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Wallet</h2>
                    <div className="bg-neutral-900 text-white rounded-2xl p-6 mb-6">
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Available Balance
                      </p>
                      <p className="text-5xl font-semibold tracking-tight">
                        ₹{walletTotal.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-neutral-500 mt-2 mb-5">
                        Use at checkout to save on your next order
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
                        <div className="bg-neutral-800 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp size={13} className="text-green-400" />
                            <p className="text-xs text-neutral-400">Total Credited</p>
                          </div>
                          <p className="text-base font-semibold text-green-400">
                            +₹{totalCredited.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="bg-neutral-800 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingDown size={13} className="text-red-400" />
                            <p className="text-xs text-neutral-400">Total Spent</p>
                          </div>
                          <p className="text-base font-semibold text-red-400">
                            −₹{totalSpent.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        Transaction History
                      </h3>
                      {profile?.wallet?.length ? (
                        <span className="text-xs text-neutral-400">
                          {profile.wallet.length} transaction{profile.wallet.length !== 1 ? 's' : ''}
                        </span>
                      ) : null}
                    </div>

                    {!profile?.wallet?.length ? (
                      <div className="border border-dashed border-neutral-200 rounded-2xl p-10 text-center">
                        <Wallet size={32} className="mx-auto mb-3 text-neutral-300" />
                        <p className="font-medium text-neutral-900 mb-1">No transactions yet</p>
                        <p className="text-sm text-neutral-500">
                          Earn wallet credits by referring friends or receiving refunds
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[...profile.wallet]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((entry, i) => {
                            const isCredit   = entry.type === 'credit';
                            const src        = sourceConfig[entry.source] ?? {
                              label: entry.source,
                              icon:  <Wallet size={16} />,
                              color: 'bg-neutral-100 text-neutral-600',
                            };

                            return (
                              <motion.div
                                key={entry._id ?? i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center justify-between p-4 border border-neutral-100 rounded-2xl hover:border-neutral-200 hover:bg-neutral-50/50 transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${src.color}`}>
                                    {src.icon}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-neutral-900">
                                      {src.label}
                                    </p>
                                    {entry.description && (
                                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                                        {entry.description}
                                      </p>
                                    )}
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                      {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                                    {isCredit ? '+' : '−'}₹{entry.amount.toLocaleString('en-IN')}
                                  </span>
                                  <div className={`mt-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${
                                    isCredit
                                      ? 'bg-green-50 text-green-600'
                                      : 'bg-red-50 text-red-500'
                                  }`}>
                                    {isCredit
                                      ? <TrendingUp size={10} />
                                      : <TrendingDown size={10} />
                                    }
                                    {isCredit ? 'Credit' : 'Debit'}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}