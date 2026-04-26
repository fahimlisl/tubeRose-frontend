import React from 'react';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCart } from '../hooks/useCart';
import { publicBannerApi } from '../api/public.api.ts';

interface IBanner {
  _id: string;
  message: string;
  bgColor: string;
  priority: number;
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Header() {

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const [banners, setBanners] = useState<IBanner[]>([]);
const [bannerIndex, setBannerIndex] = useState(0);

useEffect(() => {
  publicBannerApi.getActive()
    .then((res) => {
      const list = res?.data;
      if (Array.isArray(list) && list.length > 0) setBanners(list);
    })
    .catch(() => {}); 
}, []);
useEffect(() => {
  if (banners.length <= 1) return;
  const interval = setInterval(() => {
    setBannerIndex((i) => (i + 1) % banners.length);
  }, 4000);
  return () => clearInterval(interval);
}, [banners]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      {banners.length > 0 && (
      <div
        className="text-white text-xs py-2 text-center tracking-wide font-medium relative z-50 transition-colors duration-500"
        style={{ backgroundColor: banners[bannerIndex]?.bgColor || '#171717' }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={banners[bannerIndex]?._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              {banners[bannerIndex]?.message}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
      <header 
        className={cn(
          "sticky top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled 
            ? "bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm" 
            : "bg-white border-b border-transparent"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12">
            <button 
              className="md:hidden text-neutral-900"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-xl md:text-2xl tracking-tighter font-semibold">TUBEROSE</Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Home</Link>
              <Link to="/shop" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Shop</Link>
              <Link to="/about" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">About</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-neutral-600 hover:text-neutral-900 transition-colors hidden md:block">
              <Search size={20} />
            </button>
            <Link to="/account" className="text-neutral-600 hover:text-neutral-900 transition-colors hidden md:block">
              <User size={20} />
            </Link>
            <Link to="/cart" className="text-neutral-600 hover:text-neutral-900 transition-colors relative">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-50 shadow-xl md:hidden flex flex-col"
            >
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-xl tracking-tighter font-semibold">TUBEROSE</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-500">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <Link to="/" className="text-lg font-medium text-neutral-900">Home</Link>
                <Link to="/shop" className="text-lg font-medium text-neutral-900">Shop All</Link>
                <Link to="/about" className="text-lg font-medium text-neutral-900">About Us</Link>
                <div className="h-px bg-neutral-100 my-4" />
                <Link to="/account" className="flex items-center gap-3 text-neutral-600">
                  <User size={20} /> My Account
                </Link>
                <button className="flex items-center gap-3 text-neutral-600">
                  <Search size={20} /> Search
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
