import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { adminAuth } from "../api/admin.api.ts";

interface AdminUser {
  _id: string;
  role: string;
  email?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on mount = checking session
  const [error, setError] = useState<string | null>(null);

  // Check existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Don't call refresh on mount - it fails if no refresh token exists
        // Instead, just try to access a protected route to see if we have a valid session
        // The API layer will handle token refresh automatically on 401

        // For now, we'll just load from localStorage if it exists
        const storedAdmin = localStorage.getItem("admin_user");
        if (storedAdmin) {
          const parsed = JSON.parse(storedAdmin);
          if (parsed?.role === "admin") {
            setAdmin(parsed);
          } else {
            setAdmin(null);
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminAuth.login({ email, password });
      const adminData = res.data?.admin ?? {
        _id: res.data?._id,
        role: "admin",
        email,
      };

      setAdmin(adminData);
      // Store admin data in localStorage for persistence
      localStorage.setItem("admin_user", JSON.stringify(adminData));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed!";
      console.error("❌ Login error:", message);
      setError(message);
      throw err; // re-throw so the component can react
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await adminAuth.logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Logout failed!";
      setError(message);
      console.error("⚠️  Logout error (continuing):", message);
    } finally {
      // Always clear admin state and localStorage, even if logout API fails
      setAdmin(null);
      localStorage.removeItem("admin_user");
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, isLoading, error, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
};
