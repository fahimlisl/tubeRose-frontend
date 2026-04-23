import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

export function NotFoundPage() {
  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-6xl mb-4">404</h1>
        <p className="text-xl text-neutral-600 mb-8">Page not found</p>
        <Link to="/">
          <motion.button
            whileHover={{ x: -4 }}
            className="border border-neutral-900 text-neutral-900 px-8 py-4 text-sm inline-flex items-center gap-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
