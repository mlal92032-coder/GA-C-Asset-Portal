import { Server as HTTPServer } from 'http'
import { Socket as ServerSocket, Server } from 'socket.io'
import { useSession } from 'next-auth/react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// WebSocket Server Singleton
let ioServer: Server | null = null
const connectedUsers = new Map<string, Set<string>>() // userId -> socketIds
const userSockets = new Map<string, ServerSocket>() // socketId -> socket
const roomSubscriptions = new Map<string, Set<string>>() // roomId -> socketIds

interface AuthenticatedSocket extends ServerSocket {
  userId?: string
  companyId?: string
  userEmail?: string
}

/**
 * Initialize Socket.io server with HTTP server
 */
export function initializeWebSocketServer(httpServer: HTTPServer): Server {
  if (ioServer) {
    return ioServer
  }

  ioServer = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e6, // 1MB
    path: '/socket.io/',
  })

  // Middleware: Authenticate user
  ioServer.use((socket, next) => {
    const token = socket.handshake.auth.token
    const userId = socket.handshake.auth.userId
    const companyId = socket.handshake.auth.companyId
    const userEmail = socket.handshake.auth.userEmail

    if (!userId || !companyId) {
      logger.warn(`WebSocket auth failed: missing userId or companyId`)
      return next(new Error('Unauthorized: Missing user info'))
    }

    ;(socket as AuthenticatedSocket).userId = userId
    ;(socket as AuthenticatedSocket).companyId = companyId
    ;(socket as AuthenticatedSocket).userEmail = userEmail

    next()
  })

  // Connection handler
  ioServer.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!
    const companyId = socket.companyId!

    logger.info(`WebSocket connected: ${userId} (${socket.id})`)

    // Track user connection
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set())
    }
    connectedUsers.get(userId)!.add(socket.id)
    userSockets.set(socket.id, socket)

    // Join company room
    const companyRoom = `company:${companyId}`
    socket.join(companyRoom)

    // Join user's personal room for direct messages
    const userRoom = `user:${userId}`
    socket.join(userRoom)

    // Broadcast presence update
    ioServer!.to(companyRoom).emit('presence:user_online', {
      userId,
      timestamp: new Date(),
      onlineCount: getConnectedUserCount(companyId),
    })

    // Handle custom subscriptions
    socket.on('subscribe:assets', (data) => {
      const assetsRoom = `assets:${data.companyId}`
      socket.join(assetsRoom)
      subscribeToRoom(assetsRoom, socket.id)
      logger.debug(`User ${userId} subscribed to assets`)
    })

    socket.on('subscribe:notifications', () => {
      const notificationsRoom = `notifications:${userId}`
      socket.join(notificationsRoom)
      subscribeToRoom(notificationsRoom, socket.id)
    })

    socket.on('subscribe:analytics', (data) => {
      const analyticsRoom = `analytics:${data.companyId}`
      socket.join(analyticsRoom)
      subscribeToRoom(analyticsRoom, socket.id)
    })

    socket.on('subscribe:presence', (data) => {
      const presenceRoom = `presence:${data.companyId}`
      socket.join(presenceRoom)
      subscribeToRoom(presenceRoom, socket.id)
    })

    // Handle unsubscribe
    socket.on('unsubscribe', (roomId: string) => {
      socket.leave(roomId)
      unsubscribeFromRoom(roomId, socket.id)
      logger.debug(`User ${userId} unsubscribed from ${roomId}`)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`WebSocket disconnected: ${userId} (${socket.id})`)

      // Clean up tracking
      const userSocketSet = connectedUsers.get(userId)
      if (userSocketSet) {
        userSocketSet.delete(socket.id)
        if (userSocketSet.size === 0) {
          connectedUsers.delete(userId)
        }
      }
      userSockets.delete(socket.id)

      // Clean up room subscriptions
      for (const [roomId, socketIds] of roomSubscriptions.entries()) {
        socketIds.delete(socket.id)
        if (socketIds.size === 0) {
          roomSubscriptions.delete(roomId)
        }
      }

      // Broadcast offline status
      ioServer!.to(companyRoom).emit('presence:user_offline', {
        userId,
        timestamp: new Date(),
        onlineCount: getConnectedUserCount(companyId),
      })
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`WebSocket error for ${userId}: ${error}`)
    })
  })

  logger.info('WebSocket server initialized')
  return ioServer
}

/**
 * Get the Socket.io server instance
 */
export function getWebSocketServer(): Server {
  if (!ioServer) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocketServer first.')
  }
  return ioServer
}

/**
 * Broadcast asset updates to all connected users in company
 */
export function broadcastAssetUpdate(
  assetId: string,
  update: { action: string; [key: string]: any },
  companyId: string,
) {
  if (!ioServer) return

  ioServer.to(`assets:${companyId}`).emit('asset:updated', {
    assetId,
    ...update,
    timestamp: new Date(),
  })

  logger.debug(`Asset ${assetId} updated: ${update.action}`)
}

/**
 * Broadcast checkout event
 */
export function broadcastAssetCheckout(
  assetId: string,
  userId: string,
  checkoutData: any,
) {
  if (!ioServer) return

  ioServer.emit('asset:checked_out', {
    assetId,
    userId,
    ...checkoutData,
    timestamp: new Date(),
  })

  logger.debug(`Asset ${assetId} checked out by ${userId}`)
}

/**
 * Broadcast checkin event
 */
export function broadcastAssetCheckin(
  assetId: string,
  userId: string,
  checkinData: any,
) {
  if (!ioServer) return

  ioServer.emit('asset:checked_in', {
    assetId,
    userId,
    ...checkinData,
    timestamp: new Date(),
  })

  logger.debug(`Asset ${assetId} checked in by ${userId}`)
}

/**
 * Send notification to specific user
 */
export function sendNotification(userId: string, notification: any) {
  if (!ioServer) return

  ioServer.to(`user:${userId}`).emit('notification:new', {
    ...notification,
    timestamp: new Date(),
  })

  logger.debug(`Notification sent to ${userId}`)
}

/**
 * Broadcast notification to room
 */
export function broadcastNotification(roomId: string, notification: any) {
  if (!ioServer) return

  ioServer.to(roomId).emit('notification:broadcast', {
    ...notification,
    timestamp: new Date(),
  })
}

/**
 * Broadcast analytics/dashboard update
 */
export function broadcastAnalyticsUpdate(companyId: string, data: any) {
  if (!ioServer) return

  ioServer.to(`analytics:${companyId}`).emit('analytics:updated', {
    ...data,
    timestamp: new Date(),
  })

  logger.debug(`Analytics updated for company ${companyId}`)
}

/**
 * Broadcast bulk operation progress
 */
export function broadcastBulkOperationProgress(
  operationId: string,
  progress: {
    current: number
    total: number
    percentage: number
    status: 'in_progress' | 'completed' | 'failed'
    message?: string
  },
  companyId: string,
) {
  if (!ioServer) return

  ioServer.to(`company:${companyId}`).emit('bulk:operation_progress', {
    operationId,
    ...progress,
    timestamp: new Date(),
  })
}

/**
 * Get connected users for company
 */
export function getConnectedUsers(companyId?: string): string[] {
  if (companyId && ioServer) {
    const room = ioServer.sockets.adapter.rooms.get(`company:${companyId}`)
    if (room) {
      return Array.from(room)
    }
  }
  return Array.from(connectedUsers.keys())
}

/**
 * Get total connected user count
 */
export function getConnectedUserCount(companyId?: string): number {
  if (companyId && ioServer) {
    const room = ioServer.sockets.adapter.rooms.get(`company:${companyId}`)
    if (room) {
      return room.size
    }
    return 0
  }
  return connectedUsers.size
}

/**
 * Get subscribers for a room
 */
export function getRoomSubscribers(roomId: string): string[] {
  const socketIds = roomSubscriptions.get(roomId)
  return socketIds ? Array.from(socketIds) : []
}

/**
 * Subscribe socket to room tracking
 */
function subscribeToRoom(roomId: string, socketId: string) {
  if (!roomSubscriptions.has(roomId)) {
    roomSubscriptions.set(roomId, new Set())
  }
  roomSubscriptions.get(roomId)!.add(socketId)
}

/**
 * Unsubscribe socket from room tracking
 */
function unsubscribeFromRoom(roomId: string, socketId: string) {
  const room = roomSubscriptions.get(roomId)
  if (room) {
    room.delete(socketId)
    if (room.size === 0) {
      roomSubscriptions.delete(roomId)
    }
  }
}

/**
 * Cleanup on server shutdown
 */
export function shutdownWebSocketServer() {
  if (ioServer) {
    ioServer.close()
    ioServer = null
    connectedUsers.clear()
    userSockets.clear()
    roomSubscriptions.clear()
    logger.info('WebSocket server shutdown')
  }
}
