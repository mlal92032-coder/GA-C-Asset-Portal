'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Layout3DProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Layout3D({ children, title, subtitle }: Layout3DProps) {
  return (
    <div
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    >
      {/* Subtle background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-10" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-0 z-20 backdrop-blur-md bg-white/70 border-b border-blue-100/30 py-3"
          >
            <div className="max-w-7xl mx-auto px-6">
              {title && (
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
              )}
              {subtitle && (
                <p className="text-gray-500 text-sm">{subtitle}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-7xl mx-auto px-6 py-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
