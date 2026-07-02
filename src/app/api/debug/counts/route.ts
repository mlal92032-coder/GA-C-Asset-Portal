import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [furnitureCount, electronicCount, vehicleCount] = await Promise.all([
      prisma.furnitureAsset.count(),
      prisma.electronicAsset.count(),
      prisma.vehicleAsset.count(),
    ]);

    const totalAssets = furnitureCount + electronicCount + vehicleCount;

    // Status breakdown
    const [furnitureByStatus, electronicByStatus, vehicleByStatus] = await Promise.all([
      prisma.furnitureAsset.groupBy({ by: ['status'], _count: true }),
      prisma.electronicAsset.groupBy({ by: ['status'], _count: true }),
      prisma.vehicleAsset.groupBy({ by: ['status'], _count: true }),
    ]);

    // Condition breakdown
    const [furnitureByCondition, electronicByCondition, vehicleByCondition] = await Promise.all([
      prisma.furnitureAsset.groupBy({ by: ['condition'], _count: true }),
      prisma.electronicAsset.groupBy({ by: ['condition'], _count: true }),
      prisma.vehicleAsset.groupBy({ by: ['condition'], _count: true }),
    ]);

    // Calculate totals
    const statusBreakdown = { inUse: 0, inStore: 0, disposed: 0, auction: 0 };
    const conditionBreakdown = { good: 0, repair: 0, damaged: 0 };

    [...furnitureByStatus, ...electronicByStatus, ...vehicleByStatus].forEach((item) => {
      if (item.status === 'IN_USE') statusBreakdown.inUse += item._count;
      else if (item.status === 'IN_STORE') statusBreakdown.inStore += item._count;
      else if (item.status === 'DISPOSED') statusBreakdown.disposed += item._count;
      else if (item.status === 'AUCTION') statusBreakdown.auction += item._count;
    });

    [...furnitureByCondition, ...electronicByCondition, ...vehicleByCondition].forEach((item) => {
      if (item.condition === 'GOOD') conditionBreakdown.good += item._count;
      else if (item.condition === 'REPAIR') conditionBreakdown.repair += item._count;
      else if (item.condition === 'DAMAGED') conditionBreakdown.damaged += item._count;
    });

    return NextResponse.json({
      counts: {
        furniture: furnitureCount,
        electronic: electronicCount,
        vehicle: vehicleCount,
        total: totalAssets,
      },
      statusBreakdown,
      conditionBreakdown,
      details: {
        furnitureByStatus,
        electronicByStatus,
        vehicleByStatus,
        furnitureByCondition,
        electronicByCondition,
        vehicleByCondition,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
