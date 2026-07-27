import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { z } from 'zod';

const sparePartGetSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  vehicleId: z.string().optional(),
});

const sparePartPostSchema = z.object({
  partDate: z.string().datetime().or(z.string()),
  partName: z.string().min(1, 'Part name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  vehicleId: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission('vehicles', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const vehicleId = searchParams.get('vehicleId') || undefined;

    try {
      sparePartGetSchema.parse({ page: page.toString(), limit: limit.toString(), vehicleId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
      }
      throw error;
    }

    const skip = (page - 1) * limit;
    const where: any = {};

    if (vehicleId && vehicleId !== 'N/A') {
      where.vehicleId = vehicleId;
    }

    const [data, total] = await Promise.all([
      prisma.sparePart.findMany({
        where,
        skip,
        take: limit,
        orderBy: { partDate: 'desc' },
      }),
      prisma.sparePart.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch spare parts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('vehicles', 'create');
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await request.json();

    let validatedData: z.infer<typeof sparePartPostSchema>;
    try {
      validatedData = sparePartPostSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
      }
      throw error;
    }

    // Verify vehicle exists if provided
    if (validatedData.vehicleId) {
      const vehicleExists = await prisma.vehicleAsset.findUnique({
        where: { id: validatedData.vehicleId },
        select: { id: true },
      });

      if (!vehicleExists) {
        return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
      }
    }

    const totalCost = validatedData.quantity * validatedData.unitPrice;

    const sparePart = await prisma.sparePart.create({
      data: {
        partDate: new Date(validatedData.partDate),
        partName: validatedData.partName,
        quantity: validatedData.quantity,
        unitPrice: validatedData.unitPrice,
        totalCost,
        supplierName: validatedData.supplierName,
        vehicleId: validatedData.vehicleId || null,
        remarks: validatedData.remarks || null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'SPARE_PART',
        entityId: sparePart.id,
        details: JSON.stringify(validatedData),
      },
    });

    return NextResponse.json({
      success: true,
      data: sparePart,
      message: 'Spare part record created successfully',
    });
  } catch (error) {
    console.error('Error creating spare part:', error);
    return NextResponse.json({ success: false, error: 'Failed to create spare part' }, { status: 500 });
  }
}
