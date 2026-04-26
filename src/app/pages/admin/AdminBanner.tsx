import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, AlertCircle, CheckCircle2, Loader2, ChevronUp } from "lucide-react";
import { adminBannerApi } from "../../api/admin.api.ts";

interface IBanner {
  _id: string;
  message: string;
  isActive: boolean;
  priority: number;
  bgColor: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface BannerForm {
  message: string;
  priority: number | "";
  bgColor: string;
  startDate: string;
  endDate: string;
}

const EMPTY_FORM: BannerForm = {
  message: "",
  priority: "",
  bgColor: "#171717",
  startDate: "",
  endDate: "",
};

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastId = 0;

export default function AdminBanner() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const pushToast = (message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const fetchBanners = async () => {
    try {
      const res = await adminBannerApi.getAll();
      const list = res?.data;
      setBanners(Array.isArray(list) ? list : []);
    } catch {
      pushToast("Failed to fetch banners", "error");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (banner: IBanner) => {
    setEditingId(banner._id);
    setForm({
      message: banner.message,
      priority: banner.priority,
      bgColor: banner.bgColor ?? "#171717",
      startDate: banner.startDate ? banner.startDate.slice(0, 10) : "",
      endDate: banner.endDate ? banner.endDate.slice(0, 10) : "",
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.message.trim()) {
      pushToast("Message is required", "error");
      return;
    }

    const payload = {
      message: form.message.trim(),
      priority: form.priority === "" ? 0 : Number(form.priority),
      bgColor: form.bgColor,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await adminBannerApi.edit(editingId, payload);
        const updated: IBanner = res?.data;
        if (updated) {
          setBanners((prev) => prev.map((b) => (b._id === editingId ? updated : b)));
        }
        pushToast("Banner updated", "success");
      } else {
        const res = await adminBannerApi.add(payload);
        const created: IBanner = res?.data;
        if (created) {
          setBanners((prev) => [created, ...prev]);
        }
        pushToast("Banner created", "success");
      }
      closeDrawer();
    } catch (err: any) {
      const msg =
        err?.data?.message ??
        err?.message ??
        "Something went wrong";
      pushToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await adminBannerApi.toggle(id);
      const updated: IBanner = res?.data;
      if (updated) {
        setBanners((prev) => prev.map((b) => (b._id === id ? updated : b)));
      }
      pushToast(res?.message ?? "Banner toggled", "success");
    } catch {
      pushToast("Failed to toggle banner", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminBannerApi.remove(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      pushToast("Banner deleted", "success");
    } catch {
      pushToast("Failed to delete banner", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <div className="bg-white border-b border-neutral-200 px-6 md:px-10 py-6 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-widest text-neutral-400 uppercase font-medium mb-1">Admin</p>
          <h1 className="text-2xl tracking-tighter font-semibold text-neutral-900">Announcement Banners</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-4 py-2.5 hover:bg-neutral-700 transition-colors"
        >
          <Plus size={16} />
          New Banner
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-10 py-10">

        {loading ? (
          <div className="flex items-center justify-center py-32 text-neutral-400 gap-3">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading banners...</span>
          </div>
        ) : banners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-dashed border-neutral-300 bg-white text-center py-24 text-neutral-400"
          >
            <p className="text-sm font-medium">No banners yet</p>
            <p className="text-xs mt-1">Click "New Banner" to create your first one</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {banners.map((banner) => (
                <BannerRow
                  key={banner._id}
                  banner={banner}
                  onEdit={() => openEdit(banner)}
                  onToggle={() => handleToggle(banner._id)}
                  onDeleteRequest={() => setDeleteConfirm(banner._id)}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight text-neutral-900">
                  {editingId ? "Edit Banner" : "Create Banner"}
                </h2>
                <button onClick={closeDrawer} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
                <div>
                  <p className="text-xs text-neutral-400 font-medium tracking-wide uppercase mb-2">Preview</p>
                  <div
                    className="text-white text-xs py-2 text-center tracking-wide font-medium transition-colors duration-300"
                    style={{ backgroundColor: form.bgColor || "#171717" }}
                  >
                    {form.message || "Your message will appear here"}
                  </div>
                </div>

                <div className="h-px bg-neutral-100" />
                <Field label="Message *">
                  <textarea
                    rows={3}
                    placeholder="Free shipping on all orders over ₹499"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                  />
                </Field>
                <Field label="Priority" hint="Higher number = shown first">
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </Field>
                <Field label="Background Color">
                  <div className="flex items-center gap-3 border border-neutral-200 px-3 py-2">
                    <input
                      type="color"
                      value={form.bgColor}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      className="w-7 h-7 cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-sm text-neutral-600 font-mono">{form.bgColor}</span>
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Date">
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </Field>
                  <Field label="End Date">
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </Field>
                </div>
                <p className="text-xs text-neutral-400 -mt-3">Leave dates empty for a permanent banner</p>

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
                  {editingId ? "Save Changes" : "Create Banner"}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-full max-w-sm shadow-2xl p-6"
            >
              <h3 className="text-base font-semibold text-neutral-900 mb-1">Delete Banner?</h3>
              <p className="text-sm text-neutral-500 mb-6">This action cannot be undone.</p>
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
          {toasts.map((t) => (
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

function BannerRow({
  banner,
  onEdit,
  onToggle,
  onDeleteRequest,
}: {
  banner: IBanner;
  onEdit: () => void;
  onToggle: () => void;
  onDeleteRequest: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`bg-white border flex flex-col md:flex-row md:items-center gap-4 px-5 py-4 transition-colors ${
        banner.isActive ? "border-neutral-200" : "border-neutral-100 opacity-60"
      }`}
    >
      <div
        className="w-1 self-stretch hidden md:block flex-shrink-0"
        style={{ backgroundColor: banner.bgColor ?? "#171717" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate">{banner.message}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-0.5 ${
              banner.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {banner.isActive ? "Active" : "Inactive"}
          </span>
          {banner.priority > 0 && (
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <ChevronUp size={12} /> Priority {banner.priority}
            </span>
          )}
          {banner.endDate && (
            <span className="text-xs text-neutral-400">
              Ends{" "}
              {new Date(banner.endDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onToggle}
          title={banner.isActive ? "Deactivate" : "Activate"}
          className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          {banner.isActive ? (
            <ToggleRight size={22} className="text-green-600" />
          ) : (
            <ToggleLeft size={22} />
          )}
        </button>
        <button
          onClick={onEdit}
          title="Edit"
          className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={onDeleteRequest}
          title="Delete"
          className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-600 tracking-wide uppercase">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}