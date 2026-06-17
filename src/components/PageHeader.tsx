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
// These are the exact hex values for Tailwind 100-level colors
const gradientColorMap: Record<string, { from: string; to: string }> = {
  // From colors (using lighter shades for "from" start)
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

  // To colors (using complementary lighter shades)
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
  gradientFrom = 'from-blue-100',
  gradientTo = 'to-indigo-100',
  iconColor = 'text-blue-600',
  actions,
  stats,
}: PageHeaderProps) {
  // Get gradient colors - fallback to defaults if not found
  const fromColor = gradientColorMap[gradientFrom]?.from || '#eff6ff';
  const toColor = gradientColorMap[gradientTo]?.to || '#e0e7ff';

  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${fromColor}, ${toColor})`,
  };

  return (
    <div className="mb-8">
      <div className="p-6 rounded-2xl shadow-sm border border-slate-200/60" style={gradientStyle}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-2">
              <div className="w-12 h-12 bg-white shadow-sm flex items-center justify-center rounded-xl flex-shrink-0 border border-slate-200/60">
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                {badge && (
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold bg-white/70 ${iconColor} rounded-full mb-1.5 tracking-wide`}>
                    {badge}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-slate-500 text-sm mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {stats && stats.length > 0 && (
              <div className="flex gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-right">
                    <p className="text-3xl sm:text-4xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
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
    </div>
  );
}