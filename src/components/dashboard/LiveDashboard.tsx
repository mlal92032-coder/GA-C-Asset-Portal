'use client'

import { useState, useEffect } from 'react'
import { useAnalyticsUpdates, useAssetUpdates } from '@/hooks/useWebSocket'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { AssetRealtimeStatus } from '@/components/assets/AssetRealtimeStatus'
import { UserPresence } from '@/components/users/UserPresence'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Activity,
  Package,
  Users,
  AlertCircle,
} from 'lucide-react'

interface Props {
  companyId?: string
}

export const LiveDashboard = ({ companyId }: Props) => {
  const { data: analyticsData, lastUpdate } = useAnalyticsUpdates(companyId)
  const { updates } = useAssetUpdates(companyId)
  const [stats, setStats] = useState({
    totalAssets: 0,
    checkedOut: 0,
    inMaintenance: 0,
    users: 0,
  })

  useEffect(() => {
    if (analyticsData) {
      setStats({
        totalAssets: analyticsData.total || 0,
        checkedOut: analyticsData.activeCheckouts || 0,
        inMaintenance: analyticsData.maintenance || 0,
        users: analyticsData.totalUsers || 0,
      })
    }
  }, [analyticsData])

  const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <motion.p
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-gray-900"
          >
            {value}
          </motion.p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon size={24} className="text-blue-500" />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time asset management</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 bg-green-500 rounded-full"
          />
          <span className="text-sm text-gray-600">
            {lastUpdate ? `Updated ${new Date(lastUpdate).toLocaleTimeString()}` : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          label="Total Assets"
          value={stats.totalAssets}
          trend="+12% this month"
        />
        <StatCard
          icon={Activity}
          label="Checked Out"
          value={stats.checkedOut}
          trend="Active"
        />
        <StatCard
          icon={AlertCircle}
          label="In Maintenance"
          value={stats.inMaintenance}
          trend="Requires attention"
        />
        <StatCard icon={Users} label="Active Users" value={stats.users} trend="Online now" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Updates */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <AssetRealtimeStatus companyId={companyId} />
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            <NotificationCenter />
          </div>

          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
              Checkout Asset
            </button>
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium">
              Check In Asset
            </button>
            <button className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium">
              Schedule Maintenance
            </button>
          </div>
        </div>
      </div>

      {/* User Presence */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <UserPresence />
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Activity Feed</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✓ {updates.length} updates in the last minute</p>
          {updates.slice(0, 3).map((update, idx) => (
            <p key={idx} className="text-xs text-gray-500">
              • {update.action} - {update.data.name}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
