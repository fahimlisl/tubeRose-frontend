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
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";
import { publicForgotPasswordApi } from "../api/public.api.ts";
import { toast } from "sonner";

type ForgotStep = "idle" | "forgot-phone" | "forgot-otp" | "forgot-done";

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const transition: Transition = { duration: 0.22, ease: "easeInOut" };

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
    />
  );
}

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const [forgotStep, setForgotStep] = useState<ForgotStep>("idle");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResendTimer, setForgotResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    user,
    isLoading,
    authStep,
    setAuthStep,
    login,
    checkPhoneNumber,
    sendOtp,
    verifyOtp,
    register,
    applyReferralCode,
    skipReferral,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/account";

  useEffect(() => {
    if (user && !isLoading && authStep !== "referral")
      navigate(from, { replace: true });
  }, [user, isLoading, authStep, navigate, from]);

  useEffect(() => {
    if (authStep === "done") navigate(from, { replace: true });
  }, [authStep, navigate, from]);

  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const t = setTimeout(() => setOtpResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [otpResendTimer]);

  useEffect(() => {
    if (forgotResendTimer <= 0) return;
    const t = setTimeout(() => setForgotResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [forgotResendTimer]);

  if (user && !isLoading && authStep !== "referral") return null;

  const makeOtpHandlers = (
    otpState: string[],
    setOtpState: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  ) => ({
    onChange: (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const next = [...otpState];
      next[index] = value.slice(-1);
      setOtpState(next);
      if (value && index < 5) refs.current[index + 1]?.focus();
    },
    onKeyDown: (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otpState[index] && index > 0)
        refs.current[index - 1]?.focus();
    },
    onPaste: (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (pasted.length === 6) {
        setOtpState(pasted.split(""));
        refs.current[5]?.focus();
      }
      e.preventDefault();
    },
  });

  const signupOtp = makeOtpHandlers(otp, setOtp, otpRefs);
  const forgotOtpH = makeOtpHandlers(forgotOtp, setForgotOtp, forgotOtpRefs);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(identifier, password);
    } catch {}
  };

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await checkPhoneNumber(phone);
      await sendOtp();
      setAuthStep("otp");
      setOtpResendTimer(30);
    } catch {}
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await verifyOtp(otp.join(""));
      setAuthStep("details");
    } catch {}
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    try {
      await sendOtp();
      setOtpResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch {}
  };

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email: regEmail, password: regPassword });
    } catch {}
  };

  const handleReferralSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await applyReferralCode(referralCode);
    } catch {}
  };

  const handleForgotPhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await publicForgotPasswordApi.sendOtp({ phoneNumber: forgotPhone });
      setForgotStep("forgot-otp");
      setForgotResendTimer(30);
      toast.success("OTP sent to your phone!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResendOtp = async () => {
    if (forgotResendTimer > 0) return;
    setForgotLoading(true);
    try {
      await publicForgotPasswordApi.sendOtp({ phoneNumber: forgotPhone });
      setForgotResendTimer(30);
      setForgotOtp(["", "", "", "", "", ""]);
      forgotOtpRefs.current[0]?.focus();
      toast.success("OTP resent!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to resend OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Min. 8 characters required.");
      return;
    }
    setForgotLoading(true);
    try {
      await publicForgotPasswordApi.verifyOtp({
        otp: forgotOtp.join(""),
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      setForgotStep("forgot-done");
    } catch (err: any) {
      toast.error(err?.message ?? "Invalid OTP or session expired.");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setForgotStep("idle");
    setForgotPhone("");
    setForgotOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setForgotResendTimer(0);
  };

  const isForgotFlow = forgotStep !== "idle";
  const steps: AuthStep[] = ["phone", "otp", "details", "referral"];
  const stepIndex = steps.indexOf(authStep);
  const stepLabel: Record<string, string> = {
    phone: "Phone Number",
    otp: "Verify OTP",
    details: "Your Details",
    referral: "Referral Code",
  };
  const handleForgotOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...forgotOtp];
    next[index] = value.slice(-1);
    setForgotOtp(next);
    if (value && index < 5) forgotOtpRefs.current[index + 1]?.focus();
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0)
      forgotOtpRefs.current[index - 1]?.focus();
  };

  const handleForgotOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setForgotOtp(pasted.split(""));
      forgotOtpRefs.current[5]?.focus();
    }
    e.preventDefault();
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
          {authStep === "idle" && !isForgotFlow && (
            <div className="flex p-1 bg-neutral-100 m-4 rounded-xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isLogin
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setAuthStep("phone");
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !isLogin
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Create Account
              </button>
            </div>
          )}
          {authStep !== "idle" && authStep !== "done" && !isForgotFlow && (
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-neutral-500">
                  Step {stepIndex + 1} of {steps.length}
                </span>
                <span className="text-xs font-medium text-neutral-900">
                  {stepLabel[authStep]}
                </span>
              </div>
              <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-neutral-900 rounded-full"
                  animate={{
                    width: `${((stepIndex + 1) / steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}
          {isForgotFlow && forgotStep !== "forgot-done" && (
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-neutral-500">
                  Step {forgotStep === "forgot-phone" ? 1 : 2} of 2
                </span>
                <span className="text-xs font-medium text-neutral-900">
                  {forgotStep === "forgot-phone"
                    ? "Phone Verification"
                    : "Reset Password"}
                </span>
              </div>
              <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-neutral-900 rounded-full"
                  animate={{
                    width: forgotStep === "forgot-phone" ? "50%" : "100%",
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          <div className="p-6 pt-5">
            <AnimatePresence mode="wait">
              {authStep === "idle" && isLogin && !isForgotFlow && (
                <motion.div
                  key="login"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
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
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
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
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex justify-end mt-1.5">
                        <button
                          type="button"
                          onClick={() => setForgotStep("forgot-phone")}
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Spinner /> : "Sign In"}
                    </button>
                  </form>
                </motion.div>
              )}
              {authStep === "phone" && (
                <motion.div
                  key="phone"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
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
                        <Phone
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                        <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pr-2 border-r border-neutral-200">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, ""))
                          }
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
                        <Spinner />
                      ) : (
                        <>
                          {" "}
                          Send OTP <ChevronRight size={16} />{" "}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep("idle");
                        setIsLogin(true);
                      }}
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
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Verify OTP
                  </h1>
                  <p className="text-sm text-neutral-500 mb-6">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium text-neutral-900">
                      +91 {phone}
                    </span>
                  </p>
                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div
                      className="flex gap-2 justify-between"
                      onPaste={signupOtp.onPaste}
                    >
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            signupOtp.onChange(i, e.target.value)
                          }
                          onKeyDown={(e) => signupOtp.onKeyDown(i, e)}
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
                        <Spinner />
                      ) : (
                        <>
                          {" "}
                          Verify OTP <ChevronRight size={16} />{" "}
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpResendTimer > 0}
                        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <RotateCcw size={14} />
                        {otpResendTimer > 0
                          ? `Resend in ${otpResendTimer}s`
                          : "Resend OTP"}
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
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Your details
                  </h1>
                  <p className="text-sm text-neutral-500 mb-6">
                    Almost there — fill in your info to create your account.
                  </p>
                  <form onSubmit={handleDetailsSubmit} className="space-y-4">
                    {[
                      {
                        label: "Full Name",
                        icon: <UserIcon size={18} />,
                        type: "text",
                        value: name,
                        set: setName,
                        placeholder: "John Doe",
                      },
                      {
                        label: "Email Address",
                        icon: <Mail size={18} />,
                        type: "email",
                        value: regEmail,
                        set: setRegEmail,
                        placeholder: "you@example.com",
                      },
                      {
                        label: "Password",
                        icon: <Lock size={18} />,
                        type: "password",
                        value: regPassword,
                        set: setRegPassword,
                        placeholder: "Min. 8 characters",
                      },
                    ].map(({ label, icon, type, value, set, placeholder }) => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          {label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                            {icon}
                          </span>
                          <input
                            type={type}
                            required
                            minLength={type === "password" ? 8 : undefined}
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                            placeholder={placeholder}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <Spinner />
                      ) : (
                        <>
                          {" "}
                          Create Account <ChevronRight size={16} />{" "}
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {authStep === "referral" && (
                <motion.div
                  key="referral"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
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
                    <span className="font-medium text-neutral-900">
                      both of you get ₹200
                    </span>{" "}
                    added to your wallets.
                  </p>
                  <form
                    onSubmit={handleReferralSubmit}
                    className="space-y-4 mt-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Referral Code
                      </label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) =>
                          setReferralCode(e.target.value.toUpperCase())
                        }
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
                        <Spinner />
                      ) : (
                        <>
                          {" "}
                          Apply Code <ChevronRight size={16} />{" "}
                        </>
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

              {forgotStep === "forgot-phone" && (
                <motion.div
                  key="forgot-phone"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
                    <KeyRound size={22} className="text-neutral-900" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Forgot password?
                  </h1>
                  <p className="text-sm text-neutral-500 mb-6">
                    Enter your registered phone number. We'll send an OTP to
                    reset your password.
                  </p>
                  <form
                    onSubmit={handleForgotPhoneSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                        <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pr-2 border-r border-neutral-200">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={forgotPhone}
                          onChange={(e) =>
                            setForgotPhone(e.target.value.replace(/\D/g, ""))
                          }
                          className="block w-full pl-20 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading || forgotPhone.length !== 10}
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <Spinner />
                      ) : (
                        <>
                          {" "}
                          Send OTP <ChevronRight size={16} />{" "}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForgotFlow}
                      className="w-full text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-1 flex items-center justify-center gap-1"
                    >
                      <ArrowLeft size={14} /> Back to sign in
                    </button>
                  </form>
                </motion.div>
              )}
              {forgotStep === "forgot-otp" && (
                <motion.div
                  key="forgot-otp"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">
                    Reset your password
                  </h1>
                  <p className="text-sm text-neutral-500 mb-6">
                    Enter the OTP sent to{" "}
                    <span className="font-medium text-neutral-900">
                      +91 {forgotPhone}
                    </span>{" "}
                    and choose a new password.
                  </p>
                  <form onSubmit={handleForgotOtpSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        OTP
                      </label>
                      <div
                        className="flex gap-2 justify-between"
                        onPaste={handleForgotOtpPaste}
                      >
                        {forgotOtp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              forgotOtpRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleForgotOtpChange(i, e.target.value)
                            }
                            onKeyDown={(e) => handleForgotOtpKeyDown(i, e)}
                            className="w-11 h-12 text-center text-lg font-semibold border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors bg-neutral-50"
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                          placeholder="Min. 8 characters"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm ${
                            confirmPassword && newPassword !== confirmPassword
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          }`}
                          placeholder="Re-enter new password"
                        />
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        forgotLoading ||
                        forgotOtp.join("").length !== 6 ||
                        !newPassword ||
                        newPassword !== confirmPassword
                      }
                      className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <Spinner />
                      ) : (
                        <>
                          {" "}
                          Reset Password <ChevronRight size={16} />{" "}
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleForgotResendOtp}
                        disabled={forgotResendTimer > 0 || forgotLoading}
                        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <RotateCcw size={14} />
                        {forgotResendTimer > 0
                          ? `Resend in ${forgotResendTimer}s`
                          : "Resend OTP"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setForgotStep("forgot-phone")}
                      className="w-full text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-1 flex items-center justify-center gap-1"
                    >
                      <ArrowLeft size={14} /> Change phone number
                    </button>
                  </form>
                </motion.div>
              )}
              {forgotStep === "forgot-done" && (
                <motion.div
                  key="forgot-done"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 size={32} className="text-green-600" />
                  </motion.div>
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
                    Password reset!
                  </h1>
                  <p className="text-sm text-neutral-500 mb-8">
                    Your password has been updated. Sign in with your new
                    password.
                  </p>
                  <button
                    onClick={() => {
                      resetForgotFlow();
                      setIsLogin(true);
                    }}
                    className="w-full bg-neutral-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98]"
                  >
                    Sign In
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
