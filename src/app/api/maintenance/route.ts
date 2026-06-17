import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireView } from '@/lib/api-auth';
import { z } from 'zod';

const maintenanceGetSchema = z.object({
  assetId: z.string(),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireView('maintenance');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const assetType = searchParams.get('assetType');

    if (!assetId || !assetType) {
      return NextResponse.json(
        { success: false, error: 'assetId and assetType are required' },
        { status: 400 }
      );
    }

    try {
      maintenanceGetSchema.parse({ assetId, assetType });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    const maintenances = await prisma.maintenance.findMany({
      where: {
        assetId,
        assetType,
      },
      orderBy: {
        maintenanceDate: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: maintenances });
  } catch (error) {
    console.error('Error fetching maintenances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenances' },
      { status: 500 }
    );
  }
}

const maintenancePostSchema = z.object({
  assetId: z.string(),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']),
  description: z.string().min(1),
  cost: z.number().optional().nullable(),
  performedBy: z.string().optional().nullable(),
  nextDueDate: z.string().optional().nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional().default('SCHEDULED'),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireView('maintenance');
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();

    let validatedData: z.infer<typeof maintenancePostSchema>;
    try {
      validatedData = maintenancePostSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Verify asset exists
    let assetExists = false;
    if (validatedData.assetType === 'FURNITURE') {
      assetExists = (await prisma.furnitureAsset.findUnique({
        where: { id: validatedData.assetId },
        select: { id: true },
      })) !== null;
    } else if (validatedData.assetType === 'ELECTRONIC') {
      assetExists = (await prisma.electronicAsset.findUnique({
        where: { id: validatedData.assetId },
        select: { id: true },
      })) !== null;
    } else if (validatedData.assetType === 'VEHICLE') {
      assetExists = (await prisma.vehicleAsset.findUnique({
        where: { id: validatedData.assetId },
        select: { id: true },
      })) !== null;
    }

    if (!assetExists) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        assetId: validatedData.assetId,
        assetType: validatedData.assetType,
        description: validatedData.description,
        cost: validatedData.cost || null,
        performedBy: validatedData.performedBy || null,
        nextDueDate: validatedData.nextDueDate ? new Date(validatedData.nextDueDate) : null,
        status: validatedData.status,
      },
    });

    return NextResponse.json({ success: true, data: maintenance });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance' },
      { status: 500 }
    );
  }
}
