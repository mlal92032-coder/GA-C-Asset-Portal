import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { generateAssetTag } from '@/lib/asset-tag';
import { generateSerialNumber } from '@/lib/serial-number';

const furnitureSchema = z.object({
  assetName: z.string().min(1, 'Asset name is required'),
  assetTag: z.string().min(1, 'Asset tag is required'),
  imageUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
  furnitureType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  material: z.union([z.string(), z.null(), z.undefined()]).optional(),
  purchaseDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  purchasePrice: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),
  companyId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  manufacturerId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  locationId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  assignedUserId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']),
  status: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']),
  remarks: z.union([z.string(), z.null(), z.undefined()]).optional(),
  usefulLifeYears: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  salvageValue: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  depreciationMethod: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission('furniture', 'view');
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
      OR?: Array<{ assetName?: { contains: string } } | { material?: { contains: string } } | { furnitureType?: { contains: string } }>;
      condition?: 'GOOD' | 'REPAIR' | 'DAMAGED';
      status?: 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION';
      locationId?: string;
      companyId?: string;
    } = {};

    if (search) {
      where.OR = [
        { assetName: { contains: search } },
        { material: { contains: search } },
        { furnitureType: { contains: search } },
      ];
    }
    if (condition) where.condition = condition as 'GOOD' | 'REPAIR' | 'DAMAGED';
    if (status) where.status = status as 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION';
    if (locationId) where.locationId = locationId;
    if (companyId) where.companyId = companyId;

    const [total, assets] = await Promise.all([
      prisma.furnitureAsset.count({ where }),
      prisma.furnitureAsset.findMany({
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
    console.error('Error fetching furniture assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch furniture assets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission('furniture', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();

    const validatedData = furnitureSchema.parse(body);

    // Check if asset tag already exists
    const existingAsset = await prisma.furnitureAsset.findFirst({
      where: { assetTag: validatedData.assetTag },
    });
    if (existingAsset) {
      return NextResponse.json(
        { success: false, error: 'Asset tag already exists' },
        { status: 400 }
      );
    }

    const asset = await prisma.furnitureAsset.create({
      data: {
        assetTag: validatedData.assetTag,
        assetName: validatedData.assetName,
        imageUrl: validatedData.imageUrl || null,
        furnitureType: validatedData.furnitureType || null,
        material: validatedData.material || null,
        purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
        purchasePrice: validatedData.purchasePrice ? (typeof validatedData.purchasePrice === 'string' ? parseFloat(validatedData.purchasePrice) : validatedData.purchasePrice) : null,
        companyId: validatedData.companyId || null,
        manufacturerId: validatedData.manufacturerId || null,
        locationId: validatedData.locationId || null,
        assignedUserId: validatedData.assignedUserId || null,
        condition: validatedData.condition,
        status: validatedData.status,
        remarks: validatedData.remarks || null,
        usefulLifeYears: validatedData.usefulLifeYears ? (typeof validatedData.usefulLifeYears === 'string' ? parseInt(validatedData.usefulLifeYears) : validatedData.usefulLifeYears) : null,
        salvageValue: validatedData.salvageValue ? (typeof validatedData.salvageValue === 'string' ? parseFloat(validatedData.salvageValue) : validatedData.salvageValue) : null,
        depreciationMethod: validatedData.depreciationMethod || null,
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
      entity: 'FURNITURE',
      entityId: asset.id,
      details: validatedData,
    });

    return NextResponse.json({ success: true, data: asset, message: 'Furniture asset created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating furniture asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create furniture asset' },
      { status: 500 }
    );
  }
}
