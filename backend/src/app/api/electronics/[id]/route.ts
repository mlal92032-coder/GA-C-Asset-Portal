import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { autoCreateMaintenanceTask } from '@/lib/maintenance-automation';
import { authOptions } from '@/lib/auth-options';

const electronicSchema = z.object({
  assetName: z.union([z.string().min(1, 'Asset name is required'), z.undefined()]).optional(),
  imageUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
  deviceType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  brand: z.union([z.string(), z.null(), z.undefined()]).optional(),
  model: z.union([z.string(), z.null(), z.undefined()]).optional(),
  serialNumber: z.union([z.string(), z.null(), z.undefined()]).optional(),
  purchaseDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  warrantyEndDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  companyId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  manufacturerId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  locationId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  assignedUserId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).optional(),
  status: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']).optional(),
  lastMaintenanceDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  remarks: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('electronics', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const asset = await prisma.electronicAsset.findUnique({
      where: { id },
      include: {
        company: true,
        manufacturer: true,
        location: true,
        assignedUser: { select: { id: true, fullName: true, email: true, department: true, designation: true, status: true } },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Electronic asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error fetching electronic asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch electronic asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('electronics', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();
    const validatedData = electronicSchema.parse(body);

    // Check serial number uniqueness if changed
    if (validatedData.serialNumber) {
      const existing = await prisma.electronicAsset.findFirst({
        where: { serialNumber: validatedData.serialNumber, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Serial number already exists' },
          { status: 400 }
        );
      }
    }

    const oldAsset = await prisma.electronicAsset.findUnique({ where: { id } });

    const updateData: {
      assetName?: string;
      imageUrl?: string | null;
      deviceType?: string | null;
      brand?: string | null;
      model?: string | null;
      serialNumber?: string | null;
      purchaseDate?: Date | null;
      warrantyEndDate?: Date | null;
      companyId?: string | null;
      manufacturerId?: string | null;
      locationId?: string | null;
      assignedUserId?: string | null;
      condition?: 'GOOD' | 'REPAIR' | 'DAMAGED';
      status?: 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION';
      lastMaintenanceDate?: Date | null;
      remarks?: string | null;
    } = {};
    if (validatedData.assetName !== undefined) updateData.assetName = validatedData.assetName;
    if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl;
    if (validatedData.deviceType !== undefined) updateData.deviceType = validatedData.deviceType;
    if (validatedData.brand !== undefined) updateData.brand = validatedData.brand;
    if (validatedData.model !== undefined) updateData.model = validatedData.model;
    if (validatedData.serialNumber !== undefined) updateData.serialNumber = validatedData.serialNumber;
    if (validatedData.purchaseDate !== undefined) updateData.purchaseDate = validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null;
    if (validatedData.warrantyEndDate !== undefined) updateData.warrantyEndDate = validatedData.warrantyEndDate ? new Date(validatedData.warrantyEndDate) : null;
    if (validatedData.companyId !== undefined) updateData.companyId = validatedData.companyId;
    if (validatedData.manufacturerId !== undefined) updateData.manufacturerId = validatedData.manufacturerId;
    if (validatedData.locationId !== undefined) updateData.locationId = validatedData.locationId;
    if (validatedData.assignedUserId !== undefined) updateData.assignedUserId = validatedData.assignedUserId;
    if (validatedData.condition !== undefined) updateData.condition = validatedData.condition;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.lastMaintenanceDate !== undefined) updateData.lastMaintenanceDate = validatedData.lastMaintenanceDate ? new Date(validatedData.lastMaintenanceDate) : null;
    if (validatedData.remarks !== undefined) updateData.remarks = validatedData.remarks;

    const asset = await prisma.electronicAsset.update({
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
      entity: 'ELECTRONIC',
      entityId: asset.id,
      details: { old: oldAsset, new: validatedData },
    });

    // Auto-create maintenance task if condition changed to REPAIR
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await autoCreateMaintenanceTask(
        asset.id,
        'ELECTRONIC',
        asset.assetName,
        oldAsset?.condition,
        validatedData.condition,
        session.user.id
      );
    }

    return NextResponse.json({ success: true, data: asset, message: 'Electronic asset updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating electronic asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update electronic asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('electronics', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const asset = await prisma.electronicAsset.findUnique({ where: { id } });
    await prisma.electronicAsset.delete({ where: { id } });

    if (asset) {
      await createAuditLog({
        action: 'DELETE',
        entity: 'ELECTRONIC',
        entityId: id,
        details: { deleted: asset },
      });
    }

    return NextResponse.json({ success: true, message: 'Electronic asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting electronic asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete electronic asset' },
      { status: 500 }
    );
  }
}
