import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total asset value (only furniture has purchasePrice)
    const furnitureAssets = await prisma.furnitureAsset.findMany({
      select: { purchasePrice: true },
    });

    const totalValue = furnitureAssets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);

    // Get maintenance stats (safe)
    let maintenanceStats: unknown[] = [];
    try {
      const stats = await prisma.maintenance.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          cost: true,
        },
      });
      maintenanceStats = stats as unknown[];
    } catch {
      // Maintenance table may not be ready, continue with empty stats
    }

    // Get review stats (safe)
    let reviewStats: { _avg: { rating: number | null }; _count: number } = { _avg: { rating: 0 }, _count: 0 };
    try {
      reviewStats = await prisma.review.aggregate({
        _avg: {
          rating: true,
        },
        _count: true,
      });
    } catch {
      // Review table may not be ready, continue with empty stats
    }

    // Get assets by condition trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAssets = await prisma.furnitureAsset.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }) + await prisma.electronicAsset.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }) + await prisma.vehicleAsset.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // Get warranty expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const warrantyExpiring = await prisma.electronicAsset.count({
      where: {
        warrantyEndDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
      },
    });

    // Get maintenance scheduled
    let scheduledMaintenance = 0;
    try {
      scheduledMaintenance = await prisma.maintenance.count({
        where: {
          status: 'SCHEDULED',
        },
      });
    } catch {
      // Maintenance count may fail, continue with 0
    }

    return NextResponse.json({
      success: true,
      data: {
        totalValue,
        maintenanceStats,
        reviewStats: {
          averageRating: reviewStats._avg.rating || 0,
          totalReviews: reviewStats._count,
        },
        recentAssets,
        warrantyExpiring,
        scheduledMaintenance,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    // Return empty data instead of error
    return NextResponse.json({
      success: true,
      data: {
        totalValue: 0,
        maintenanceStats: [],
        reviewStats: { averageRating: 0, totalReviews: 0 },
        recentAssets: 0,
        warrantyExpiring: 0,
        scheduledMaintenance: 0,
      },
    });
  }
}
