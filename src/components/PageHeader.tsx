'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  gradientFrom?: string;
  gradientTo?: string;
  iconColor?: string;
  actions?: ReactNode;
  stats?: { label: string; value: string | number }[];
}

// Map gradient names to actual CSS colors (Tailwind v3+ color palette)
const gradientColorMap: Record<string, { from: string; to: string }> = {
  // Dark gradients (default)
  'from-blue-600': { from: '#2563eb', to: '' },
  'from-blue-700': { from: '#1d4ed8', to: '' },
  'to-blue-800': { from: '', to: '#1e40af' },
  'to-indigo-900': { from: '', to: '#312e81' },

  // Light gradients (fallback)
  'from-blue-100': { from: '#dbeafe', to: '' },
  'from-indigo-100': { from: '#e0e7ff', to: '' },
  'from-pink-100': { from: '#fbcfe8', to: '' },
  'from-rose-100': { from: '#ffe4e6', to: '' },
  'from-green-100': { from: '#dcfce7', to: '' },
  'from-emerald-100': { from: '#d1fae5', to: '' },
  'from-purple-100': { from: '#f3e8ff', to: '' },
  'from-violet-100': { from: '#ede9fe', to: '' },
  'from-orange-100': { from: '#ffedd5', to: '' },
  'from-red-100': { from: '#fee2e2', to: '' },
  'from-cyan-100': { from: '#cffafe', to: '' },
  'from-teal-100': { from: '#ccfbf1', to: '' },
  'from-sky-100': { from: '#e0f2fe', to: '' },

  'to-indigo-100': { from: '', to: '#e0e7ff' },
  'to-rose-100': { from: '', to: '#ffe4e6' },
  'to-emerald-100': { from: '', to: '#d1fae5' },
  'to-violet-100': { from: '', to: '#ede9fe' },
  'to-amber-100': { from: '', to: '#fef3c7' },
  'to-blue-100': { from: '', to: '#dbeafe' },
  'to-cyan-100': { from: '', to: '#cffafe' },
  'to-pink-100': { from: '', to: '#fbcfe8' },
  'to-red-100': { from: '', to: '#fee2e2' },
  'to-sky-100': { from: '', to: '#e0f2fe' },
  'to-teal-100': { from: '', to: '#ccfbf1' },
};

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  gradientFrom = 'from-blue-600',
  gradientTo = 'to-blue-800',
  iconColor = 'text-white',
  actions,
  stats,
}: PageHeaderProps) {
  // Get gradient colors - fallback to defaults if not found
  const fromColor = gradientColorMap[gradientFrom]?.from || '#2563eb';
  const toColor = gradientColorMap[gradientTo]?.to || '#1e40af';

  // Detect if gradient is light (for text color adjustment)
  const isLightGradient = gradientFrom.includes('-100') || gradientTo.includes('-100');
  const titleTextColor = isLightGradient ? 'text-slate-900' : 'text-white';
  const subtitleTextColor = isLightGradient ? 'text-slate-600' : 'text-blue-50';
  const badgeBackground = isLightGradient ? 'bg-slate-900/10' : 'bg-white/25';
  const badgeTextColor = isLightGradient ? 'text-slate-800' : 'text-white';
  const statValueColor = isLightGradient ? 'text-slate-900' : 'text-slate-800';
  const statLabelColor = isLightGradient ? 'text-slate-600' : 'text-slate-500';

  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${fromColor}, ${toColor})`,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 shadow-lg border border-white/30 relative overflow-visible backdrop-blur-xl" style={gradientStyle}>
      {/* Premium background blur layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/8 to-white/15 backdrop-blur-lg" />

      {/* Sophisticated depth layers */}
      {!isLightGradient && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/12 to-transparent rounded-full blur-3xl -translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-400/12 to-transparent rounded-full blur-3xl translate-x-32 translate-y-32" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-blue-500/8 via-indigo-500/5 to-transparent rounded-full blur-3xl" />
        </>
      )}

      {/* Premium accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-1">
              <div className="w-10 h-10 bg-white/20 shadow-lg flex items-center justify-center rounded-lg flex-shrink-0 border border-white/30 backdrop-blur-md">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                {badge && (
                  <span className={`inline-block px-2 py-0.5 text-xs font-bold ${badgeBackground} ${badgeTextColor} rounded-full mb-1 tracking-wider shadow-md backdrop-blur-sm`}>
                    {badge}
                  </span>
                )}
                <h1 className={`text-xl sm:text-2xl font-bold ${titleTextColor} tracking-tight drop-shadow-lg`}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={`${subtitleTextColor} text-xs sm:text-sm mt-1 font-semibold`}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {stats && stats.length > 0 && (
              <div className="flex gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-right">
                    <p className={`text-xl sm:text-2xl font-bold ${statValueColor}`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs ${statLabelColor}`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {actions && (
              <div className="flex items-center gap-2 flex-wrap">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}