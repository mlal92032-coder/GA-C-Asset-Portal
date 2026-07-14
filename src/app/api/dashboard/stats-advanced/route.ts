/**
 * Advanced Dashboard Statistics API
 * Optimized with caching, business intelligence, and health metrics
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { cache } from '@/lib/cache';
import {
  getConditionTrends,
  getDepreciationForecast,
  getHealthAlerts,
  getUtilizationMetrics,
  getLocationDistributionWithMetrics,
  getCostAnalysis,
} from '@/lib/dashboard-utils';

// Cache duration: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  const startTime = Date.now();

  try {
    // Authenticate user
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const cacheKey = `dashboard-stats-advanced`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('[DASHBOARD] Cache hit - returning cached stats');
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        responseTime: Date.now() - startTime,
      });
    }

    console.log('[DASHBOARD] Cache miss - fetching fresh data');

    // Run all queries in parallel for performance
    const [
      basicStats,
      conditionTrends,
      depreciationForecast,
      healthAlerts,
      utilizationMetrics,
      locationMetrics,
      costAnalysis,
    ] = await Promise.all([
      getBasicStats(),
      getConditionTrends(),
      getDepreciationForecast(),
      getHealthAlerts(),
      getUtilizationMetrics(),
      getLocationDistributionWithMetrics(),
      getCostAnalysis(),
    ]);

    const responseData = {
      // Core statistics
      ...basicStats,

      // Advanced metrics
      conditionTrends,
      depreciationForecast,
      healthAlerts,
      utilizationMetrics,
      locationMetrics,
      costAnalysis,

      // Metadata
      generatedAt: new Date().toISOString(),
      cacheExpiration: new Date(Date.now() + CACHE_TTL).toISOString(),
    };

    // Cache the response
    cache.set(cacheKey, responseData, CACHE_TTL);

    const responseTime = Date.now() - startTime;
    console.log(`[DASHBOARD] Stats generated in ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      data: responseData,
      cached: false,
      responseTime,
    });
  } catch (error) {
    console.error('[DASHBOARD ERROR]', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard statistics',
      },
      { status: 500 }
    );
  }
}

/**
 * Get basic asset statistics (counts, breakdowns)
 */
async function getBasicStats() {
  const [furnitureCount, electronicCount, vehicleCount] = await Promise.all([
    prisma.furnitureAsset.count(),
    prisma.electronicAsset.count(),
    prisma.vehicleAsset.count(),
  ]);

  const totalAssets = furnitureCount + electronicCount + vehicleCount;

  if (totalAssets === 0) {
    return {
      totalAssets: 0,
      furnitureCount: 0,
      electronicCount: 0,
      vehicleCount: 0,
      conditionBreakdown: { good: 0, repair: 0, damaged: 0 },
      statusBreakdown: { inUse: 0, inStore: 0, disposed: 0, auction: 0 },
      assetsByLocation: [],
      assetsByCompany: [],
      recentAssets: [],
    };
  }

  // Get condition breakdown (optimized with single aggregation)
  const [furnitureCondition, electronicCondition, vehicleCondition] = await Promise.all([
    prisma.furnitureAsset.groupBy({ by: ['condition'], _count: true }),
    prisma.electronicAsset.groupBy({ by: ['condition'], _count: true }),
    prisma.vehicleAsset.groupBy({ by: ['condition'], _count: true }),
  ]);

  const conditionBreakdown = { good: 0, repair: 0, damaged: 0 };
  [...furnitureCondition, ...electronicCondition, ...vehicleCondition].forEach((item) => {
    if (item.condition === 'GOOD') conditionBreakdown.good += item._count;
    if (item.condition === 'REPAIR') conditionBreakdown.repair += item._count;
    if (item.condition === 'DAMAGED') conditionBreakdown.damaged += item._count;
  });

  // Get status breakdown
  const [furnitureStatus, electronicStatus, vehicleStatus] = await Promise.all([
    prisma.furnitureAsset.groupBy({ by: ['status'], _count: true }),
    prisma.electronicAsset.groupBy({ by: ['status'], _count: true }),
    prisma.vehicleAsset.groupBy({ by: ['status'], _count: true }),
  ]);

  const statusBreakdown = { inUse: 0, inStore: 0, disposed: 0, auction: 0 };
  [...furnitureStatus, ...electronicStatus, ...vehicleStatus].forEach((item) => {
    if (item.status === 'IN_USE') statusBreakdown.inUse += item._count;
    else if (item.status === 'IN_STORE') statusBreakdown.inStore += item._count;
    else if (item.status === 'DISPOSED') statusBreakdown.disposed += item._count;
    else if (item.status === 'AUCTION') statusBreakdown.auction += item._count;
  });

  // Get assets by location (with pagination)
  const allAssetsByLocation = (
    await Promise.all([
      prisma.furnitureAsset.groupBy({ by: ['locationId'], _count: true }),
      prisma.electronicAsset.groupBy({ by: ['locationId'], _count: true }),
      prisma.vehicleAsset.groupBy({ by: ['locationId'], _count: true }),
    ])
  ).flat();

  const locationMap = new Map<string, number>();
  allAssetsByLocation.forEach((item) => {
    if (item.locationId) locationMap.set(item.locationId, (locationMap.get(item.locationId) || 0) + item._count);
  });

  const locationIds = Array.from(locationMap.keys());
  const locations = await prisma.location.findMany({
    where: { id: { in: locationIds } },
    select: { id: true, locationName: true },
    take: 20, // Limit to top 20 locations
  });

  const assetsByLocation = locations
    .map((loc) => ({ locationName: loc.locationName, count: locationMap.get(loc.id) || 0 }))
    .sort((a, b) => b.count - a.count);

  // Get assets by company
  const allAssetsByCompany = (
    await Promise.all([
      prisma.furnitureAsset.groupBy({ by: ['companyId'], _count: true }),
      prisma.electronicAsset.groupBy({ by: ['companyId'], _count: true }),
      prisma.vehicleAsset.groupBy({ by: ['companyId'], _count: true }),
    ])
  ).flat();

  const companyCountMap = new Map<string, number>();
  allAssetsByCompany.forEach((item) => {
    if (item.companyId) companyCountMap.set(item.companyId, (companyCountMap.get(item.companyId) || 0) + item._count);
  });

  const companyIds = Array.from(companyCountMap.keys());
  const companiesData = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, companyName: true },
    take: 10, // Limit to top 10 companies
  });

  const assetsByCompany = companiesData
    .map((comp) => ({ companyName: comp.companyName, count: companyCountMap.get(comp.id) || 0 }))
    .sort((a, b) => b.count - a.count);

  // Get recent assets (with pagination - 10 items max)
  const [recentFurniture, recentElectronic, recentVehicle] = await Promise.all([
    prisma.furnitureAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        assetName: true,
        assetTag: true,
        condition: true,
        status: true,
        createdAt: true,
        company: { select: { companyName: true } },
      },
    }),
    prisma.electronicAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        assetName: true,
        assetTag: true,
        condition: true,
        status: true,
        createdAt: true,
        company: { select: { companyName: true } },
      },
    }),
    prisma.vehicleAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2,
      select: {
        id: true,
        assetName: true,
        assetTag: true,
        condition: true,
        status: true,
        createdAt: true,
        company: { select: { companyName: true } },
      },
    }),
  ]);

  const recentAssets = [
    ...recentFurniture.map((a) => ({
      id: a.id,
      name: a.assetName,
      type: 'FURNITURE',
      date: a.createdAt.toISOString(),
      assetTag: a.assetTag,
      condition: a.condition,
      status: a.status,
      office: a.company?.companyName || 'N/A',
    })),
    ...recentElectronic.map((a) => ({
      id: a.id,
      name: a.assetName,
      type: 'ELECTRONIC',
      date: a.createdAt.toISOString(),
      assetTag: a.assetTag,
      condition: a.condition,
      status: a.status,
      office: a.company?.companyName || 'N/A',
    })),
    ...recentVehicle.map((a) => ({
      id: a.id,
      name: a.assetName,
      type: 'VEHICLE',
      date: a.createdAt.toISOString(),
      assetTag: a.assetTag,
      condition: a.condition,
      status: a.status,
      office: a.company?.companyName || 'N/A',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    totalAssets,
    furnitureCount,
    electronicCount,
    vehicleCount,
    conditionBreakdown,
    statusBreakdown,
    assetsByLocation,
    assetsByCompany,
    recentAssets,
  };
}
