import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { motion } from 'motion/react';
import { Package, MapPin, CreditCard, User as UserIcon, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const MOCK_ORDERS = [
  { id: 'ORD-7742', date: 'Oct 12, 2025', status: 'Delivered', total: '₹1,299', items: 2 },
  { id: 'ORD-6231', date: 'Sep 05, 2025', status: 'Processing', total: '₹2,499', items: 3 },
  { id: 'ORD-5509', date: 'Aug 21, 2025', status: 'Delivered', total: '₹899', items: 1 },
];

export function AccountPage() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'profile', label: 'Profile Details', icon: UserIcon },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  ] as const;

  return (
    <div className="bg-neutral-50 min-h-screen py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-neutral-900 mb-2">
            My Account
          </h1>
          <p className="text-neutral-500">
            Welcome back, {user.name || user.email}! Manage your orders and preferences here.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 text-lg font-medium shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-neutral-900 truncate">{user.name || 'User'}</div>
                  <div className="text-sm text-neutral-500 truncate">{user.email}</div>
                </div>
              </div>
            </div>

            <nav className="space-y-1 bg-white rounded-2xl p-2 shadow-sm border border-neutral-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-sm font-medium ${
                      isActive 
                        ? 'bg-neutral-900 text-white' 
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      {tab.label}
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
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 min-h-[500px]"
            >
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Recent Orders</h2>
                  {MOCK_ORDERS.length > 0 ? (
                    <div className="space-y-4">
                      {MOCK_ORDERS.map((order) => (
                        <div key={order.id} className="border border-neutral-100 rounded-xl p-5 hover:border-neutral-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold text-neutral-900">{order.id}</span>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-sm text-neutral-500">
                              Placed on {order.date} • {order.items} {order.items === 1 ? 'item' : 'items'}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                            <span className="font-semibold text-neutral-900">{order.total}</span>
                            <button className="text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-500">
                      <Package size={48} className="mx-auto mb-4 opacity-20" />
                      <p>You haven't placed any orders yet.</p>
                      <button onClick={() => navigate('/shop')} className="mt-4 text-neutral-900 font-medium hover:underline">
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="max-w-md">
                  <h2 className="text-xl font-semibold mb-6">Profile Details</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Full Name</label>
                      <div className="text-neutral-900 font-medium">{user.name || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">Email Address</label>
                      <div className="text-neutral-900 font-medium">{user.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-1">User ID</label>
                      <div className="text-neutral-500 text-sm font-mono">{user.id}</div>
                    </div>
                    <button className="mt-6 border border-neutral-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Saved Addresses</h2>
                  <div className="border border-dashed border-neutral-200 rounded-xl p-8 text-center">
                    <MapPin size={32} className="mx-auto mb-3 text-neutral-400" />
                    <h3 className="font-medium text-neutral-900 mb-1">No addresses saved</h3>
                    <p className="text-sm text-neutral-500 mb-4">Add an address for faster checkout</p>
                    <button className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors">
                      Add New Address
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
