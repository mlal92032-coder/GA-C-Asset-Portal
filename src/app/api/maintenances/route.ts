import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { z } from 'zod';

const maintenanceGetAllSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  assetType: z.string().optional(),
});

const maintenancePostSchema = z.object({
  assetId: z.string().min(1),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']),
  description: z.string().min(1),
  cost: z.number().optional().nullable(),
  performedBy: z.string().optional().nullable(),
  nextDueDate: z.string().optional().nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  odometerReading: z.number().optional().nullable(),
  workType: z.string().optional().nullable(),
  vendorName: z.string().optional().nullable(),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Card']).optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission('maintenance', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const assetType = searchParams.get('assetType');

    // Validate query params
    try {
      maintenanceGetAllSchema.parse({ page: page.toString(), limit: limit.toString(), assetType });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
      }
      throw error;
    }

    const skip = (page - 1) * limit;

    const where: any = {};
    if (assetType) {
      where.assetType = assetType;
    }

    const [data, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { maintenanceDate: 'desc' },
      }),
      prisma.maintenance.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching maintenances:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch maintenances' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('maintenance', 'create');
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await request.json();

    let validatedData: z.infer<typeof maintenancePostSchema>;
    try {
      validatedData = maintenancePostSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
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
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
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
        userId: user.id,
        odometerReading: validatedData.odometerReading || null,
        workType: validatedData.workType || null,
        vendorName: validatedData.vendorName || null,
        paymentMethod: validatedData.paymentMethod || null,
        remarks: validatedData.remarks || null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'MAINTENANCE',
        entityId: maintenance.id,
        details: JSON.stringify(validatedData),
      },
    });

    return NextResponse.json({ success: true, data: maintenance, message: 'Maintenance record created' });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json({ success: false, error: 'Failed to create maintenance' }, { status: 500 });
  }
}
