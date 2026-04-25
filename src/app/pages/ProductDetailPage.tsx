// import { useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import React from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { products } from '../data/products';
// import { ShoppingBag, ArrowLeft, Check, Leaf, ShieldCheck, ChevronDown, ChevronUp, Star } from 'lucide-react';
// import { useCart } from '../hooks/useCart';

// export function ProductDetailPage() {
//   const { id } = useParams();
//   const product = products.find(p => p.id === id);
//   const { addToCart } = useCart();

//   const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || '');
//   const [added, setAdded] = useState(false);
//   const [openAccordion, setOpenAccordion] = useState<string | null>('details');

//   if (!product) {
//     return (
//       <div className="pt-32 pb-32 min-h-screen flex items-center justify-center">
//         <div className="max-w-[1400px] mx-auto px-6 text-center">
//           <h1 className="text-5xl font-light mb-6">Product Not Found</h1>
//           <Link to="/shop" className="text-neutral-600 hover:text-neutral-900 underline underline-offset-4 decoration-1">
//             Back to Shop
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const handleAddToCart = () => {
//     if (!selectedSize) return;
//     addToCart(product, selectedSize, 1);
//     setAdded(true);
//     setTimeout(() => setAdded(false), 2000);
//   };

//   const getCategoryLabel = (category: string) => {
//     const labels: Record<string, string> = {
//       'acne': 'Acne Care',
//       'hydration': 'Hydration',
//       'anti-aging': 'Anti-Aging',
//       'brightening': 'Brightening',
//       'sensitive': 'Sensitive Skin'
//     };
//     return labels[category] || category;
//   };

//   const toggleAccordion = (section: string) => {
//     setOpenAccordion(openAccordion === section ? null : section);
//   };

//   return (
//     <div className="pt-24 pb-32 min-h-screen bg-white">
//       <div className="max-w-[1400px] mx-auto px-6">
//         <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors group font-medium">
//           <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
//           Back to Shop
//         </Link>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
//           {/* Product Image - Sticky */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//             className="sticky top-24 relative bg-neutral-100 aspect-[4/5] rounded-3xl overflow-hidden"
//           >
//             <img
//               src={product.image}
//               alt={product.name}
//               className="size-full object-cover"
//             />
//           </motion.div>

//           {/* Product Info */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, delay: 0.1 }}
//             className="flex flex-col py-6"
//           >
//             <div className="mb-8">
//               <div className="flex items-center gap-2 mb-3">
//                 <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 px-3 py-1 rounded-full">
//                   {getCategoryLabel(product.category)}
//                 </span>
//                 <div className="flex items-center gap-1">
//                   <Star size={14} className="fill-amber-400 text-amber-400" />
//                   <span className="text-sm font-medium">4.8</span>
//                   <span className="text-sm text-neutral-400">(124 reviews)</span>
//                 </div>
//               </div>
              
//               <h1 className="text-4xl md:text-5xl font-medium mb-4 leading-tight text-neutral-900">{product.name}</h1>
              
//               <p className="text-neutral-500 text-lg mb-6 leading-relaxed">{product.description}</p>
              
//               <div className="flex items-center gap-4">
//                 <p className="text-3xl font-semibold text-neutral-900">₹{product.price.toLocaleString('en-IN')}</p>
//                 <span className="text-sm text-neutral-400 line-through">₹{(product.price * 1.2).toLocaleString('en-IN')}</span>
//                 <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">20% OFF</span>
//               </div>
//               <p className="text-xs text-neutral-500 mt-2">Inclusive of all taxes</p>
//             </div>

//             {/* Badges */}
//             <div className="flex flex-wrap gap-4 mb-8">
//               <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700">
//                 <Leaf size={16} className="text-green-600" />
//                 Cruelty-Free
//               </div>
//               <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700">
//                 <ShieldCheck size={16} className="text-blue-600" />
//                 Dermatologically Tested
//               </div>
//             </div>

//             {/* Skin Type */}
//             {product.skinType && (
//               <div className="mb-8">
//                 <label className="block text-sm font-medium text-neutral-900 mb-3">Suitable For</label>
//                 <div className="flex flex-wrap gap-2">
//                   {product.skinType.map(type => (
//                     <span
//                       key={type}
//                       className="px-4 py-2 text-sm font-medium bg-neutral-100/80 text-neutral-700 rounded-full border border-neutral-200"
//                     >
//                       {type}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Size Selection */}
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-3">
//                 <label className="block text-sm font-medium text-neutral-900">Select Size</label>
//                 <button className="text-xs font-medium text-neutral-500 underline underline-offset-2">Size Guide</button>
//               </div>
//               <div className="flex flex-wrap gap-3">
//                 {product.sizes.map(size => (
//                   <button
//                     key={size}
//                     onClick={() => setSelectedSize(size)}
//                     className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 ${
//                       selectedSize === size
//                         ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
//                         : 'border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:bg-neutral-50'
//                     }`}
//                   >
//                     {size}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Add to Cart */}
//             <motion.button
//               whileHover={{ scale: 1.01 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={handleAddToCart}
//               disabled={!selectedSize}
//               className={`w-full py-4 rounded-xl text-base font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-8 transition-all shadow-lg ${
//                 added ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-neutral-900 text-white shadow-neutral-900/20 hover:bg-neutral-800'
//               }`}
//             >
//               {added ? (
//                 <>
//                   <Check size={20} />
//                   Added to Cart
//                 </>
//               ) : (
//                 <>
//                   <ShoppingBag size={20} />
//                   Add to Cart
//                 </>
//               )}
//             </motion.button>

//             {/* Accordions */}
//             <div className="border-t border-neutral-200">
//               {/* Product Details */}
//               <div className="border-b border-neutral-200">
//                 <button 
//                   onClick={() => toggleAccordion('details')}
//                   className="w-full py-6 flex items-center justify-between text-left"
//                 >
//                   <span className="text-sm font-semibold uppercase tracking-wider">Product Details</span>
//                   {openAccordion === 'details' ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
//                 </button>
//                 <AnimatePresence>
//                   {openAccordion === 'details' && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: 'auto', opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       className="overflow-hidden"
//                     >
//                       <ul className="text-neutral-600 space-y-3 pb-6 pl-4 list-disc text-sm leading-relaxed">
//                         <li>Dermatologically tested and approved for sensitive skin</li>
//                         <li>100% Vegan, Cruelty-free, and PETA certified</li>
//                         <li>Formulated with clean, sustainable ingredients</li>
//                         <li>Free from parabens, sulfates, and artificial fragrances</li>
//                         <li>Sustainably packaged using recyclable materials</li>
//                       </ul>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* How to Use */}
//               <div className="border-b border-neutral-200">
//                 <button 
//                   onClick={() => toggleAccordion('usage')}
//                   className="w-full py-6 flex items-center justify-between text-left"
//                 >
//                   <span className="text-sm font-semibold uppercase tracking-wider">How to Use</span>
//                   {openAccordion === 'usage' ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
//                 </button>
//                 <AnimatePresence>
//                   {openAccordion === 'usage' && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: 'auto', opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       className="overflow-hidden"
//                     >
//                       <ol className="text-neutral-600 space-y-3 pb-6 pl-4 list-decimal text-sm leading-relaxed">
//                         <li>Cleanse your face thoroughly and pat dry.</li>
//                         <li>Apply an appropriate amount (pea-sized) to your fingertips.</li>
//                         <li>Gently massage onto your face and neck in upward circular motions.</li>
//                         <li>Follow up with an SPF during the day.</li>
//                       </ol>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* Shipping & Returns */}
//               <div className="border-b border-neutral-200">
//                 <button 
//                   onClick={() => toggleAccordion('shipping')}
//                   className="w-full py-6 flex items-center justify-between text-left"
//                 >
//                   <span className="text-sm font-semibold uppercase tracking-wider">Shipping & Returns</span>
//                   {openAccordion === 'shipping' ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
//                 </button>
//                 <AnimatePresence>
//                   {openAccordion === 'shipping' && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: 'auto', opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       className="overflow-hidden"
//                     >
//                       <div className="text-neutral-600 space-y-4 pb-6 text-sm leading-relaxed">
//                         <p><strong>Free Shipping:</strong> On all orders over ₹499 across India.</p>
//                         <p><strong>Standard Delivery:</strong> 3-5 business days depending on location.</p>
//                         <p><strong>Returns:</strong> We offer a 30-day money-back guarantee if you are not satisfied with your purchase. Simply contact our support team to initiate a return.</p>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, ArrowLeft, Check, Leaf, ShieldCheck,
  ChevronDown, ChevronUp, Star, MapPin, Loader2, X
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useProduct } from '../hooks/useProduct';
import { ISizeVariant, getThumbnail } from '../../interfaces/product.interface.ts';
import { publicShippingApi } from '../api/public.api.ts';

// ── Pincode state type ────────────────────────────────────────────────────────
interface ServiceabilityResult {
  serviceable: boolean;
  bestOption: {
    courierName: string;
    estimatedDays: number;
    etd: string;
    cod: boolean;
  } | null;
}

export function ProductDetailPage() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize]     = useState<ISizeVariant | null>(null);
  const [added, setAdded]                   = useState(false);
  const [openAccordion, setOpenAccordion]   = useState<string | null>('details');

  // ── Image gallery state ───────────────────────────────────────────────────
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // ── Pincode state ─────────────────────────────────────────────────────────
  const [pincode, setPincode]                       = useState("");
  const [pincodeLoading, setPincodeLoading]         = useState(false);
  const [pincodeError, setPincodeError]             = useState<string | null>(null);
  const [serviceability, setServiceability]         = useState<ServiceabilityResult | null>(null);

  React.useEffect(() => {
    if (product?.sizes?.length) {
      const firstInStock = product.sizes.find((s) => s.stock > 0) ?? product.sizes[0];
      setSelectedSize(firstInStock);
    }
    // reset image index when product loads
    setActiveImageIndex(0);
  }, [product]);

const handleAddToCart = () => {
  if (!selectedSize || !product) return;

  // product from your backend has _id, title, image[], sizes[]
  // this matches CartProduct type exactly
  addToCart(
    {
      _id:            product._id,
      title:          product.title,
      category:       product.category,
      image:          product.image,
      sizes:          product.sizes,
    },
    selectedSize.label,  // sizeLabel — "15ml", "200ml" etc
    1
  );

  setAdded(true);
  setTimeout(() => setAdded(false), 2000);
};

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  // ── Pincode check ─────────────────────────────────────────────────────────
  const handlePincodeCheck = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeError("Enter a valid 6-digit pincode.");
      return;
    }
    setPincodeLoading(true);
    setPincodeError(null);
    setServiceability(null);
    try {
      const res = await publicShippingApi.checkServiceability(pincode);
      setServiceability(res.data);
    } catch (err: unknown) {
      setPincodeError(
        err instanceof Error ? err.message : "Failed to check serviceability."
      );
    } finally {
      setPincodeLoading(false);
    }
  };

  const discountPercent =
    selectedSize?.basePrice && selectedSize.basePrice > selectedSize.finalPrice
      ? Math.round(((selectedSize.basePrice - selectedSize.finalPrice) / selectedSize.basePrice) * 100)
      : null;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      acne: 'Acne Care', hydration: 'Hydration',
      'anti-aging': 'Anti-Aging', brightening: 'Brightening', sensitive: 'Sensitive Skin',
    };
    return labels[category] || category;
  };

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
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

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pt-24 pb-32 min-h-screen bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="h-4 w-28 bg-neutral-100 rounded-full animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="aspect-[4/5] bg-neutral-100 rounded-3xl animate-pulse" />
            <div className="flex flex-col py-6 gap-5">
              <div className="flex gap-3">
                <div className="h-6 w-20 bg-neutral-100 rounded-full animate-pulse" />
                <div className="h-6 w-28 bg-neutral-100 rounded-full animate-pulse" />
              </div>
              <div className="h-12 w-3/4 bg-neutral-100 rounded-xl animate-pulse" />
              <div className="h-4 w-full bg-neutral-100 rounded-full animate-pulse" />
              <div className="h-4 w-5/6 bg-neutral-100 rounded-full animate-pulse" />
              <div className="flex gap-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 w-24 bg-neutral-100 rounded-xl animate-pulse" />
                ))}
              </div>
              <div className="h-14 w-full bg-neutral-100 rounded-xl animate-pulse mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // all images — thumbnail first
  const allImages = [
    ...product.image.filter((img: any) => img.isThumbnail),
    ...product.image.filter((img: any) => !img.isThumbnail),
  ];

  const activeImage = allImages[activeImageIndex]?.url ?? getThumbnail(product.image);

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <div className="pt-24 pb-32 min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors group font-medium"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── Image Gallery ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-24 flex gap-4"
          >
            {/* Thumbnail strip — only show if more than 1 image */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-3">
                {allImages.map((img: any, index: number) => (
                  <button
                    key={img._id ?? index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === index
                        ? "border-neutral-900"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 bg-neutral-100 aspect-[4/5] rounded-3xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={activeImage}
                  alt={product.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Image counter badge */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Product Info ── */}
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

              <h1 className="text-4xl md:text-5xl font-medium mb-4 leading-tight text-neutral-900">
                {product.title}
              </h1>

              <p className="text-neutral-500 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>

              <AnimatePresence mode="wait">
                {selectedSize && (
                  <motion.div
                    key={selectedSize.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <p className="text-3xl font-semibold text-neutral-900">
                      ₹{selectedSize.finalPrice.toLocaleString('en-IN')}
                    </p>
                    {selectedSize.basePrice && selectedSize.basePrice > selectedSize.finalPrice && (
                      <>
                        <span className="text-sm text-neutral-400 line-through">
                          ₹{selectedSize.basePrice.toLocaleString('en-IN')}
                        </span>
                        {discountPercent && (
                          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-xs text-neutral-500 mt-2">Inclusive of all taxes</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700">
                <Leaf size={16} className="text-green-600" />Cruelty-Free
              </div>
              <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700">
                <ShieldCheck size={16} className="text-blue-600" />Dermatologically Tested
              </div>
            </div>

            {/* Skin Type */}
            {product.skinType?.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-neutral-900 mb-3">Suitable For</label>
                <div className="flex flex-wrap gap-2">
                  {product.skinType.map((type: string) => (
                    <span key={type} className="px-4 py-2 text-sm font-medium bg-neutral-100/80 text-neutral-700 rounded-full border border-neutral-200 capitalize">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-neutral-900">Select Size</label>
                  {selectedSize && (
                    <span className="text-xs text-neutral-500">
                      {selectedSize.stock > 0
                        ? `${selectedSize.stock} in stock`
                        : <span className="text-red-500">Out of stock</span>}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: ISizeVariant) => {
                    const isSelected    = selectedSize?._id === size._id;
                    const isOutOfStock  = size.stock === 0;
                    return (
                      <button
                        key={size._id}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`relative px-5 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex flex-col items-center gap-0.5 min-w-[72px]
                          ${isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                            : isOutOfStock
                              ? 'border-neutral-100 text-neutral-300 cursor-not-allowed bg-neutral-50'
                              : 'border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:bg-neutral-50'
                          }`}
                      >
                        <span>{size.label}</span>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
                          ₹{size.finalPrice.toLocaleString('en-IN')}
                        </span>
                        {isOutOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-full h-px bg-neutral-300 rotate-[-20deg] absolute" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!selectedSize || selectedSize.stock === 0}
              className={`w-full py-4 rounded-xl text-base font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-8 transition-all shadow-lg ${
                added
                  ? 'bg-green-600 text-white shadow-green-600/20'
                  : 'bg-neutral-900 text-white shadow-neutral-900/20 hover:bg-neutral-800'
              }`}
            >
              {added
                ? <><Check size={20} /> Added to Cart</>
                : <><ShoppingBag size={20} /> Add to Cart</>
              }
            </motion.button>

            {/* ── Pincode Serviceability ── */}
            <div className="mb-8 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-neutral-700" />
                <span className="text-sm font-semibold text-neutral-900">Check Delivery</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={e => {
                    setPincode(e.target.value.replace(/\D/g, ""));
                    setServiceability(null);
                    setPincodeError(null);
                  }}
                  onKeyDown={e => e.key === "Enter" && handlePincodeCheck()}
                  placeholder="Enter 6-digit pincode"
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                />
                <button
                  onClick={handlePincodeCheck}
                  disabled={pincodeLoading || pincode.length !== 6}
                  className="px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[90px] justify-center"
                >
                  {pincodeLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : "Check"
                  }
                </button>
              </div>

              {/* Result */}
              <AnimatePresence>
                {pincodeError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 mt-3 text-red-600 text-sm"
                  >
                    <X size={14} />
                    {pincodeError}
                  </motion.div>
                )}

                {serviceability && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3"
                  >
                    {serviceability.serviceable && serviceability.bestOption ? (
                      <div className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-700">
                            Delivery available via {serviceability.bestOption.courierName}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Estimated delivery in{" "}
                            <span className="font-semibold text-neutral-700">
                              {serviceability.bestOption.estimatedDays} day{serviceability.bestOption.estimatedDays !== 1 ? "s" : ""}
                            </span>
                            {serviceability.bestOption.etd && (
                              <> · by <span className="font-semibold text-neutral-700">
                                {new Date(serviceability.bestOption.etd).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short"
                                })}
                              </span></>
                            )}
                            {serviceability.bestOption.cod && (
                              <span className="ml-2 text-blue-600 font-medium">· COD available</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <X size={16} className="text-red-500 shrink-0" />
                        <p className="text-sm text-red-600 font-medium">
                          Delivery not available at this pincode.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Accordions ── */}
            <div className="border-t border-neutral-200">

              {[
                {
                  key: "details",
                  label: "Product Details",
                  content: (
                    product.productDetails?.length > 0 ? (
                      <ul className="text-neutral-600 space-y-3 pb-6 pl-4 list-disc text-sm leading-relaxed">
                        {product.productDetails.map((detail: any, i: number) => (
                          <li key={i}>{detail.title}</li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="text-neutral-600 space-y-3 pb-6 pl-4 list-disc text-sm leading-relaxed">
                        <li>Dermatologically tested and approved for sensitive skin</li>
                        <li>100% Vegan, Cruelty-free, and PETA certified</li>
                        <li>Formulated with clean, sustainable ingredients</li>
                        <li>Free from parabens, sulfates, and artificial fragrances</li>
                      </ul>
                    )
                  ),
                },
                {
                  key: "usage",
                  label: "How to Use",
                  content: (
                    <ol className="text-neutral-600 space-y-3 pb-6 pl-4 list-decimal text-sm leading-relaxed">
                      <li>Cleanse your face thoroughly and pat dry.</li>
                      <li>Apply a pea-sized amount to your fingertips.</li>
                      <li>Gently massage onto face and neck in upward circular motions.</li>
                      <li>Follow up with SPF during the day.</li>
                    </ol>
                  ),
                },
                {
                  key: "shipping",
                  label: "Shipping & Returns",
                  content: (
                    <div className="text-neutral-600 space-y-4 pb-6 text-sm leading-relaxed">
                      <p><strong>Free Shipping:</strong> On all orders over ₹499 across India.</p>
                      <p><strong>Standard Delivery:</strong> 3-5 business days depending on location.</p>
                      <p><strong>Returns:</strong> 30-day money-back guarantee. Contact support to initiate.</p>
                    </div>
                  ),
                },
              ].map(({ key, label, content }) => (
                <div key={key} className="border-b border-neutral-200">
                  <button
                    onClick={() => toggleAccordion(key)}
                    className="w-full py-6 flex items-center justify-between text-left"
                  >
                    <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
                    {openAccordion === key
                      ? <ChevronUp size={20} className="text-neutral-400" />
                      : <ChevronDown size={20} className="text-neutral-400" />
                    }
                  </button>
                  <AnimatePresence>
                    {openAccordion === key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}