import { prisma } from '@/lib/prisma'

export class AuditService {
  static async logAction(data: {
    userId: string
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT' | 'CHECKOUT' | 'CHECKIN'
    entity: string
    entityId: string
    details?: Record<string, any>
    changes?: Record<string, any>
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entity_id: data.entityId,
        details: data.details,
        changes: data.changes,
        createdAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    })
  }

  static async getEntityAuditLog(entity: string, entityId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: {
        entity,
        entity_id: entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  static async getUserAuditLog(userId: string, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  static async getActionAuditLog(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT' | 'CHECKOUT' | 'CHECKIN',
    limit: number = 50,
  ) {
    return prisma.auditLog.findMany({
      where: { action },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  static async getAuditLog(filters?: {
    userId?: string
    action?: string
    entity?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }) {
    const where: any = {}

    if (filters?.userId) where.userId = filters.userId
    if (filters?.action) where.action = filters.action
    if (filters?.entity) where.entity = filters.entity

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    return prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    })
  }

  static async getAuditStats() {
    const [total, creates, updates, deletes, checkouts] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { action: 'CREATE' } }),
      prisma.auditLog.count({ where: { action: 'UPDATE' } }),
      prisma.auditLog.count({ where: { action: 'DELETE' } }),
      prisma.auditLog.count({ where: { action: 'CHECKOUT' } }),
    ])

    return {
      total,
      creates,
      updates,
      deletes,
      checkouts,
    }
  }

  static async getMostActiveUsers(days: number = 30, limit: number = 10) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: { userId: true },
    })

    const counts: Record<string, number> = {}
    for (const log of logs) {
      counts[log.userId] = (counts[log.userId] || 0) + 1
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    return Promise.all(
      sorted.map(async ([userId, count]) => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, fullName: true },
        })
        return { user, actionCount: count }
      }),
    )
  }

  static async getAuditSummary(entity: string) {
    const logs = await prisma.auditLog.findMany({
      where: { entity },
      select: { action: true },
    })

    const summary = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      EXPORT: 0,
      IMPORT: 0,
      CHECKOUT: 0,
      CHECKIN: 0,
    }

    for (const log of logs) {
      summary[log.action as keyof typeof summary]++
    }

    return summary
  }
}
