import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  X, AlertCircle, CheckCircle2, Loader2, Tag,
  Percent, IndianRupee, Users, Calendar, ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { adminCouponApi } from "../../api/admin.api.ts";
import React from "react";

type CouponType = "flat" | "percentage";
type Category   = "CREAM" | "ALL" | "FACE WASH" | "TONERS" | "CLEANSERS" | "SUNSCREENS";

interface ICoupon {
  _id: string;
  code: string;
  typeOfCoupon: CouponType;
  value: number;
  minCartAmount: number;
  maxDiscount?: number;
  expiryDate?: string;
  isActive: boolean;
  category: Category;
  isForFirstTimeUser: boolean;
  usedCount: number;
  usageLimit?: number;
  perUserLimit?: number;
  createdAt: string;
}

interface CouponForm {
  code: string;
  typeOfCoupon: CouponType;
  value: number | "";
  minCartAmount: number | "";
  maxDiscount: number | "";
  expiryDate: string;
  isActive: boolean;
  category: Category;
  isForFirstTimeUser: boolean;
  usageLimit: number | "";
  perUserLimit: number | "";
}

const EMPTY_FORM: CouponForm = {
  code:               "",
  typeOfCoupon:       "flat",
  value:              "",
  minCartAmount:      "",
  maxDiscount:        "",
  expiryDate:         "",
  isActive:           true,
  category:           "ALL",
  isForFirstTimeUser: false,
  usageLimit:         "",
  perUserLimit:       1,
};

const CATEGORIES: Category[] = ["ALL", "CREAM", "FACE WASH", "TONERS", "CLEANSERS", "SUNSCREENS"];

interface Toast { id: number; message: string; type: "success" | "error" }
let toastId = 0;

export default function AdminCoupon() {
  const [coupons,       setCoupons]       = useState<ICoupon[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [toasts,        setToasts]        = useState<Toast[]>([]);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [form,          setForm]          = useState<CouponForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterActive,  setFilterActive]  = useState<"all" | "active" | "inactive">("all");

  const pushToast = (message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const fetchCoupons = async () => {
    try {
      const res = await adminCouponApi.getAll();
      setCoupons(Array.isArray(res?.data) ? res.data : []);
    } catch {
      pushToast("Failed to fetch coupons", "error");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (coupon: ICoupon) => {
    setEditingId(coupon._id);
    setForm({
      code:               coupon.code,
      typeOfCoupon:       coupon.typeOfCoupon,
      value:              coupon.value,
      minCartAmount:      coupon.minCartAmount,
      maxDiscount:        coupon.maxDiscount ?? "",
      expiryDate:         coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
      isActive:           coupon.isActive,
      category:           coupon.category,
      isForFirstTimeUser: coupon.isForFirstTimeUser,
      usageLimit:         coupon.usageLimit ?? "",
      perUserLimit:       coupon.perUserLimit ?? 1,
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.code.trim())    { pushToast("Code is required", "error"); return; }
    if (!form.value)          { pushToast("Value is required", "error"); return; }
    if (!form.category)       { pushToast("Category is required", "error"); return; }
    if (form.typeOfCoupon === "percentage" && Number(form.value) > 100) {
      pushToast("Percentage cannot exceed 100", "error"); return;
    }
    if (form.typeOfCoupon === "percentage" && !form.maxDiscount) {
      pushToast("Max discount is required for percentage coupons", "error"); return;
    }

    const payload = {
      code:               form.code.toUpperCase().trim(),
      typeOfCoupon:       form.typeOfCoupon,
      value:              Number(form.value),
      minCartAmount:      form.minCartAmount === "" ? 0 : Number(form.minCartAmount),
      maxDiscount:        form.maxDiscount === "" ? undefined : Number(form.maxDiscount),
      expiryDate:         form.expiryDate || undefined,
      isActive:           form.isActive,
      category:           form.category,
      isForFirstTimeUser: form.isForFirstTimeUser,
      usageLimit:         form.usageLimit === "" ? undefined : Number(form.usageLimit),
      perUserLimit:       form.perUserLimit === "" ? 1 : Number(form.perUserLimit),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await adminCouponApi.edit(editingId, payload);
        const updated: ICoupon = res?.data;
        if (updated) setCoupons(prev => prev.map(c => c._id === editingId ? updated : c));
        pushToast("Coupon updated", "success");
      } else {
        const res = await adminCouponApi.add(payload);
        const created: ICoupon = res?.data;
        if (created) setCoupons(prev => [created, ...prev]);
        pushToast("Coupon created", "success");
      }
      closeDrawer();
    } catch (err: any) {
      pushToast(err?.data?.message ?? err?.message ?? "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };
  const handleToggle = async (id: string) => {
    try {
      const res = await adminCouponApi.toggle(id);
      const updated: ICoupon = res?.data;
      if (updated) setCoupons(prev => prev.map(c => c._id === id ? updated : c));
      pushToast(res?.message ?? "Coupon toggled", "success");
    } catch {
      pushToast("Failed to toggle coupon", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminCouponApi.remove(id);
      setCoupons(prev => prev.filter(c => c._id !== id));
      pushToast("Coupon deleted", "success");
    } catch {
      pushToast("Failed to delete coupon", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = coupons.filter(c => {
    if (filterActive === "active")   return c.isActive;
    if (filterActive === "inactive") return !c.isActive;
    return true;
  });


  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <div className="bg-white border-b border-neutral-200 px-6 md:px-10 py-6 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-widest text-neutral-400 uppercase font-medium mb-1">Admin</p>
          <h1 className="text-2xl tracking-tighter font-semibold text-neutral-900">Coupons</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-4 py-2.5 hover:bg-neutral-700 transition-colors"
        >
          <Plus size={16} />
          New Coupon
        </button>
      </div>

      <div className="border-b border-neutral-200 bg-white px-6 md:px-10 py-3 flex items-center gap-6 text-xs text-neutral-500 overflow-x-auto">
        <span>Total: <strong className="text-neutral-900">{coupons.length}</strong></span>
        <span>Active: <strong className="text-green-700">{coupons.filter(c => c.isActive).length}</strong></span>
        <span>Inactive: <strong className="text-neutral-500">{coupons.filter(c => !c.isActive).length}</strong></span>
        <div className="ml-auto flex items-center gap-2">
          {(["all", "active", "inactive"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filterActive === f
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-10 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-neutral-400 gap-3">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading coupons...</span>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-dashed border-neutral-300 bg-white text-center py-24 text-neutral-400"
          >
            <Tag size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No coupons yet</p>
            <p className="text-xs mt-1">Click "New Coupon" to create your first one</p>
          </motion.div>
        ) : (
          <div className="bg-white border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-neutral-100 bg-neutral-50">
              {["Code", "Type & Value", "Category", "Usage", "Status", "Actions"].map(h => (
                <span key={h} className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{h}</span>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {filtered.map((coupon) => (
                <CouponRow
                  key={coupon._id}
                  coupon={coupon}
                  onEdit={() => openEdit(coupon)}
                  onToggle={() => handleToggle(coupon._id)}
                  onDeleteRequest={() => setDeleteConfirm(coupon._id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight text-neutral-900">
                  {editingId ? "Edit Coupon" : "Create Coupon"}
                </h2>
                <button onClick={closeDrawer} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
                <Field label="Coupon Code *">
                  <input
                    type="text"
                    placeholder="SAVE20"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full border border-neutral-200 px-3 py-2.5 text-sm font-mono uppercase text-neutral-900 placeholder:text-neutral-400 placeholder:normal-case focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </Field>
                <Field label="Coupon Type *">
                  <div className="grid grid-cols-2 gap-2">
                    {(["flat", "percentage"] as CouponType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setForm({ ...form, typeOfCoupon: t })}
                        className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium border transition-colors ${
                          form.typeOfCoupon === t
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {t === "flat" ? <IndianRupee size={14} /> : <Percent size={14} />}
                        {t === "flat" ? "Flat (₹)" : "Percentage (%)"}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={`Value * ${form.typeOfCoupon === "flat" ? "(₹)" : "(%)"}`}>
                    <input
                      type="number"
                      min={1}
                      max={form.typeOfCoupon === "percentage" ? 100 : undefined}
                      placeholder={form.typeOfCoupon === "flat" ? "200" : "20"}
                      value={form.value}
                      onChange={e => setForm({ ...form, value: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </Field>
                  {form.typeOfCoupon === "percentage" && (
                    <Field label="Max Discount (₹) *">
                      <input
                        type="number"
                        min={1}
                        placeholder="500"
                        value={form.maxDiscount}
                        onChange={e => setForm({ ...form, maxDiscount: e.target.value === "" ? "" : Number(e.target.value) })}
                        className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                      />
                    </Field>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min Cart (₹)">
                    <input
                      type="number"
                      min={0}
                      placeholder="499"
                      value={form.minCartAmount}
                      onChange={e => setForm({ ...form, minCartAmount: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </Field>
                  <Field label="Expiry Date">
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                      className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </Field>
                </div>
                <Field label="Category *">
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value as Category })}
                      className="w-full appearance-none border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white pr-8"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Global Limit" hint="Total uses allowed">
                    <input
                      type="number"
                      min={1}
                      placeholder="100"
                      value={form.usageLimit}
                      onChange={e => setForm({ ...form, usageLimit: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </Field>
                  <Field label="Per User Limit" hint="Per user uses">
                    <input
                      type="number"
                      min={1}
                      placeholder="1"
                      value={form.perUserLimit}
                      onChange={e => setForm({ ...form, perUserLimit: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </Field>
                </div>

                <div className="h-px bg-neutral-100" />
                <div className="flex flex-col gap-3">
                  <Toggle
                    label="Active"
                    description="Coupon is available for use"
                    value={form.isActive}
                    onChange={v => setForm({ ...form, isActive: v })}
                  />
                  <Toggle
                    label="First-time users only"
                    description="Only valid on a user's first order"
                    value={form.isForFirstTimeUser}
                    onChange={v => setForm({ ...form, isForFirstTimeUser: v })}
                  />
                </div>

              </div>
              <div className="px-6 py-4 border-t border-neutral-100 flex items-center gap-3">
                <button
                  onClick={closeDrawer}
                  className="flex-1 border border-neutral-200 text-sm font-medium text-neutral-600 py-2.5 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-neutral-900 text-white text-sm font-medium py-2.5 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingId ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-full max-w-sm shadow-2xl p-6"
            >
              <h3 className="text-base font-semibold text-neutral-900 mb-1">Delete Coupon?</h3>
              <p className="text-sm text-neutral-500 mb-6">This will also delete all usage history. Cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border border-neutral-200 text-sm font-medium text-neutral-600 py-2.5 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium shadow-lg text-white ${
                t.type === "success" ? "bg-neutral-900" : "bg-red-600"
              }`}
            >
              {t.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
function CouponRow({
  coupon, onEdit, onToggle, onDeleteRequest,
}: {
  coupon: ICoupon;
  onEdit: () => void;
  onToggle: () => void;
  onDeleteRequest: () => void;
}) {
  const isExpired = coupon.expiryDate && new Date() > new Date(coupon.expiryDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors ${
        !coupon.isActive ? "opacity-50" : ""
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-neutral-900 tracking-wider">
            {coupon.code}
          </span>
          {coupon.isForFirstTimeUser && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100">
              1st order
            </span>
          )}
          {isExpired && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100">
              expired
            </span>
          )}
        </div>
        {coupon.expiryDate && !isExpired && (
          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
            <Calendar size={10} />
            Expires {new Date(coupon.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}
        {coupon.minCartAmount > 0 && (
          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
            <ShoppingBag size={10} />
            Min ₹{coupon.minCartAmount.toLocaleString("en-IN")}
          </p>
        )}
      </div>
      <div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 ${
          coupon.typeOfCoupon === "flat"
            ? "bg-blue-50 text-blue-700"
            : "bg-orange-50 text-orange-700"
        }`}>
          {coupon.typeOfCoupon === "flat"
            ? <><IndianRupee size={11} />{coupon.value} off</>
            : <><Percent size={11} />{coupon.value}% off</>
          }
        </span>
        {coupon.maxDiscount && (
          <p className="text-xs text-neutral-400 mt-1">max ₹{coupon.maxDiscount}</p>
        )}
      </div>
      <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 w-fit">
        {coupon.category}
      </span>
      <div>
        <p className="text-sm font-medium text-neutral-900">
          {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
        </p>
        <p className="text-xs text-neutral-400 flex items-center gap-1">
          <Users size={10} />
          {coupon.perUserLimit ? `${coupon.perUserLimit}x per user` : "unlimited"}
        </p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 w-fit ${
        coupon.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
      }`}>
        {coupon.isActive ? "Active" : "Inactive"}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggle}
          title={coupon.isActive ? "Deactivate" : "Activate"}
          className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          {coupon.isActive
            ? <ToggleRight size={22} className="text-green-600" />
            : <ToggleLeft size={22} />
          }
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDeleteRequest}
          className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}
function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-600 tracking-wide uppercase">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
function Toggle({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 border border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
      onClick={() => onChange(!value)}
    >
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
      <div className={`w-9 h-5 rounded-full transition-colors relative ${value ? "bg-neutral-900" : "bg-neutral-200"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-4" : "left-0.5"}`} />
      </div>
    </div>
  );
}