import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Truck, Package, CheckCircle2, AlertCircle,
  Loader2, Save, ToggleLeft, ToggleRight, IndianRupee,
} from "lucide-react";
import { adminShippingApi } from "../../api/admin.api.ts";
import React from "react";

interface ShippingConfig {
  _id: string;
  freeShippingEnabled:   boolean;
  freeShippingThreshold: number;
  defaultShippingCost:   number;
  isActive:              boolean;
  updatedBy?:            string;
  updatedAt:             string;
}

interface Toast { id: number; message: string; type: "success" | "error" }
let toastId = 0;

export default function AdminShipping() {
  const [config,     setConfig]     = useState<ShippingConfig | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toasts,     setToasts]     = useState<Toast[]>([]);
  const [freeShippingEnabled,   setFreeShippingEnabled]   = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | "">(499);
  const [defaultShippingCost,   setDefaultShippingCost]   = useState<number | "">(99);
  const [isDirty,               setIsDirty]               = useState(false);

  const pushToast = (message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const fetchConfig = async () => {
    try {
      const res = await adminShippingApi.getSettings();
      const data: ShippingConfig = res?.data;
      setConfig(data);
      setFreeShippingEnabled(data.freeShippingEnabled);
      setFreeShippingThreshold(data.freeShippingThreshold);
      setDefaultShippingCost(data.defaultShippingCost);
      setIsDirty(false);
    } catch {
      pushToast("Failed to fetch shipping settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  useEffect(() => {
    if (!config) return;
    const changed =
      freeShippingEnabled   !== config.freeShippingEnabled   ||
      Number(freeShippingThreshold) !== config.freeShippingThreshold ||
      Number(defaultShippingCost)   !== config.defaultShippingCost;
    setIsDirty(changed);
  }, [freeShippingEnabled, freeShippingThreshold, defaultShippingCost, config]);

  const handleSave = async () => {
    if (!isDirty) return;
    if (!freeShippingEnabled && (freeShippingThreshold === "" || Number(freeShippingThreshold) < 0)) {
      pushToast("Free shipping threshold must be a positive number.", "error");
      return;
    }
    if (defaultShippingCost === "" || Number(defaultShippingCost) < 0) {
      pushToast("Default shipping cost must be a positive number.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await adminShippingApi.updateSettings({
        freeShippingEnabled,
        freeShippingThreshold: Number(freeShippingThreshold),
        defaultShippingCost:   Number(defaultShippingCost),
      });
      setConfig(res?.data);
      setIsDirty(false);
      pushToast("Shipping settings saved!", "success");
    } catch (err: any) {
      pushToast(err?.data?.message ?? err?.message ?? "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  const previewShipping = (cartAmount: number): number => {
    if (freeShippingEnabled) return 0;
    if (cartAmount >= Number(freeShippingThreshold)) return 0;
    return Number(defaultShippingCost);
  };

  const PREVIEW_AMOUNTS = [199, 349, 499, 799];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <div className="bg-white border-b border-neutral-200 px-6 md:px-10 py-6 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-widest text-neutral-400 uppercase font-medium mb-1">Admin</p>
          <h1 className="text-2xl tracking-tighter font-semibold text-neutral-900">Shipping Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 transition-colors ${
            isDirty
              ? "bg-neutral-900 text-white hover:bg-neutral-700"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          }`}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-10 py-10 space-y-6">

        {loading ? (
          <div className="flex items-center justify-center py-32 text-neutral-400 gap-3">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading settings...</span>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {isDirty && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center justify-between bg-amber-50 border border-amber-200 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertCircle size={15} />
                    You have unsaved changes
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchConfig}
                      className="text-xs text-amber-600 hover:text-amber-900 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="text-xs font-medium bg-amber-700 text-white px-3 py-1.5 hover:bg-amber-800 transition-colors flex items-center gap-1.5"
                    >
                      {saving && <Loader2 size={11} className="animate-spin" />}
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-2">
                <Truck size={16} className="text-neutral-400" />
                <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Free Shipping</h2>
              </div>
              <div className="px-6 py-6 space-y-6">
                <div
                  className="flex items-center justify-between p-4 border border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() => setFreeShippingEnabled(v => !v)}
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Always Free Shipping</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      When enabled, all orders ship free regardless of cart amount
                    </p>
                  </div>
                  <div>
                    {freeShippingEnabled
                      ? <ToggleRight size={28} className="text-green-600" />
                      : <ToggleLeft size={28} className="text-neutral-300" />
                    }
                  </div>
                </div>
                <AnimatePresence>
                  {!freeShippingEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4">
                        <Field
                          label="Free Shipping Threshold (₹)"
                          hint="Orders above this amount qualify for free shipping"
                        >
                          <div className="relative">
                            <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="number"
                              min={0}
                              value={freeShippingThreshold}
                              onChange={e => setFreeShippingThreshold(e.target.value === "" ? "" : Number(e.target.value))}
                              className="w-full pl-8 pr-3 py-2.5 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                            />
                          </div>
                        </Field>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-2">
                <Package size={16} className="text-neutral-400" />
                <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Shipping Cost</h2>
              </div>
              <div className="px-6 py-6">
                <Field
                  label="Default Shipping Cost (₹)"
                  hint={
                    freeShippingEnabled
                      ? "Not used — free shipping is always applied"
                      : `Charged when cart is below ₹${freeShippingThreshold || 0}`
                  }
                >
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="number"
                      min={0}
                      value={defaultShippingCost}
                      onChange={e => setDefaultShippingCost(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={freeShippingEnabled}
                      className="w-full pl-8 pr-3 py-2.5 border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </Field>
              </div>
            </div>
            <div className="bg-white border border-neutral-200">
              <div className="px-6 py-5 border-b border-neutral-100">
                <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Live Preview</h2>
                <p className="text-xs text-neutral-400 mt-0.5">How shipping will appear at checkout with current settings</p>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PREVIEW_AMOUNTS.map(amount => {
                    const cost = previewShipping(amount);
                    const isFree = cost === 0;
                    return (
                      <div
                        key={amount}
                        className={`border px-4 py-3 text-center transition-colors ${
                          isFree ? "border-green-200 bg-green-50" : "border-neutral-100 bg-neutral-50"
                        }`}
                      >
                        <p className="text-xs text-neutral-400 mb-1">Cart ₹{amount}</p>
                        <p className={`text-sm font-semibold ${isFree ? "text-green-700" : "text-neutral-900"}`}>
                          {isFree ? "Free" : `₹${cost}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-neutral-50 border border-neutral-100 text-xs text-neutral-500">
                  {freeShippingEnabled ? (
                    <span className="text-green-700 font-medium">✓ All orders ship free regardless of cart total</span>
                  ) : (
                    <>
                      Orders under{" "}
                      <span className="font-semibold text-neutral-900">₹{freeShippingThreshold || 0}</span>
                      {" "}pay{" "}
                      <span className="font-semibold text-neutral-900">₹{defaultShippingCost || 0}</span>
                      {" "}shipping. Orders at or above that threshold ship free.
                    </>
                  )}
                </div>
              </div>
            </div>
            {config?.updatedAt && (
              <p className="text-xs text-neutral-400 text-right">
                Last updated {new Date(config.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
                {config.updatedBy && <> by <span className="font-medium">{config.updatedBy}</span></>}
              </p>
            )}
          </>
        )}
      </div>
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

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-600 tracking-wide uppercase">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}