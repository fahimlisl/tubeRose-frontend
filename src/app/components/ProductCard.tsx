import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  description?: string;
  rating?: number;
  reviews?: number;
}

export function ProductCard({ id, image, name, price, description, rating = 4.8, reviews = 124 }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col h-full"
    >
      <Link to={`/product/${id}`} className="block relative overflow-hidden bg-neutral-100 aspect-[4/5] mb-4 rounded-2xl">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {price > 500 && (
            <span className="bg-white/90 backdrop-blur-sm text-neutral-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm tracking-wider uppercase">
              Bestseller
            </span>
          )}
        </div>
        
        {/* Quick Add Button (Desktop Hover) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-full bg-white text-black py-3 rounded-xl text-sm font-medium shadow-lg hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center gap-2">
            <ShoppingBag size={16} />
            Quick View
          </button>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="size-full"
        >
          <img
            src={image}
            alt={name}
            className="size-full object-cover"
          />
        </motion.div>
      </Link>
      
      <div className="flex flex-col flex-1 px-1">
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-neutral-600">{rating}</span>
          <span className="text-xs text-neutral-400">({reviews})</span>
        </div>
        
        <Link to={`/product/${id}`}>
          <h3 className="text-lg font-medium text-neutral-900 leading-tight mb-1 hover:text-neutral-600 transition-colors line-clamp-1">{name}</h3>
        </Link>
        
        {description && (
          <p className="text-neutral-500 text-sm mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-semibold text-neutral-900">₹{price.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </motion.div>
  );
}
