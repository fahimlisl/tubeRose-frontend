import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { products } from '../data/products';
import { ShoppingBag, ArrowLeft, Check, Leaf, ShieldCheck, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || '');
  const [added, setAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  if (!product) {
    return (
      <div className="pt-32 pb-32 min-h-screen flex items-center justify-center">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <h1 className="text-5xl font-light mb-6">Product Not Found</h1>
          <Link to="/shop" className="text-neutral-600 hover:text-neutral-900 underline underline-offset-4 decoration-1">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'acne': 'Acne Care',
      'hydration': 'Hydration',
      'anti-aging': 'Anti-Aging',
      'brightening': 'Brightening',
      'sensitive': 'Sensitive Skin'
    };
    return labels[category] || category;
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <div className="pt-24 pb-32 min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors group font-medium">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Product Image - Sticky */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-24 relative bg-neutral-100 aspect-[4/5] rounded-3xl overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col py-6"
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 px-3 py-1 rounded-full">
                  {getCategoryLabel(product.category)}
                </span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-neutral-400">(124 reviews)</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-medium mb-4 leading-tight text-neutral-900">{product.name}</h1>
              
              <p className="text-neutral-500 text-lg mb-6 leading-relaxed">{product.description}</p>
              
              <div className="flex items-center gap-4">
                <p className="text-3xl font-semibold text-neutral-900">₹{product.price.toLocaleString('en-IN')}</p>
                <span className="text-sm text-neutral-400 line-through">₹{(product.price * 1.2).toLocaleString('en-IN')}</span>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">20% OFF</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Inclusive of all taxes</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700">
                <Leaf size={16} className="text-green-600" />
                Cruelty-Free
              </div>
              <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700">
                <ShieldCheck size={16} className="text-blue-600" />
                Dermatologically Tested
              </div>
            </div>

            {/* Skin Type */}
            {product.skinType && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-neutral-900 mb-3">Suitable For</label>
                <div className="flex flex-wrap gap-2">
                  {product.skinType.map(type => (
                    <span
                      key={type}
                      className="px-4 py-2 text-sm font-medium bg-neutral-100/80 text-neutral-700 rounded-full border border-neutral-200"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-neutral-900">Select Size</label>
                <button className="text-xs font-medium text-neutral-500 underline underline-offset-2">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full py-4 rounded-xl text-base font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-8 transition-all shadow-lg ${
                added ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-neutral-900 text-white shadow-neutral-900/20 hover:bg-neutral-800'
              }`}
            >
              {added ? (
                <>
                  <Check size={20} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Add to Cart
                </>
              )}
            </motion.button>

            {/* Accordions */}
            <div className="border-t border-neutral-200">
              {/* Product Details */}
              <div className="border-b border-neutral-200">
                <button 
                  onClick={() => toggleAccordion('details')}
                  className="w-full py-6 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-semibold uppercase tracking-wider">Product Details</span>
                  {openAccordion === 'details' ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'details' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="text-neutral-600 space-y-3 pb-6 pl-4 list-disc text-sm leading-relaxed">
                        <li>Dermatologically tested and approved for sensitive skin</li>
                        <li>100% Vegan, Cruelty-free, and PETA certified</li>
                        <li>Formulated with clean, sustainable ingredients</li>
                        <li>Free from parabens, sulfates, and artificial fragrances</li>
                        <li>Sustainably packaged using recyclable materials</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* How to Use */}
              <div className="border-b border-neutral-200">
                <button 
                  onClick={() => toggleAccordion('usage')}
                  className="w-full py-6 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-semibold uppercase tracking-wider">How to Use</span>
                  {openAccordion === 'usage' ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'usage' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ol className="text-neutral-600 space-y-3 pb-6 pl-4 list-decimal text-sm leading-relaxed">
                        <li>Cleanse your face thoroughly and pat dry.</li>
                        <li>Apply an appropriate amount (pea-sized) to your fingertips.</li>
                        <li>Gently massage onto your face and neck in upward circular motions.</li>
                        <li>Follow up with an SPF during the day.</li>
                      </ol>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping & Returns */}
              <div className="border-b border-neutral-200">
                <button 
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full py-6 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-semibold uppercase tracking-wider">Shipping & Returns</span>
                  {openAccordion === 'shipping' ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-neutral-600 space-y-4 pb-6 text-sm leading-relaxed">
                        <p><strong>Free Shipping:</strong> On all orders over ₹499 across India.</p>
                        <p><strong>Standard Delivery:</strong> 3-5 business days depending on location.</p>
                        <p><strong>Returns:</strong> We offer a 30-day money-back guarantee if you are not satisfied with your purchase. Simply contact our support team to initiate a return.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
