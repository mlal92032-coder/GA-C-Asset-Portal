import { getWebSocketServer } from '@/websocket/server'
import { prisma } from '@/lib/prisma'
import { WebSocketService } from './websocket.service'

export class RealtimeSyncService {
  // Sync asset changes across all connected clients
  static async syncAssetChange(
    assetId: string,
    action: 'create' | 'update' | 'delete',
    data: any,
    companyId: string,
  ) {
    const ws = getWebSocketServer()

    // Emit to all connected clients in company
    switch (action) {
      case 'create':
        ws.broadcastAssetUpdate(assetId, { action: 'created', ...data }, companyId)
        await WebSocketService.notifyUsers(
          await this.getCompanyUsers(companyId),
          {
            type: 'asset:created',
            title: 'New Asset Added',
            message: `Asset "${data.name}" has been added`,
            data: { assetId, ...data },
          },
        )
        break

      case 'update':
        ws.broadcastAssetUpdate(assetId, { action: 'updated', ...data }, companyId)
        await WebSocketService.broadcastToRoom(`assets:${companyId}`, {
          type: 'asset:updated',
          title: 'Asset Updated',
          message: `Asset "${data.name}" has been updated`,
          data: { assetId, ...data },
        })
        break

      case 'delete':
        ws.broadcastAssetUpdate(assetId, { action: 'deleted' }, companyId)
        await WebSocketService.broadcastToRoom(`assets:${companyId}`, {
          type: 'asset:deleted',
          title: 'Asset Removed',
          message: 'An asset has been removed from inventory',
          data: { assetId },
        })
        break
    }
  }

  // Sync checkout state
  static async syncCheckout(checkoutId: string, data: any, companyId: string) {
    const ws = getWebSocketServer()

    // Notify all company users
    const userIds = await this.getCompanyUsers(companyId)

    ws.broadcastAssetCheckout(data.assetId, data.userId, data)

    await WebSocketService.notifyUsers(userIds, {
      type: 'asset:checkedout',
      title: 'Asset Checked Out',
      message: `Asset has been checked out`,
      data,
    })
  }

  // Sync checkin state
  static async syncCheckin(checkoutId: string, data: any, companyId: string) {
    const ws = getWebSocketServer()

    ws.broadcastAssetCheckin(data.assetId, data.userId, data)

    const userIds = await this.getCompanyUsers(companyId)
    await WebSocketService.notifyUsers(userIds, {
      type: 'asset:checkedin',
      title: 'Asset Checked In',
      message: 'Asset has been checked in',
      data,
    })
  }

  // Sync maintenance updates
  static async syncMaintenance(
    maintenanceId: string,
    status: string,
    companyId: string,
  ) {
    const userIds = await this.getCompanyUsers(companyId)

    await WebSocketService.notifyUsers(userIds, {
      type: 'maintenance:updated',
      title: 'Maintenance Status Updated',
      message: `Maintenance status changed to ${status}`,
      data: { maintenanceId, status },
    })
  }

  // Sync analytics/dashboard data
  static async syncDashboardData(companyId: string, data: any) {
    const ws = getWebSocketServer()
    ws.broadcastAnalyticsUpdate(companyId, data)
  }

  // Get all users in company
  private static async getCompanyUsers(companyId: string): Promise<string[]> {
    const users = await prisma.user.findMany({
      where: {
        // Assuming users have companyId or similar relationship
        // Adjust based on actual schema
      },
      select: { id: true },
    })
    return users.map(u => u.id)
  }

  // Batch sync multiple changes
  static async syncBatch(
    changes: Array<{
      type: 'asset' | 'checkout' | 'maintenance'
      action: string
      data: any
      companyId: string
    }>,
  ) {
    for (const change of changes) {
      if (change.type === 'asset') {
        await this.syncAssetChange(change.data.id, change.action as any, change.data, change.companyId)
      } else if (change.type === 'checkout') {
        await this.syncCheckout(change.data.id, change.data, change.companyId)
      } else if (change.type === 'maintenance') {
        await this.syncMaintenance(change.data.id, change.action, change.companyId)
      }
    }
  }

  // Trigger dashboard refresh
  static async refreshDashboard(companyId: string) {
    const [assetStats, checkoutStats, maintenanceStats] = await Promise.all([
      prisma.furnitureAsset.count({ where: { companyId } }).then(count => ({
        furniture: count,
      })),
      prisma.assetCheckout.count({ where: { status: 'CHECKED_OUT' } }),
      prisma.maintenance.count({ where: { status: 'SCHEDULED' } }),
    ])

    await this.syncDashboardData(companyId, {
      assets: assetStats,
      checkouts: checkoutStats,
      maintenance: maintenanceStats,
      timestamp: new Date(),
    })
  }
}
