import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Save, Plus, Trash2,
  UploadCloud, Check, Loader2, X, AlertCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminProductApi } from '../../api/admin.api.ts';

type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
type SizeLabel = '15ml' | '30ml' | '50ml' | '100ml' | '200ml' | '15g' | '30g' | '50g' | '100g' | '200g';
type Unit = 'ml' | 'g';

interface SizeVariant {
  label: SizeLabel;
  unit: Unit;
  basePrice: number;
  finalPrice: number;
  stock: number;
}

interface ProductDetail {
  title: string;
}

interface ExistingImage {
  url: string;
  public_id: string;
  isThumbnail: boolean;
}

interface NewImage {
  file: File;
  previewUrl: string;
  isThumbnail: boolean;
}

interface FormState {
  title: string;
  category: string;
  description: string;
  skinType: SkinType[];
  sizes: SizeVariant[];
  productDetails: ProductDetail[];
}

const SKIN_TYPES: SkinType[] = ['oily', 'dry', 'combination', 'sensitive', 'normal'];
const SIZE_LABELS: SizeLabel[] = ['15ml', '30ml', '50ml', '100ml', '200ml', '15g', '30g', '50g', '100g', '200g'];
const CATEGORIES = ['Cleansers', 'Toners', 'Serums', 'Moisturizers', 'Sunscreens'];

export function AdminEditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    title: '',
    category: '',
    description: '',
    skinType: [],
    sizes: [],
    productDetails: [],
  });

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  useEffect(() => {
    const load = async () => {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const res = await adminProductApi.getById(id!);
        const p = res?.data;
        if (!p) throw new Error('Product not found.');

        setFormData({
          title: p.title ?? '',
          category: p.category ?? '',
          description: p.description ?? '',
          skinType: p.skinType ?? [],
          sizes: p.sizes?.map((s: SizeVariant) => ({
            label: s.label,
            unit: s.unit,
            basePrice: s.basePrice ?? 0,
            finalPrice: s.finalPrice ?? 0,
            stock: s.stock ?? 0,
          })) ?? [],
          productDetails: p.productDetails?.map((d: ProductDetail) => ({ title: d.title ?? '' })) ?? [],
        });

        setExistingImages(p.image ?? []);
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load product.');
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [id]);
  const handleRemoveExisting = (publicId: string) => {
    setRemovedPublicIds(prev => [...prev, publicId]);
    setExistingImages(prev => {
      const updated = prev.filter(img => img.public_id !== publicId);
      const wasThumb = prev.find(img => img.public_id === publicId)?.isThumbnail;
      if (wasThumb && updated.length > 0) updated[0] = { ...updated[0], isThumbnail: true };
      return updated;
    });
  };

  const handleSetExistingThumbnail = (publicId: string) => {
    setExistingImages(prev => prev.map(img => ({ ...img, isThumbnail: img.public_id === publicId })));
    setNewImages(prev => prev.map(img => ({ ...img, isThumbnail: false })));
  };
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const noExistingThumb = !existingImages.some(img => img.isThumbnail);
    const noNewThumb = !newImages.some(img => img.isThumbnail);

    const previews: NewImage[] = files.map((file, i) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isThumbnail: noExistingThumb && noNewThumb && i === 0,
    }));

    setNewImages(prev => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveNew = (index: number) => {
    setNewImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].previewUrl);
      if (prev[index].isThumbnail && updated.length > 0) updated[0] = { ...updated[0], isThumbnail: true };
      return updated;
    });
  };

  const handleSetNewThumbnail = (index: number) => {
    setExistingImages(prev => prev.map(img => ({ ...img, isThumbnail: false })));
    setNewImages(prev => prev.map((img, i) => ({ ...img, isThumbnail: i === index })));
  };

  const handleAddSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { label: '30ml', unit: 'ml', basePrice: 0, finalPrice: 0, stock: 0 }],
    }));
  };

  const handleRemoveSize = (i: number) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, idx) => idx !== i) }));
  };

  const handleSizeChange = (index: number, field: keyof SizeVariant, value: string | number) => {
    setFormData(prev => {
      const s = [...prev.sizes];
      s[index] = { ...s[index], [field]: value };
      return { ...prev, sizes: s };
    });
  };
  const handleAddDetail = () => {
    setFormData(prev => ({ ...prev, productDetails: [...prev.productDetails, { title: '' }] }));
  };

  const handleRemoveDetail = (i: number) => {
    setFormData(prev => ({ ...prev, productDetails: prev.productDetails.filter((_, idx) => idx !== i) }));
  };

  const handleDetailChange = (i: number, value: string) => {
    setFormData(prev => {
      const d = [...prev.productDetails];
      d[i] = { title: value };
      return { ...prev, productDetails: d };
    });
  };
  const handleSkinTypeToggle = (type: SkinType) => {
    setFormData(prev => ({
      ...prev,
      skinType: prev.skinType.includes(type)
        ? prev.skinType.filter(t => t !== type)
        : [...prev.skinType, type],
    }));
  };
  const validate = (): string | null => {
    if (!formData.title.trim())         return 'Product title is required.';
    if (!formData.category)             return 'Category is required.';
    if (!formData.description.trim())   return 'Description is required.';
    if (formData.skinType.length === 0) return 'Select at least one skin type.';
    if (formData.sizes.length === 0)    return 'At least one size variant is required.';
    for (const [i, size] of formData.sizes.entries()) {
      if (!size.finalPrice || size.finalPrice <= 0)
        return `Final price is required for size variant #${i + 1}.`;
    }
    if (existingImages.length + newImages.length === 0)
      return 'At least one product image is required.';
    return null;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validErr = validate();
    if (validErr) {
      setError(validErr);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('category', formData.category);
      payload.append('description', formData.description.trim());
      payload.append('skinType', JSON.stringify(formData.skinType));
      payload.append('sizes', JSON.stringify(formData.sizes));
      payload.append('productDetails', JSON.stringify(formData.productDetails.filter(d => d.title.trim())));

      if (removedPublicIds.length > 0) {
        payload.append('removedImagePublicIds', JSON.stringify(removedPublicIds));
      }

      newImages.forEach(img => payload.append('image', img.file));

      await adminProductApi.edit(id!, payload);

      setSuccess(true);
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong, please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-neutral-600 text-sm">{fetchError}</p>
        <Link to="/admin/products" className="text-sm font-medium text-neutral-700 underline underline-offset-2">
          Back to Products
        </Link>
      </div>
    );
  }

  type ImageEntry =
    | { type: 'existing'; url: string; public_id: string; isThumbnail: boolean }
    | { type: 'new'; index: number; file: File; previewUrl: string; isThumbnail: boolean };

  const allImages: ImageEntry[] = [
    ...existingImages.map(img => ({ type: 'existing' as const, ...img })),
    ...newImages.map((img, i) => ({ type: 'new' as const, index: i, ...img })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-12">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-neutral-50/80 backdrop-blur-md z-10 py-4 border-b border-neutral-200/50 -mx-4 px-4 md:-mx-8 md:px-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 text-neutral-500 hover:bg-neutral-200/50 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Edit Product</h1>
            <p className="text-sm text-neutral-500 truncate max-w-xs">{formData.title}</p>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting || success}
          className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> :
           success      ? <><Check size={18} /> Saved!</> :
                          <><Save size={18} /> Save Changes</>}
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Product Title</label>
                <input type="text" required value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea required rows={4} value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all resize-y" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Inventory & Variants</h2>
                <p className="text-sm text-neutral-500">Manage size variants and pricing.</p>
              </div>
              <button type="button" onClick={handleAddSize}
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={16} /> Add Size
              </button>
            </div>
            <div className="space-y-4">
              <AnimatePresence>
                {formData.sizes.map((size, index) => (
                  <motion.div key={index} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Size</label>
                      <select value={size.label} onChange={e => handleSizeChange(index, 'label', e.target.value as SizeLabel)}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900">
                        {SIZE_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Unit</label>
                      <select value={size.unit} onChange={e => handleSizeChange(index, 'unit', e.target.value as Unit)}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900">
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Base Price (₹)</label>
                      <input type="number" min="0" value={size.basePrice}
                        onChange={e => handleSizeChange(index, 'basePrice', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Final Price (₹)*</label>
                      <input type="number" min="0" required value={size.finalPrice}
                        onChange={e => handleSizeChange(index, 'finalPrice', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Stock</label>
                      <input type="number" min="0" value={size.stock}
                        onChange={e => handleSizeChange(index, 'stock', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    </div>
                    {formData.sizes.length > 1 && (
                      <button type="button" onClick={() => handleRemoveSize(index)}
                        className="h-9 w-9 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Key Features / Details</h2>
                <p className="text-sm text-neutral-500">Highlight specific benefits or ingredients.</p>
              </div>
              <button type="button" onClick={handleAddDetail}
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={16} /> Add Detail
              </button>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {formData.productDetails.map((detail, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neutral-900 mt-1 shrink-0" />
                    <input type="text" value={detail.title} onChange={e => handleDetailChange(index, e.target.value)}
                      placeholder="e.g. Contains 2% Salicylic Acid"
                      className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
                    <button type="button" onClick={() => handleRemoveDetail(index)}
                      className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {formData.productDetails.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">No details added.</p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Product Images</h2>
            <p className="text-xs text-neutral-400">
              {existingImages.length + newImages.length} image{existingImages.length + newImages.length !== 1 ? 's' : ''} total · hover any to set as cover
            </p>

            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud size={20} className="text-neutral-500" />
              </div>
              <p className="text-sm font-medium text-neutral-900 mb-1">Upload new images</p>
              <p className="text-xs text-neutral-500">PNG, JPG or WEBP</p>
            </div>

            {allImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                {allImages.map((img, i) => (
                  <div key={i} className="aspect-square bg-neutral-100 rounded-lg border border-neutral-200 relative group overflow-hidden">
                    <img src={img.type === 'existing' ? img.url : img.previewUrl} alt="" className="w-full h-full object-cover" />

                    {img.isThumbnail && (
                      <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded font-medium z-10">
                        Cover
                      </span>
                    )}
                    {img.type === 'new' && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] px-1 py-0.5 rounded font-medium z-10">
                        New
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                      {!img.isThumbnail && (
                        <button type="button"
                          onClick={() => img.type === 'existing' ? handleSetExistingThumbnail(img.public_id) : handleSetNewThumbnail(img.index)}
                          className="px-2 py-1 bg-white rounded text-neutral-700 hover:bg-neutral-100 text-[10px] font-medium">
                          Cover
                        </button>
                      )}
                      <button type="button"
                        onClick={() => img.type === 'existing' ? handleRemoveExisting(img.public_id) : handleRemoveNew(img.index)}
                        className="p-1 bg-white rounded text-red-600 hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Organization</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900">
                <option value="" disabled>Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">Suitable Skin Types</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map(type => {
                  const isSelected = formData.skinType.includes(type);
                  return (
                    <button key={type} type="button" onClick={() => handleSkinTypeToggle(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                      }`}>
                      {isSelected && <Check size={14} />}
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}