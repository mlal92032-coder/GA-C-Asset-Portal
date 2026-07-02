import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const vehicleSchema = z.object({
  assetName: z.string().min(1, 'Asset name is required'),
  assetTag: z.string().min(1, 'Asset tag is required'),
  imageUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
  vehicleType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  brand: z.union([z.string(), z.null(), z.undefined()]).optional(),
  model: z.union([z.string(), z.null(), z.undefined()]).optional(),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  engineNumber: z.union([z.string(), z.null(), z.undefined()]).optional(),
  chassisNumber: z.union([z.string(), z.null(), z.undefined()]).optional(),
  fuelType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  purchaseDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  companyId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  manufacturerId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  locationId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  assignedUserId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']),
  status: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']),
  lastServiceDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  insuranceExpiryDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  remarks: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission('vehicles', 'view');
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
      OR?: Array<{ assetName?: { contains: string } } | { brand?: { contains: string } } | { model?: { contains: string } } | { registrationNumber?: { contains: string } }>;
      condition?: 'GOOD' | 'REPAIR' | 'DAMAGED';
      status?: 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION';
      locationId?: string;
      companyId?: string;
    } = {};

    if (search) {
      where.OR = [
        { assetName: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { registrationNumber: { contains: search } },
      ];
    }
    if (condition) where.condition = condition as 'GOOD' | 'REPAIR' | 'DAMAGED';
    if (status) where.status = status as 'IN_USE' | 'IN_STORE' | 'DISPOSED';
    if (locationId) where.locationId = locationId;
    if (companyId) where.companyId = companyId;

    const [total, assets] = await Promise.all([
      prisma.vehicleAsset.count({ where }),
      prisma.vehicleAsset.findMany({
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
    console.error('Error fetching vehicle assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle assets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission('vehicles', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const validatedData = vehicleSchema.parse(body);

    // Check if asset tag already exists
    const existingAssetTag = await prisma.vehicleAsset.findFirst({
      where: { assetTag: validatedData.assetTag },
    });
    if (existingAssetTag) {
      return NextResponse.json(
        { success: false, error: 'Asset tag already exists' },
        { status: 400 }
      );
    }

    // Check registration number uniqueness
    const existing = await prisma.vehicleAsset.findUnique({
      where: { registrationNumber: validatedData.registrationNumber || undefined },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Registration number already exists' },
        { status: 400 }
      );
    }

    const asset = await prisma.vehicleAsset.create({
      data: {
        assetTag: validatedData.assetTag,
        assetName: validatedData.assetName,
        registrationNumber: validatedData.registrationNumber,
        imageUrl: validatedData.imageUrl || null,
        vehicleType: validatedData.vehicleType || null,
        brand: validatedData.brand || null,
        model: validatedData.model || null,
        engineNumber: validatedData.engineNumber || null,
        fuelType: validatedData.fuelType || null,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
        companyId: validatedData.companyId || null,
        manufacturerId: validatedData.manufacturerId || null,
        locationId: validatedData.locationId || null,
        assignedUserId: validatedData.assignedUserId || null,
        condition: validatedData.condition,
        status: validatedData.status,
        lastServiceDate: validatedData.lastServiceDate ? new Date(validatedData.lastServiceDate) : null,
        insuranceExpiryDate: validatedData.insuranceExpiryDate ? new Date(validatedData.insuranceExpiryDate) : null,
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
      entity: 'VEHICLE',
      entityId: asset.id,
      details: validatedData,
    });

    return NextResponse.json({ success: true, data: asset, message: 'Vehicle asset created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating vehicle asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle asset' },
      { status: 500 }
    );
  }
}
