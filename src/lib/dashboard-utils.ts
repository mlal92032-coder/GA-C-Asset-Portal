/**
 * Advanced Dashboard Utilities
 * Provides business intelligence, trends, forecasting, and health metrics
 */

import { prisma } from './prisma';

export interface TrendData {
  period: string;
  value: number;
  change: number;
  percentChange: number;
}

export interface HealthAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  count: number;
  actionUrl?: string;
}

export interface DepreciationForecast {
  assetType: string;
  currentValue: number;
  projectedValue30Days: number;
  projectedValue90Days: number;
  totalDepreciation: number;
}

/**
 * Get asset condition trends (30/60/90 days)
 */
export async function getConditionTrends() {
  const now = new Date();
  const periods = [
    { days: 30, label: '30 days' },
    { days: 60, label: '60 days' },
    { days: 90, label: '90 days' },
  ];

  const trends: TrendData[] = [];

  for (const period of periods) {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - period.days);

    const goodCount = await prisma.furnitureAsset.count({
      where: { condition: 'GOOD', updatedAt: { gte: startDate } },
    });

    const totalInPeriod = await prisma.furnitureAsset.count({
      where: { updatedAt: { gte: startDate } },
    });

    trends.push({
      period: period.label,
      value: totalInPeriod,
      change: goodCount,
      percentChange: totalInPeriod > 0 ? (goodCount / totalInPeriod) * 100 : 0,
    });
  }

  return trends;
}

/**
 * Calculate depreciation forecast based on asset age and condition
 */
export async function getDepreciationForecast() {
  const [furniture, electronics, vehicles] = await Promise.all([
    prisma.furnitureAsset.aggregate({
      _sum: { estimatedValue: true },
      _count: true,
      where: { status: { not: 'DISPOSED' } },
    }),
    prisma.electronicAsset.aggregate({
      _sum: { estimatedValue: true },
      _count: true,
      where: { status: { not: 'DISPOSED' } },
    }),
    prisma.vehicleAsset.aggregate({
      _sum: { estimatedValue: true },
      _count: true,
      where: { status: { not: 'DISPOSED' } },
    }),
  ]);

  // Calculate depreciation rates (simplified)
  const depreciationRates = {
    FURNITURE: 0.05, // 5% per year
    ELECTRONIC: 0.15, // 15% per year
    VEHICLE: 0.10, // 10% per year
  };

  const monthlyRate = {
    FURNITURE: depreciationRates.FURNITURE / 12,
    ELECTRONIC: depreciationRates.ELECTRONIC / 12,
    VEHICLE: depreciationRates.VEHICLE / 12,
  };

  const forecasts: DepreciationForecast[] = [
    {
      assetType: 'Furniture',
      currentValue: furniture._sum.estimatedValue || 0,
      projectedValue30Days: (furniture._sum.estimatedValue || 0) * (1 - monthlyRate.FURNITURE),
      projectedValue90Days: (furniture._sum.estimatedValue || 0) * Math.pow(1 - monthlyRate.FURNITURE, 3),
      totalDepreciation: (furniture._sum.estimatedValue || 0) * depreciationRates.FURNITURE,
    },
    {
      assetType: 'Electronics',
      currentValue: electronics._sum.estimatedValue || 0,
      projectedValue30Days: (electronics._sum.estimatedValue || 0) * (1 - monthlyRate.ELECTRONIC),
      projectedValue90Days: (electronics._sum.estimatedValue || 0) * Math.pow(1 - monthlyRate.ELECTRONIC, 3),
      totalDepreciation: (electronics._sum.estimatedValue || 0) * depreciationRates.ELECTRONIC,
    },
    {
      assetType: 'Vehicles',
      currentValue: vehicles._sum.estimatedValue || 0,
      projectedValue30Days: (vehicles._sum.estimatedValue || 0) * (1 - monthlyRate.VEHICLE),
      projectedValue90Days: (vehicles._sum.estimatedValue || 0) * Math.pow(1 - monthlyRate.VEHICLE, 3),
      totalDepreciation: (vehicles._sum.estimatedValue || 0) * depreciationRates.VEHICLE,
    },
  ];

  return forecasts;
}

/**
 * Identify health alerts based on asset conditions
 */
export async function getHealthAlerts(): Promise<HealthAlert[]> {
  const alerts: HealthAlert[] = [];

  // Alert 1: Assets in poor condition
  const damagedAssets = await prisma.furnitureAsset.count({
    where: { condition: 'DAMAGED' },
  });
  if (damagedAssets > 0) {
    alerts.push({
      id: 'damaged-assets',
      severity: 'warning',
      title: 'Damaged Assets Detected',
      description: `${damagedAssets} asset(s) are in damaged condition and may need repair or replacement`,
      count: damagedAssets,
      actionUrl: '/assets?filter=condition:DAMAGED',
    });
  }

  // Alert 2: Assets needing maintenance
  const maintenanceNeeded = await prisma.maintenance.count({
    where: {
      nextMaintenanceDate: {
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Within 7 days
      },
    },
  });
  if (maintenanceNeeded > 0) {
    alerts.push({
      id: 'maintenance-due',
      severity: 'critical',
      title: 'Maintenance Due',
      description: `${maintenanceNeeded} asset(s) need maintenance within the next 7 days`,
      count: maintenanceNeeded,
      actionUrl: '/maintenance?filter=due:soon',
    });
  }

  // Alert 3: Warranty expiring soon
  const warrantyExpiring = await prisma.electronicAsset.count({
    where: {
      warrantyExpireDate: {
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Within 30 days
      },
    },
  });
  if (warrantyExpiring > 0) {
    alerts.push({
      id: 'warranty-expiring',
      severity: 'info',
      title: 'Warranties Expiring',
      description: `${warrantyExpiring} electronic asset(s) warranty will expire within 30 days`,
      count: warrantyExpiring,
    });
  }

  // Alert 4: Assets without assignment
  const unassignedAssets = await prisma.furnitureAsset.count({
    where: { assignedUserId: null, status: 'IN_USE' },
  });
  if (unassignedAssets > 0) {
    alerts.push({
      id: 'unassigned-assets',
      severity: 'info',
      title: 'Unassigned Assets',
      description: `${unassignedAssets} asset(s) are in use but not assigned to any employee`,
      count: unassignedAssets,
      actionUrl: '/assets?filter=assigned:false',
    });
  }

  return alerts;
}

/**
 * Calculate asset utilization rates
 */
export async function getUtilizationMetrics() {
  const [total, inUse] = await Promise.all([
    prisma.furnitureAsset.count(),
    prisma.furnitureAsset.count({ where: { status: 'IN_USE' } }),
  ]);

  return {
    totalAssets: total,
    utilizationRate: total > 0 ? (inUse / total) * 100 : 0,
    assetsInUse: inUse,
    assetsInStorage: total - inUse,
  };
}

/**
 * Get asset distribution by location with utilization
 */
export async function getLocationDistributionWithMetrics() {
  const locations = await prisma.location.findMany({
    select: { id: true, locationName: true },
  });

  const metrics = await Promise.all(
    locations.map(async (loc) => {
      const [total, inUse, damaged] = await Promise.all([
        prisma.furnitureAsset.count({ where: { locationId: loc.id } }),
        prisma.furnitureAsset.count({
          where: { locationId: loc.id, status: 'IN_USE' },
        }),
        prisma.furnitureAsset.count({
          where: { locationId: loc.id, condition: 'DAMAGED' },
        }),
      ]);

      return {
        locationName: loc.locationName,
        totalAssets: total,
        inUseAssets: inUse,
        damagedAssets: damaged,
        utilizationRate: total > 0 ? (inUse / total) * 100 : 0,
        healthScore: total > 0 ? ((total - damaged) / total) * 100 : 0,
      };
    })
  );

  return metrics;
}

/**
 * Get cost analysis data
 */
export async function getCostAnalysis() {
  const [furnitureValue, electronicsValue, vehiclesValue] = await Promise.all([
    prisma.furnitureAsset.aggregate({
      _sum: { estimatedValue: true },
      where: { status: { not: 'DISPOSED' } },
    }),
    prisma.electronicAsset.aggregate({
      _sum: { estimatedValue: true },
      where: { status: { not: 'DISPOSED' } },
    }),
    prisma.vehicleAsset.aggregate({
      _sum: { estimatedValue: true },
      where: { status: { not: 'DISPOSED' } },
    }),
  ]);

  const totalValue =
    (furnitureValue._sum.estimatedValue || 0) +
    (electronicsValue._sum.estimatedValue || 0) +
    (vehiclesValue._sum.estimatedValue || 0);

  return {
    furnitureValue: furnitureValue._sum.estimatedValue || 0,
    electronicsValue: electronicsValue._sum.estimatedValue || 0,
    vehiclesValue: vehiclesValue._sum.estimatedValue || 0,
    totalValue,
    furniturePercentage: totalValue > 0 ? ((furnitureValue._sum.estimatedValue || 0) / totalValue) * 100 : 0,
    electronicsPercentage: totalValue > 0 ? ((electronicsValue._sum.estimatedValue || 0) / totalValue) * 100 : 0,
    vehiclesPercentage: totalValue > 0 ? ((vehiclesValue._sum.estimatedValue || 0) / totalValue) * 100 : 0,
  };
}
