import { getWebSocketServer } from '@/websocket/server'
import { prisma } from '@/lib/prisma'

export class WebSocketService {
  // Asset events
  static async broadcastAssetCreated(assetId: string, asset: any, companyId: string) {
    const ws = getWebSocketServer()
    ws.broadcastAssetUpdate(assetId, { action: 'created', ...asset }, companyId)
  }

  static async broadcastAssetUpdated(assetId: string, asset: any, companyId: string) {
    const ws = getWebSocketServer()
    ws.broadcastAssetUpdate(assetId, { action: 'updated', ...asset }, companyId)
  }

  static async broadcastAssetDeleted(assetId: string, companyId: string) {
    const ws = getWebSocketServer()
    ws.broadcastAssetUpdate(assetId, { action: 'deleted' }, companyId)
  }

  // Checkout events
  static async broadcastCheckout(assetId: string, checkoutData: any) {
    const ws = getWebSocketServer()
    ws.broadcastAssetCheckout(assetId, checkoutData.userId, checkoutData)

    // Notify the user who checked out
    await this.notifyUser(checkoutData.userId, {
      type: 'checkout',
      title: 'Asset Checked Out',
      message: `You have checked out asset ${assetId}`,
      data: checkoutData,
    })
  }

  static async broadcastCheckin(assetId: string, checkinData: any) {
    const ws = getWebSocketServer()
    ws.broadcastAssetCheckin(assetId, checkinData.userId, checkinData)

    // Notify the user who checked in
    await this.notifyUser(checkinData.userId, {
      type: 'checkin',
      title: 'Asset Checked In',
      message: `You have checked in asset ${assetId}`,
      data: checkinData,
    })
  }

  // Maintenance events
  static async broadcastMaintenanceCreated(maintenanceId: string, data: any) {
    const ws = getWebSocketServer()
    this.broadcastToRoom('notifications:global', {
      type: 'maintenance:created',
      title: 'Maintenance Scheduled',
      message: `New maintenance scheduled for asset ${data.assetId}`,
      data,
    })
  }

  static async broadcastMaintenanceUpdated(maintenanceId: string, status: string) {
    const ws = getWebSocketServer()
    this.broadcastToRoom('notifications:global', {
      type: 'maintenance:updated',
      title: 'Maintenance Status Updated',
      message: `Maintenance status changed to ${status}`,
      maintenanceId,
    })
  }

  // Notification methods
  static async notifyUser(userId: string, notification: any) {
    const ws = getWebSocketServer()

    // Save to database
    await prisma.notification.create({
      data: {
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        isRead: false,
      },
    })

    // Send real-time notification
    ws.sendNotification(userId, notification)
  }

  static async notifyUsers(userIds: string[], notification: any) {
    const ws = getWebSocketServer()

    // Save to database for all users
    await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        isRead: false,
      })),
    })

    // Send real-time notifications
    for (const userId of userIds) {
      ws.sendNotification(userId, notification)
    }
  }

  static async broadcastToRoom(roomId: string, notification: any) {
    const ws = getWebSocketServer()
    ws.broadcastNotification(roomId, notification)
  }

  // Analytics updates
  static async broadcastAnalyticsUpdate(companyId: string, data: any) {
    const ws = getWebSocketServer()
    ws.broadcastAnalyticsUpdate(companyId, data)
  }

  // Presence tracking
  static getConnectedUsers() {
    const ws = getWebSocketServer()
    return ws.getConnectedUsers()
  }

  static getConnectedUserCount(): number {
    const ws = getWebSocketServer()
    return ws.getConnectedUserCount()
  }

  static getRoomSubscribers(roomId: string): string[] {
    const ws = getWebSocketServer()
    return ws.getRoomSubscribers(roomId)
  }

  // Batch notifications
  static async sendBatchNotifications(notifications: Array<{
    userId: string
    title: string
    message: string
    type: string
    data?: any
  }>) {
    const ws = getWebSocketServer()

    for (const notif of notifications) {
      await this.notifyUser(notif.userId, notif)
    }
  }

  // Notification preferences
  static async getUserNotificationPreferences(userId: string) {
    return prisma.notificationPreference.findUnique({
      where: { userId },
    })
  }

  static async updateUserNotificationPreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean
      pushNotifications?: boolean
      checkoutAlerts?: boolean
      maintenanceAlerts?: boolean
      analyticsReports?: boolean
    },
  ) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...preferences },
      update: preferences,
    })
  }

  // Mark notifications as read
  static async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    })
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
  }

  // Get unread notifications
  static async getUnreadNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  // Clear notifications
  static async clearNotifications(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId, isRead: true },
    })
  }
}
