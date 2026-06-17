'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/components/GlobalSearch';
import NotificationBell from '@/components/NotificationBell';
import Sidebar from '@/components/Sidebar';
import { Menu, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        <Sidebar onClose={() => {}} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 h-full z-50 lg:hidden"
          >
            <Sidebar onClose={() => setMobileOpen(false)} collapsed={false} onToggleCollapse={() => {}} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-3 overflow-visible">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-lg lg:hidden" aria-label="Open navigation menu">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors rounded-lg" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            <div className="flex-1 min-w-0 max-w-md lg:max-w-xl">
              <GlobalSearch />
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <NotificationBell />
            <div className="hidden sm:block w-px h-5 bg-slate-200 mx-2" />
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white rounded-lg">
                {getInitials(session?.user?.name)}
              </div>
              <div className="min-w-0 hidden md:block">
                <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{session?.user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{session?.user?.role || ''}</p>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}