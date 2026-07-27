'use client';

import { Menu, Plus, Package } from 'lucide-react';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onManageClick?: () => void;
  badge?: string;
  title?: string;
  subtitle?: string;
}

export default function DashboardHeader({
  onMenuClick,
  onManageClick,
  badge = 'Dashboard',
  title = 'GA&C Asset Portal',
  subtitle = 'General Administration & Coordination Department',
}: DashboardHeaderProps) {
  return (
    <>
      {/* Blue Gradient Header - Full width, extends to top, no gaps */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-lg border-b border-blue-700/30">
        {/* Container - Full padding for proper spacing */}
        <div className="px-2 sm:px-3 lg:px-3 py-1 sm:py-1.5">
          {/* Main Header Row - Icon, Title, Actions */}
          <div className="flex items-start justify-between gap-2">
            {/* Left Section - Mobile Menu + Icon + Title */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={onMenuClick}
                className="p-2 text-white hover:bg-white/20 transition-all duration-200 rounded-lg lg:hidden flex-shrink-0 mt-0.5"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Icon - Desktop only, hidden on mobile */}
              <div className="w-12 h-10 bg-white/20 shadow-lg flex items-center justify-center rounded-xl flex-shrink-0 border border-white/30 backdrop-blur-md hidden sm:flex">
                <Package className="w-6 h-6 text-white" />
              </div>

              {/* Title Section */}
              <div className="min-w-0 flex-1">
                {/* Badge */}
                {badge && (
                  <span className="inline-block px-3 py-1 text-xs font-bold bg-white/25 text-white rounded-full mb-2 tracking-wider shadow-md backdrop-blur-sm">
                    {badge}
                  </span>
                )}
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                  {title}
                </h1>
                {/* Subtitle */}
                <p className="text-blue-100 text-sm sm:text-base font-semibold leading-tight mt-2">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Right Section - Notification Bell + Manage Button */}
            <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0 mt-2 sm:mt-0">
              {/* Notification Bell */}
              <NotificationBell isDarkMode={true} />

              {/* Manage Assets Button */}
              <Link
                href="/admin/users"
                className="flex items-center gap-2 px-3 sm:px-3 py-1 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap text-sm sm:text-base"
                title="Manage Assets"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Manage</span>
                <span className="hidden md:inline">Assets</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
