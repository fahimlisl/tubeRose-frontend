import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transition } from 'framer-motion';
import {
  X, ArrowLeft, Mail, Lock, User as UserIcon,
  Phone, Gift, ChevronRight, RotateCcw,
} from 'lucide-react';
import { useAuth, AuthStep } from '../hooks/useAuth';

// ── Slide animation — same as AuthPage ───────────────────────────────────────
const slideVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0  },
  exit:   { opacity: 0, x: -40 },
};
const transition: Transition = { duration: 0.22, ease: "easeInOut" };

interface AuthModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess?: () => void; // called after login/register completes
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin]             = useState(true);
  const [identifier, setIdentifier]       = useState("");
  const [password, setPassword]           = useState("");
  const [phone, setPhone]                 = useState("");
  const [otp, setOtp]                     = useState(["", "", "", "", "", ""]);
  const [name, setName]                   = useState("");
  const [regEmail, setRegEmail]           = useState("");
  const [regPassword, setRegPassword]     = useState("");
  const [referralCode, setReferralCode]   = useState("");
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    user, isLoading, authStep, setAuthStep,
    login, checkPhoneNumber, sendOtp,
    verifyOtp, register, applyReferralCode, skipReferral,
  } = useAuth();

  // ── Call onSuccess when auth completes ───────────────────────────────────
  useEffect(() => {
    if ((authStep === "done" || user) && isOpen) {
      onSuccess?.();
      onClose();
    }
  }, [authStep, user]);

  // ── OTP resend countdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const t = setTimeout(() => setOtpResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [otpResendTimer]);

  // ── Reset state when modal closes ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsLogin(true);
        setIdentifier(""); setPassword(""); setPhone("");
        setOtp(["", "", "", "", "", ""]); setName("");
        setRegEmail(""); setRegPassword(""); setReferralCode("");
        setAuthStep("idle");
      }, 300);
    }
  }, [isOpen]);

  // ── Block body scroll when open ───────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── OTP helpers ───────────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── Handlers — identical to AuthPage ─────────────────────────────────────
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try { await login(identifier, password); } catch { }
  };

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await checkPhoneNumber(phone);
      await sendOtp();
      setAuthStep("otp");
      setOtpResendTimer(30);
    } catch { }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try { await verifyOtp(otp.join("")); setAuthStep("details"); } catch { }
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    try {
      await sendOtp();
      setOtpResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch { }
  };

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try { await register({ name, email: regEmail, password: regPassword }); setAuthStep("referral"); } catch { }
  };

  const handleReferralSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try { await applyReferralCode(referralCode); } catch { }
  };

  // ── Step progress ─────────────────────────────────────────────────────────
  const steps: AuthStep[]                      = ["phone", "otp", "details", "referral"];
  const currentStepIndex                       = steps.indexOf(authStep);
  const stepLabel: Record<string, string>      = {
    phone: "Phone Number", otp: "Verify OTP",
    details: "Your Details", referral: "Referral Code",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* ── Modal ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 20  }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">

              {/* ── Close button ── */}
              <div className="flex justify-end p-4 pb-0">
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-900"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ── Tab toggle (idle only) ── */}
              {authStep === "idle" && (
                <div className="flex p-1 bg-neutral-100 mx-4 rounded-xl">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isLogin ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setIsLogin(false); setAuthStep("phone"); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      !isLogin ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* ── Step progress bar ── */}
              {authStep !== "idle" && authStep !== "done" && (
                <div className="px-6 pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-500">
                      Step {currentStepIndex + 1} of {steps.length}
                    </span>
                    <span className="text-xs font-medium text-neutral-900">
                      {stepLabel[authStep]}
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-neutral-900 rounded-full"
                      animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}

              {/* ── Step content ── */}
              <div className="p-6 pt-4">
                <AnimatePresence mode="wait">

                  {/* Login */}
                  {authStep === "idle" && isLogin && (
                    <motion.div key="login" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition}>
                      <h2 className="text-xl font-semibold text-neutral-900 mb-1">Welcome back</h2>
                      <p className="text-sm text-neutral-500 mb-5">Sign in to continue with your order.</p>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Email or Phone</label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="text" required value={identifier}
                              onChange={(e) => setIdentifier(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                              placeholder="you@example.com or 9876543210"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                          <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="password" required value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                        <button type="submit" disabled={isLoading}
                          className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {isLoading
                            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            : "Sign In"
                          }
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* Phone */}
                  {authStep === "phone" && (
                    <motion.div key="phone" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition}>
                      <h2 className="text-xl font-semibold text-neutral-900 mb-1">Enter your phone</h2>
                      <p className="text-sm text-neutral-500 mb-5">We'll send an OTP to verify your number.</p>

                      <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pr-2 border-r border-neutral-200 pl-1">+91</span>
                            <input
                              type="tel" required maxLength={10} value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                              className="w-full pl-20 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                              placeholder="9876543210"
                            />
                          </div>
                        </div>
                        <button type="submit" disabled={isLoading || phone.length !== 10}
                          className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {isLoading
                            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            : <> Send OTP <ChevronRight size={14} /> </>
                          }
                        </button>
                        <button type="button" onClick={() => { setAuthStep("idle"); setIsLogin(true); }}
                          className="w-full text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-1"
                        >
                          Already have an account? Sign in
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* OTP */}
                  {authStep === "otp" && (
                    <motion.div key="otp" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition}>
                      <h2 className="text-xl font-semibold text-neutral-900 mb-1">Verify OTP</h2>
                      <p className="text-sm text-neutral-500 mb-5">
                        Code sent to <span className="font-medium text-neutral-900">+91 {phone}</span>
                      </p>

                      <form onSubmit={handleOtpSubmit} className="space-y-5">
                        <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                          {otp.map((digit, i) => (
                            <input key={i}
                              ref={(el) => { otpRefs.current[i] = el; }}
                              type="text" inputMode="numeric" maxLength={1} value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              className="w-11 h-12 text-center text-lg font-semibold border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-colors bg-neutral-50"
                            />
                          ))}
                        </div>
                        <button type="submit" disabled={isLoading || otp.join("").length !== 6}
                          className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {isLoading
                            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            : <> Verify OTP <ChevronRight size={14} /> </>
                          }
                        </button>
                        <div className="flex items-center justify-between">
                          <button type="button" onClick={handleResendOtp} disabled={otpResendTimer > 0}
                            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-40 transition-colors"
                          >
                            <RotateCcw size={13} />
                            {otpResendTimer > 0 ? `Resend in ${otpResendTimer}s` : "Resend OTP"}
                          </button>
                          <button type="button" onClick={() => setAuthStep("phone")}
                            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                          >
                            <ArrowLeft size={13} /> Change number
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Details */}
                  {authStep === "details" && (
                    <motion.div key="details" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition}>
                      <h2 className="text-xl font-semibold text-neutral-900 mb-1">Your details</h2>
                      <p className="text-sm text-neutral-500 mb-5">Almost there — fill in your info.</p>

                      <form onSubmit={handleDetailsSubmit} className="space-y-4">
                        {[
                          { label: "Full Name",      icon: <UserIcon size={16} />, type: "text",     value: name,        set: setName,        placeholder: "John Doe"          },
                          { label: "Email Address",  icon: <Mail size={16} />,     type: "email",    value: regEmail,    set: setRegEmail,    placeholder: "you@example.com"   },
                          { label: "Password",       icon: <Lock size={16} />,     type: "password", value: regPassword, set: setRegPassword, placeholder: "Min. 8 characters" },
                        ].map(({ label, icon, type, value, set, placeholder }) => (
                          <div key={label}>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</span>
                              <input type={type} required minLength={type === "password" ? 8 : undefined}
                                value={value} onChange={(e) => set(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                                placeholder={placeholder}
                              />
                            </div>
                          </div>
                        ))}
                        <button type="submit" disabled={isLoading}
                          className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {isLoading
                            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            : <> Create Account <ChevronRight size={14} /> </>
                          }
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* Referral */}
                  {authStep === "referral" && (
                    <motion.div key="referral" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition}>
                      <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mb-3">
                        <Gift size={20} className="text-neutral-900" />
                      </div>
                      <h2 className="text-xl font-semibold text-neutral-900 mb-1">Got a referral code?</h2>
                      <p className="text-sm text-neutral-500 mb-5">
                        Enter a friend's code and <span className="font-medium text-neutral-900">both get ₹200</span>.
                      </p>
                      <form onSubmit={handleReferralSubmit} className="space-y-4">
                        <input type="text" value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-colors tracking-widest font-mono uppercase"
                          placeholder="e.g. AB12CD34" maxLength={8}
                        />
                        <button type="submit" disabled={isLoading || referralCode.length === 0}
                          className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {isLoading
                            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            : <> Apply Code <ChevronRight size={14} /> </>
                          }
                        </button>
                        <button type="button" onClick={skipReferral}
                          className="w-full py-3 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors rounded-xl hover:bg-neutral-50"
                        >
                          Skip for now
                        </button>
                      </form>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}