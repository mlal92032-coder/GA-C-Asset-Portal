import { prisma } from '@/lib/prisma'
import { AssetCondition, AssetStatus } from '@prisma/client'

export interface AssetFilters {
  companyId?: string
  locationId?: string
  status?: AssetStatus
  condition?: AssetCondition
  assignedUserId?: string
  search?: string
  limit?: number
  offset?: number
}

export class AssetService {
  // ==================== FURNITURE ASSETS ====================

  static async createFurnitureAsset(data: any) {
    return prisma.furnitureAsset.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
      include: {
        company: true,
        location: true,
        assignedUser: true,
        manufacturer: true,
      },
    })
  }

  static async getFurnitureAssets(filters: AssetFilters) {
    const where: any = {}

    if (filters.companyId) where.companyId = filters.companyId
    if (filters.locationId) where.location_id = filters.locationId
    if (filters.status) where.status = filters.status
    if (filters.condition) where.condition = filters.condition
    if (filters.assignedUserId) where.assigned_user_id = filters.assignedUserId
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { assetTag: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.furnitureAsset.findMany({
      where,
      include: {
        company: true,
        location: true,
        assignedUser: true,
        manufacturer: true,
      },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getFurnitureAsset(id: string) {
    return prisma.furnitureAsset.findUnique({
      where: { id },
      include: {
        company: true,
        location: true,
        assignedUser: true,
        manufacturer: true,
        checkouts: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        maintenances: {
          include: { assignedTo: true },
          orderBy: { maintenanceDate: 'desc' },
          take: 5,
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
  }

  static async updateFurnitureAsset(id: string, data: any) {
    return prisma.furnitureAsset.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        company: true,
        location: true,
        assignedUser: true,
        manufacturer: true,
      },
    })
  }

  static async deleteFurnitureAsset(id: string) {
    return prisma.furnitureAsset.delete({
      where: { id },
    })
  }

  // ==================== ELECTRONICS ASSETS ====================

  static async createElectronicAsset(data: any) {
    return prisma.electronicAsset.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
      include: {
        company: true,
        location: true,
        manufacturer: true,
      },
    })
  }

  static async getElectronicAssets(filters: AssetFilters) {
    const where: any = {}

    if (filters.companyId) where.companyId = filters.companyId
    if (filters.locationId) where.location_id = filters.locationId
    if (filters.status) where.status = filters.status
    if (filters.condition) where.condition = filters.condition
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { assetTag: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.electronicAsset.findMany({
      where,
      include: {
        company: true,
        location: true,
        manufacturer: true,
      },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getElectronicAsset(id: string) {
    return prisma.electronicAsset.findUnique({
      where: { id },
      include: {
        company: true,
        location: true,
        manufacturer: true,
        checkouts: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        maintenances: {
          include: { assignedTo: true },
          orderBy: { maintenanceDate: 'desc' },
          take: 5,
        },
      },
    })
  }

  static async updateElectronicAsset(id: string, data: any) {
    return prisma.electronicAsset.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        company: true,
        location: true,
        manufacturer: true,
      },
    })
  }

  // ==================== VEHICLE ASSETS ====================

  static async createVehicleAsset(data: any) {
    return prisma.vehicleAsset.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
      include: {
        company: true,
        location: true,
        manufacturer: true,
      },
    })
  }

  static async getVehicleAssets(filters: AssetFilters) {
    const where: any = {}

    if (filters.companyId) where.companyId = filters.companyId
    if (filters.locationId) where.location_id = filters.locationId
    if (filters.status) where.status = filters.status
    if (filters.condition) where.condition = filters.condition

    return prisma.vehicleAsset.findMany({
      where,
      include: {
        company: true,
        location: true,
        manufacturer: true,
      },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getVehicleAsset(id: string) {
    return prisma.vehicleAsset.findUnique({
      where: { id },
      include: {
        company: true,
        location: true,
        manufacturer: true,
        maintenances: {
          include: { assignedTo: true },
          orderBy: { maintenanceDate: 'desc' },
          take: 5,
        },
      },
    })
  }

  // ==================== SHARED OPERATIONS ====================

  static async getAssetByTag(assetTag: string, type?: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE') {
    if (type === 'FURNITURE') {
      return prisma.furnitureAsset.findUnique({
        where: { assetTag },
      })
    }
    if (type === 'ELECTRONIC') {
      return prisma.electronicAsset.findUnique({
        where: { assetTag },
      })
    }
    if (type === 'VEHICLE') {
      return prisma.vehicleAsset.findUnique({
        where: { assetTag },
      })
    }

    // Search across all types
    const [furniture, electronic, vehicle] = await Promise.all([
      prisma.furnitureAsset.findUnique({ where: { assetTag } }),
      prisma.electronicAsset.findUnique({ where: { assetTag } }),
      prisma.vehicleAsset.findUnique({ where: { assetTag } }),
    ])

    return furniture || electronic || vehicle
  }

  static async getAssetStats(companyId?: string) {
    const where = companyId ? { companyId } : {}

    const [furnitureCount, electronicCount, vehicleCount, furnitureValue, electronicValue, vehicleValue] = await Promise.all([
      prisma.furnitureAsset.count({ where }),
      prisma.electronicAsset.count({ where }),
      prisma.vehicleAsset.count({ where }),
      prisma.furnitureAsset.aggregate({
        where,
        _sum: { purchasePrice: true },
      }),
      prisma.electronicAsset.aggregate({
        where,
        _sum: { purchasePrice: true },
      }),
      prisma.vehicleAsset.aggregate({
        where,
        _sum: { purchasePrice: true },
      }),
    ])

    return {
      total: furnitureCount + electronicCount + vehicleCount,
      furniture: furnitureCount,
      electronics: electronicCount,
      vehicles: vehicleCount,
      totalValue:
        (furnitureValue._sum.purchasePrice || 0) +
        (electronicValue._sum.purchasePrice || 0) +
        (vehicleValue._sum.purchasePrice || 0),
    }
  }

  static async getAssetsByCondition(condition: AssetCondition, companyId?: string) {
    const where = companyId ? { condition, companyId } : { condition }

    const [furniture, electronics, vehicles] = await Promise.all([
      prisma.furnitureAsset.findMany({ where }),
      prisma.electronicAsset.findMany({ where }),
      prisma.vehicleAsset.findMany({ where }),
    ])

    return {
      furniture,
      electronics,
      vehicles,
      total: furniture.length + electronics.length + vehicles.length,
    }
  }

  static async getAssetsByStatus(status: AssetStatus, companyId?: string) {
    const where = companyId ? { status, companyId } : { status }

    const [furniture, electronics, vehicles] = await Promise.all([
      prisma.furnitureAsset.findMany({ where }),
      prisma.electronicAsset.findMany({ where }),
      prisma.vehicleAsset.findMany({ where }),
    ])

    return {
      furniture,
      electronics,
      vehicles,
      total: furniture.length + electronics.length + vehicles.length,
    }
  }
}
