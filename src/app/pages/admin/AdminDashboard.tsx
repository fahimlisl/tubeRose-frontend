import { motion } from 'motion/react';
import React from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 13 },
  { name: 'Wed', revenue: 2000, orders: 98 },
  { name: 'Thu', revenue: 2780, orders: 39 },
  { name: 'Fri', revenue: 1890, orders: 48 },
  { name: 'Sat', revenue: 2390, orders: 38 },
  { name: 'Sun', revenue: 3490, orders: 43 },
];

export function AdminDashboard() {
  const stats = [
    { label: 'Total Revenue', value: '₹1,24,500', trend: '+12.5%', isUp: true, icon: CreditCard },
    { label: 'Total Orders', value: '1,240', trend: '+4.2%', isUp: true, icon: ShoppingCart },
    { label: 'Active Users', value: '840', trend: '-2.1%', isUp: false, icon: Users },
    { label: 'Conversion Rate', value: '3.2%', trend: '+0.5%', isUp: true, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard Overview</h1>
        <div className="flex gap-2 text-sm text-neutral-500">
          Last 7 Days
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-600">
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-semibold text-neutral-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 h-[400px] flex flex-col"
        >
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Revenue Trend</h2>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#171717" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#737373', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100"
        >
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-neutral-900 mt-2" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Order #ORD-{7000 + i} placed</p>
                  <p className="text-xs text-neutral-500 mt-1">{i * 12} mins ago • ₹{(i * 1299).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors border border-neutral-200">
            View All Activity
          </button>
        </motion.div>
      </div>
    </div>
  );
}
