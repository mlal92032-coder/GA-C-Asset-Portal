'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import AppFooter from '@/components/AppFooter';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function DashboardLayout({
  children,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  totalItems = 0,
  onPageChange,
  onItemsPerPageChange,
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col relative overflow-x-hidden">
      {/* Background layers for professional look */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/8 to-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-indigo-500/5 to-blue-500/8 rounded-full blur-3xl" />
      </div>

      {/* Main Layout with Sidebar and Content */}
      <div className="flex flex-1 min-h-0 relative">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mobile-backdrop fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar - LEFT SIDE, STICKY AT TOP */}
      <motion.div
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:flex lg:flex-shrink-0 lg:z-30 sticky top-0 h-screen overflow-y-auto"
      >
        <Sidebar onClose={() => {}} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} setMobileOpen={setMobileOpen} />
      </motion.div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 h-full z-50 lg:hidden"
          >
            <Sidebar onClose={() => setMobileOpen(false)} collapsed={false} onToggleCollapse={() => {}} setMobileOpen={setMobileOpen} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT SIDE - Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/40 border-b border-slate-200/60 flex items-center px-4 sm:px-6 gap-3 overflow-visible shadow-md backdrop-blur-sm relative lg:hidden">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg" aria-label="Open navigation menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Footer */}
        <AppFooter
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
      </div>
    </div>
  );
}