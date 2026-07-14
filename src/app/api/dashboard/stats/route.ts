import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  try {
    console.log('[DASHBOARD] Fetching stats...');
    const authResult = await requireAuth();
    console.log('[DASHBOARD] Auth result type:', authResult instanceof NextResponse ? 'NextResponse' : 'user');
    if (authResult instanceof NextResponse) {
      console.log('[DASHBOARD] Auth failed, returning error response');
      return authResult;
    }
    console.log('[DASHBOARD] Auth successful for user:', authResult.user.email);

    // Get actual counts from database
    const [furnitureCount, electronicCount, vehicleCount] = await Promise.all([
      prisma.furnitureAsset.count(),
      prisma.electronicAsset.count(),
      prisma.vehicleAsset.count(),
    ]);
    const totalAssets = furnitureCount + electronicCount + vehicleCount;

    // If database is empty, return empty stats instead of demo data
    if (totalAssets === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalAssets: 0,
          furnitureCount: 0,
          electronicCount: 0,
          vehicleCount: 0,
          conditionBreakdown: { good: 0, repair: 0, damaged: 0 },
          statusBreakdown: { inUse: 0, inStore: 0, disposed: 0 },
          assetsByLocation: [],
          assetsByCompany: [],
          recentAssets: [],
          sampleAssetTags: {
            furniture: [],
            electronic: [],
            vehicle: [],
          },
        },
      });
    }

    // Get real data from database
    const [furnitureTags, electronicTags, vehicleTags] = await Promise.all([
      prisma.furnitureAsset.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { assetTag: true, assetName: true } }),
      prisma.electronicAsset.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { assetTag: true, assetName: true } }),
      prisma.vehicleAsset.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { assetTag: true, assetName: true } }),
    ]);

    // Get condition breakdown
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

    // Get assets by location
    const allAssetsByLocation = (await Promise.all([
      prisma.furnitureAsset.groupBy({ by: ['locationId'], _count: true }),
      prisma.electronicAsset.groupBy({ by: ['locationId'], _count: true }),
      prisma.vehicleAsset.groupBy({ by: ['locationId'], _count: true }),
    ])).flat();
    const locationMap = new Map<string, number>();
    allAssetsByLocation.forEach((item) => {
      if (item.locationId) locationMap.set(item.locationId, (locationMap.get(item.locationId) || 0) + item._count);
    });
    const locationIds = Array.from(locationMap.keys());
    const locations = await prisma.location.findMany({ where: { id: { in: locationIds } }, select: { id: true, locationName: true } });
    const assetsByLocation = locations.map((loc) => ({ locationName: loc.locationName, count: locationMap.get(loc.id) || 0 }));

    // Get assets by company
    const allAssetsByCompany = (await Promise.all([
      prisma.furnitureAsset.groupBy({ by: ['companyId'], _count: true }),
      prisma.electronicAsset.groupBy({ by: ['companyId'], _count: true }),
      prisma.vehicleAsset.groupBy({ by: ['companyId'], _count: true }),
    ])).flat();
    const companyCountMap = new Map<string, number>();
    allAssetsByCompany.forEach((item) => {
      if (item.companyId) companyCountMap.set(item.companyId, (companyCountMap.get(item.companyId) || 0) + item._count);
    });
    const companyIds = Array.from(companyCountMap.keys());
    const companiesData = await prisma.company.findMany({ where: { id: { in: companyIds } }, select: { id: true, companyName: true } });
    const assetsByCompany = companiesData.map((comp) => ({ companyName: comp.companyName, count: companyCountMap.get(comp.id) || 0 }));

    // Get ALL assets for filtering (not just recent)
    const [allFurniture, allElectronic, allVehicle] = await Promise.all([
      prisma.furnitureAsset.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, assetName: true, assetTag: true, condition: true, status: true, createdAt: true, companyId: true }
      }),
      prisma.electronicAsset.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, assetName: true, assetTag: true, condition: true, status: true, createdAt: true, companyId: true }
      }),
      prisma.vehicleAsset.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, assetName: true, assetTag: true, condition: true, status: true, createdAt: true, companyId: true }
      }),
    ]);

    // Get all company IDs for asset lookup
    const allCompanyIds = [
      ...allFurniture.map(a => a.companyId),
      ...allElectronic.map(a => a.companyId),
      ...allVehicle.map(a => a.companyId)
    ].filter(Boolean) as string[];
    const uniqueCompanyIds = [...new Set(allCompanyIds)];
    const companiesLookup = await prisma.company.findMany({ where: { id: { in: uniqueCompanyIds } }, select: { id: true, companyName: true } });
    const companyNameMap = new Map(companiesLookup.map(c => [c.id, c.companyName]));

    const recentAssets = [
      ...allFurniture.map((a) => ({
        id: a.id,
        name: a.assetName,
        type: 'FURNITURE',
        date: a.createdAt.toISOString(),
        assetTag: a.assetTag,
        condition: a.condition,
        status: a.status,
        office: a.companyId ? companyNameMap.get(a.companyId) || 'N/A' : 'N/A'
      })),
      ...allElectronic.map((a) => ({
        id: a.id,
        name: a.assetName,
        type: 'ELECTRONIC',
        date: a.createdAt.toISOString(),
        assetTag: a.assetTag,
        condition: a.condition,
        status: a.status,
        office: a.companyId ? companyNameMap.get(a.companyId) || 'N/A' : 'N/A'
      })),
      ...allVehicle.map((a) => ({
        id: a.id,
        name: a.assetName,
        type: 'VEHICLE',
        date: a.createdAt.toISOString(),
        assetTag: a.assetTag,
        condition: a.condition,
        status: a.status,
        office: a.companyId ? companyNameMap.get(a.companyId) || 'N/A' : 'N/A'
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get employee assigned assets
    const [assignedFurniture, assignedElectronic, assignedVehicle] = await Promise.all([
      prisma.furnitureAsset.findMany({
        where: { assignedUserId: { not: null } },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: { id: true, assetTag: true, assetName: true, serialNumber: true, assignedUserId: true, assignedUser: { select: { id: true, fullName: true, department: true, designation: true, status: true } } }
      }),
      prisma.electronicAsset.findMany({
        where: { assignedUserId: { not: null } },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: { id: true, assetTag: true, assetName: true, serialNumber: true, assignedUserId: true, assignedUser: { select: { id: true, fullName: true, department: true, designation: true, status: true } } }
      }),
      prisma.vehicleAsset.findMany({
        where: { assignedUserId: { not: null } },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: { id: true, assetTag: true, assetName: true, serialNumber: true, assignedUserId: true, assignedUser: { select: { id: true, fullName: true, department: true, designation: true, status: true } } }
      }),
    ]);

    const employeeAssets = [
      ...assignedFurniture.map(a => ({
        id: a.id,
        assetTag: a.assetTag,
        assetName: a.assetName,
        serialNumber: a.serialNumber || 'N/A',
        type: 'FURNITURE',
        employeeName: a.assignedUser?.fullName || 'Unassigned',
        department: a.assignedUser?.department || 'N/A',
        designation: a.assignedUser?.designation || 'N/A',
        status: a.assignedUser?.status || 'INACTIVE'
      })),
      ...assignedElectronic.map(a => ({
        id: a.id,
        assetTag: a.assetTag,
        assetName: a.assetName,
        serialNumber: a.serialNumber || 'N/A',
        type: 'ELECTRONIC',
        employeeName: a.assignedUser?.fullName || 'Unassigned',
        department: a.assignedUser?.department || 'N/A',
        designation: a.assignedUser?.designation || 'N/A',
        status: a.assignedUser?.status || 'INACTIVE'
      })),
      ...assignedVehicle.map(a => ({
        id: a.id,
        assetTag: a.assetTag,
        assetName: a.assetName,
        serialNumber: a.serialNumber || 'N/A',
        type: 'VEHICLE',
        employeeName: a.assignedUser?.fullName || 'Unassigned',
        department: a.assignedUser?.department || 'N/A',
        designation: a.assignedUser?.designation || 'N/A',
        status: a.assignedUser?.status || 'INACTIVE'
      })),
    ];

    const responseData = {
      success: true,
      data: {
        totalAssets,
        furnitureCount,
        electronicCount,
        vehicleCount,
        conditionBreakdown,
        statusBreakdown,
        assetsByLocation,
        assetsByCompany,
        recentAssets,
        employeeAssets,
        sampleAssetTags: { furniture: furnitureTags, electronic: electronicTags, vehicle: vehicleTags },
      },
    };
    console.log('[DASHBOARD API] Returning:', {
      totalAssets,
      furnitureCount,
      electronicCount,
      vehicleCount,
      recentAssetsCount: recentAssets.length,
      locationCount: assetsByLocation.length,
      conditionBreakdown
    });
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Dashboard API Error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
