import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If the user is already logged in, redirect them to the admin dashboard.
    // Note: In production, you should also verify user.role === 'admin' here.
    if (user && !isLoading) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, location]);

  if (user && !isLoading) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
    // After successful login, the useEffect above will trigger the redirect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4 md:p-8">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to storefront
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden relative">
          {/* Subtle top border accent to distinguish the admin panel */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900" />
          
          <div className="p-8 pt-10">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} className="text-neutral-900" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-2">
              Admin Portal
            </h1>
            <p className="text-sm text-neutral-500 mb-8">
              Sign in with your administrator credentials to access the dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                    placeholder="admin@yourstore.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-neutral-700">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neutral-900 text-white rounded-xl py-3 mt-2 text-sm font-medium hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Authorize Access'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}