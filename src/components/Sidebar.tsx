'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonHover, buttonTap } from '@/lib/animations';
import {
  LayoutDashboard, Users, Building2, Factory, MapPin, Armchair, Monitor,
  Car, LogOut, X, Package, AlertTriangle, UserCog, Settings,
  ClipboardList, ChevronLeft, ChevronRight, Menu,
} from 'lucide-react';
import { getAccessibleModules, type Module } from '@/lib/permissions';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  module: Module | null;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { href: '/employees', label: 'Employees', icon: UserCog, module: 'dashboard' },
  { href: '/assets/all', label: 'All Assets', icon: Package, module: 'dashboard' },
  { href: '/assets/furniture', label: 'Furniture', icon: Armchair, module: 'furniture' },
  { href: '/assets/electronics', label: 'Electronics', icon: Monitor, module: 'electronics' },
  { href: '/assets/vehicles', label: 'Vehicles', icon: Car, module: 'vehicles' },
  { href: '/admin/users', label: 'Users', icon: Users, module: 'users' },
  { href: '/admin/requests', label: 'Requests & Approvals', icon: AlertTriangle, module: 'users' },
  { href: '/admin/offices', label: 'Offices', icon: Building2, module: 'companies' },
  { href: '/admin/manufacturers', label: 'Manufacturers', icon: Factory, module: 'manufacturers' },
  { href: '/admin/locations', label: 'Locations', icon: MapPin, module: 'locations' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList, module: 'audit_logs' },
  { href: '/settings', label: 'Settings', icon: Settings, module: null },
];

interface SidebarProps { onClose: () => void; collapsed: boolean; onToggleCollapse: () => void; setMobileOpen?: (open: boolean) => void; }

export default function Sidebar({ onClose, collapsed, onToggleCollapse, setMobileOpen = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user?.role as string) || '';
  const permissionsJson = (session?.user?.permissions as string) || null;
  const accessibleModules = getAccessibleModules(userRole, permissionsJson);
  const alwaysAccessible = ['/dashboard', '/employees', '/assets/all'];

  const filteredItems = navItems.filter((item) => {
    if (alwaysAccessible.includes(item.href)) return true;
    if (!item.module) return true;
    return accessibleModules.includes(item.module);
  });

  const overviewItems = filteredItems.filter((i) => i.href === '/dashboard' || i.href === '/employees');
  const allAssetsItem = filteredItems.filter((i) => i.href === '/assets/all');
  const assetItems = filteredItems.filter((i) => i.href.startsWith('/assets/') && i.href !== '/assets/all');
  const adminItems = filteredItems.filter((i) => i.href.startsWith('/admin/') && i.href !== '/admin/audit-logs' && i.href !== '/admin/requests');
  const requestsItems = filteredItems.filter((i) => i.href === '/admin/requests');
  const auditItems = filteredItems.filter((i) => i.href === '/admin/audit-logs');
  const settingsItems = filteredItems.filter((i) => i.href === '/settings');

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
    return (
      <motion.div key={item.href} whileHover={!isActive ? { x: 4 } : {}} whileTap={{ x: 2 }}>
        <Link
          href={item.href}
          onClick={() => onClose()}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl mx-2 ${
            isActive
              ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 border border-blue-300/60 shadow-md backdrop-blur-sm'
              : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-200/40 hover:to-slate-100/40 hover:text-slate-900 border border-transparent hover:border-slate-300/40 hover:backdrop-blur-sm'
          }`}
          title={collapsed ? item.label : undefined}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="truncate">
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>
    );
  };

  const renderSection = (title: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        {!collapsed && <p className="px-4 mb-2.5 text-[10px] font-extrabold text-blue-700 uppercase tracking-widest drop-shadow-sm bg-gradient-to-r from-blue-500/10 to-indigo-500/10 py-1.5 rounded-lg">{title}</p>}
        <div className="space-y-1">{items.map(renderNavItem)}</div>
      </div>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full bg-gradient-to-b from-slate-50 via-white to-blue-50/30 flex flex-col overflow-hidden flex-shrink-0 border-r border-slate-200/60 shadow-lg relative"
    >
      {/* Header with gradient - Sticky */}
      <div className="sticky top-0 z-10 border-b border-blue-700/30 flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg">
        {/* Header row - Logo on left, Dashboard info on right */}
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left - Logo and Organization */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white flex-shrink-0 shadow-md border border-slate-200/60 flex items-center justify-center">
              <Image
                src="/sef-logo.png"
                alt="SEF Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
                <h1 className="text-xs font-bold text-white truncate">Sindh Education Foundation</h1>
                <p className="text-[10px] text-blue-100 font-semibold truncate">Government of Sindh</p>
              </motion.div>
            )}
          </div>

          {/* Right - Collapse Button */}
          <button onClick={onToggleCollapse} className="p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 rounded-lg hidden lg:flex flex-shrink-0" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Nav - scrollable middle section */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {renderSection('Overview', overviewItems)}
        {renderSection('Assets', [...allAssetsItem, ...assetItems])}
        {renderSection('Administration', [...adminItems, ...requestsItems])}
        {renderSection('Monitoring', auditItems)}
        {renderSection('Configuration', settingsItems)}
      </nav>


      {/* User - Fixed at bottom */}
      <div className="px-3 py-4 border-t border-slate-200/60 flex-shrink-0 bg-gradient-to-b from-transparent to-blue-50/40">
        <div className={`flex items-center gap-3 px-3 py-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mb-3 shadow-md ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-white/20 flex items-center justify-center text-xs font-bold text-white rounded-lg flex-shrink-0 border border-white/30">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white">{session?.user?.name || 'User'}</p>
              <p className="text-[10px] text-white/75 truncate">{userRole === 'SUPER_ADMIN' ? 'Super Admin' : userRole === 'VIEW_USER' ? 'View Only' : 'User'}</p>
            </div>
          )}
        </div>

        <motion.button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg w-full border border-transparent hover:border-red-200/50 ${collapsed ? 'justify-center' : ''}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div whileHover={{ rotate: 10 }}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
          </motion.div>
          {!collapsed && <span>Sign Out</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}