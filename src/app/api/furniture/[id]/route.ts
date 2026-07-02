import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const furnitureSchema = z.object({
  assetName: z.union([z.string().min(1, 'Asset name is required'), z.undefined()]).optional(),
  imageUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
  furnitureType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  material: z.union([z.string(), z.null(), z.undefined()]).optional(),
  purchaseDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  purchasePrice: z.union([z.string(), z.number(), z.null(), z.undefined()]).optional(),
  companyId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  manufacturerId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  locationId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  assignedUserId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).optional(),
  status: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']).optional(),
  remarks: z.union([z.string(), z.null(), z.undefined()]).optional(),
  usefulLifeYears: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  salvageValue: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  depreciationMethod: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('furniture', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const asset = await prisma.furnitureAsset.findUnique({
      where: { id },
      include: {
        company: true,
        manufacturer: true,
        location: true,
        assignedUser: { select: { id: true, fullName: true, email: true, department: true, designation: true } },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Furniture asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error fetching furniture asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch furniture asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('furniture', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();

    const validatedData = furnitureSchema.parse(body);

    const oldAsset = await prisma.furnitureAsset.findUnique({ where: { id } });

    const updateData: {
      assetName?: string;
      imageUrl?: string | null;
      furnitureType?: string | null;
      material?: string | null;
      purchaseDate?: Date | null;
      purchasePrice?: number | null;
      companyId?: string | null;
      manufacturerId?: string | null;
      locationId?: string | null;
      assignedUserId?: string | null;
      condition?: 'GOOD' | 'REPAIR' | 'DAMAGED';
      status?: 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION';
      remarks?: string | null;
      usefulLifeYears?: number | null;
      salvageValue?: number | null;
      depreciationMethod?: string | null;
    } = {
      assetName: validatedData.assetName,
      imageUrl: validatedData.imageUrl ?? oldAsset?.imageUrl,
    };
    
    if (validatedData.furnitureType !== undefined) updateData.furnitureType = validatedData.furnitureType;
    if (validatedData.material !== undefined) updateData.material = validatedData.material;
    if (validatedData.purchaseDate !== undefined) updateData.purchaseDate = validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null;
    if (validatedData.purchasePrice !== undefined) updateData.purchasePrice = typeof validatedData.purchasePrice === 'string' ? parseFloat(validatedData.purchasePrice) : validatedData.purchasePrice;
    if (validatedData.companyId !== undefined) updateData.companyId = validatedData.companyId;
    if (validatedData.manufacturerId !== undefined) updateData.manufacturerId = validatedData.manufacturerId;
    if (validatedData.locationId !== undefined) updateData.locationId = validatedData.locationId;
    if (validatedData.assignedUserId !== undefined) updateData.assignedUserId = validatedData.assignedUserId;
    if (validatedData.condition !== undefined) updateData.condition = validatedData.condition;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.remarks !== undefined) updateData.remarks = validatedData.remarks;
    if (validatedData.usefulLifeYears !== undefined) {
      updateData.usefulLifeYears = typeof validatedData.usefulLifeYears === 'string' ? parseInt(validatedData.usefulLifeYears, 10) : validatedData.usefulLifeYears;
    }
    if (validatedData.salvageValue !== undefined) {
      updateData.salvageValue = typeof validatedData.salvageValue === 'string' ? parseFloat(validatedData.salvageValue) : validatedData.salvageValue;
    }
    if (validatedData.depreciationMethod !== undefined) updateData.depreciationMethod = validatedData.depreciationMethod;

    const asset = await prisma.furnitureAsset.update({
      where: { id },
      data: updateData,
      include: {
        company: { select: { id: true, companyName: true } },
        manufacturer: { select: { id: true, manufacturerName: true } },
        location: { select: { id: true, locationName: true } },
        assignedUser: { select: { id: true, fullName: true } },
      },
    });

    await createAuditLog({
      action: 'UPDATE',
      entity: 'FURNITURE',
      entityId: asset.id,
      details: { old: oldAsset, new: validatedData },
    });

    return NextResponse.json({ success: true, data: asset, message: 'Furniture asset updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating furniture asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update furniture asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('furniture', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const asset = await prisma.furnitureAsset.findUnique({ where: { id } });
    await prisma.furnitureAsset.delete({ where: { id } });

    if (asset) {
      await createAuditLog({
        action: 'DELETE',
        entity: 'FURNITURE',
        entityId: id,
        details: { deleted: asset },
      });
    }

    return NextResponse.json({ success: true, message: 'Furniture asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting furniture asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete furniture asset' },
      { status: 500 }
    );
  }
}
