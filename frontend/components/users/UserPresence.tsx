'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { motion } from 'framer-motion'
import { Users, UserCheck } from 'lucide-react'

interface OnlineUser {
  id: string
  email: string
  socketId: string
  connectedAt: Date
}

export const UserPresence = () => {
  const { connected, on, off } = useWebSocket({
    subscriptions: ['presence'],
  })
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    const handleUserOnline = (data: any) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.id === data.userId)
        if (exists) return prev

        return [
          ...prev,
          {
            id: data.userId,
            email: data.email,
            socketId: '',
            connectedAt: new Date(data.timestamp),
          },
        ]
      })
      setOnlineCount(prev => prev + 1)
    }

    const handleUserOffline = (data: any) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== data.userId))
      setOnlineCount(prev => Math.max(0, prev - 1))
    }

    on('user:online', handleUserOnline)
    on('user:offline', handleUserOffline)

    return () => {
      off('user:online', handleUserOnline)
      off('user:offline', handleUserOffline)
    }
  }, [on, off])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users size={20} className="text-indigo-500" />
        <h3 className="font-semibold text-gray-900">Users Online</h3>
        <motion.span
          key={onlineCount}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
        >
          {onlineCount} online
        </motion.span>
      </div>

      {onlineCount === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p>No other users online</p>
        </div>
      ) : (
        <div className="space-y-2">
          {onlineUsers.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email.split('@')[1]}
                </p>
              </div>
              <UserCheck size={16} className="text-green-500 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Connection Status */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              backgroundColor: connected
                ? 'rgb(34, 197, 94)'
                : 'rgb(107, 114, 128)',
            }}
            transition={{ duration: 0.3 }}
            className="w-2 h-2 rounded-full"
          />
          <p className="text-xs text-gray-600">
            {connected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
      </div>
    </div>
  )
}
