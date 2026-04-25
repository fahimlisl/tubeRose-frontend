import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import React from "react";
import { toast } from "sonner";
import { publicAuthApi } from "../api/public.api.ts";
import { userCartApi } from "../api/user.api.ts";
import { userAuthApi } from "../api/user.api.ts";
import type { CartItem } from "./useCart";

const ANON_CART_KEY = "tuberose_cart";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export type AuthStep =
  | "idle"
  | "phone"
  | "otp"
  | "details"
  | "referral"
  | "done";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authStep: AuthStep;
  setAuthStep: (step: AuthStep) => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkPhoneNumber: (phoneNumber: string) => Promise<void>;
  sendOtp: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  applyReferralCode: (code: string) => Promise<void>;
  skipReferral: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mergeAnonymousCart = async () => {
  try {
    const saved = localStorage.getItem(ANON_CART_KEY);
    if (!saved) {
      return;
    }

    const localItems: CartItem[] = JSON.parse(saved);
    if (!localItems.length) {
      return;
    }
    const anonymousCart = localItems.map((item) => ({
      productId: item.product._id,
      sizeLabel: item.sizeLabel,
      quantity: item.quantity,
    }));

    await userCartApi.merge(anonymousCart);
    localStorage.removeItem(ANON_CART_KEY); 
  } catch (err) {
    console.error("⚠️  Merge failed (silent continue):", err);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authStep, setAuthStep] = useState<AuthStep>("idle");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("user_auth");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.role === "user") {
            setUser(parsed);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await userAuthApi.login({ identifier, password });
      const userData = res.data?.user;
      if (!userData) throw new Error("Invalid response from server.");
      setUser(userData);
      localStorage.setItem("user_auth", JSON.stringify(userData)); 

      await mergeAnonymousCart(); 
      toast.success("Welcome back!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed.";
      console.error("❌ Login error:", message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await userAuthApi.logout();
    } catch {
      // even if request fails, clear local state
    } finally {
      setUser(null);
      setAuthStep("idle");
      localStorage.removeItem("user_auth");
      localStorage.removeItem(ANON_CART_KEY);
      setIsLoading(false);
      toast.success("Logged out successfully.");
    }
  };

  const checkPhoneNumber = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      await publicAuthApi.checkPhoneNumber(phoneNumber);
      toast.success("Phone number verified!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to check phone number.";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    setIsLoading(true);
    try {
      await publicAuthApi.sendOtp();
      toast.success("OTP sent to your phone!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send OTP.";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    setIsLoading(true);
    try {
      await publicAuthApi.verifyOtp(otp);
      toast.success("OTP verified!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP.";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await publicAuthApi.register(data);
      const userData = res.data?.user; 
      if (!userData) throw new Error("Registration failed.");

      setUser(userData);
      await mergeAnonymousCart(); 
      toast.success("Account created successfully!");
      setAuthStep("referral");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed.";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const applyReferralCode = async (code: string) => {
    setIsLoading(true);
    try {
      await publicAuthApi.applyReferralCode(code);
      toast.success("Referral code applied! ₹200 added to your wallet.");
      setAuthStep("done");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid referral code.";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const skipReferral = () => {
    setAuthStep("done");
    toast.success("Welcome aboard!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authStep,
        setAuthStep,
        login,
        logout,
        checkPhoneNumber,
        sendOtp,
        verifyOtp,
        register,
        applyReferralCode,
        skipReferral,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
