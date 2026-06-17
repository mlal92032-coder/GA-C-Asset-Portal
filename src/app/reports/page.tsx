'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Download,
  Package,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Armchair,
  Monitor,
  Car,
  MapPin,
  BarChart3,
} from 'lucide-react';

interface AssetExport {
  id: string;
  name: string;
  type: string;
  category: string;
  condition: string;
  status: string;
  location: string;
  assignedTo: string;
  company: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const STATUS_COLORS = ['#3b82f6', '#10b981', '#64748b'];

// Custom tooltip for charts
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-slate-900">{payload[0].name}</p>
        <p className="text-slate-600 mt-0.5">
          Count: <span className="font-semibold text-slate-900">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
}

// Custom Donut Chart (native SVG, bypasses Recharts 3.x deprecation)
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
            <circle key={i} cx={center} cy={center} r={radius} fill="none"
              stroke={color} strokeWidth="36"
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={startOffset}
              style={{ transition: 'stroke-dasharray 0.5s ease' }} />
          );
        })}
        <text x={center} y={center - 6} textAnchor="middle" className="text-2xl font-bold" fill="#1e293b">{total}</text>
        <text x={center} y={center + 16} textAnchor="middle" className="text-xs" fill="#64748b">Total</text>
      </svg>
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
    DISPOSED: { className: 'badge-secondary', icon: AlertTriangle },
  };

  const { className, icon: Icon } = config[status] || { className: 'badge-secondary', icon: Package };

  return (
    <span className={`badge ${className}`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ').charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
    </span>
  );
}

// Type badge component
function TypeBadge({ type }: { type: string }) {
  const config: Record<string, string> = {
    Furniture: 'badge-purple',
    Electronic: 'badge-blue',
    Vehicle: 'badge-orange',
  };

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Furniture: Armchair,
    Electronic: Monitor,
    Vehicle: Car,
  };

  const Icon = iconMap[type] || Package;

  return (
    <span className={`badge ${config[type] || 'badge-secondary'}`}>
      <Icon className="w-3 h-3" />
      {type}
    </span>
  );
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const canExport = session?.user?.role !== 'VIEW_USER';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [allAssets, setAllAssets] = useState<AssetExport[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, furnitureRes, electronicRes, vehicleRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/furniture'),
        fetch('/api/electronics'),
        fetch('/api/vehicles'),
      ]);

      const statsJson = await statsRes.json();
      const furnitureJson = await furnitureRes.json();
      const electronicJson = await electronicRes.json();
      const vehicleJson = await vehicleRes.json();

      if (statsJson.success) setStats(statsJson.data);

      const assets: AssetExport[] = [
        ...(furnitureJson.data || []).map((a: any) => ({
          id: a.id, name: a.assetName, type: 'Furniture', category: a.furnitureType || 'N/A',
          condition: a.condition, status: a.status, location: a.location?.locationName || 'N/A',
          assignedTo: a.assignedUser?.fullName || 'Unassigned', company: a.company?.companyName || 'N/A',
        })),
        ...(electronicJson.data || []).map((a: any) => ({
          id: a.id, name: a.assetName, type: 'Electronic', category: a.deviceType || 'N/A',
          condition: a.condition, status: a.status, location: a.location?.locationName || 'N/A',
          assignedTo: a.assignedUser?.fullName || 'Unassigned', company: a.company?.companyName || 'N/A',
        })),
        ...(vehicleJson.data || []).map((a: any) => ({
          id: a.id, name: a.assetName, type: 'Vehicle', category: a.vehicleType || 'N/A',
          condition: a.condition, status: a.status, location: a.location?.locationName || 'N/A',
          assignedTo: a.assignedUser?.fullName || 'Unassigned', company: a.company?.companyName || 'N/A',
        })),
      ];
      setAllAssets(assets);
    } catch {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Type', 'Category', 'Condition', 'Status', 'Location', 'Assigned To', 'Company'];
    const rows = allAssets.map((a) => [
      a.id, a.name, a.type, a.category, a.condition, a.status, a.location, a.assignedTo, a.company,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asset-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportSummaryCSV = () => {
    if (!stats) return;

    const headers = ['Category', 'Total', 'Good', 'Repair', 'Damaged', 'In Use', 'In Store', 'Disposed'];
    const rows = [
      ['Furniture', stats.furnitureCount, stats.conditionBreakdown.good, stats.conditionBreakdown.repair, stats.conditionBreakdown.damaged, stats.statusBreakdown.inUse, stats.statusBreakdown.inStore, stats.statusBreakdown.disposed],
      ['Electronics', stats.electronicCount, stats.conditionBreakdown.good, stats.conditionBreakdown.repair, stats.conditionBreakdown.damaged, stats.statusBreakdown.inUse, stats.statusBreakdown.inStore, stats.statusBreakdown.disposed],
      ['Vehicles', stats.vehicleCount, stats.conditionBreakdown.good, stats.conditionBreakdown.repair, stats.conditionBreakdown.damaged, stats.statusBreakdown.inUse, stats.statusBreakdown.inStore, stats.statusBreakdown.disposed],
      ['Total', stats.totalAssets, stats.conditionBreakdown.good, stats.conditionBreakdown.repair, stats.conditionBreakdown.damaged, stats.statusBreakdown.inUse, stats.statusBreakdown.inStore, stats.statusBreakdown.disposed],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asset-summary-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Package className="w-12 h-12 mb-3 text-slate-300" />
        <p className="text-lg font-medium text-slate-500">No data available</p>
        <p className="text-sm mt-1">Add some assets to see reports</p>
      </div>
    </DashboardLayout>
  );

  const typeChartData = [
    { name: 'Furniture', value: stats.furnitureCount, fill: '#8b5cf6' },
    { name: 'Electronics', value: stats.electronicCount, fill: '#10b981' },
    { name: 'Vehicles', value: stats.vehicleCount, fill: '#f97316' },
  ];

  const conditionData = [
    { name: 'Good', value: stats.conditionBreakdown.good, fill: '#10b981' },
    { name: 'Repair', value: stats.conditionBreakdown.repair, fill: '#f59e0b' },
    { name: 'Damaged', value: stats.conditionBreakdown.damaged, fill: '#ef4444' },
  ];

  const statusData = [
    { name: 'In Use', value: stats.statusBreakdown.inUse, fill: '#3b82f6' },
    { name: 'In Store', value: stats.statusBreakdown.inStore, fill: '#10b981' },
    { name: 'Disposed', value: stats.statusBreakdown.disposed, fill: '#64748b' },
  ];

  const locationChartData = (stats.assetsByLocation || []).map((loc: any) => ({
    name: loc.locationName.length > 20 ? loc.locationName.slice(0, 20) + '...' : loc.locationName,
    count: loc.count,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Reports & Export"
        subtitle="Generate reports and export your asset data"
        icon={BarChart3}
        badge="Reports & Analytics"
        gradientFrom="from-pink-100"
        gradientTo="to-rose-100"
        iconColor="text-pink-600"
        actions={
          canExport && (
            <div className="flex items-center gap-3">
              <Button onClick={exportSummaryCSV} variant="primary" icon={<FileSpreadsheet className="w-4 h-4" />}>
                Export Summary
              </Button>
              <Button onClick={exportToCSV} variant="secondary" icon={<Download className="w-4 h-4" />}>
                Export All Assets
              </Button>
            </div>
          )
        }
      />

      {/* Summary Stats with gradient cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 animate-in" style={{ animationDelay: '100ms', opacity: 0 }}>
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 opacity-10">
            <Package className="w-full h-full" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-white/80 mb-1">Total Assets</p>
            <p className="text-3xl font-bold text-white tracking-tight">{stats.totalAssets.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/20 animate-in" style={{ animationDelay: '200ms', opacity: 0 }}>
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 opacity-10">
            <Armchair className="w-full h-full" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-white/80 mb-1">Furniture</p>
            <p className="text-3xl font-bold text-white tracking-tight">{stats.furnitureCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/20 animate-in" style={{ animationDelay: '300ms', opacity: 0 }}>
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 opacity-10">
            <Monitor className="w-full h-full" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-white/80 mb-1">Electronics</p>
            <p className="text-3xl font-bold text-white tracking-tight">{stats.electronicCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/20 animate-in" style={{ animationDelay: '400ms', opacity: 0 }}>
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 opacity-10">
            <Car className="w-full h-full" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-white/80 mb-1">Vehicles</p>
            <p className="text-3xl font-bold text-white tracking-tight">{stats.vehicleCount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 animate-in clickable-card" style={{ animationDelay: '300ms', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-50 flex items-center justify-center">
              <Armchair className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Asset Types</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Distribution by category</p>
          <DonutChart data={typeChartData} colors={['#8b5cf6', '#10b981', '#f97316']} />
        </div>

        <div className="card p-6 animate-in clickable-card" style={{ animationDelay: '400ms', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Condition Breakdown</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Asset health overview</p>
          <DonutChart data={conditionData} colors={['#10b981', '#f59e0b', '#ef4444']} />
        </div>

        <div className="card p-6 animate-in clickable-card" style={{ animationDelay: '500ms', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Status Breakdown</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Current usage status</p>
          <DonutChart data={statusData} colors={['#3b82f6', '#10b981', '#64748b']} />
        </div>
      </div>

      {/* Location Distribution */}
      {locationChartData.length > 0 && (
        <div className="card p-6 mb-8 animate-in" style={{ animationDelay: '500ms', opacity: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-violet-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Assets by Location</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Geographic distribution of assets</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="url(#locationGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
              <defs>
                <linearGradient id="locationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Asset Inventory Table */}
      <div className="card animate-in" style={{ animationDelay: '600ms', opacity: 0 }}>
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Complete Asset Inventory</h3>
                <p className="text-sm text-slate-500">{allAssets.length} total assets</p>
              </div>
            </div>
            {canExport && (
            <Button
              onClick={exportToCSV}
              variant="primary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          )}
          </div>
        </div>

        {allAssets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="modern-table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Assigned To</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                {allAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="font-semibold text-slate-900">{asset.name}</td>
                    <td>
                      <TypeBadge type={asset.type} />
                    </td>
                    <td className="text-slate-600">{asset.category}</td>
                    <td>
                      <ConditionBadge condition={asset.condition} />
                    </td>
                    <td>
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="text-slate-600">{asset.location}</td>
                    <td className="text-slate-600">{asset.assignedTo}</td>
                    <td className="text-slate-600">{asset.company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Package className="w-12 h-12 mb-3 text-slate-300" />
            <p className="text-base font-medium text-slate-500">No assets found</p>
            <p className="text-sm mt-1">Add assets to see them listed here</p>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}

