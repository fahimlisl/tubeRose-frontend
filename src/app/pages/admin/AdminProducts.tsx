import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, RefreshCw, PackageX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminProductApi } from '../../api/admin.api.ts';
import React from 'react';

interface ProductImage {
  _id: string;
  url: string;
  public_id: string;
  isThumbnail: boolean;
}

interface SizeVariant {
  _id: string;
  label: string;
  unit: string;
  basePrice: number;
  finalPrice: number;
  stock: number;
}

interface ProductDetail {
  _id: string;
  title: string;
}

interface Product {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: ProductImage[];
  sizes: SizeVariant[];
  productDetails: ProductDetail[];
  skinType: string[];
  createdAt: string;
  updatedAt: string;
}

export function AdminProducts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminProductApi.getAll();
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteConfirm(null);
    try {
      await adminProductApi.remove(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatus = (product: Product) => {
    const totalStock = product.sizes?.reduce((sum, s) => sum + (s.stock ?? 0), 0) ?? 0;
    if (totalStock === 0) return 'Out of Stock';
    if (totalStock <= 15) return 'Low Stock';
    return 'Active';
  };

  const getThumbnail = (product: Product) => {
    return product.image?.find(img => img.isThumbnail)?.url ?? product.image?.[0]?.url ?? null;
  };

  const getDisplayPrice = (product: Product) => {
    if (!product.sizes?.length) return '—';
    const prices = product.sizes.map(s => s.finalPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max
      ? `₹${min.toLocaleString('en-IN')}`
      : `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}`;
  };

  const getTotalStock = (product: Product) => {
    return product.sizes?.reduce((sum, s) => sum + (s.stock ?? 0), 0) ?? 0;
  };

  const filteredProducts = products.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Products</h1>
        <Link
          to="/admin/add/product"
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={fetchProducts} className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium">
              <RefreshCw size={14} /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={fetchProducts}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-neutral-400" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-neutral-400 gap-3">
            <PackageX size={36} className="text-neutral-300" />
            <p className="text-sm">
              {searchTerm ? `No products matching "${searchTerm}"` : 'No products added yet.'}
            </p>
            {!searchTerm && (
              <Link to="/admin/add/product" className="text-sm font-medium text-neutral-700 underline underline-offset-2">
                Add your first product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Stock</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProducts.map((product, i) => {
                    const status = getStatus(product);
                    const thumb = getThumbnail(product);
                    return (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden">
                              {thumb ? (
                                <img src={thumb} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                  <PackageX size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{product.title}</p>
                              <p className="text-xs text-neutral-400">
                                {product.sizes?.length} variant{product.sizes?.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-neutral-600">{product.category}</td>
                        <td className="p-4 text-sm font-medium text-neutral-900">{getDisplayPrice(product)}</td>
                        <td className="p-4 text-sm text-neutral-600">{getTotalStock(product)} units</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            status === 'Active'     ? 'bg-green-100 text-green-700' :
                            status === 'Low Stock'  ? 'bg-amber-100 text-amber-700' :
                                                     'bg-red-100 text-red-700'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {deleteConfirm === product._id ? (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-neutral-500">Delete?</span>
                                <button
                                  onClick={() => handleDelete(product._id)}
                                  disabled={deletingId === product._id}
                                  className="px-2 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                                >
                                  {deletingId === product._id ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 border border-neutral-200 rounded font-medium hover:bg-neutral-50 transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigate(`/admin/edit/product/${product._id}`)}
                                  className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(product._id)}
                                  className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="p-4 border-t border-neutral-100 text-xs text-neutral-400">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  );
}