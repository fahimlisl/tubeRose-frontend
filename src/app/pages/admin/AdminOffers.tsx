import { motion } from 'motion/react';
import { Plus, Tag, Calendar, Percent, CheckCircle2, Clock } from 'lucide-react';
import React from 'react';

const mockOffers = [
  { id: 'OFF-1', title: 'Summer Sale', code: 'SUMMER25', discount: '25%', type: 'Percentage', status: 'Active', expiry: 'Aug 31, 2026' },
  { id: 'OFF-2', title: 'Welcome Bonus', code: 'WELCOME10', discount: '10%', type: 'Percentage', status: 'Active', expiry: 'Ongoing' },
  { id: 'OFF-3', title: 'Free Shipping', code: 'FREESHIP', discount: '₹0 Shipping', type: 'Fixed Amount', status: 'Scheduled', expiry: 'Dec 31, 2026' },
  { id: 'OFF-4', title: 'Diwali Special', code: 'DIWALI50', discount: '₹500 Off', type: 'Fixed Amount', status: 'Expired', expiry: 'Nov 15, 2025' },
];

export function AdminOffers() {
  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Offers & Promotions</h1>
        <button className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors self-start sm:self-auto">
          <Plus size={16} />
          Create Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockOffers.map((offer, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={offer.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  offer.status === 'Active' ? 'bg-green-100 text-green-700' :
                  offer.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                  'bg-neutral-100 text-neutral-500'
                }`}>
                  <Percent size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{offer.title}</h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 mt-0.5">
                    <Tag size={12} />
                    {offer.code}
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                offer.status === 'Active' ? 'bg-green-50 text-green-700' :
                offer.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' :
                'bg-neutral-50 text-neutral-500'
              }`}>
                {offer.status === 'Active' && <CheckCircle2 size={12} />}
                {offer.status === 'Scheduled' && <Clock size={12} />}
                {offer.status}
              </span>
            </div>

            <div className="flex-1 mt-2">
              <div className="text-3xl font-bold tracking-tight text-neutral-900">{offer.discount}</div>
              <p className="text-sm text-neutral-500 mt-1">on all orders above ₹999</p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Calendar size={14} />
                <span className={offer.status === 'Expired' ? 'line-through' : ''}>
                  Expires: {offer.expiry}
                </span>
              </div>
              <button className="font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
                Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
