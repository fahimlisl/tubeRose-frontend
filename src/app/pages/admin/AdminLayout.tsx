import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  Megaphone,
  Percent,
} from "lucide-react";

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/admin");
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/products", icon: PackageSearch, label: "Products" },
    { to: "/admin/coupon", icon: Percent, label: "Coupon" },
    { to: "/admin/banner", icon: Megaphone, label: "Banner" },
    {
      label: "Settings",
      icon: Settings,
      children: [
        { to: "/admin/settings/wallet", label: "Wallet" },
        { to: "/admin/settings/shipping", label: "Shipping" },
        { to: "/admin/settings/security", label: "Security" },
        { to: "/admin/settings/change-password", label: "Change Password" },
      ],
    },
  ];

  useEffect(() => {
    if (location.pathname.startsWith("/admin/settings")) {
      setOpenMenu("Settings");
    }
  }, [location.pathname]);

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <NavLink
          to="/"
          className="text-xl font-bold tracking-tighter text-neutral-900 flex items-center gap-2"
        >
          <span>
            TUBEROSE <span className="text-neutral-400 font-light">ADMIN</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-2 mt-4">
          Main Menu
        </div>

        {navItems.map((item) => {
          // ✅ Handle dropdown (Settings)
          if (item.children) {
            const isOpen = openMenu === item.label;

            return (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setOpenMenu(isOpen ? null : item.label)
                  }
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.label}
                  </div>
                </button>

                {isOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-sm transition ${
                            isActive
                              ? "bg-neutral-900 text-white"
                              : "text-neutral-600 hover:bg-neutral-100"
                          }`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-md"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-100">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-neutral-50">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
            {admin?.email?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {admin?.email || "Admin"}
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {admin?.role || "Administrator"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-neutral-200 z-20">
        <SidebarContent />
      </aside>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-30 flex items-center justify-between px-4">
        <NavLink
          to="/"
          className="text-lg font-bold tracking-tighter text-neutral-900"
        >
          TUBEROSE<span className="text-neutral-400 font-light">ADMIN</span>
        </NavLink>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-64 max-w-[80%] flex flex-col bg-white h-full shadow-2xl relative z-30 pt-16"
          >
            <SidebarContent />
          </motion.aside>
        </div>
      )}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}