'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, Factory, MapPin, Armchair, Monitor,
  Car, BarChart3, LogOut, X, Settings, Package, AlertTriangle, UserCog,
  ClipboardList, ChevronLeft, ChevronRight,
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
  { href: '/admin/delete-requests', label: 'Delete Requests', icon: AlertTriangle, module: 'users' },
  { href: '/admin/offices', label: 'Offices', icon: Building2, module: 'companies' },
  { href: '/admin/manufacturers', label: 'Manufacturers', icon: Factory, module: 'manufacturers' },
  { href: '/admin/locations', label: 'Locations', icon: MapPin, module: 'locations' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList, module: 'audit_logs' },
  { href: '/reports', label: 'Reports', icon: BarChart3, module: 'reports' },
  { href: '/settings', label: 'Settings', icon: Settings, module: 'settings' },
];

interface SidebarProps { onClose: () => void; collapsed: boolean; onToggleCollapse: () => void; }

export default function Sidebar({ onClose, collapsed, onToggleCollapse }: SidebarProps) {
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
  const adminItems = filteredItems.filter((i) => i.href.startsWith('/admin/') && i.href !== '/admin/audit-logs' && i.href !== '/admin/delete-requests');
  const deleteItems = filteredItems.filter((i) => i.href === '/admin/delete-requests');
  const auditItems = filteredItems.filter((i) => i.href === '/admin/audit-logs');
  const reportItems = filteredItems.filter((i) => i.href === '/reports');
  const settingsItems = filteredItems.filter((i) => i.href === '/settings');

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => onClose()}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg mx-2 ${
          isActive
            ? 'bg-blue-50 text-blue-700 border border-blue-100'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
        }`}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="truncate">
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  const renderSection = (title: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        {!collapsed && <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>}
        <div className="space-y-0.5">{items.map(renderNavItem)}</div>
      </div>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full bg-white flex flex-col overflow-hidden flex-shrink-0 border-r border-slate-200"
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center rounded-lg flex-shrink-0">
            <span className="text-[10px] font-bold text-white">SEF</span>
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0 flex-1 overflow-hidden">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate">SEF</h1>
              <p className="text-[10px] text-slate-400 tracking-wide truncate">Asset Manager</p>
            </motion.div>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors rounded-lg lg:hidden">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {renderSection('Overview', overviewItems)}
        {renderSection('Assets', [...allAssetsItem, ...assetItems])}
        {renderSection('Administration', [...adminItems, ...deleteItems])}
        {renderSection('Monitoring', auditItems)}
        {renderSection('Analytics', reportItems)}
        {renderSection('System', settingsItems)}
      </nav>

      {/* Collapse toggle */}
      <button onClick={onToggleCollapse} className="hidden lg:flex items-center justify-center h-8 mx-3 mb-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors rounded-lg">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-100 flex-shrink-0">
        <div className={`flex items-center gap-3 px-2 py-2 bg-slate-50 rounded-lg mb-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white rounded-lg flex-shrink-0">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-slate-700">{session?.user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{userRole === 'SUPER_ADMIN' ? 'Super Admin' : userRole === 'VIEW_USER' ? 'View Only' : 'User'}</p>
            </div>
          )}
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className={`flex items-center gap-3 px-2 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors rounded-lg w-full ${collapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}