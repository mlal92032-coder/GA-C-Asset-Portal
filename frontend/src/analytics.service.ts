import { prisma } from '@/lib/prisma'
import { AssetStatus, AssetCondition } from '@prisma/client'

export class AnalyticsService {
  static async getDashboardStats(companyId?: string) {
    const where = companyId ? { companyId } : {}

    const [furnitureCount, electronicCount, vehicleCount, totalUsers, activecheckouts] = await Promise.all([
      prisma.furnitureAsset.count({ where }),
      prisma.electronicAsset.count({ where }),
      prisma.vehicleAsset.count({ where }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.assetCheckout.count({ where: { status: 'CHECKED_OUT' } }),
    ])

    return {
      totalAssets: furnitureCount + electronicCount + vehicleCount,
      furnitureAssets: furnitureCount,
      electronicAssets: electronicCount,
      vehicleAssets: vehicleCount,
      totalUsers,
      activeCheckouts: activecheckouts,
    }
  }

  static async getAssetDistribution(companyId?: string) {
    const where = companyId ? { companyId } : {}

    const [byStatus, byCondition] = await Promise.all([
      Promise.all([
        prisma.furnitureAsset.count({ where: { ...where, status: 'IN_USE' } }),
        prisma.furnitureAsset.count({ where: { ...where, status: 'IN_STORE' } }),
        prisma.furnitureAsset.count({ where: { ...where, status: 'DISPOSED' } }),
        prisma.furnitureAsset.count({ where: { ...where, status: 'AUCTION' } }),
      ]),
      Promise.all([
        prisma.furnitureAsset.count({ where: { ...where, condition: 'GOOD' } }),
        prisma.furnitureAsset.count({ where: { ...where, condition: 'REPAIR' } }),
        prisma.furnitureAsset.count({ where: { ...where, condition: 'DAMAGED' } }),
      ]),
    ])

    return {
      byStatus: {
        inUse: byStatus[0],
        inStore: byStatus[1],
        disposed: byStatus[2],
        auction: byStatus[3],
      },
      byCondition: {
        good: byCondition[0],
        needsRepair: byCondition[1],
        damaged: byCondition[2],
      },
    }
  }

  static async getAssetValue(companyId?: string) {
    const where = companyId ? { companyId } : {}

    const [furniture, electronics, vehicles] = await Promise.all([
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

    const furnitureValue = furniture._sum.purchasePrice || 0
    const electronicsValue = electronics._sum.purchasePrice || 0
    const vehiclesValue = vehicles._sum.purchasePrice || 0
    const totalValue = furnitureValue + electronicsValue + vehiclesValue

    return {
      furniture: furnitureValue,
      electronics: electronicsValue,
      vehicles: vehiclesValue,
      total: totalValue,
    }
  }

  static async getDepreciationForecast(assetId: string) {
    // Get asset details - try each type
    let asset: any = await prisma.furnitureAsset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      asset = await prisma.electronicAsset.findUnique({
        where: { id: assetId },
      })
    }

    if (!asset) {
      asset = await prisma.vehicleAsset.findUnique({
        where: { id: assetId },
      })
    }

    if (!asset) throw new Error('Asset not found')

    const purchaseDate = new Date(asset.purchaseDate)
    const salvageValue = asset.salvageValue || 0
    const usefulLife = asset.useful_life_years || 5

    const forecast = []
    const basePrice = asset.purchasePrice

    for (let year = 0; year <= usefulLife; year++) {
      let value: number

      if (asset.depreciation_method === 'STRAIGHT_LINE') {
        const annualDepreciation = (basePrice - salvageValue) / usefulLife
        value = Math.max(salvageValue, basePrice - annualDepreciation * year)
      } else {
        // Declining balance
        const rate = 2 / usefulLife
        value = basePrice * Math.pow(1 - rate, year)
      }

      const date = new Date(purchaseDate)
      date.setFullYear(date.getFullYear() + year)

      forecast.push({
        year,
        date,
        value: Math.max(salvageValue, value),
      })
    }

    return forecast
  }

  static async getCheckoutTrends(days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const checkouts = await prisma.assetCheckout.findMany({
      where: {
        checkoutDate: {
          gte: startDate,
        },
      },
      select: {
        checkoutDate: true,
        status: true,
      },
      orderBy: { checkoutDate: 'asc' },
    })

    // Group by date
    const byDate: Record<string, { checkouts: number; returns: number }> = {}

    for (const checkout of checkouts) {
      const dateStr = checkout.checkoutDate.toISOString().split('T')[0]
      if (!byDate[dateStr]) {
        byDate[dateStr] = { checkouts: 0, returns: 0 }
      }

      if (checkout.status === 'CHECKED_OUT') {
        byDate[dateStr].checkouts++
      } else {
        byDate[dateStr].returns++
      }
    }

    return Object.entries(byDate).map(([date, data]) => ({
      date,
      ...data,
    }))
  }

  static async getMostUsedAssets(limit: number = 10) {
    const checkouts = await prisma.assetCheckout.findMany({
      select: { assetId: true },
      orderBy: { checkoutDate: 'desc' },
    })

    const counts: Record<string, number> = {}
    for (const checkout of checkouts) {
      counts[checkout.assetId] = (counts[checkout.assetId] || 0) + 1
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    return Promise.all(
      sorted.map(async ([assetId, count]) => {
        const asset =
          (await prisma.furnitureAsset.findUnique({
            where: { id: assetId },
          })) ||
          (await prisma.electronicAsset.findUnique({
            where: { id: assetId },
          })) ||
          (await prisma.vehicleAsset.findUnique({
            where: { id: assetId },
          }))

        return { asset, checkoutCount: count }
      }),
    )
  }

  static async getMaintenanceOverview(companyId?: string) {
    const where = companyId ? { /* company filter */ } : {}

    const [scheduled, inProgress, completed, overdue] = await Promise.all([
      prisma.maintenance.count({
        where: { ...where, status: 'SCHEDULED' },
      }),
      prisma.maintenance.count({
        where: { ...where, status: 'IN_PROGRESS' },
      }),
      prisma.maintenance.count({
        where: { ...where, status: 'COMPLETED' },
      }),
      prisma.maintenance.count({
        where: {
          ...where,
          status: 'SCHEDULED',
          maintenanceDate: { lt: new Date() },
        },
      }),
    ])

    return {
      scheduled,
      inProgress,
      completed,
      overdue,
    }
  }
}
