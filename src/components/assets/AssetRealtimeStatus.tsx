'use client'

import { useState, useEffect } from 'react'
import { useAssetUpdates } from '@/hooks/useWebSocket'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react'

interface AssetUpdate {
  assetId: string
  action: 'created' | 'updated' | 'checkedout' | 'checkedin'
  timestamp: Date
  data: any
}

interface Props {
  companyId?: string
}

export const AssetRealtimeStatus = ({ companyId }: Props) => {
  const { updates } = useAssetUpdates(companyId)
  const [recentUpdates, setRecentUpdates] = useState<AssetUpdate[]>([])

  useEffect(() => {
    setRecentUpdates(updates.slice(0, 5))
  }, [updates])

  const getStatusIcon = (action: string) => {
    const iconProps = { size: 18 }
    switch (action) {
      case 'created':
        return <CheckCircle {...iconProps} className="text-green-500" />
      case 'checkedout':
        return <Activity {...iconProps} className="text-blue-500" />
      case 'checkedin':
        return <CheckCircle {...iconProps} className="text-green-500" />
      default:
        return <AlertCircle {...iconProps} className="text-gray-500" />
    }
  }

  const getStatusLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Asset Created',
      updated: 'Asset Updated',
      checkedout: 'Checked Out',
      checkedin: 'Checked In',
    }
    return labels[action] || 'Updated'
  }

  const getTimeDiff = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Activity size={20} className="text-blue-500" />
        Real-time Updates
      </h3>

      {recentUpdates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p>No recent updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentUpdates.map((update, idx) => (
            <motion.div
              key={`${update.assetId}-${idx}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              {getStatusIcon(update.action)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">
                  {getStatusLabel(update.action)}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  Asset: {update.data.name || update.assetId}
                </p>
                <p className="text-xs text-gray-400">
                  {getTimeDiff(update.timestamp)}
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
