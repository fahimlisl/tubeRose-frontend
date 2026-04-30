// src/pages/admin/settings/ChangePassword.tsx

import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
// import { adminAuthSettings } from "@/api/admin.api";
import { adminAuthSettings } from "../../api/admin.api.ts";
import React from "react";

interface FormState {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface FieldVisibility {
  oldPassword: boolean;
  newPassword: boolean;
  confirmNewPassword: boolean;
}

export function ChangePassword() {
  const [form, setForm] = useState<FormState>({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [show, setShow] = useState<FieldVisibility>({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [loading, setLoading] = useState(false);

  const toggleShow = (field: keyof FieldVisibility) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (form.oldPassword === form.newPassword) {
      toast.error("New password cannot be the same as the current one.");
      return;
    }

    try {
      setLoading(true);
      await adminAuthSettings.changePassword(form);
      toast.success("Password updated successfully.");
      setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fields: {
    name: keyof FormState;
    label: string;
    placeholder: string;
  }[] = [
    {
      name: "oldPassword",
      label: "Current Password",
      placeholder: "Enter current password",
    },
    {
      name: "newPassword",
      label: "New Password",
      placeholder: "Min. 8 characters",
    },
    {
      name: "confirmNewPassword",
      label: "Confirm New Password",
      placeholder: "Re-enter new password",
    },
  ];

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={20} className="text-neutral-700" />
          <h1 className="text-xl font-semibold text-neutral-900">
            Change Password
          </h1>
        </div>
        <p className="text-sm text-neutral-500">
          Update your admin account password
        </p>
      </div>

      {/* Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ name, label, placeholder }) => (
            <div key={name} className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                <Lock size={13} className="text-neutral-400" />
                {label}
              </label>
              <div className="relative">
                <input
                  type={show[name] ? "text" : "password"}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(name)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                  tabIndex={-1}
                >
                  {show[name] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          {/* Hint */}
          <p className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2.5">
            ⚡ Password must be at least 8 characters and different from your
            current one.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}