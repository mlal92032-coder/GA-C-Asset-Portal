import { prisma } from '@/lib/prisma'
import { MaintenanceStatus } from '@prisma/client'

export class MaintenanceService {
  static async createMaintenance(data: {
    assetId: string
    assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE'
    maintenanceType: string
    description: string
    maintenanceDate: Date
    estimatedCost?: number
    actualCost?: number
    assignedToId?: string
    notes?: string
  }) {
    return prisma.maintenance.create({
      data: {
        assetId: data.assetId,
        assetType: data.assetType,
        maintenanceType: data.maintenanceType,
        description: data.description,
        maintenanceDate: data.maintenanceDate,
        estimatedCost: data.estimatedCost,
        actualCost: data.actualCost,
        assignedToId: data.assignedToId,
        notes: data.notes,
        status: 'SCHEDULED',
      },
      include: {
        assignedTo: true,
      },
    })
  }

  static async updateMaintenance(id: string, data: any) {
    return prisma.maintenance.update({
      where: { id },
      data,
      include: {
        assignedTo: true,
      },
    })
  }

  static async getMaintenance(id: string) {
    return prisma.maintenance.findUnique({
      where: { id },
      include: {
        assignedTo: true,
      },
    })
  }

  static async getAssetMaintenance(assetId: string) {
    return prisma.maintenance.findMany({
      where: { assetId },
      include: {
        assignedTo: true,
      },
      orderBy: { maintenanceDate: 'desc' },
    })
  }

  static async completeMaintenance(id: string, data: {
    actualCost?: number
    completionDate?: Date
    notes?: string
  }) {
    return prisma.maintenance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualCost: data.actualCost,
        completionDate: data.completionDate || new Date(),
        notes: data.notes,
      },
      include: {
        assignedTo: true,
      },
    })
  }

  static async getScheduledMaintenance() {
    return prisma.maintenance.findMany({
      where: {
        status: 'SCHEDULED',
        maintenanceDate: {
          gte: new Date(),
        },
      },
      include: {
        assignedTo: true,
      },
      orderBy: { maintenanceDate: 'asc' },
    })
  }

  static async getOverdueMaintenance() {
    return prisma.maintenance.findMany({
      where: {
        status: 'SCHEDULED',
        maintenanceDate: {
          lt: new Date(),
        },
      },
      include: {
        assignedTo: true,
      },
      orderBy: { maintenanceDate: 'asc' },
    })
  }

  static async getMaintenanceStats(assetId?: string) {
    const where = assetId ? { assetId } : {}

    const [scheduled, completed, cancelled, inProgress] = await Promise.all([
      prisma.maintenance.count({
        where: {
          ...where,
          status: 'SCHEDULED',
        },
      }),
      prisma.maintenance.count({
        where: {
          ...where,
          status: 'COMPLETED',
        },
      }),
      prisma.maintenance.count({
        where: {
          ...where,
          status: 'CANCELLED',
        },
      }),
      prisma.maintenance.count({
        where: {
          ...where,
          status: 'IN_PROGRESS',
        },
      }),
    ])

    return {
      scheduled,
      completed,
      cancelled,
      inProgress,
      total: scheduled + completed + cancelled + inProgress,
    }
  }

  static async getMaintenanceCosts(assetId?: string) {
    const where = assetId ? { assetId } : {}

    const costs = await prisma.maintenance.aggregate({
      where,
      _sum: {
        estimatedCost: true,
        actualCost: true,
      },
    })

    return {
      totalEstimated: costs._sum.estimatedCost || 0,
      totalActual: costs._sum.actualCost || 0,
    }
  }

  static async startMaintenance(id: string) {
    return prisma.maintenance.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
      },
      include: {
        assignedTo: true,
      },
    })
  }

  static async cancelMaintenance(id: string, reason?: string) {
    return prisma.maintenance.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason,
      },
      include: {
        assignedTo: true,
      },
    })
  }
}
