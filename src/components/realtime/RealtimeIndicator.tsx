'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { motion, AnimatePresence } from 'framer-motion'

interface RealtimeIndicatorProps {
  showLabel?: boolean
  className?: string
}

/**
 * Real-time connection status indicator
 * Shows whether WebSocket is connected and displays online user count
 */
export function RealtimeIndicator({ showLabel = true, className = '' }: RealtimeIndicatorProps) {
  const { connected, onlineUsers } = useWebSocket({ autoConnect: true })
  const [isVisible, setIsVisible] = useState(true)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`flex items-center gap-2 ${className}`}
        >
          {/* Connection Status Indicator */}
          <motion.div
            animate={{
              backgroundColor: connected ? '#10b981' : '#ef4444',
            }}
            transition={{ duration: 0.3 }}
            className="w-3 h-3 rounded-full shadow-lg"
          >
            {connected && (
              <motion.div
                className="absolute w-3 h-3 rounded-full bg-green-500"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Status Text */}
          {showLabel && (
            <motion.span
              className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}
              animate={{ opacity: connected ? 1 : 0.7 }}
            >
              {connected ? 'Live' : 'Offline'}
            </motion.span>
          )}

          {/* Online Users Count */}
          {connected && onlineUsers > 0 && (
            <motion.span
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ({onlineUsers} online)
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Bulk operation progress indicator
 */
interface BulkOperationProgressProps {
  progress: number
  current: number
  total: number
  status: 'in_progress' | 'completed' | 'failed'
  message?: string
  onClose?: () => void
}

export function BulkOperationProgress({
  progress,
  current,
  total,
  status,
  message,
  onClose,
}: BulkOperationProgressProps) {
  const statusColors = {
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-lg shadow-lg p-4 border-l-4"
      style={{ borderLeftColor: statusColors[status] }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">
          {status === 'in_progress' && 'Processing...'}
          {status === 'completed' && 'Completed'}
          {status === 'failed' && 'Failed'}
        </h3>

        {status === 'completed' || status === 'failed' ? (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        ) : null}
      </div>

      {/* Progress Text */}
      <p className="text-sm text-gray-600 mb-2">
        {message || `Processing ${current} of ${total} items`}
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={statusColors[status]}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 50 }}
        />
      </div>

      {/* Progress Percentage */}
      <div className="text-xs text-gray-500 mt-2 text-right">{Math.round(progress)}%</div>
    </motion.div>
  )
}

/**
 * Real-time notification toast
 */
interface RealtimeToastProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  onClose?: () => void
  autoClose?: number
}

export function RealtimeToast({
  type,
  title,
  message,
  onClose,
  autoClose = 5000,
}: RealtimeToastProps) {
  useEffect(() => {
    if (!autoClose || !onClose) return

    const timer = setTimeout(onClose, autoClose)
    return () => clearTimeout(timer)
  }, [autoClose, onClose])

  const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className={`${typeColors[type]} text-white rounded-lg shadow-lg p-4 flex items-start gap-4`}
    >
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white hover:opacity-80"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </motion.div>
  )
}

/**
 * Asset status badge with real-time update animation
 */
interface AssetStatusBadgeProps {
  status: string
  isUpdating?: boolean
}

export function AssetStatusBadge({ status, isUpdating = false }: AssetStatusBadgeProps) {
  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    CHECKED_OUT: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    RETIRED: 'bg-gray-100 text-gray-800',
    DAMAGED: 'bg-red-100 text-red-800',
  }

  return (
    <motion.span
      animate={isUpdating ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5 }}
      className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors.AVAILABLE}`}
    >
      {status.replace(/_/g, ' ')}
    </motion.span>
  )
}
