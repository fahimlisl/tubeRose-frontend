import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Gift,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Power,
} from "lucide-react";
import { adminWalletSettingsApi } from "../../api/admin.api.ts";
import { toast } from "sonner";

interface Settings {
  walletCashbackEnabled: boolean;
  walletCashbackPercent: number;
  walletSpendingEnabled: boolean;
  walletSpendingMaxPercent: number;
  walletSpendingMaxFixedCap: number;
  referralBonusEnabled: boolean;
  referralBonusAmount: number;
}

const defaultSettings: Settings = {
  walletCashbackEnabled: true,
  walletCashbackPercent: 2,
  walletSpendingEnabled: true,
  walletSpendingMaxPercent: 10,
  walletSpendingMaxFixedCap: 200,
  referralBonusEnabled: true,
  referralBonusAmount: 200,
};

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-red-600" : "bg-gray-300"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-md ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  prefix,
  suffix,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 w-40 transition-opacity ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {prefix && (
        <span className="text-gray-600 text-sm font-medium">{prefix}</span>
      )}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (min !== undefined && v < min) return;
          if (max !== undefined && v > max) return;
          onChange(v);
        }}
        disabled={disabled}
        className="bg-transparent text-gray-900 text-sm font-semibold w-full focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && (
        <span className="text-gray-600 text-sm font-medium">{suffix}</span>
      )}
    </div>
  );
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
  children: React.ReactNode;
}

function SectionCard({
  icon,
  title,
  subtitle,
  accentColor,
  children,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
    >
      <div className={`px-6 py-5 border-b border-gray-100 flex items-center gap-4`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColor}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-gray-900 font-semibold text-base">{title}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </motion.div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function AdminWalletSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [original, setOriginal] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminWalletSettingsApi.get();
        setSettings(res.data);
        setOriginal(res.data);
      } catch {
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(original));
  }, [settings, original]);

  const update = (key: keyof Settings, value: boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminWalletSettingsApi.update(settings);
      setOriginal(res.data);
      setSettings(res.data);
      toast.success("Settings saved successfully!");
      setHasChanges(false);
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(original);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-gray-700">Settings</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Wallet & Rewards
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Control cashback earning, wallet spending limits, and referral bonuses.
          </p>
        </div>

        <motion.div
          layout
          className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-6 grid grid-cols-3 gap-4 shadow-sm"
        >
          {[
            {
              label: "Cashback on ₹1,000 order",
              value: settings.walletCashbackEnabled
                ? `₹${Math.floor((1000 * settings.walletCashbackPercent) / 100)}`
                : "Disabled",
              active: settings.walletCashbackEnabled,
            },
            {
              label: "Max wallet use on ₹1,000",
              value: settings.walletSpendingEnabled
                ? `₹${Math.min(
                    Math.floor((1000 * settings.walletSpendingMaxPercent) / 100),
                    settings.walletSpendingMaxFixedCap
                  )}`
                : "Disabled",
              active: settings.walletSpendingEnabled,
            },
            {
              label: "Referral bonus (each)",
              value: settings.referralBonusEnabled
                ? `₹${settings.referralBonusAmount}`
                : "Disabled",
              active: settings.referralBonusEnabled,
            },
          ].map(({ label, value, active }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p
                className={`text-lg font-bold ${
                  active ? "text-gray-900" : "text-gray-300"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="space-y-4">

          <SectionCard
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            title="Wallet Cashback"
            subtitle="Reward users after every successful purchase"
            accentColor="bg-emerald-50"
          >
            <SettingRow
              label="Enable cashback"
              description="Users earn wallet credit after every order"
            >
              <Toggle
                enabled={settings.walletCashbackEnabled}
                onChange={(v) => update("walletCashbackEnabled", v)}
              />
            </SettingRow>

            <SettingRow
              label="Cashback percentage"
              description="% of base order amount credited to wallet"
            >
              <NumberInput
                value={settings.walletCashbackPercent}
                onChange={(v) => update("walletCashbackPercent", v)}
                min={0}
                max={100}
                suffix="%"
                disabled={!settings.walletCashbackEnabled}
              />
            </SettingRow>
          </SectionCard>
          <SectionCard
            icon={<TrendingDown size={18} className="text-blue-600" />}
            title="Wallet Spending"
            subtitle="Control how much wallet balance can be used per order"
            accentColor="bg-blue-50"
          >
            <SettingRow
              label="Enable wallet spending"
              description="Allow users to redeem wallet balance at checkout"
            >
              <Toggle
                enabled={settings.walletSpendingEnabled}
                onChange={(v) => update("walletSpendingEnabled", v)}
              />
            </SettingRow>

            <SettingRow
              label="Max spend (% of order)"
              description="Wallet can cover at most this % of order total"
            >
              <NumberInput
                value={settings.walletSpendingMaxPercent}
                onChange={(v) => update("walletSpendingMaxPercent", v)}
                min={0}
                max={100}
                suffix="%"
                disabled={!settings.walletSpendingEnabled}
              />
            </SettingRow>

            <SettingRow
              label="Hard cap per order"
              description="Absolute ₹ ceiling — whichever limit is lower wins"
            >
              <NumberInput
                value={settings.walletSpendingMaxFixedCap}
                onChange={(v) => update("walletSpendingMaxFixedCap", v)}
                min={0}
                prefix="₹"
                disabled={!settings.walletSpendingEnabled}
              />
            </SettingRow>

            {settings.walletSpendingEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3"
              >
                <AlertCircle size={15} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  On a ₹{(1000).toLocaleString("en-IN")} order, user can use max{" "}
                  <strong>
                    ₹
                    {Math.min(
                      Math.floor((1000 * settings.walletSpendingMaxPercent) / 100),
                      settings.walletSpendingMaxFixedCap
                    ).toLocaleString("en-IN")}
                  </strong>{" "}
                  from wallet (lower of {settings.walletSpendingMaxPercent}% = ₹
                  {Math.floor((1000 * settings.walletSpendingMaxPercent) / 100)} and cap ₹
                  {settings.walletSpendingMaxFixedCap}).
                </p>
              </motion.div>
            )}
          </SectionCard>
          <SectionCard
            icon={<Gift size={18} className="text-red-600" />}
            title="Referral Bonus"
            subtitle="Bonus credited to both parties when a referral code is used"
            accentColor="bg-red-50"
          >
            <SettingRow
              label="Enable referral bonus"
              description="Both referrer and new user receive wallet credit"
            >
              <Toggle
                enabled={settings.referralBonusEnabled}
                onChange={(v) => update("referralBonusEnabled", v)}
              />
            </SettingRow>

            <SettingRow
              label="Bonus amount (each)"
              description="Amount credited to both referrer and new user"
            >
              <NumberInput
                value={settings.referralBonusAmount}
                onChange={(v) => update("referralBonusAmount", v)}
                min={0}
                prefix="₹"
                disabled={!settings.referralBonusEnabled}
              />
            </SettingRow>
          </SectionCard>
        </div>
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-xl">
                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                  <AlertCircle size={15} />
                  Unsaved changes
                </div>
                <div className="w-px h-5 bg-gray-200" />
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save changes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}