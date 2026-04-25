import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import React from "react";

import { RootLayout } from "./app/layouts/RootLayout";
import { AdminLayout } from "./app/pages/admin/AdminLayout";
import { AuthProvider } from "./app/hooks/useAuth";
import { CartProvider } from "./app/hooks/useCart";
import { AdminAuthProvider } from "./app/context/AdminAuthContext";
import { AdminProtectedRoute } from "./app/components/AdminProtectedRoute";

import { HomePage } from "./app/pages/HomePage";
import { ShopPage } from "./app/pages/ShopPage";
import { ProductDetailPage } from "./app/pages/ProductDetailPage";
import { CartPage } from "./app/pages/CartPage";
import { AboutPage } from "./app/pages/AboutPage";
import { NotFoundPage } from "./app/pages/NotFoundPage";
import { AuthPage } from "./app/pages/AuthPage";
import { AccountPage } from "./app/pages/AccountPage";
import { AdminLogin } from "./app/pages/AdminLogin";
import { AdminDashboard } from "./app/pages/admin/AdminDashboard";
import { AdminProducts } from "./app/pages/admin/AdminProducts";
import { AdminOrders } from "./app/pages/admin/AdminOrders";
import { AdminOffers } from "./app/pages/admin/AdminOffers";
import { AdminAddProduct } from "./app/pages/admin/AdminAddProduct";
import { CheckoutPage } from "./app/pages/CheckoutPage";
import { OrderSuccessPage } from "./app/pages/OrderSuccessPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const duration = 300;
    const start = window.scrollY;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, start * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [pathname]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <Toaster position="bottom-right" theme="light" />
      <ScrollToTop />

      <Routes>
        {/*  Public routes  */}
        <Route element={<RootLayout />}>
          <Route path="/"            element={<HomePage />} />
          <Route path="/shop"        element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart"        element={<CartPage />} />
          <Route path="/about"       element={<AboutPage />} />
          <Route path="/auth"        element={<AuthPage />} />
          <Route path="/account"     element={<AccountPage />} />
          {/* need to change to user section for more secure */}
          <Route path="/checkout" element={<CheckoutPage />} />
<Route path="/order/:orderId" element={<OrderSuccessPage />} />
{/* <Route path="/orders" element={<OrdersPage />} /> // for order history later */}
        </Route>

        {/*  Admin login — outside RootLayout, outside protection  */}
        <Route path="/auth/admin" element={<AdminLogin />} />

        {/*  Protected admin routes  */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index                element={<AdminDashboard />} />
          <Route path="products"      element={<AdminProducts />} />
          <Route path="add/product"   element={<AdminAddProduct />} />
          <Route path="orders"        element={<AdminOrders />} />
          <Route path="offers"        element={<AdminOffers />} />
        </Route>

        {/* 404  */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminAuthProvider>
          <AppRoutes />
        </AdminAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}