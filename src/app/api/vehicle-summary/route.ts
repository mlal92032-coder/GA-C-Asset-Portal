import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { getVehicleMaintenanceSummary } from '@/lib/vehicleCalculations';
import { z } from 'zod';

const vehicleSummarySchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    try {
      vehicleSummarySchema.parse({ vehicleId: vehicleId || '' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
      }
      throw error;
    }

    // Fetch vehicle details
    const vehicle = await prisma.vehicleAsset.findUnique({
      where: { id: vehicleId! },
      select: {
        id: true,
        assetName: true,
        assetTag: true,
        purchasePrice: true,
        purchaseDate: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
    }

    // Fetch all maintenance records for this vehicle
    const maintenances = await prisma.maintenance.findMany({
      where: {
        assetId: vehicleId!,
        assetType: 'VEHICLE',
      },
      orderBy: { maintenanceDate: 'desc' },
    });

    // Fetch all spare parts for this vehicle
    const spareParts = await prisma.sparePart.findMany({
      where: {
        vehicleId: vehicleId!,
      },
    });

    // Calculate summary
    const completed = maintenances.filter(m => m.status === 'COMPLETED');
    const summary = getVehicleMaintenanceSummary(maintenances, vehicle.purchasePrice, completed);

    // Calculate total spare parts cost
    const totalSparePartsCost = spareParts.reduce((sum, sp) => sum + (sp.totalCost || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        vehicle: {
          id: vehicle.id,
          name: vehicle.assetName,
          assetTag: vehicle.assetTag,
          purchasePrice: vehicle.purchasePrice,
          purchaseDate: vehicle.purchaseDate,
        },
        summary: {
          ...summary,
          totalSparePartsCost,
          totalLifecycleCostWithSpares: summary.totalLifecycleCost + totalSparePartsCost,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching vehicle summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch vehicle summary' }, { status: 500 });
  }
}
