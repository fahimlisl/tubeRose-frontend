import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingCart, 
  Tags, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // In a real app, you would check if user.role === 'admin'
  // For this demo, we'll let any logged-in user see it or redirect if not logged in.
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/products', icon: PackageSearch, label: 'Products' },
    { to: '/admin/offers', icon: Tags, label: 'Offers & Promos' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <NavLink to="/" className="text-xl font-bold tracking-tighter text-neutral-900 flex items-center gap-2">
          <span>GLOW<span className="text-neutral-400 font-light">ADMIN</span></span>
        </NavLink>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-2 mt-4">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-100">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-neutral-50">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-neutral-200 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-30 flex items-center justify-between px-4">
        <NavLink to="/" className="text-lg font-bold tracking-tighter text-neutral-900">
          GLOW<span className="text-neutral-400 font-light">ADMIN</span>
        </NavLink>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-64 max-w-[80%] flex flex-col bg-white h-full shadow-2xl relative z-30 pt-16"
          >
            <SidebarContent />
          </motion.aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
