import { useEffect, useRef, useCallback, useState } from 'react'
// import { io, Socket } from 'socket.io-client'  // TODO: Install socket.io-client when real-time features are needed
import { useSession } from 'next-auth/react'

// Temporary placeholder types
type Socket = any
const io = () => null

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnect?: boolean
  subscriptions?: Array<'assets' | 'notifications' | 'analytics' | 'presence'>
  companyId?: string
}

interface WebSocketEvent {
  type: string
  data: any
  timestamp: Date
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<WebSocketEvent[]>([])
  const [onlineUsers, setOnlineUsers] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const {
    autoConnect = true,
    reconnect = true,
    subscriptions = ['notifications'],
    companyId,
  } = options

  // Initialize WebSocket connection
  useEffect(() => {
    // TODO: Implement Socket.io connection when needed
    // For now, this is a placeholder to allow the app to build
    return undefined
  }, [session?.user, autoConnect, reconnect, subscriptions, companyId])

  const addEvent = useCallback((type: string, data: any) => {
    setEvents(prev => [...prev.slice(-99), { type, data, timestamp: new Date() }])
  }, [])

  // Subscribe to additional rooms
  const subscribe = useCallback(
    (type: 'assets' | 'notifications' | 'analytics' | 'presence') => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(`subscribe:${type}`, { companyId })
      }
    },
    [companyId],
  )

  // Unsubscribe from rooms
  const unsubscribe = useCallback((roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', roomId)
    }
  }, [])

  // Emit custom events
  const emit = useCallback((eventName: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data)
    }
  }, [])

  // Listen to custom events
  const on = useCallback((eventName: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback)
    }
  }, [])

  // Remove event listener
  const off = useCallback((eventName: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(eventName, callback)
    }
  }, [])

  return {
    connected,
    socket: socketRef.current,
    events,
    error,
    onlineUsers,
    subscribe,
    unsubscribe,
    emit,
    on,
    off,
  }
}

// Hook for listening to notifications
export const useNotifications = () => {
  const { on, off, emit } = useWebSocket({ subscriptions: ['notifications'] })
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev].slice(0, 100))
      setUnreadCount(prev => prev + 1)
    }

    on('notification:new', handleNewNotification)
    on('notification:broadcast', handleNewNotification)

    return () => {
      off('notification:new', handleNewNotification)
      off('notification:broadcast', handleNewNotification)
    }
  }, [on, off])

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)),
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  return {
    notifications,
    unreadCount,
    clearNotification,
    markAsRead,
  }
}

// Hook for listening to asset updates
export const useAssetUpdates = (companyId?: string) => {
  const { on, off } = useWebSocket({
    subscriptions: ['assets'],
    companyId,
  })
  const [updates, setUpdates] = useState<any[]>([])

  useEffect(() => {
    const handleAssetUpdated = (data: any) => {
      setUpdates(prev => [data, ...prev].slice(0, 100))
    }

    on('asset:updated', handleAssetUpdated)
    on('asset:checkedout', handleAssetUpdated)
    on('asset:checkedin', handleAssetUpdated)

    return () => {
      off('asset:updated', handleAssetUpdated)
      off('asset:checkedout', handleAssetUpdated)
      off('asset:checkedin', handleAssetUpdated)
    }
  }, [on, off])

  return { updates }
}

// Hook for listening to analytics updates
export const useAnalyticsUpdates = (companyId?: string) => {
  const { on, off } = useWebSocket({
    subscriptions: ['analytics'],
    companyId,
  })
  const [data, setData] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const handleAnalyticsUpdated = (updateData: any) => {
      setData(updateData.data)
      setLastUpdate(new Date(updateData.timestamp))
    }

    on('analytics:updated', handleAnalyticsUpdated)

    return () => {
      off('analytics:updated', handleAnalyticsUpdated)
    }
  }, [on, off])

  return { data, lastUpdate }
}
