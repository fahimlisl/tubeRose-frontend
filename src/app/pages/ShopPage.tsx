import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { Filter, Loader2, PackageX } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

const CATEGORIES = [
  { id: 'all',         label: 'All Products' },
  { id: 'CREAM',       label: 'Creams'        },
  { id: 'FACE WASH',   label: 'Face Wash'     },
  { id: 'TONERS',      label: 'Toners'        },
  { id: 'CLEANSERS',   label: 'Cleansers'     },
  { id: 'SUNSCREENS',  label: 'Sunscreens'    },
];

export function ShopPage() {
  const { products, loading } = useProducts();
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
            Explore our complete collection of science-backed skincare essentials,
            tailored for your unique skin needs.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 pb-8 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 uppercase tracking-widest shrink-0">
            <Filter size={16} />
            <span>Filter By Category:</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide w-full">
            {CATEGORIES.map(cat => (
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[3/4] bg-neutral-100 rounded-2xl animate-pulse" />
                <div className="h-4 bg-neutral-100 rounded-full animate-pulse w-3/4" />
                <div className="h-4 bg-neutral-100 rounded-full animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-400 gap-3">
            <PackageX size={36} className="opacity-30" />
            <p className="text-sm">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
} 