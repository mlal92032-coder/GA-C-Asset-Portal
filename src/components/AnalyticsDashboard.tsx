'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  Star,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Package,
} from 'lucide-react';

interface AnalyticsData {
  totalValue: number;
  maintenanceStats: Array<{
    status: string;
    _count: number;
    _sum: { cost: number | null };
  }>;
  reviewStats: {
    averageRating: number;
    totalReviews: number;
  };
  recentAssets: number;
  warrantyExpiring: number;
  scheduledMaintenance: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 animate-pulse">
            <div className="w-12 h-12 bg-slate-200 mb-4" />
            <div className="w-24 h-4 bg-slate-200 mb-2" />
            <div className="w-32 h-8 bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const totalMaintenanceCost = data.maintenanceStats.reduce(
    (sum, stat) => sum + (stat._sum.cost || 0),
    0
  );

  const completedMaintenance = data.maintenanceStats.find(
    (stat) => stat.status === 'COMPLETED'
  )?._count || 0;

  const statCards = [
    {
      title: 'Total Asset Value',
      value: `Rs. ${data.totalValue.toLocaleString('en-PK')}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Average Rating',
      value: data.reviewStats.averageRating > 0 
        ? `${data.reviewStats.averageRating.toFixed(1)} / 5.0`
        : 'No reviews yet',
      icon: Star,
      gradient: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      subtitle: data.reviewStats.totalReviews > 0 
        ? `${data.reviewStats.totalReviews} review${data.reviewStats.totalReviews !== 1 ? 's' : ''}`
        : '',
    },
    {
      title: 'Maintenance Cost',
      value: `Rs. ${totalMaintenanceCost.toLocaleString('en-PK')}`,
      icon: Wrench,
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      subtitle: `${completedMaintenance} completed`,
    },
    {
      title: 'Recent Assets',
      value: data.recentAssets.toString(),
      icon: Package,
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      subtitle: 'Last 30 days',
    },
  ];

  return (
    <div>
      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1">{stat.title}</p>
            <p className={`text-2xl font-bold ${stat.textColor}`}>
              {stat.value}
            </p>
            {stat.subtitle && (
              <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="bg-white border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Alerts & Notifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Warranty Expiring Soon</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {data.warrantyExpiring}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  assets with warranty expiring in next 30 days
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <Wrench className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Scheduled Maintenance</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {data.scheduledMaintenance}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  maintenance tasks pending
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
