import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import React from 'react';

const mockProducts = [
  { id: 'PRD-01', name: 'Hyaluronic Acid Serum', price: '₹899', stock: 45, status: 'Active', category: 'Serums' },
  { id: 'PRD-02', name: 'Vitamin C Glow Moisturizer', price: '₹1,299', stock: 12, status: 'Low Stock', category: 'Moisturizers' },
  { id: 'PRD-03', name: 'Gentle Foaming Cleanser', price: '₹699', stock: 120, status: 'Active', category: 'Cleansers' },
  { id: 'PRD-04', name: 'SPF 50 Mineral Sunscreen', price: '₹1,499', stock: 0, status: 'Out of Stock', category: 'Sunscreens' },
  { id: 'PRD-05', name: 'Niacinamide Toner', price: '₹799', stock: 85, status: 'Active', category: 'Toners' },
];

export function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = mockProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Products</h1>
        <button className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors self-start sm:self-auto">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Table Container - Enable horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product Info</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={product.id}
                  className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-neutral-600">{product.category}</td>
                  <td className="p-4 text-sm font-medium text-neutral-900">{product.price}</td>
                  <td className="p-4 text-sm text-neutral-600">{product.stock} units</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.status === 'Active' ? 'bg-green-100 text-green-700' :
                      product.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-neutral-500">
              <p>No products found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
