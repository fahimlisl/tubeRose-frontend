import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  // explicit role check — logged in as user doesn't count
  if (!admin || admin.role !== "admin") {
    return <Navigate to="/auth/admin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};