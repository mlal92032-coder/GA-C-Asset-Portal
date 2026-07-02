'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import NotificationBell from '@/components/NotificationBell';
import {
  Package, Armchair, Monitor, Car, AlertTriangle, CheckCircle, XCircle,
  Plus, BarChart3, ArrowUpRight, X, MapPin, TrendingUp, Clock
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  date: string;
  assetTag?: string;
  condition?: string;
  status?: string;
}

interface DashboardData {
  totalAssets: number;
  furnitureCount: number;
  electronicCount: number;
  vehicleCount: number;
  conditionBreakdown: { good: number; repair: number; damaged: number };
  statusBreakdown: { inUse: number; inStore: number; disposed: number; auction?: number };
  assetsByLocation: { locationName: string; count: number }[];
  assetsByCompany: { companyName: string; count: number }[];
  recentAssets: Asset[];
  sampleAssetTags: { furniture: Array<{ assetTag: string; assetName: string }>; electronic: Array<{ assetTag: string; assetName: string }>; vehicle: Array<{ assetTag: string; assetName: string }> };
}

// Beautiful Donut Chart with Left Legend
function DonutChart({
  data,
  onSegmentClick,
  selectedSegment,
  title,
  colors
}: {
  data: Array<{ name: string; value: number; fill?: string }>;
  onSegmentClick?: (name: string) => void;
  selectedSegment?: string | null;
  title: string;
  colors: string[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const size = 280;
  const center = size / 2;

  let offset = 0;

  if (total === 0) {
    return (
      <motion.div
        className="card p-8 bg-gradient-to-br from-slate-50 to-slate-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="font-bold text-lg text-slate-700 mb-6">{title}</h3>
        <div className="flex items-center justify-center h-40">
          <p className="text-slate-400">No data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card p-8 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-bold text-lg text-slate-800 mb-6">{title}</h3>
      <div className="flex gap-8 items-center">
        {/* Left Legend */}
        <div className="w-40 flex flex-col gap-3">
          {data.map((item, idx) => (
            <motion.div
              key={item.name}
              onClick={() => onSegmentClick?.(item.name)}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                selectedSegment === item.name
                  ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: item.fill || colors[idx] || '#64748b' }}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate`}>{item.name}</p>
                <p className={`text-xs ${selectedSegment === item.name ? 'text-blue-100' : 'text-slate-500'}`}>
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center Donut Chart */}
        <div className="flex-1 flex flex-col items-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-48 h-48">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            {data.map((item, i) => {
              if (item.value <= 0) return null;
              const pct = item.value / total;
              const dash = circumference * pct;
              const gap = circumference - dash;
              const color = item.fill || colors[i] || '#64748b';
              const startOffset = -offset;
              offset += dash;
              const isSelected = selectedSegment === item.name;

              return (
                <motion.circle
                  key={`${item.name}-${i}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={isSelected ? 28 : 20}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={startOffset}
                  filter="url(#shadow)"
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease'
                  }}
                  animate={{ strokeWidth: isSelected ? 28 : 20 }}
                  onClick={() => onSegmentClick?.(item.name)}
                  whileHover={{ opacity: 1 }}
                />
              );
            })}
            {/* Center Circle */}
            <circle cx={center} cy={center} r={45} fill="white" filter="url(#shadow)" />
            <text
              x={center}
              y={center - 8}
              textAnchor="middle"
              className="text-3xl font-bold"
              fill="#1e293b"
            >
              {total}
            </text>
            <text
              x={center}
              y={center + 16}
              textAnchor="middle"
              className="text-xs"
              fill="#64748b"
            >
              Total
            </text>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard/stats', { credentials: 'include' });
        const json = await res.json();

        if (!json.success) throw new Error(json.error);
        setDashboardData(json.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <DashboardLayout><div className="p-8 text-center">Loading...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;
  if (!dashboardData) return <DashboardLayout><div className="p-8 text-center">No data</div></DashboardLayout>;

  // Single filteredAssets array - all charts derive from this
  const filteredAssets = useMemo(() => {
    return dashboardData.recentAssets.filter(asset => {
      // Apply Type filter
      if (selectedType) {
        const typeMap: Record<string, string> = { 'Furniture': 'FURNITURE', 'Electronics': 'ELECTRONIC', 'Vehicles': 'VEHICLE' };
        if (asset.type !== typeMap[selectedType]) return false;
      }
      // Apply Condition filter
      if (selectedCondition && asset.condition !== selectedCondition.toUpperCase()) return false;
      // Apply Status filter
      if (selectedStatus) {
        const statusMap: Record<string, string> = { 'In Use': 'IN_USE', 'In Store': 'IN_STORE', 'Disposed': 'DISPOSED', 'Auction': 'AUCTION' };
        if (asset.status !== statusMap[selectedStatus]) return false;
      }
      return true;
    });
  }, [dashboardData.recentAssets, selectedType, selectedCondition, selectedStatus]);

  // Calculate counts from filtered assets
  const typeCount = useMemo(() => {
    const counts = { FURNITURE: 0, ELECTRONIC: 0, VEHICLE: 0 };
    filteredAssets.forEach(asset => {
      if (asset.type === 'FURNITURE') counts.FURNITURE++;
      else if (asset.type === 'ELECTRONIC') counts.ELECTRONIC++;
      else if (asset.type === 'VEHICLE') counts.VEHICLE++;
    });
    return counts;
  }, [filteredAssets]);

  const conditionCount = useMemo(() => {
    const counts = { good: 0, repair: 0, damaged: 0 };
    filteredAssets.forEach(asset => {
      if (asset.condition === 'GOOD') counts.good++;
      else if (asset.condition === 'REPAIR') counts.repair++;
      else if (asset.condition === 'DAMAGED') counts.damaged++;
    });
    return counts;
  }, [filteredAssets]);

  const statusCount = useMemo(() => {
    const counts = { inUse: 0, inStore: 0, disposed: 0, auction: 0 };
    filteredAssets.forEach(asset => {
      if (asset.status === 'IN_USE') counts.inUse++;
      else if (asset.status === 'IN_STORE') counts.inStore++;
      else if (asset.status === 'DISPOSED') counts.disposed++;
      else if (asset.status === 'AUCTION') counts.auction++;
    });
    return counts;
  }, [filteredAssets]);

  // Donut chart data - always calculated from filtered assets
  const typeData = useMemo(() => [
    { name: 'Furniture', value: typeCount.FURNITURE, fill: '#8b5cf6' },
    { name: 'Electronics', value: typeCount.ELECTRONIC, fill: '#10b981' },
    { name: 'Vehicles', value: typeCount.VEHICLE, fill: '#f97316' },
  ].filter(d => d.value > 0), [typeCount]);

  const conditionData = useMemo(() => [
    { name: 'Good', value: conditionCount.good, fill: '#10b981' },
    { name: 'Repair', value: conditionCount.repair, fill: '#f59e0b' },
    { name: 'Damaged', value: conditionCount.damaged, fill: '#ef4444' },
  ].filter(d => d.value > 0), [conditionCount]);

  const statusData = useMemo(() => [
    { name: 'In Use', value: statusCount.inUse, fill: '#3b82f6' },
    { name: 'In Store', value: statusCount.inStore, fill: '#10b981' },
    { name: 'Disposed', value: statusCount.disposed, fill: '#64748b' },
    ...(statusCount.auction > 0 ? [{ name: 'Auction', value: statusCount.auction, fill: '#f97316' }] : []),
  ].filter(d => d.value > 0), [statusCount]);

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedCondition(null);
    setSelectedStatus(null);
  };

  const hasFilters = selectedType || selectedCondition || selectedStatus;

  return (
    <DashboardLayout>
      <PageHeader
        title="Asset Management Dashboard"
        subtitle="View your assets across all categories"
        icon={Package}
        badge="Dashboard"
        gradientFrom="from-blue-600"
        gradientTo="to-blue-800"
        iconColor="text-white"
        actions={
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/admin/users" className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Manage
            </Link>
          </div>
        }
      />

      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        {/* 3D Stat Cards with Gradients and Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Assets Card */}
          <motion.div
            className={`card p-6 cursor-default bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${hasFilters ? 'ring-2 ring-blue-500' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Package className="w-10 h-10 text-blue-600 drop-shadow-lg" />
              <span className="text-sm font-bold text-blue-700 bg-white px-3 py-1 rounded-full shadow-md">Total</span>
            </div>
            <p className="text-4xl font-bold text-blue-900 mb-1">{filteredAssets.length}</p>
            <p className="text-sm text-blue-700 font-medium">Total Assets</p>
          </motion.div>

          {/* Furniture Card */}
          <motion.div
            className={`card p-6 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${selectedType === 'Furniture' ? 'ring-2 ring-purple-500' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedType(selectedType === 'Furniture' ? null : 'Furniture')}
          >
            <div className="flex items-center justify-between mb-4">
              <Armchair className="w-10 h-10 text-purple-600 drop-shadow-lg" />
              <span className="text-sm font-bold text-purple-700 bg-white px-3 py-1 rounded-full shadow-md">{typeCount.FURNITURE}</span>
            </div>
            <p className="text-4xl font-bold text-purple-900 mb-1">{typeCount.FURNITURE}</p>
            <p className="text-sm text-purple-700 font-medium mb-3">Furniture</p>
            <div className="flex flex-wrap gap-2">
              {dashboardData.sampleAssetTags.furniture.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[11px] bg-white text-purple-700 px-2 py-1 rounded-full font-semibold shadow-sm">
                  {tag.assetTag || `#${i + 1}`}
                </span>
              ))}
              {dashboardData.sampleAssetTags.furniture.length > 3 && (
                <span className="text-[11px] bg-purple-200 text-purple-900 px-2 py-1 rounded-full font-semibold">
                  +{dashboardData.sampleAssetTags.furniture.length - 3} more
                </span>
              )}
            </div>
          </motion.div>

          {/* Electronics Card */}
          <motion.div
            className={`card p-6 cursor-pointer bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${selectedType === 'Electronics' ? 'ring-2 ring-emerald-500' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedType(selectedType === 'Electronics' ? null : 'Electronics')}
          >
            <div className="flex items-center justify-between mb-4">
              <Monitor className="w-10 h-10 text-emerald-600 drop-shadow-lg" />
              <span className="text-sm font-bold text-emerald-700 bg-white px-3 py-1 rounded-full shadow-md">{typeCount.ELECTRONIC}</span>
            </div>
            <p className="text-4xl font-bold text-emerald-900 mb-1">{typeCount.ELECTRONIC}</p>
            <p className="text-sm text-emerald-700 font-medium mb-3">Electronics</p>
            <div className="flex flex-wrap gap-2">
              {dashboardData.sampleAssetTags.electronic.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[11px] bg-white text-emerald-700 px-2 py-1 rounded-full font-semibold shadow-sm">
                  {tag.assetTag || `#${i + 1}`}
                </span>
              ))}
              {dashboardData.sampleAssetTags.electronic.length > 3 && (
                <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-1 rounded-full font-semibold">
                  +{dashboardData.sampleAssetTags.electronic.length - 3} more
                </span>
              )}
            </div>
          </motion.div>

          {/* Vehicles Card */}
          <motion.div
            className={`card p-6 cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${selectedType === 'Vehicles' ? 'ring-2 ring-orange-500' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedType(selectedType === 'Vehicles' ? null : 'Vehicles')}
          >
            <div className="flex items-center justify-between mb-4">
              <Car className="w-10 h-10 text-orange-600 drop-shadow-lg" />
              <span className="text-sm font-bold text-orange-700 bg-white px-3 py-1 rounded-full shadow-md">{typeCount.VEHICLE}</span>
            </div>
            <p className="text-4xl font-bold text-orange-900 mb-1">{typeCount.VEHICLE}</p>
            <p className="text-sm text-orange-700 font-medium mb-3">Vehicles</p>
            <div className="flex flex-wrap gap-2">
              {dashboardData.sampleAssetTags.vehicle.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[11px] bg-white text-orange-700 px-2 py-1 rounded-full font-semibold shadow-sm">
                  {tag.assetTag || `#${i + 1}`}
                </span>
              ))}
              {dashboardData.sampleAssetTags.vehicle.length > 3 && (
                <span className="text-[11px] bg-orange-200 text-orange-900 px-2 py-1 rounded-full font-semibold">
                  +{dashboardData.sampleAssetTags.vehicle.length - 3} more
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Filter Indicator with Clear Button */}
        {hasFilters && (
          <motion.div
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-between shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-blue-900 font-semibold">
                Filtered:
              </span>
              <span className="text-sm text-blue-700">
                {filteredAssets.length} of {dashboardData.totalAssets} assets
              </span>
              {selectedType && (
                <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  {selectedType}
                </span>
              )}
              {selectedCondition && (
                <span className="inline-block bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  {selectedCondition}
                </span>
              )}
              {selectedStatus && (
                <span className="inline-block bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  {selectedStatus}
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          </motion.div>
        )}

        {/* Donut Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DonutChart
            data={typeData}
            onSegmentClick={(name) => setSelectedType(selectedType === name ? null : name)}
            selectedSegment={selectedType}
            title="Asset Types"
            colors={['#8b5cf6', '#10b981', '#f97316']}
          />
          <DonutChart
            data={conditionData}
            onSegmentClick={(name) => setSelectedCondition(selectedCondition === name ? null : name)}
            selectedSegment={selectedCondition}
            title="Condition"
            colors={['#10b981', '#f59e0b', '#ef4444']}
          />
          <DonutChart
            data={statusData}
            onSegmentClick={(name) => setSelectedStatus(selectedStatus === name ? null : name)}
            selectedSegment={selectedStatus}
            title="Status"
            colors={['#3b82f6', '#10b981', '#64748b', '#f97316']}
          />
        </div>

        {/* Recent Assets Table */}
        <motion.div
          className="card shadow-lg hover:shadow-xl transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-6 py-5 border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Recently Added Assets</h3>
                <p className="text-sm text-slate-600 font-medium">{filteredAssets.length} assets</p>
              </div>
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-700">Asset Name</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700">Tag</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700">Type</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700">Condition</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.slice(0, 10).map((asset, idx) => (
                  <motion.tr
                    key={asset.id}
                    className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <td className="px-6 py-4 text-slate-800 font-medium">{asset.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 bg-slate-50 rounded px-2 py-1">{asset.assetTag || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                        style={{
                          backgroundColor: asset.type === 'FURNITURE' ? '#ede9fe' : asset.type === 'ELECTRONIC' ? '#d1fae5' : '#fed7aa',
                          color: asset.type === 'FURNITURE' ? '#7e22ce' : asset.type === 'ELECTRONIC' ? '#059669' : '#ea580c',
                        }}
                      >
                        {asset.type === 'FURNITURE' ? 'Furniture' : asset.type === 'ELECTRONIC' ? 'Electronics' : 'Vehicle'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                        style={{
                          backgroundColor: asset.condition === 'GOOD' ? '#d1fae5' : asset.condition === 'REPAIR' ? '#fef08a' : '#fee2e2',
                          color: asset.condition === 'GOOD' ? '#059669' : asset.condition === 'REPAIR' ? '#b45309' : '#dc2626',
                        }}
                      >
                        {asset.condition || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                        style={{
                          backgroundColor: asset.status === 'IN_USE' ? '#dbeafe' : asset.status === 'IN_STORE' ? '#d1fae5' : '#e2e8f0',
                          color: asset.status === 'IN_USE' ? '#0369a1' : asset.status === 'IN_STORE' ? '#059669' : '#475569',
                        }}
                      >
                        {asset.status?.replace('_', ' ') || '-'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
