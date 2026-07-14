import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { authenticate } from '@/lib/auth'

interface ConnectedUser {
  id: string
  email: string
  socketId: string
  rooms: string[]
  connectedAt: Date
}

interface RoomSubscription {
  roomId: string
  userId: string
  type: 'assets' | 'notifications' | 'analytics' | 'presence'
}

export class WebSocketServer {
  private io: SocketIOServer
  private connectedUsers: Map<string, ConnectedUser> = new Map()
  private roomSubscriptions: Map<string, RoomSubscription[]> = new Map()

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 60000,
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication error'))
        }

        // Verify token and attach user to socket
        const user = await authenticate(token)
        if (!user) {
          return next(new Error('Invalid token'))
        }

        socket.data.user = user
        next()
      } catch (error) {
        next(new Error('Authentication failed'))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.user?.id
      const userEmail = socket.data.user?.email

      console.log(`✅ User connected: ${userEmail} (${socket.id})`)

      // Track connected user
      this.connectedUsers.set(userId, {
        id: userId,
        email: userEmail,
        socketId: socket.id,
        rooms: [],
        connectedAt: new Date(),
      })

      // Emit user online status
      this.io.emit('user:online', {
        userId,
        email: userEmail,
        timestamp: new Date(),
      })

      // Handle room subscriptions
      socket.on('subscribe:assets', (data) => {
        this.handleSubscription(socket, userId, 'assets', data)
      })

      socket.on('subscribe:notifications', (data) => {
        this.handleSubscription(socket, userId, 'notifications', data)
      })

      socket.on('subscribe:analytics', (data) => {
        this.handleSubscription(socket, userId, 'analytics', data)
      })

      socket.on('subscribe:presence', (data) => {
        this.handleSubscription(socket, userId, 'presence', data)
      })

      // Handle unsubscriptions
      socket.on('unsubscribe', (roomId) => {
        this.handleUnsubscribe(socket, userId, roomId)
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(userId, socket.id)
      })

      // Handle errors
      socket.on('error', (error) => {
        console.error(`WebSocket error for ${userEmail}:`, error)
      })

      // Send connection confirmation
      socket.emit('connected', {
        userId,
        socketId: socket.id,
        timestamp: new Date(),
      })
    })
  }

  private handleSubscription(
    socket: any,
    userId: string,
    type: 'assets' | 'notifications' | 'analytics' | 'presence',
    data: any,
  ) {
    const roomId = `${type}:${data.companyId || 'global'}`

    // Add user to room
    socket.join(roomId)

    // Track subscription
    if (!this.roomSubscriptions.has(roomId)) {
      this.roomSubscriptions.set(roomId, [])
    }

    this.roomSubscriptions.get(roomId)!.push({
      roomId,
      userId,
      type,
    })

    // Update user's rooms list
    const user = this.connectedUsers.get(userId)
    if (user && !user.rooms.includes(roomId)) {
      user.rooms.push(roomId)
    }

    // Notify room of new subscriber
    this.io.to(roomId).emit('user:subscribed', {
      userId,
      type,
      timestamp: new Date(),
      totalSubscribers: this.roomSubscriptions.get(roomId)?.length || 0,
    })
  }

  private handleUnsubscribe(socket: any, userId: string, roomId: string) {
    socket.leave(roomId)

    // Remove subscription
    const subscriptions = this.roomSubscriptions.get(roomId)
    if (subscriptions) {
      const index = subscriptions.findIndex(s => s.userId === userId)
      if (index > -1) {
        subscriptions.splice(index, 1)
      }
    }

    // Update user's rooms list
    const user = this.connectedUsers.get(userId)
    if (user) {
      user.rooms = user.rooms.filter(r => r !== roomId)
    }
  }

  private handleDisconnect(userId: string, socketId: string) {
    const user = this.connectedUsers.get(userId)
    if (user && user.socketId === socketId) {
      this.connectedUsers.delete(userId)

      // Clean up subscriptions
      for (const [roomId, subscriptions] of this.roomSubscriptions) {
        const filtered = subscriptions.filter(s => s.userId !== userId)
        if (filtered.length === 0) {
          this.roomSubscriptions.delete(roomId)
        } else {
          this.roomSubscriptions.set(roomId, filtered)
        }
      }

      // Notify others user is offline
      this.io.emit('user:offline', {
        userId,
        timestamp: new Date(),
      })

      console.log(`❌ User disconnected: ${user?.email} (${socketId})`)
    }
  }

  // Public methods for emitting events from API routes

  public broadcastAssetUpdate(assetId: string, data: any, companyId?: string) {
    const roomId = `assets:${companyId || 'global'}`
    this.io.to(roomId).emit('asset:updated', {
      assetId,
      data,
      timestamp: new Date(),
    })
  }

  public broadcastAssetCheckout(assetId: string, userId: string, data: any) {
    this.io.emit('asset:checkedout', {
      assetId,
      userId,
      data,
      timestamp: new Date(),
    })
  }

  public broadcastAssetCheckin(assetId: string, userId: string, data: any) {
    this.io.emit('asset:checkedin', {
      assetId,
      userId,
      data,
      timestamp: new Date(),
    })
  }

  public sendNotification(userId: string, notification: any) {
    const user = this.connectedUsers.get(userId)
    if (user) {
      this.io.to(user.socketId).emit('notification:new', {
        ...notification,
        timestamp: new Date(),
      })
    }
  }

  public broadcastNotification(roomId: string, notification: any) {
    this.io.to(roomId).emit('notification:broadcast', {
      ...notification,
      timestamp: new Date(),
    })
  }

  public broadcastAnalyticsUpdate(companyId: string, data: any) {
    const roomId = `analytics:${companyId}`
    this.io.to(roomId).emit('analytics:updated', {
      data,
      timestamp: new Date(),
    })
  }

  public getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values())
  }

  public getConnectedUserCount(): number {
    return this.connectedUsers.size
  }

  public getRoomSubscribers(roomId: string): string[] {
    const subscriptions = this.roomSubscriptions.get(roomId) || []
    return subscriptions.map(s => s.userId)
  }

  public getServer(): SocketIOServer {
    return this.io
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null

export function initializeWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer(httpServer)
  }
  return wsServer
}

export function getWebSocketServer(): WebSocketServer {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized')
  }
  return wsServer
}
