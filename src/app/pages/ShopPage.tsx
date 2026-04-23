import { useState } from 'react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { Filter } from 'lucide-react';
import React from 'react';

export function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-12 pt-8">
          <h1 className="text-5xl md:text-6xl font-light mb-6">Shop All</h1>
          <p className="text-neutral-500 text-lg max-w-xl leading-relaxed">
            Explore our complete collection of science-backed skincare essentials, tailored for your unique skin needs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 pb-8 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 uppercase tracking-widest shrink-0">
            <Filter size={16} />
            <span>Filter By Concern:</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide w-full">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'acne', label: 'Acne Care' },
              { id: 'hydration', label: 'Hydration' },
              { id: 'anti-aging', label: 'Anti-Aging' },
              { id: 'brightening', label: 'Brightening' },
              { id: 'sensitive', label: 'Sensitive Skin' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-sm px-5 py-2.5 rounded-full transition-all whitespace-nowrap font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-neutral-500">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
