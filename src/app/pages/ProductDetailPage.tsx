import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, ArrowLeft, Check, Leaf, ShieldCheck,
  ChevronDown, ChevronUp, Star, MapPin, Loader2, X,
  Plus, MessageSquare, BadgeCheck, ImagePlus, Trash2,
} from 'lucide-react';
import { useCart }    from '../hooks/useCart';
import { useProduct } from '../hooks/useProduct';
import { useAuth }    from '../hooks/useAuth';
import { ISizeVariant, getThumbnail } from '../../interfaces/product.interface.ts';
import { publicShippingApi, publicReviewApi } from '../api/public.api.ts';
import { userReviewApi } from '../api/user.api.ts';
import { toast } from 'sonner';


interface ServiceabilityResult {
  serviceable: boolean;
  bestOption: {
    courierName:   string;
    estimatedDays: number;
    etd:           string;
    cod:           boolean;
  } | null;
}

interface IReview {
  _id:                string;
  user:               { _id: string; name: string };
  rating:             number;
  title:              string;
  body:               string;
  isVerifiedPurchase: boolean;
  images?:            { url: string; public_id: string }[];
  createdAt:          string;
}


function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          className={i <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-200 fill-neutral-200"} />
      ))}
    </div>
  );
}


function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95">
          <Star size={28}
            className={i <= (hovered || value)
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-200 fill-neutral-200"} />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-neutral-600">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}

function MobileGallery({ images, title }: { images: any[]; title: string }) {
  const [current, setCurrent]   = useState(0);
  const startX                  = useRef(0);
  const isDragging              = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current  = e.touches[0].clientX;
    isDragging.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && current < images.length - 1) setCurrent(c => c + 1);
      if (diff < 0 && current > 0) setCurrent(c => c - 1);
    }
    isDragging.current = false;
  };

  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100 select-none"
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]?.url}
          alt={`${title} ${current + 1}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.22 }}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </AnimatePresence>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {current + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

function ImageUploadPicker({
  files, onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const added = Array.from(incoming).filter(f => f.type.startsWith("image/"));
    const merged = [...files, ...added].slice(0, 3); // max 3
    onChange(merged);
  };

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
        Photos (optional · max 3)
      </label>

      <div className="flex gap-3 flex-wrap">
        {files.map((file, i) => {
          const url = URL.createObjectURL(file);
          return (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 group">
              <img src={url} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={11} />
              </button>
            </div>
          );
        })}

        {files.length < 3 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ImagePlus size={18} />
            <span className="text-[10px] font-medium">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <p className="text-xs text-neutral-400 mt-2">
          {files.length}/3 photo{files.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}

export function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { product, loading, error } = useProduct(id);
  const { addToCart } = useCart();
  const { user }   = useAuth();

  const [selectedSize,    setSelectedSize]    = useState<ISizeVariant | null>(null);
  const [added,           setAdded]           = useState(false);
  const [openAccordion,   setOpenAccordion]   = useState<string | null>('details');
  const [activeImageIdx,  setActiveImageIdx]  = useState(0);

  const [pincode,        setPincode]        = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError,   setPincodeError]   = useState<string | null>(null);
  const [serviceability, setServiceability] = useState<ServiceabilityResult | null>(null);

  const [reviews,        setReviews]        = useState<IReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showForm,       setShowForm]       = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [reviewForm,     setReviewForm]     = useState({ title: "", body: "", rating: 0 });
  const [reviewImages,   setReviewImages]   = useState<File[]>([]);
  const [reviewError,    setReviewError]    = useState<string | null>(null);

  useEffect(() => {
    if (product?.sizes?.length) {
      const first = product.sizes.find((s: ISizeVariant) => s.stock > 0) ?? product.sizes[0];
      setSelectedSize(first);
    }
    setActiveImageIdx(0);
  }, [product]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    publicReviewApi.getAll(id)
      .then(res => setReviews(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize || !product) return;
    addToCart(
      { _id: product._id, title: product.title, category: product.category, image: product.image.filter(img => img._id) as { url: string; public_id: string; isThumbnail: boolean; _id: string; }[], sizes: product.sizes },
      selectedSize.label, 1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handlePincodeCheck = async () => {
    if (!/^\d{6}$/.test(pincode)) { setPincodeError("Enter a valid 6-digit pincode."); return; }
    setPincodeLoading(true);
    setPincodeError(null);
    setServiceability(null);
    try {
      const res = await publicShippingApi.checkServiceability(pincode);
      setServiceability(res.data);
    } catch (err: unknown) {
      setPincodeError(err instanceof Error ? err.message : "Failed to check serviceability.");
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleWriteReview = () => {
    if (!user) {
      navigate("/auth", { state: { from: `/product/${id}` } });
      return;
    }
    setShowForm(v => !v);
    setReviewError(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.rating)       { setReviewError("Please select a rating."); return; }
    if (!reviewForm.title.trim()) { setReviewError("Title is required."); return; }
    if (!reviewForm.body.trim())  { setReviewError("Please write your review."); return; }

    setSubmitting(true);
    setReviewError(null);
    try {
      const formData = new FormData();
      formData.append("title",  reviewForm.title.trim());
      formData.append("body",   reviewForm.body.trim());
      formData.append("rating", String(reviewForm.rating));
      reviewImages.forEach(file => formData.append("images", file));

      const res = await userReviewApi.add(id!, formData);
      setReviews(prev => [res?.data, ...prev]);
      setShowForm(false);
      setReviewForm({ title: "", body: "", rating: 0 });
      setReviewImages([]);
      toast.success("Review submitted! It'll appear after approval.");
    } catch (err: any) {
      setReviewError(err?.message ?? "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const discountPercent = selectedSize?.basePrice && selectedSize.basePrice > selectedSize.finalPrice
    ? Math.round(((selectedSize.basePrice - selectedSize.finalPrice) / selectedSize.basePrice) * 100)
    : null;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const getCategoryLabel = (cat: string) =>
    ({ acne: 'Acne Care', hydration: 'Hydration', 'anti-aging': 'Anti-Aging', brightening: 'Brightening', sensitive: 'Sensitive Skin' }[cat] ?? cat);

  if (error) return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-light mb-6">Product Not Found</h1>
        <Link to="/shop" className="text-neutral-600 hover:text-neutral-900 underline underline-offset-4">Back to Shop</Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="pt-24 pb-32 min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="h-4 w-28 bg-neutral-100 rounded-full animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="aspect-[4/5] bg-neutral-100 rounded-3xl animate-pulse" />
          <div className="flex flex-col py-6 gap-5">
            <div className="h-12 w-3/4 bg-neutral-100 rounded-xl animate-pulse" />
            <div className="h-4 w-full bg-neutral-100 rounded-full animate-pulse" />
            <div className="h-4 w-5/6 bg-neutral-100 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const allImages = [
    ...product.image.filter((img: any) => img.isThumbnail),
    ...product.image.filter((img: any) => !img.isThumbnail),
  ];

  return (
    <div className="pt-24 pb-32 min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6">

        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors group font-medium">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start">

          <div className="lg:hidden">
            <MobileGallery images={allImages} title={product.title} />
          </div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="hidden lg:flex sticky top-24 gap-4">
            {allImages.length > 1 && (
              <div className="flex flex-col gap-3">
                {allImages.map((img: any, i: number) => (
                  <button key={img._id ?? i} onClick={() => setActiveImageIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIdx === i ? "border-neutral-900" : "border-transparent opacity-60 hover:opacity-100"
                    }`}>
                    <img src={img.url} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 bg-neutral-100 aspect-[4/5] rounded-3xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img key={activeImageIdx} src={allImages[activeImageIdx]?.url ?? getThumbnail(product.image)}
                  alt={product.title}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }} className="w-full h-full object-cover" />
              </AnimatePresence>
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  {activeImageIdx + 1} / {allImages.length}
                </div>
              )}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col py-2 lg:py-6">

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 px-3 py-1 rounded-full">
                  {getCategoryLabel(product.category)}
                </span>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-neutral-400">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-medium mb-4 leading-tight text-neutral-900">{product.title}</h1>
              <p className="text-neutral-500 text-base md:text-lg mb-6 leading-relaxed">{product.description}</p>

              <AnimatePresence mode="wait">
                {selectedSize && (
                  <motion.div key={selectedSize.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="flex items-center gap-4">
                    <p className="text-3xl font-semibold text-neutral-900">₹{selectedSize.finalPrice.toLocaleString('en-IN')}</p>
                    {selectedSize.basePrice && selectedSize.basePrice > selectedSize.finalPrice && (
                      <>
                        <span className="text-sm text-neutral-400 line-through">₹{selectedSize.basePrice.toLocaleString('en-IN')}</span>
                        {discountPercent && (
                          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">{discountPercent}% OFF</span>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-xs text-neutral-500 mt-2">Inclusive of all taxes</p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700">
                <Leaf size={16} className="text-green-600" />Cruelty-Free
              </div>
              <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700">
                <ShieldCheck size={16} className="text-blue-600" />Dermatologically Tested
              </div>
            </div>
            {product.skinType?.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-neutral-900 mb-3">Suitable For</label>
                <div className="flex flex-wrap gap-2">
                  {product.skinType.map((type: string) => (
                    <span key={type} className="px-4 py-2 text-sm font-medium bg-neutral-100/80 text-neutral-700 rounded-full border border-neutral-200 capitalize">{type}</span>
                  ))}
                </div>
              </div>
            )}

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
                    const isSelected   = selectedSize?._id === size._id;
                    const isOutOfStock = size.stock === 0;
                    return (
                      <button key={size._id} onClick={() => !isOutOfStock && setSelectedSize(size)} disabled={isOutOfStock}
                        className={`relative px-5 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex flex-col items-center gap-0.5 min-w-[72px] ${
                          isSelected ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                          : isOutOfStock ? 'border-neutral-100 text-neutral-300 cursor-not-allowed bg-neutral-50'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:bg-neutral-50'
                        }`}>
                        <span>{size.label}</span>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
                          ₹{size.finalPrice.toLocaleString('en-IN')}
                        </span>
                        {isOutOfStock && <span className="absolute inset-0 flex items-center justify-center"><span className="w-full h-px bg-neutral-300 rotate-[-20deg] absolute" /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart} disabled={!selectedSize || selectedSize.stock === 0}
              className={`w-full py-4 rounded-xl text-base font-medium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-8 transition-all shadow-lg ${
                added ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-neutral-900 text-white shadow-neutral-900/20 hover:bg-neutral-800'
              }`}>
              {added ? <><Check size={20} /> Added to Cart</> : <><ShoppingBag size={20} /> Add to Cart</>}
            </motion.button>

            <div className="mb-8 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-neutral-700" />
                <span className="text-sm font-semibold text-neutral-900">Check Delivery</span>
              </div>
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" maxLength={6} value={pincode}
                  onChange={e => { setPincode(e.target.value.replace(/\D/g, "")); setServiceability(null); setPincodeError(null); }}
                  onKeyDown={e => e.key === "Enter" && handlePincodeCheck()}
                  placeholder="Enter 6-digit pincode"
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white" />
                <button onClick={handlePincodeCheck} disabled={pincodeLoading || pincode.length !== 6}
                  className="px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[90px] justify-center">
                  {pincodeLoading ? <Loader2 size={16} className="animate-spin" /> : "Check"}
                </button>
              </div>
              <AnimatePresence>
                {pincodeError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 mt-3 text-red-600 text-sm">
                    <X size={14} />{pincodeError}
                  </motion.div>
                )}
                {serviceability && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3">
                    {serviceability.serviceable && serviceability.bestOption ? (
                      <div className="flex items-start gap-2">
                        <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-700">Delivery available via {serviceability.bestOption.courierName}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Estimated in <span className="font-semibold text-neutral-700">{serviceability.bestOption.estimatedDays} day{serviceability.bestOption.estimatedDays !== 1 ? "s" : ""}</span>
                            {serviceability.bestOption.etd && <> · by <span className="font-semibold text-neutral-700">{new Date(serviceability.bestOption.etd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></>}
                            {serviceability.bestOption.cod && <span className="ml-2 text-blue-600 font-medium">· COD available</span>}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <X size={16} className="text-red-500 shrink-0" />
                        <p className="text-sm text-red-600 font-medium">Delivery not available at this pincode.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-neutral-200">
              {[
                {
                  key: "details", label: "Product Details",
                  content: product.productDetails?.length > 0 ? (
                    <ul className="text-neutral-600 space-y-3 pb-6 pl-4 list-disc text-sm leading-relaxed">
                      {product.productDetails.map((d: any, i: number) => <li key={i}>{d.title}</li>)}
                    </ul>
                  ) : (
                    <ul className="text-neutral-600 space-y-3 pb-6 pl-4 list-disc text-sm leading-relaxed">
                      <li>Dermatologically tested and approved for sensitive skin</li>
                      <li>100% Vegan, Cruelty-free, and PETA certified</li>
                      <li>Formulated with clean, sustainable ingredients</li>
                      <li>Free from parabens, sulfates, and artificial fragrances</li>
                    </ul>
                  ),
                },
                {
                  key: "usage", label: "How to Use",
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
                  key: "shipping", label: "Shipping & Returns",
                  content: (
                    <div className="text-neutral-600 space-y-4 pb-6 text-sm leading-relaxed">
                      <p><strong>Free Shipping:</strong> On all orders over ₹499 across India.</p>
                      <p><strong>Standard Delivery:</strong> 3-5 business days depending on location.</p>
                      <p><strong>Returns:</strong> 30-day money-back guarantee.</p>
                    </div>
                  ),
                },
              ].map(({ key, label, content }) => (
                <div key={key} className="border-b border-neutral-200">
                  <button onClick={() => setOpenAccordion(openAccordion === key ? null : key)}
                    className="w-full py-5 flex items-center justify-between text-left">
                    <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
                    {openAccordion === key ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
                  </button>
                  <AnimatePresence>
                    {openAccordion === key && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">{content}</motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="mt-16 md:mt-24 border-t border-neutral-200 pt-12 md:pt-16">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-neutral-900">Customer Reviews</h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  <StarDisplay rating={Math.round(avgRating)} size={18} />
                  <span className="text-lg font-semibold text-neutral-900">{avgRating.toFixed(1)}</span>
                  <span className="text-neutral-400 text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                </div>
              )}
            </div>
            <button onClick={handleWriteReview}
              className="flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-5 py-3 rounded-full hover:bg-neutral-700 transition-colors self-start sm:self-auto">
              <Plus size={16} />
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          </div>
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10 p-6 bg-neutral-50 rounded-2xl">
              <div className="flex flex-col items-center justify-center">
                <p className="text-6xl font-semibold text-neutral-900">{avgRating.toFixed(1)}</p>
                <StarDisplay rating={Math.round(avgRating)} size={16} />
                <p className="text-xs text-neutral-400 mt-1">{reviews.length} reviews</p>
              </div>
              <div className="sm:col-span-3 flex flex-col gap-2 justify-center">
                {ratingCounts.map(({ star, count }) => {
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500 w-4 text-right shrink-0">{star}</span>
                      <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: star * 0.05 }}
                          className="h-full bg-amber-400 rounded-full" />
                      </div>
                      <span className="text-xs text-neutral-400 w-6 shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
                <div className="border border-neutral-200 rounded-2xl p-6 bg-white space-y-5">
                  <h3 className="text-base font-semibold text-neutral-900">Your Review</h3>

                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Rating *</label>
                    <StarInput value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Title *</label>
                    <input type="text" placeholder="Summarise your experience"
                      value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-neutral-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-colors" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">Review *</label>
                    <textarea rows={4} placeholder="Tell others what you think about this product..."
                      value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                      className="w-full border border-neutral-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-colors resize-none" />
                  </div>
                  <ImageUploadPicker files={reviewImages} onChange={setReviewImages} />

                  {reviewError && (
                    <p className="text-sm text-red-500 flex items-center gap-1.5"><X size={14} />{reviewError}</p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => { setShowForm(false); setReviewError(null); setReviewImages([]); }}
                      className="flex-1 border border-neutral-200 text-sm font-medium text-neutral-600 py-3 rounded-xl hover:bg-neutral-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSubmitReview} disabled={submitting}
                      className="flex-1 bg-neutral-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      Submit Review
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {reviewsLoading ? (
            <div className="flex items-center justify-center py-16 text-neutral-400 gap-3">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 text-neutral-400">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium text-sm">No reviews yet</p>
              <p className="text-xs mt-1">Be the first to share your experience</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence initial={false}>
                {reviews.map((review, i) => (
                  <motion.div key={review._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }} className="border-b border-neutral-100 pb-8 last:border-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {review.user?.name?.charAt(0).toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{review.user?.name ?? "Anonymous"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarDisplay rating={review.rating} size={12} />
                            {review.isVerifiedPurchase && (
                              <span className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                                <BadgeCheck size={10} />Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400 shrink-0">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {review.title && <p className="text-sm font-semibold text-neutral-900 mb-1">{review.title}</p>}
                    <p className="text-sm text-neutral-600 leading-relaxed">{review.body}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {review.images.map((img, idx) => (
                          <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer"
                            className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-100 hover:opacity-80 transition-opacity">
                            <img src={img.url} alt={`review image ${idx + 1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}