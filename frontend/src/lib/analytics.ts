import { prisma } from '@/lib/prisma';
import { Condition, AssetStatus } from '@prisma/client';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

export interface AnalyticsDateRange {
  startDate: Date;
  endDate: Date;
}

export function getDateRangeFromTimeRange(timeRange: TimeRange): AnalyticsDateRange {
  const endDate = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
}

export async function getAssetDistribution(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

  const [furniture, electronic, vehicle] = await Promise.all([
    prisma.furnitureAsset.count({
      where: { createdAt: { gte: startDate, lte: endDate } }
    }),
    prisma.electronicAsset.count({
      where: { createdAt: { gte: startDate, lte: endDate } }
    }),
    prisma.vehicleAsset.count({
      where: { createdAt: { gte: startDate, lte: endDate } }
    })
  ]);

  return [
    { type: 'Furniture', count: furniture, fill: '#8b5cf6' },
    { type: 'Electronics', count: electronic, fill: '#10b981' },
    { type: 'Vehicles', count: vehicle, fill: '#f97316' }
  ];
}

export async function getCheckoutTrends(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

  const checkouts = await prisma.assetCheckout.findMany({
    where: {
      checkedOutAt: { gte: startDate, lte: endDate }
    },
    select: {
      checkedOutAt: true,
      checkInDate: true
    }
  });

  // Group by date
  const trendMap = new Map<string, { checkouts: number; checkins: number }>();

  checkouts.forEach(checkout => {
    const dateStr = checkout.checkedOutAt.toISOString().split('T')[0];
    if (!trendMap.has(dateStr)) {
      trendMap.set(dateStr, { checkouts: 0, checkins: 0 });
    }
    const trend = trendMap.get(dateStr)!;
    trend.checkouts += 1;

    if (checkout.checkInDate) {
      const checkinDateStr = checkout.checkInDate.toISOString().split('T')[0];
      if (!trendMap.has(checkinDateStr)) {
        trendMap.set(checkinDateStr, { checkouts: 0, checkins: 0 });
      }
      trendMap.get(checkinDateStr)!.checkins += 1;
    }
  });

  return Array.from(trendMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getMaintenanceTrends(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

  const maintenances = await prisma.maintenance.findMany({
    where: {
      maintenanceDate: { gte: startDate, lte: endDate }
    },
    select: {
      maintenanceDate: true,
      cost: true
    }
  });

  const trendMap = new Map<string, { cost: number; count: number }>();

  maintenances.forEach(maintenance => {
    const dateStr = maintenance.maintenanceDate.toISOString().split('T')[0];
    if (!trendMap.has(dateStr)) {
      trendMap.set(dateStr, { cost: 0, count: 0 });
    }
    const trend = trendMap.get(dateStr)!;
    trend.cost += maintenance.cost || 0;
    trend.count += 1;
  });

  return Array.from(trendMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getConditionDistribution(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

  const [furniture, electronic, vehicle] = await Promise.all([
    prisma.furnitureAsset.groupBy({
      by: ['condition'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: true
    }),
    prisma.electronicAsset.groupBy({
      by: ['condition'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: true
    }),
    prisma.vehicleAsset.groupBy({
      by: ['condition'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: true
    })
  ]);

  const conditionMap = new Map<Condition, number>();

  [...furniture, ...electronic, ...vehicle].forEach(item => {
    const count = conditionMap.get(item.condition) || 0;
    conditionMap.set(item.condition, count + item._count);
  });

  return [
    { condition: 'GOOD', count: conditionMap.get('GOOD' as Condition) || 0, fill: '#10b981' },
    { condition: 'REPAIR', count: conditionMap.get('REPAIR' as Condition) || 0, fill: '#f59e0b' },
    { condition: 'DAMAGED', count: conditionMap.get('DAMAGED' as Condition) || 0, fill: '#ef4444' }
  ];
}

export async function getLocationDistribution(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

  const [furniture, electronic, vehicle] = await Promise.all([
    prisma.furnitureAsset.groupBy({
      by: ['locationId'],
      where: { createdAt: { gte: startDate, lte: endDate }, locationId: { not: null } },
      _count: true
    }),
    prisma.electronicAsset.groupBy({
      by: ['locationId'],
      where: { createdAt: { gte: startDate, lte: endDate }, locationId: { not: null } },
      _count: true
    }),
    prisma.vehicleAsset.groupBy({
      by: ['locationId'],
      where: { createdAt: { gte: startDate, lte: endDate }, locationId: { not: null } },
      _count: true
    })
  ]);

  const locationMap = new Map<string, number>();

  [...furniture, ...electronic, ...vehicle].forEach(item => {
    if (item.locationId) {
      const count = locationMap.get(item.locationId) || 0;
      locationMap.set(item.locationId, count + item._count);
    }
  });

  const locationIds = Array.from(locationMap.keys());
  const locations = await prisma.location.findMany({
    where: { id: { in: locationIds } },
    select: { id: true, locationName: true }
  });

  return locations.map(loc => ({
    location: loc.locationName,
    count: locationMap.get(loc.id) || 0
  }));
}

export async function getUtilizationRate(timeRange: TimeRange) {
  const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

  const [totalFurniture, totalElectronic, totalVehicle] = await Promise.all([
    prisma.furnitureAsset.count(),
    prisma.electronicAsset.count(),
    prisma.vehicleAsset.count()
  ]);

  const [inUseFurniture, inUseElectronic, inUseVehicle] = await Promise.all([
    prisma.furnitureAsset.count({ where: { status: 'IN_USE' } }),
    prisma.electronicAsset.count({ where: { status: 'IN_USE' } }),
    prisma.vehicleAsset.count({ where: { status: 'IN_USE' } })
  ]);

  const total = totalFurniture + totalElectronic + totalVehicle;
  const inUse = inUseFurniture + inUseElectronic + inUseVehicle;

  return {
    total,
    inUse,
    percentage: total > 0 ? Math.round((inUse / total) * 100) : 0
  };
}

export async function generateAnalyticsReport(timeRange: TimeRange) {
  const [assetDistribution, checkoutTrends, maintenanceTrends, conditionDistribution, locationDistribution, utilizationRate] = await Promise.all([
    getAssetDistribution(timeRange),
    getCheckoutTrends(timeRange),
    getMaintenanceTrends(timeRange),
    getConditionDistribution(timeRange),
    getLocationDistribution(timeRange),
    getUtilizationRate(timeRange)
  ]);

  return {
    timeRange,
    generatedAt: new Date().toISOString(),
    assetDistribution,
    checkoutTrends,
    maintenanceTrends,
    conditionDistribution,
    locationDistribution,
    utilizationRate
  };
}
