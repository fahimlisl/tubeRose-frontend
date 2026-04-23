import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { ArrowRight, Star, ShieldCheck, Leaf, FlaskConical } from 'lucide-react';

export function HomePage() {
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden bg-neutral-900">
        <motion.div
          style={{ y: heroImageY }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1739980155900-36562bcb7857?w=1920&q=80"
            alt="Skincare Collection"
            className="size-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full max-w-[1400px] mx-auto px-6 flex items-center"
        >
          <div className="max-w-2xl mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase">
                  New Arrival
                </span>
                <span className="text-white/90 text-sm tracking-wide font-medium flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  4.9/5 from 10k+ reviews
                </span>
              </div>
              <h2 className="text-white text-5xl md:text-7xl lg:text-8xl mb-6 font-medium leading-[1.05] tracking-tight">
                Skincare that <br/><span className="text-white/80 italic font-light">actually works.</span>
              </h2>
              <p className="text-white/90 text-lg md:text-xl mb-10 max-w-lg font-light leading-relaxed">
                Dermatologist-approved formulas tailored for Indian skin. Clean, effective, and completely cruelty-free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-white text-black px-8 py-4 text-sm font-semibold rounded-full flex items-center justify-center gap-2 group transition-shadow hover:shadow-xl hover:shadow-white/20"
                  >
                    Shop Best Sellers
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link to="/about">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-transparent border border-white/30 text-white px-8 py-4 text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    Explore Ingredients
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Trust Badges Marquee */}
      <div className="bg-neutral-50 py-8 border-b border-neutral-100 overflow-hidden flex">
        <div className="animate-[marquee_20s_linear_infinite] flex whitespace-nowrap items-center gap-16 px-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-16">
              <div className="flex items-center gap-3 text-neutral-600 font-medium">
                <ShieldCheck size={24} className="text-blue-600" />
                Dermatologically Tested
              </div>
              <div className="flex items-center gap-3 text-neutral-600 font-medium">
                <Leaf size={24} className="text-green-600" />
                100% Vegan & Cruelty Free
              </div>
              <div className="flex items-center gap-3 text-neutral-600 font-medium">
                <FlaskConical size={24} className="text-purple-600" />
                Science Backed Actives
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div className="max-w-2xl">
              <h3 className="text-3xl md:text-5xl font-medium mb-4 tracking-tight">Our Bestsellers</h3>
              <p className="text-neutral-500 text-lg">
                Science-backed skincare essentials loved by thousands. Real results for every skin type.
              </p>
            </div>
            <Link to="/shop" className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 pb-1 border-b border-neutral-900 self-start md:self-end">
              View All Products
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Statement / Split Section */}
      <section className="bg-neutral-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center"
            >
              <h3 className="text-3xl md:text-5xl font-medium mb-6 tracking-tight">Clean Beauty,<br/>Real Results</h3>
              <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
                We believe skincare should be transparent, effective, and accessible. Every formula is dermatologically tested, made with sustainable ingredients, and completely cruelty-free. 
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-neutral-800 font-medium">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Leaf size={16} className="text-green-600" />
                  </div>
                  No Parabens or Sulfates
                </li>
                <li className="flex items-center gap-3 text-neutral-800 font-medium">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FlaskConical size={16} className="text-purple-600" />
                  </div>
                  Clinically Proven Actives
                </li>
                <li className="flex items-center gap-3 text-neutral-800 font-medium">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <ShieldCheck size={16} className="text-blue-600" />
                  </div>
                  Safe for Sensitive Skin
                </li>
              </ul>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-neutral-900 text-white px-8 py-4 text-sm font-semibold rounded-full inline-flex items-center gap-2 group w-fit"
                >
                  Our Philosophy
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:w-1/2 h-[500px] lg:h-auto"
            >
              <img 
                src="https://images.unsplash.com/photo-1696894756316-c18f512cf783?w=1080&q=80" 
                alt="Clean Skincare" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
