import { useState, FormEvent, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Transition } from "framer-motion";
import { useAuth, AuthStep } from "../hooks/useAuth";
import {
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Gift,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const transition: Transition = { duration: 0.22, ease: "easeInOut" };


export function AuthPage() {
  const [isLogin, setIsLogin]         = useState(true);
  const [identifier, setIdentifier]   = useState("");   
  const [password, setPassword]       = useState("");

  const [phone, setPhone]             = useState("");
  const [otp, setOtp]                 = useState(["", "", "", "", "", ""]);
  const [name, setName]               = useState("");
  const [regEmail, setRegEmail]       = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    user, isLoading, authStep, setAuthStep,
    login, checkPhoneNumber, sendOtp,
    verifyOtp, register, applyReferralCode, skipReferral,
  } = useAuth();

  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname || "/account";

  useEffect(() => {
    if (user && !isLoading) navigate(from, { replace: true });
  }, [user, isLoading]);

  useEffect(() => {
    if (authStep === "done") navigate(from, { replace: true });
  }, [authStep]);

  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const t = setTimeout(() => setOtpResendTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [otpResendTimer]);

  if (user && !isLoading) return null;

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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(identifier, password);
    } catch { /* toast shown in hook */ }
  };

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await checkPhoneNumber(phone);
      await sendOtp();
      setAuthStep("otp");
      setOtpResendTimer(30);
    } catch { /* toast shown in hook */ }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await verifyOtp(otp.join(""));
      setAuthStep("details");
    } catch { /* toast shown in hook */ }
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    try {
      await sendOtp();
      setOtpResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch { /* toast shown in hook */ }
  };

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email: regEmail, password: regPassword });
      setAuthStep("referral");
    } catch { /* toast shown in hook */ }
  };

  const handleReferralSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await applyReferralCode(referralCode);
    } catch { /* toast shown in hook */ }
  };

  const steps: AuthStep[] = ["phone", "otp", "details", "referral"];
  const currentStepIndex  = steps.indexOf(authStep);

  const stepLabel: Record<string, string> = {
    phone:   "Phone Number",
    otp:     "Verify OTP",
    details: "Your Details",
    referral: "Referral Code",
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 p-4 md:p-8">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to store
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">

          {/* ── Login / Signup tab toggle (only on idle) ── */}
          {authStep === "idle" && (
            <div className="flex p-1 bg-neutral-100 m-4 rounded-xl">
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

          {/* ── Registration step progress bar ── */}
          {authStep !== "idle" && authStep !== "done" && (
            <div className="px-6 pt-6">
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

          <div className="p-6 pt-5">
            <AnimatePresence mode="wait">

              {authStep === "idle" && isLogin && (
                <motion.div
                  key="login"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={transition}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Welcome back
                  </h1>
                  <p className="text-sm text-neutral-500 mb-6">
                    Sign in with your email or phone number.
                  </p>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Email or Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                          <Mail size={18} />
                        </div>
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={e => setIdentifier(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="you@example.com or 9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex justify-end mt-1.5">
                        <a href="#" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                          Forgot password?
                        </a>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : "Sign In"}
                    </button>
                  </form>
                </motion.div>
              )}

              {authStep === "phone" && (
                <motion.div
                  key="phone"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={transition}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Enter your phone
                  </h1>
                  <p className="text-sm text-neutral-500 mb-6">
                    We'll send an OTP to verify your number.
                  </p>

                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                          <Phone size={18} />
                        </div>
                        <div className="absolute inset-y-0 left-9 flex items-center pointer-events-none">
                          <span className="text-sm text-neutral-500 pr-2 border-r border-neutral-200">+91</span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="block w-full pl-20 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || phone.length !== 10}
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <> Send OTP <ChevronRight size={16} /> </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setAuthStep("idle"); setIsLogin(true); }}
                      className="w-full text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-1"
                    >
                      Already have an account? Sign in
                    </button>
                  </form>
                </motion.div>
              )}

              {authStep === "otp" && (
                <motion.div
                  key="otp"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={transition}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Verify OTP
                  </h1>
                  <p className="text-sm text-neutral-500 mb-6">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium text-neutral-900">+91 {phone}</span>
                  </p>

                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 text-center text-lg font-semibold border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors bg-neutral-50"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 6}
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <> Verify OTP <ChevronRight size={16} /> </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpResendTimer > 0}
                        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <RotateCcw size={14} />
                        {otpResendTimer > 0 ? `Resend in ${otpResendTimer}s` : "Resend OTP"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAuthStep("phone")}
                      className="w-full text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-1 flex items-center justify-center gap-1"
                    >
                      <ArrowLeft size={14} /> Change phone number
                    </button>
                  </form>
                </motion.div>
              )}

              {authStep === "details" && (
                <motion.div
                  key="details"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={transition}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Your details
                  </h1>
                  <p className="text-sm text-neutral-500 mb-6">
                    Almost there — fill in your info to create your account.
                  </p>

                  <form onSubmit={handleDetailsSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                          <UserIcon size={18} />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="Min. 8 characters"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <> Create Account <ChevronRight size={16} /> </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {authStep === "referral" && (
                <motion.div
                  key="referral"
                  variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={transition}
                >
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
                    <Gift size={24} className="text-neutral-900" />
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Got a referral code?
                  </h1>
                  <p className="text-sm text-neutral-500 mb-2">
                    Enter a friend's referral code and{" "}
                    <span className="font-medium text-neutral-900">both of you get ₹200</span>{" "}
                    added to your wallets.
                  </p>

                  <form onSubmit={handleReferralSubmit} className="space-y-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Referral Code
                      </label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={e => setReferralCode(e.target.value.toUpperCase())}
                        className="block w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm tracking-widest font-mono uppercase"
                        placeholder="e.g. AB12CD34"
                        maxLength={8}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || referralCode.length === 0}
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <> Apply Code <ChevronRight size={16} /> </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={skipReferral}
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
      </div>
    </div>
  );
}