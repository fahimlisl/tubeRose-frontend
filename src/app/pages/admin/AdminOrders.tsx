import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Eye, Download } from 'lucide-react';
import React from 'react';

const mockOrders = [
  { id: 'ORD-7742', customer: 'Sarah Jenkins', email: 'sarah.j@example.com', date: 'Oct 12, 2025', total: '₹1,299', status: 'Delivered', items: 2 },
  { id: 'ORD-6231', customer: 'Michael Chen', email: 'mchen@example.com', date: 'Sep 05, 2025', total: '₹2,499', status: 'Processing', items: 3 },
  { id: 'ORD-5509', customer: 'Emma Watson', email: 'emma.w@example.com', date: 'Aug 21, 2025', total: '₹899', status: 'Shipped', items: 1 },
  { id: 'ORD-5102', customer: 'Rahul Sharma', email: 'rahul.s@example.com', date: 'Aug 10, 2025', total: '₹3,450', status: 'Cancelled', items: 4 },
  { id: 'ORD-4991', customer: 'Priya Patel', email: 'priya.p@example.com', date: 'Aug 01, 2025', total: '₹1,899', status: 'Delivered', items: 2 },
];

export function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = mockOrders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Orders</h1>
        <button className="flex items-center gap-2 bg-white text-neutral-900 border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors self-start sm:self-auto">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by order ID or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              <Filter size={16} />
              Status
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              <Filter size={16} />
              Date
            </button>
          </div>
        </div>

        {/* Table Container - Enable horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order ID</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id}
                  className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors group"
                >
                  <td className="p-4 font-medium text-neutral-900">{order.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{order.customer}</p>
                      <p className="text-xs text-neutral-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-neutral-600">{order.date}</td>
                  <td className="p-4 text-sm font-medium text-neutral-900">{order.total}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-neutral-500">
              <p>No orders found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
