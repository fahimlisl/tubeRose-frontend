import { Twitter, Instagram, Facebook, Youtube, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-light mb-4">Join the TubeRose Club</h3>
            <p className="text-neutral-400 text-lg">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
          </div>
          <div className="w-full max-w-md">
            <form className="relative flex items-center">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-neutral-800 border-none text-white px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-neutral-500"
                required
              />
              <button 
                type="submit" 
                className="absolute right-2 bg-white text-black p-2.5 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2 pr-8">
            <Link to="/" className="text-2xl tracking-tighter font-semibold mb-6 block">TUBEROSE</Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-sm">
              Clean, science-backed skincare designed for Indian skin. Dermatologically tested, cruelty-free, and proudly made in India.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-semibold tracking-wide uppercase mb-6">Shop</h5>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Acne Care</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Anti-Aging</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold tracking-wide uppercase mb-6">About Us</h5>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Ingredients Glossary</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold tracking-wide uppercase mb-6">Support</h5>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} TubeRose Skincare. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
