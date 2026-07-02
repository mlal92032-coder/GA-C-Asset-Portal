import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const electronicSchema = z.object({
  assetName: z.string().min(1, 'Asset name is required'),
  assetTag: z.string().min(1, 'Asset tag is required'),
  imageUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
  deviceType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  brand: z.union([z.string(), z.null(), z.undefined()]).optional(),
  model: z.union([z.string(), z.null(), z.undefined()]).optional(),
  purchaseDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  warrantyEndDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  companyId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  manufacturerId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  locationId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  assignedUserId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']),
  status: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']),
  lastMaintenanceDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  remarks: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission('electronics', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const condition = searchParams.get('condition');
    const status = searchParams.get('status');
    const locationId = searchParams.get('locationId');
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: {
      OR?: Array<{ assetName?: { contains: string } } | { brand?: { contains: string } } | { model?: { contains: string } } | { serialNumber?: { contains: string } }>;
      condition?: 'GOOD' | 'REPAIR' | 'DAMAGED';
      status?: 'IN_USE' | 'IN_STORE' | 'DISPOSED';
      locationId?: string;
      companyId?: string;
    } = {};

    if (search) {
      where.OR = [
        { assetName: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { serialNumber: { contains: search } },
      ];
    }
    if (condition) where.condition = condition as 'GOOD' | 'REPAIR' | 'DAMAGED';
    if (status) where.status = status as 'IN_USE' | 'IN_STORE' | 'DISPOSED';
    if (locationId) where.locationId = locationId;
    if (companyId) where.companyId = companyId;

    const [total, assets] = await Promise.all([
      prisma.electronicAsset.count({ where }),
      prisma.electronicAsset.findMany({
        where,
        include: {
          company: { select: { id: true, companyName: true } },
          manufacturer: { select: { id: true, manufacturerName: true } },
          location: { select: { id: true, locationName: true } },
          assignedUser: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching electronic assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch electronic assets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission('electronics', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const validatedData = electronicSchema.parse(body);

    // Check if asset tag already exists
    const existingAsset = await prisma.electronicAsset.findFirst({
      where: { assetTag: validatedData.assetTag },
    });
    if (existingAsset) {
      return NextResponse.json(
        { success: false, error: 'Asset tag already exists' },
        { status: 400 }
      );
    }

    const asset = await prisma.electronicAsset.create({
      data: {
        assetTag: validatedData.assetTag,
        assetName: validatedData.assetName,
        imageUrl: validatedData.imageUrl || null,
        deviceType: validatedData.deviceType || null,
        brand: validatedData.brand || null,
        model: validatedData.model || null,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
        companyId: validatedData.companyId || null,
        manufacturerId: validatedData.manufacturerId || null,
        locationId: validatedData.locationId || null,
        assignedUserId: validatedData.assignedUserId || null,
        condition: validatedData.condition,
        status: validatedData.status,
        warrantyEndDate: validatedData.warrantyEndDate ? new Date(validatedData.warrantyEndDate) : null,
        lastMaintenanceDate: validatedData.lastMaintenanceDate ? new Date(validatedData.lastMaintenanceDate) : null,
        remarks: validatedData.remarks || null,
      },
      include: {
        company: { select: { id: true, companyName: true } },
        manufacturer: { select: { id: true, manufacturerName: true } },
        location: { select: { id: true, locationName: true } },
        assignedUser: { select: { id: true, fullName: true } },
      },
    });

    await createAuditLog({
      action: 'CREATE',
      entity: 'ELECTRONIC',
      entityId: asset.id,
      details: validatedData,
    });

    return NextResponse.json({ success: true, data: asset, message: 'Electronic asset created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating electronic asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create electronic asset' },
      { status: 500 }
    );
  }
}
