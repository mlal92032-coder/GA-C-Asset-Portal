'use client';

import { Menu, Plus } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onManageClick?: () => void;
}

export default function DashboardHeader({ onMenuClick, onManageClick }: DashboardHeaderProps) {
  return (
    <>
      {/* Blue Gradient Header - Full width, no gaps */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-lg border-b border-blue-700/30">
        {/* Container */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Top row - Mobile menu, title, actions */}
          <div className="flex items-start justify-between gap-4">
            {/* Left - Title Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={onMenuClick}
                className="p-2 text-white hover:bg-white/20 transition-all duration-200 rounded-lg lg:hidden flex-shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  GA&C Asset Portal
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm font-medium leading-tight mt-0.5">
                  General Administration & Coordination Department
                </p>
              </div>
            </div>

            {/* Right - Notification Bell + Manage Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notification Bell */}
              <div className="flex items-center">
                <NotificationBell isDarkMode={true} />
              </div>

              {/* Manage Assets Button */}
              <button
                onClick={onManageClick}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap text-sm sm:text-base"
                title="Manage Assets"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Manage Assets</span>
                <span className="sm:hidden">Manage</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
