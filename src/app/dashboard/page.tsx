'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { NotificationCenter, type Notification } from '@/components/NotificationCenter';
import { SkeletonCard, SkeletonStats, SkeletonTable } from '@/components/Skeleton';
import { staggerContainer, staggerItem, cardAnimation } from '@/lib/animations';
import {
  Package, Armchair, Monitor, Car, AlertTriangle, CheckCircle, XCircle,
  Plus, BarChart3, ArrowUpRight, X, MapPin, TrendingUp, Clock, Building2, Users
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  date: string;
  assetTag?: string;
  condition?: string;
  status?: string;
  office?: string;
}

interface EmployeeAsset {
  id: string;
  assetTag?: string;
  assetName: string;
  serialNumber: string;
  type: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  employeeName: string;
  department: string;
  designation: string;
  status: 'ACTIVE' | 'INACTIVE';
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
  employeeAssets: EmployeeAsset[];
  sampleAssetTags: { furniture: Array<{ assetTag: string; assetName: string }>; electronic: Array<{ assetTag: string; assetName: string }>; vehicle: Array<{ assetTag: string; assetName: string }> };
}

// Professional Donut Chart Component
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
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const size = 240;
  const center = size / 2;

  let offset = 0;

  if (total === 0) {
    return (
      <motion.div
        className="card p-8 bg-white border-2 border-slate-200 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="font-bold text-2xl text-slate-800 mb-6">{title}</h3>
        <div className="flex items-center justify-center h-40 text-slate-400">No data</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card p-8 bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <h3 className="font-bold text-2xl text-slate-900 mb-8">{title}</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        {/* Legend - Left Side */}
        <div className="space-y-3">
          {data.map((item, idx) => {
            const color = item.fill || colors[idx] || '#64748b';
            const isSelected = selectedSegment === item.name;

            return (
              <motion.button
                key={item.name}
                onClick={() => onSegmentClick?.(item.name)}
                whileHover={{ x: 4 }}
                className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-blue-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 shadow-md"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 12px ${color}cc`
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.value}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Chart - Right Side */}
        <div className="lg:col-span-2 flex justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-64 h-64 drop-shadow-2xl">
            <defs>
              <filter id="chartShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="3" dy="6" stdDeviation="5" floodOpacity="0.3" />
              </filter>
              <radialGradient id="centerGlow" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </radialGradient>
            </defs>

            {/* Donut Segments */}
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
                  strokeWidth={isSelected ? 22 : 16}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={startOffset}
                  filter="url(#chartShadow)"
                  style={{
                    cursor: 'pointer',
                    strokeLinecap: 'round'
                  }}
                  animate={{
                    strokeWidth: isSelected ? 22 : 16
                  }}
                  onClick={() => onSegmentClick?.(item.name)}
                  whileHover={{ opacity: 0.9 }}
                />
              );
            })}

            {/* Center Circle */}
            <circle cx={center} cy={center + 1} r={40} fill="rgba(0,0,0,0.08)" />
            <circle cx={center} cy={center} r={40} fill="url(#centerGlow)" filter="url(#chartShadow)" />
            <circle cx={center} cy={center} r={37} fill="white" />

            {/* Center Text */}
            <text
              x={center}
              y={center - 2}
              textAnchor="middle"
              fontSize="28"
              fontWeight="bold"
              fill="#1e293b"
            >
              {total}
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#64748b"
            >
              Assets
            </text>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch dashboard data
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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications?unreadOnly=false', { credentials: 'include' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Convert API notifications to NotificationCenter format
          const convertedNotifications: Notification[] = json.data.map((notif: any) => ({
            id: notif.id,
            type: notif.type?.toLowerCase() === 'asset' ? 'asset'
              : notif.type?.toLowerCase() === 'checkout' ? 'checkout'
              : notif.type?.toLowerCase() === 'maintenance' ? 'maintenance'
              : notif.type?.toLowerCase() === 'alert' ? 'alert'
              : 'system',
            title: notif.title,
            message: notif.message,
            read: notif.isRead,
            timestamp: new Date(notif.createdAt),
            actionUrl: notif.link,
          }));
          setNotifications(convertedNotifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle notification read
  const handleNotificationRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
      });
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle notification delete
  const handleNotificationDelete = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
      });
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
        credentials: 'include',
      });
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filteredAssets = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.recentAssets.filter(asset => {
      if (selectedType) {
        const typeMap: Record<string, string> = { 'Furniture': 'FURNITURE', 'Electronics': 'ELECTRONIC', 'Vehicles': 'VEHICLE' };
        if (asset.type !== typeMap[selectedType]) return false;
      }
      if (selectedCondition && asset.condition !== selectedCondition.toUpperCase()) return false;
      if (selectedStatus) {
        const statusMap: Record<string, string> = { 'In Use': 'IN_USE', 'In Store': 'IN_STORE', 'Disposed': 'DISPOSED', 'Auction': 'AUCTION' };
        if (asset.status !== statusMap[selectedStatus]) return false;
      }
      return true;
    });
  }, [dashboardData, selectedType, selectedCondition, selectedStatus]);

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

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="GA&C Asset Portal"
          subtitle="General Administration & Coordination Department"
          icon={Package}
          badge="Dashboard"
          gradientFrom="from-blue-600"
          gradientTo="to-blue-800"
          iconColor="text-white"
          actions={
            <div className="flex items-center gap-4">
              <NotificationCenter
                notifications={notifications}
                onNotificationRead={handleNotificationRead}
                onNotificationDelete={handleNotificationDelete}
                onMarkAllRead={handleMarkAllRead}
              />
            </div>
          }
        />
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          <div className="mb-12">
            <SkeletonStats />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 mb-12">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable />
        </div>
      </DashboardLayout>
    );
  }

  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;
  if (!dashboardData) return <DashboardLayout><div className="p-8 text-center">No data</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader
        title="GA&C Asset Portal"
        subtitle="General Administration & Coordination Department"
        icon={Package}
        badge="Dashboard"
        gradientFrom="from-blue-600"
        gradientTo="to-blue-800"
        iconColor="text-white"
        actions={
          <div className="flex items-center gap-4">
            <NotificationCenter
              notifications={notifications}
              onNotificationRead={handleNotificationRead}
              onNotificationDelete={handleNotificationDelete}
              onMarkAllRead={handleMarkAllRead}
            />
            <Link href="/admin/users" className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Manage
            </Link>
          </div>
        }
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Stat Cards with Stagger Animation - Compact & Professional */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
          variants={staggerContainer.container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={staggerItem}>
            <Link href="/assets/all" className="block h-full">
              <motion.div className="stat-card bg-white border-2 border-slate-200 cursor-pointer shadow-lg relative overflow-hidden group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-blue-400" />
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8 transition-opacity" />
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="stat-card-icon bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                      <Package className="w-6 h-6 text-blue-600 font-bold" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
                      <p className="text-sm font-bold text-slate-700">Assets</p>
                    </div>
                  </div>
                  <p className="stat-card-value text-3xl font-bold text-blue-600 mb-1">{dashboardData.totalAssets}</p>
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Link href="/assets/furniture" className="block h-full">
              <motion.div className="stat-card bg-white border-2 border-slate-200 cursor-pointer shadow-lg relative overflow-hidden group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 to-purple-400" />
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8 transition-opacity" />
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="stat-card-icon bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                      <Armchair className="w-6 h-6 text-purple-600 font-bold" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</p>
                      <p className="text-sm font-bold text-slate-700">Furniture</p>
                    </div>
                  </div>
                  <p className="stat-card-value text-3xl font-bold text-purple-600 mb-1">{typeCount.FURNITURE}</p>
                  <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" />
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Link href="/assets/electronics" className="block h-full">
              <motion.div className="stat-card bg-white border-2 border-slate-200 cursor-pointer shadow-lg relative overflow-hidden group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-600 to-emerald-400" />
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 transition-opacity" />
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="stat-card-icon bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
                      <Monitor className="w-6 h-6 text-emerald-600 font-bold" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</p>
                      <p className="text-sm font-bold text-slate-700">Electronics</p>
                    </div>
                  </div>
                  <p className="stat-card-value text-3xl font-bold text-emerald-600 mb-1">{typeCount.ELECTRONIC}</p>
                  <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" />
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Link href="/assets/vehicles" className="block h-full">
              <motion.div className="stat-card bg-white border-2 border-slate-200 cursor-pointer shadow-lg relative overflow-hidden group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-600 to-orange-400" />
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-8 -mt-8 transition-opacity" />
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="stat-card-icon bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                      <Car className="w-6 h-6 text-orange-600 font-bold" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</p>
                      <p className="text-sm font-bold text-slate-700">Vehicles</p>
                    </div>
                  </div>
                  <p className="stat-card-value text-3xl font-bold text-orange-600 mb-1">{typeCount.VEHICLE}</p>
                  <div className="h-1 w-12 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Filter Indicator */}
        {hasFilters && (
          <motion.div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-between shadow-sm" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-900 font-semibold">Filtered: {filteredAssets.length}/{dashboardData.totalAssets}</span>
              {selectedType && <span className="bg-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">{selectedType}</span>}
              {selectedCondition && <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">{selectedCondition}</span>}
              {selectedStatus && <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">{selectedStatus}</span>}
            </div>
            <button onClick={clearFilters} className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-white px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"><X className="w-3.5 h-3.5" /> Clear</button>
          </motion.div>
        )}

        {/* Donut Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
          <motion.div className="relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-2xl blur-xl" />
            <DonutChart data={typeData} onSegmentClick={(name) => setSelectedType(selectedType === name ? null : name)} selectedSegment={selectedType} title="Asset Types" colors={['#8b5cf6', '#10b981', '#f97316']} />
          </motion.div>
          <motion.div className="relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-red-400/10 rounded-2xl blur-xl" />
            <DonutChart data={conditionData} onSegmentClick={(name) => setSelectedCondition(selectedCondition === name ? null : name)} selectedSegment={selectedCondition} title="Condition" colors={['#10b981', '#f59e0b', '#ef4444']} />
          </motion.div>
          <motion.div className="relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-2xl blur-xl" />
            <DonutChart data={statusData} onSegmentClick={(name) => setSelectedStatus(selectedStatus === name ? null : name)} selectedSegment={selectedStatus} title="Status" colors={['#3b82f6', '#10b981', '#64748b', '#f97316']} />
          </motion.div>
        </div>

        {/* Offices and Departments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 px-0">
          {/* Offices */}
          <motion.div className="card border-2 border-slate-200 shadow-lg p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Offices</h3>
                <p className="text-xs text-slate-500 font-medium">Organization Locations</p>
              </div>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-3">
              {dashboardData.assetsByCompany && dashboardData.assetsByCompany.length > 0 ? (
                dashboardData.assetsByCompany.map((office, idx) => (
                  <motion.div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0"></div>
                      <span className="font-semibold text-slate-800 text-sm">{office.companyName}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-bold text-xs ml-2 flex-shrink-0 border border-blue-200">{office.count}</span>
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">No offices configured</p>
              )}
            </div>
          </motion.div>

          {/* Departments/Locations */}
          <motion.div className="card border-2 border-slate-200 shadow-lg p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Departments</h3>
                <p className="text-xs text-slate-500 font-medium">Organization Departments</p>
              </div>
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg flex items-center justify-center border-2 border-emerald-200">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-3">
              {dashboardData.assetsByLocation && dashboardData.assetsByLocation.length > 0 ? (
                dashboardData.assetsByLocation.map((dept, idx) => (
                  <motion.div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-3 h-3 rounded-full bg-emerald-600 flex-shrink-0"></div>
                      <span className="font-semibold text-slate-800 text-sm">{dept.locationName}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-bold text-xs ml-2 flex-shrink-0 border border-emerald-200">{dept.count}</span>
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">No departments configured</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Assets Table */}
        <motion.div className="card border-2 border-slate-200 shadow-lg mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-6 py-5 border-b-2 border-slate-200 bg-white flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Recently Added Assets</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">{filteredAssets.length} assets found</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Asset Name</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Tag</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Office</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Type</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Condition</th>
                  <th className="px-5 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.slice(0, 10).map((asset, idx) => {
                  const assetPath = asset.type === 'FURNITURE' ? `/assets/furniture/${asset.id}` : asset.type === 'ELECTRONIC' ? `/assets/electronics/${asset.id}` : `/assets/vehicles/${asset.id}`;

                  return (
                    <motion.tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} onClick={() => router.push(assetPath)}>
                      <td className="px-5 py-4 text-slate-800 font-medium">{asset.name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-600 font-semibold">{asset.assetTag || '-'}</td>
                      <td className="px-5 py-4"><span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{asset.office || '-'}</span></td>
                      <td className="px-5 py-4"><span className="inline-block px-3 py-1 rounded-md text-xs font-semibold" style={{ backgroundColor: asset.type === 'FURNITURE' ? '#f3e8ff' : asset.type === 'ELECTRONIC' ? '#d1fae5' : '#fed7aa', color: asset.type === 'FURNITURE' ? '#7e22ce' : asset.type === 'ELECTRONIC' ? '#059669' : '#ea580c' }}>{asset.type === 'FURNITURE' ? 'Furniture' : asset.type === 'ELECTRONIC' ? 'Electronics' : 'Vehicle'}</span></td>
                      <td className="px-5 py-4"><span className="inline-block px-3 py-1 rounded-md text-xs font-semibold" style={{ backgroundColor: asset.condition === 'GOOD' ? '#d1fae5' : asset.condition === 'REPAIR' ? '#fef08a' : '#fee2e2', color: asset.condition === 'GOOD' ? '#059669' : asset.condition === 'REPAIR' ? '#b45309' : '#dc2626' }}>{asset.condition || '-'}</span></td>
                      <td className="px-5 py-4"><span className="inline-block px-3 py-1 rounded-md text-xs font-semibold" style={{ backgroundColor: asset.status === 'IN_USE' ? '#dbeafe' : asset.status === 'IN_STORE' ? '#d1fae5' : '#e2e8f0', color: asset.status === 'IN_USE' ? '#0369a1' : asset.status === 'IN_STORE' ? '#059669' : '#475569' }}>{asset.status?.replace('_', ' ') || '-'}</span></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Employee Assets Section */}
        <motion.div className="card border-2 border-slate-200 shadow-lg mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-6 py-5 border-b-2 border-slate-200 bg-white flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Employee Assigned Assets</h3>
              <p className="text-sm text-slate-500 font-medium">{dashboardData.employeeAssets.length} assets assigned</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center border-2 border-purple-200">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Serial Number</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Asset Name</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Employee Name</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Office</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Department</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Designation</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.employeeAssets && dashboardData.employeeAssets.length > 0 ? (
                  dashboardData.employeeAssets.slice(0, 15).map((asset, idx) => (
                    <motion.tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600">{asset.serialNumber}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{asset.assetName}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{asset.employeeName}</td>
                      <td className="px-6 py-4"><span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Office</span></td>
                      <td className="px-6 py-4"><span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">{asset.department || '-'}</span></td>
                      <td className="px-6 py-4"><span className="text-slate-700 font-medium text-sm">{asset.designation || '-'}</span></td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${asset.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {asset.status === 'ACTIVE' ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No employee assets assigned</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
