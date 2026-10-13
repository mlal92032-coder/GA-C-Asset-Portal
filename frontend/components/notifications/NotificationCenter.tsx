'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/useWebSocket'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Trash2, Check } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'checkout' | 'maintenance' | 'alert' | 'info'
  isRead: boolean
  timestamp: Date
}

export const NotificationCenter = () => {
  const { notifications, unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([])

  useEffect(() => {
    setDisplayNotifications(notifications.slice(0, 10))
  }, [notifications])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', notificationId }),
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleClear = async () => {
    try {
      await fetch('/api/notifications/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      })
      setDisplayNotifications([])
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      checkout: 'bg-blue-50 border-l-4 border-blue-500',
      maintenance: 'bg-yellow-50 border-l-4 border-yellow-500',
      alert: 'bg-red-50 border-l-4 border-red-500',
      info: 'bg-green-50 border-l-4 border-green-500',
    }
    return colors[type] || 'bg-gray-50 border-l-4 border-gray-500'
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {displayNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayNotifications.map(notif => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 flex items-start gap-3 ${getNotificationColor(notif.type)} ${!notif.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {notif.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {displayNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 flex gap-2">
                <button
                  onClick={handleClear}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
