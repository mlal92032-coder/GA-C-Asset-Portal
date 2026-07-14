'use client';

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, AlertTriangle } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
}

interface AdvancedAnalyticsProps {
  metrics?: AnalyticsMetric[];
  isLoading?: boolean;
}

export function AdvancedAnalytics({ metrics = [], isLoading = false }: AdvancedAnalyticsProps) {
  const defaultMetrics: AnalyticsMetric[] = [
    {
      label: 'Total Asset Value',
      value: 2500000,
      change: 12.5,
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Depreciation This Quarter',
      value: 125000,
      change: 8.2,
      trend: 'up',
      icon: BarChart3,
    },
    {
      label: 'Assets in Use',
      value: 834,
      change: -2.1,
      trend: 'down',
      icon: PieChartIcon,
    },
    {
      label: 'Pending Maintenance',
      value: 42,
      change: 15.3,
      trend: 'up',
      icon: AlertTriangle,
    },
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer.container}
        initial="hidden"
        animate={isLoading ? 'hidden' : 'show'}
      >
        {displayMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';

          return (
            <motion.div
              key={idx}
              variants={staggerItem}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <motion.div
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isPositive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  {isPositive ? '↑' : '↓'} {Math.abs(metric.change)}%
                </motion.div>
              </div>

              <h3 className="text-sm text-gray-600 mb-2">{metric.label}</h3>

              <motion.div
                className="text-2xl font-bold text-gray-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                {metric.value.toLocaleString()}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Depreciation Analysis */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Depreciation Trends</h3>
          </div>

          <div className="space-y-3">
            {['Furniture', 'Electronics', 'Vehicles'].map((category, idx) => (
              <motion.div
                key={category}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <span className="text-sm text-gray-600 w-20">{category}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-blue-500'
                        : idx === 1
                          ? 'bg-green-500'
                          : 'bg-orange-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${60 + idx * 15}%` }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12">
                  {60 + idx * 15}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Asset Condition */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <PieChartIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Asset Condition</h3>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Good', value: 75, color: 'bg-green-500' },
              { label: 'Repair Needed', value: 18, color: 'bg-yellow-500' },
              { label: 'Damaged', value: 7, color: 'bg-red-500' },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <span className="text-sm text-gray-600 w-24">{item.label}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 1 }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12">
                  {item.value}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Key Insights */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Key Insights</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <motion.li
                className="flex gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <span className="text-blue-600 font-bold">•</span>
                <span>12 assets approaching end of useful life in next quarter</span>
              </motion.li>
              <motion.li
                className="flex gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 }}
              >
                <span className="text-blue-600 font-bold">•</span>
                <span>Furniture category showing highest depreciation rate at 8.2%</span>
              </motion.li>
              <motion.li
                className="flex gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-blue-600 font-bold">•</span>
                <span>42 assets require scheduled maintenance this month</span>
              </motion.li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
