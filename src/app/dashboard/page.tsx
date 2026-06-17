'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/Button';
import {
  Package,
  Armchair,
  Monitor,
  Car,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  BarChart3,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Simple stat bar component (no external chart lib needed)
function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-sm font-medium text-slate-600 truncate">{label}</span>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-lg font-bold text-slate-800 ml-3">{value}</span>
    </div>
  );
}

interface DashboardData {
  totalAssets: number;
  furnitureCount: number;
  electronicCount: number;
  vehicleCount: number;
  conditionBreakdown: { good: number; repair: number; damaged: number };
  statusBreakdown: { inUse: number; inStore: number; disposed: number };
  assetsByLocation: { locationName: string; count: number }[];
  assetsByCompany: { companyName: string; count: number }[];
  recentAssets: { id: string; name: string; type: string; date: string; assetTag?: string; condition?: string; status?: string }[];
  sampleAssetTags: {
    furniture: { assetTag: string; assetName: string }[];
    electronic: { assetTag: string; assetName: string }[];
    vehicle: { assetTag: string; assetName: string }[];
  };
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const STATUS_COLORS = ['#3b82f6', '#10b981', '#64748b'];

// Animated counter component
function AnimatedCounter({ target, duration = 800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const startValue = 0;

          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // Ease out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easedProgress * (target - startValue) + startValue));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={ref} className="stat-number">{count.toLocaleString()}</span>;
}

// Custom Donut Chart component (bypasses Recharts 3.x Cell deprecation)
function DonutChart({ data, colors }: { data: { name: string; value: number; fill?: string }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const size = 220;
  const center = size / 2;

  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, i) => {
          if (item.value <= 0) return null;
          const pct = item.value / total;
          const dash = circumference * pct;
          const gap = circumference - dash;
          const color = item.fill || colors[i] || '#64748b';
          const startOffset = -offset;
          offset += dash;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="36"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={startOffset}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
        })}
        {/* Center text */}
        <text x={center} y={center - 6} textAnchor="middle" className="text-2xl font-bold" fill="#1e293b">
          {total}
        </text>
        <text x={center} y={center + 16} textAnchor="middle" className="text-xs" fill="#64748b">
          Total
        </text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {data.map((item, i) => {
          const color = item.fill || colors[i] || '#64748b';
          return (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span>{item.name}</span>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Condition badge component
function ConditionBadge({ condition }: { condition: string }) {
  const config: Record<string, { className: string; icon: any }> = {
    GOOD: { className: 'badge-success', icon: CheckCircle },
    REPAIR: { className: 'badge-warning', icon: AlertTriangle },
    DAMAGED: { className: 'badge-danger', icon: XCircle },
  };

  const { className, icon: Icon } = config[condition] || { className: 'badge-secondary', icon: Package };

  return (
    <span className={`badge ${className}`}>
      <Icon className="w-3 h-3" />
      {condition.charAt(0) + condition.slice(1).toLowerCase()}
    </span>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; icon: any }> = {
    IN_USE: { className: 'badge-blue', icon: TrendingUp },
    IN_STORE: { className: 'badge-success', icon: Package },
    DISPOSED: { className: 'badge-secondary', icon: XCircle },
  };

  const { className, icon: Icon } = config[status] || { className: 'badge-secondary', icon: Package };

  return (
    <span className={`badge ${className}`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ').charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
    </span>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = (session?.user?.role as string) || '';
  const userPermissionsJson = (session?.user?.permissions as string) || null;
  const hasPermission = (module: string) => {
    if (userRole === 'SUPER_ADMIN') return true;
    if (userRole === 'VIEW_USER') return true; // can view dashboard
    if (!userPermissionsJson) return false;
    try {
      const perms = JSON.parse(userPermissionsJson);
      if (Array.isArray(perms)) {
        // Legacy format: string[]
        return perms.includes(module);
      }
      // New format: { [module]: string[] }
      const moduleActions = perms[module];
      return Array.isArray(moduleActions) && moduleActions.includes('view');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/dashboard/stats', {
          credentials: 'include',
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          const errorMsg = json.error || `HTTP ${res.status}: ${res.statusText}`;
          setError(errorMsg);
          return;
        }

        setData(json.data);
      } catch (err: any) {
        setError('Failed to load dashboard. Please refresh the page or log in again.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="w-24 h-4 skeleton mb-2" />
              <div className="w-40 h-8 skeleton mb-2" />
              <div className="w-56 h-4 skeleton" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-10 skeleton rounded-lg" />
              <div className="w-28 h-10 skeleton rounded-lg" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-40 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="w-28 h-4 skeleton mb-2" />
              <div className="w-40 h-3 skeleton mb-6" />
              <div className="w-44 h-44 skeleton mx-auto rounded-full" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="card border-red-500/20 p-10 max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <p className="font-semibold text-xl mb-2 text-slate-800">Unable to load dashboard</p>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  // Ensure sampleAssetTags exists (fallback to empty arrays)
  const sampleAssetTags = data.sampleAssetTags || {
    furniture: [],
    electronic: [],
    vehicle: [],
  };

  const conditionData = [
    { name: 'Good', value: data.conditionBreakdown.good, fill: '#10b981' },
    { name: 'Repair', value: data.conditionBreakdown.repair, fill: '#f59e0b' },
    { name: 'Damaged', value: data.conditionBreakdown.damaged, fill: '#ef4444' },
  ];

  const statusData = [
    { name: 'In Use', value: data.statusBreakdown.inUse, fill: '#3b82f6' },
    { name: 'In Store', value: data.statusBreakdown.inStore, fill: '#10b981' },
    { name: 'Disposed', value: data.statusBreakdown.disposed, fill: '#64748b' },
  ];

  const typeChartData = [
    { name: 'Furniture', value: data.furnitureCount, fill: '#8b5cf6' },
    { name: 'Electronics', value: data.electronicCount, fill: '#10b981' },
    { name: 'Vehicles', value: data.vehicleCount, fill: '#f97316' },
  ];

  const locationChartData = data.assetsByLocation.map((loc) => ({
    name: loc.locationName.length > 20 ? loc.locationName.slice(0, 20) + '...' : loc.locationName,
    count: loc.count,
  }));

  // Build stat cards based on permissions
  const allStatCards = [
    {
      title: 'Total Assets',
      value: data.totalAssets,
      icon: Package,
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-100',
      badgeColor: 'text-blue-700',
      hoverBorder: 'hover:border-blue-300',
      percentage: '+12',
      href: '/assets/all',
      permission: 'assets_all',
      sampleTags: [
        ...sampleAssetTags.furniture.slice(0, 3),
        ...sampleAssetTags.electronic.slice(0, 2),
      ],
    },
    {
      title: 'Furniture',
      value: data.furnitureCount,
      icon: Armchair,
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-100',
      badgeColor: 'text-purple-700',
      hoverBorder: 'hover:border-purple-300',
      percentage: '+8',
      href: '/assets/furniture',
      permission: 'furniture',
      sampleTags: sampleAssetTags.furniture,
    },
    {
      title: 'Electronics',
      value: data.electronicCount,
      icon: Monitor,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100',
      badgeColor: 'text-emerald-700',
      hoverBorder: 'hover:border-emerald-300',
      percentage: '+15',
      href: '/assets/electronics',
      permission: 'electronics',
      sampleTags: sampleAssetTags.electronic,
    },
    {
      title: 'Vehicles',
      value: data.vehicleCount,
      icon: Car,
      gradient: 'from-orange-500/10 to-amber-500/10',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeBg: 'bg-orange-100',
      badgeColor: 'text-orange-700',
      hoverBorder: 'hover:border-orange-300',
      percentage: '+5',
      href: '/assets/vehicles',
      permission: 'vehicles',
      sampleTags: sampleAssetTags.vehicle,
    },
  ];

  // Filter stat cards based on user permissions
  const statCards = allStatCards.filter(card => hasPermission(card.permission));

  // Type icon mapping for recent assets table
  const typeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FURNITURE: Armchair,
    ELECTRONIC: Monitor,
    VEHICLE: Car,
  };

  const typeBadgeMap: Record<string, string> = {
    FURNITURE: 'badge-purple',
    ELECTRONIC: 'badge-blue',
    VEHICLE: 'badge-orange',
  };

  // Filter recent assets based on user permissions
  const filteredRecentAssets = data.recentAssets.filter(asset => {
    if (userRole === 'SUPER_ADMIN') return true;

    const assetTypePermissionMap: Record<string, string> = {
      FURNITURE: 'furniture',
      ELECTRONIC: 'electronics',
      VEHICLE: 'vehicles',
    };

    const requiredPermission = assetTypePermissionMap[asset.type];
    return requiredPermission && hasPermission(requiredPermission);
  });

  // Determine grid layout based on number of visible cards
  const gridColsClass = statCards.length === 1
    ? 'grid-cols-1 max-w-md mx-auto'
    : statCards.length === 2
    ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
    : statCards.length === 3
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of all assets and their status"
        icon={Package}
        badge="Asset Management"
        gradientFrom="from-cyan-100"
        gradientTo="to-sky-100"
        iconColor="text-sky-600"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/reports" className="btn btn-secondary btn-sm">
              <BarChart3 className="w-4 h-4" /> View Reports
            </Link>
            <Link href="/assets/furniture" className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Add Asset
            </Link>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className={`grid ${gridColsClass} gap-4 mb-8`}>
        {statCards.map((stat, index) => (
          <Link key={stat.title} href={stat.href} className="no-underline block h-full">
            <div className={`card p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${stat.hoverBorder} group h-full flex flex-col bg-gradient-to-br ${stat.gradient}`}>
              <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <stat.icon className="w-full h-full" />
              </div>
              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 ${stat.badgeBg} px-2 py-0.5 rounded-md flex-shrink-0`}>
                    <ArrowUpRight className={`w-3 h-3 ${stat.badgeColor}`} />
                    <span className={`text-[10px] font-semibold ${stat.badgeColor}`}>{stat.percentage}%</span>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-600 mb-1 truncate">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-700 tracking-tight mb-2">
                  <AnimatedCounter target={stat.value} />
                </p>
                {stat.sampleTags && stat.sampleTags.length > 0 && (
                  <div className="mt-auto pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {stat.sampleTags.slice(0, 2).map((tag: any, idx: number) => (
                        <span key={idx} className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-[9px] font-mono font-semibold text-slate-600 rounded border border-slate-700 truncate max-w-[100px]">
                          {tag.assetTag}
                        </span>
                      ))}
                      {stat.sampleTags.length > 2 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500">+{stat.sampleTags.length - 2}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-2 flex items-center gap-1 text-[10px] text-slate-700/70 group-hover:text-slate-700/90 transition-colors">
                  <span>View details</span>
                  <ArrowUpRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row - Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Asset Types Distribution */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-50 flex items-center justify-center rounded">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Asset Types</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Distribution by category</p>
          {data.totalAssets === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No assets yet</p>
          ) : (
            <DonutChart data={typeChartData} colors={['#8b5cf6', '#10b981', '#f97316']} />
          )}
        </div>

        {/* Condition Breakdown */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center rounded">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Condition</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Asset health overview</p>
          {data.conditionBreakdown.good === 0 && data.conditionBreakdown.repair === 0 && data.conditionBreakdown.damaged === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No condition data yet</p>
          ) : (
            <DonutChart data={conditionData} colors={['#10b981', '#f59e0b', '#ef4444']} />
          )}
        </div>

        {/* Status Breakdown */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Status</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Current usage status</p>
          {data.statusBreakdown.inUse === 0 && data.statusBreakdown.inStore === 0 && data.statusBreakdown.disposed === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No status data yet</p>
          ) : (
            <DonutChart data={statusData} colors={['#3b82f6', '#10b981', '#64748b']} />
          )}
        </div>
      </div>

      {/* Location Chart - full width */}
      <div className="mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-violet-50 flex items-center justify-center rounded">
              <MapPin className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Assets by Location</h3>
          </div>
          {data.assetsByLocation.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No location data available</p>
          ) : (
            <div className="space-y-1">
              {data.assetsByLocation.map((loc, i) => (
                <StatBar
                  key={i}
                  label={loc.locationName}
                  value={loc.count}
                  max={data.totalAssets}
                  color={['bg-violet-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-sky-500'][i % 5]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Condition Summary */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-amber-50 flex items-center justify-center rounded">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Condition Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Good Condition</span>
              </div>
              <span className="text-lg font-bold text-emerald-700">{data.conditionBreakdown.good}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50/50 hover:bg-amber-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Needs Repair</span>
              </div>
              <span className="text-lg font-bold text-amber-700">{data.conditionBreakdown.repair}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50/50 hover:bg-red-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Damaged</span>
              </div>
              <span className="text-lg font-bold text-red-700">{data.conditionBreakdown.damaged}</span>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-50 flex items-center justify-center rounded">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Status Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50/50 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">In Use</span>
              </div>
              <span className="text-lg font-bold text-blue-700">{data.statusBreakdown.inUse}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50/50 hover:bg-green-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">In Store</span>
              </div>
              <span className="text-lg font-bold text-green-700">{data.statusBreakdown.inStore}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-100/30 hover:bg-slate-100/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-sm font-medium text-slate-600">Disposed</span>
              </div>
              <span className="text-lg font-bold text-slate-600">{data.statusBreakdown.disposed}</span>
            </div>
          </div>
        </div>

        {/* Office Distribution */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-violet-50 flex items-center justify-center rounded">
              <Package className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Assets by Office</h3>
          </div>
          <div className="space-y-3">
            {data.assetsByCompany.map((comp, index) => (
              <div
                key={comp.companyName}
                className="flex items-center justify-between p-3 hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0 ${
                    ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'][index % 5]
                  }`}>
                    {comp.companyName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-600 truncate">{comp.companyName}</span>
                </div>
                <span className="text-base font-bold text-slate-800 ml-3">{comp.count}</span>
              </div>
            ))}
            {data.assetsByCompany.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                <Package className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-sm">No company data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Assets Table */}
      <div className="card">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Recently Added Assets</h3>
                <p className="text-sm text-slate-500">{filteredRecentAssets.length} latest additions</p>
              </div>
            </div>
            <Link
              href="/assets/all"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {filteredRecentAssets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="modern-table w-full">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>Asset Tag</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecentAssets.map((asset, index) => {
                  const IconComponent = typeIconMap[asset.type] || Package;
                  return (
                    <tr
                      key={asset.id}
                      className="animate-in hover:bg-slate-100/30 transition-colors"
                      style={{ animationDelay: `${700 + index * 50}ms`, opacity: 0 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-4 h-4 text-slate-600" />
                          </div>
                          <span className="font-semibold text-slate-800">{asset.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${typeBadgeMap[asset.type] || 'badge-secondary'}`}>
                          {asset.type.charAt(0) + asset.type.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td>
                        {asset.assetTag ? (
                          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-xs font-mono font-medium text-slate-600">
                            {asset.assetTag}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </td>
                      <td>
                        {asset.condition ? (
                          <ConditionBadge condition={asset.condition} />
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </td>
                      <td>
                        {asset.status ? (
                          <StatusBadge status={asset.status} />
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="text-slate-500 text-sm">
                        {asset.date
                          ? formatDistanceToNow(new Date(asset.date), { addSuffix: true })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-slate-600" />
            </div>
            <p className="empty-state-title text-lg font-semibold text-slate-600">No recent assets</p>
            <p className="empty-state-text mt-1">Newly added assets will appear here</p>
            {hasPermission('furniture') && (
              <Link
                href="/assets/furniture"
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Your First Asset
              </Link>
            )}
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}

