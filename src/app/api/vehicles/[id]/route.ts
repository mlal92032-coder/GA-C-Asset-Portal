import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const vehicleSchema = z.object({
  assetName: z.union([z.string().min(1, 'Asset name is required'), z.undefined()]).optional(),
  imageUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
  vehicleType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  brand: z.union([z.string(), z.null(), z.undefined()]).optional(),
  model: z.union([z.string(), z.null(), z.undefined()]).optional(),
  registrationNumber: z.union([z.string().min(1, 'Registration number is required'), z.undefined()]).optional(),
  engineNumber: z.union([z.string(), z.null(), z.undefined()]).optional(),
  fuelType: z.union([z.string(), z.null(), z.undefined()]).optional(),
  purchaseDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  companyId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  manufacturerId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  locationId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  assignedUserId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).optional(),
  status: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED']).optional(),
  lastServiceDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  insuranceExpiryDate: z.union([z.string(), z.null(), z.undefined()]).optional(),
  remarks: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('vehicles', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const asset = await prisma.vehicleAsset.findUnique({
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
        { success: false, error: 'Vehicle asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error fetching vehicle asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('vehicles', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();
    const validatedData = vehicleSchema.parse(body);

    // Check registration number uniqueness if changed
    if (validatedData.registrationNumber) {
      const existing = await prisma.vehicleAsset.findFirst({
        where: { registrationNumber: validatedData.registrationNumber, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Registration number already exists' },
          { status: 400 }
        );
      }
    }

    const oldAsset = await prisma.vehicleAsset.findUnique({ where: { id } });

    const updateData: {
      assetName?: string;
      imageUrl?: string | null;
      vehicleType?: string | null;
      brand?: string | null;
      model?: string | null;
      registrationNumber?: string;
      engineNumber?: string | null;
      fuelType?: string | null;
      purchaseDate?: Date | null;
      companyId?: string | null;
      manufacturerId?: string | null;
      locationId?: string | null;
      assignedUserId?: string | null;
      condition?: 'GOOD' | 'REPAIR' | 'DAMAGED';
      status?: 'IN_USE' | 'IN_STORE' | 'DISPOSED';
      lastServiceDate?: Date | null;
      insuranceExpiryDate?: Date | null;
      remarks?: string | null;
    } = {};
    if (validatedData.assetName !== undefined) updateData.assetName = validatedData.assetName;
    if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl;
    if (validatedData.vehicleType !== undefined) updateData.vehicleType = validatedData.vehicleType;
    if (validatedData.brand !== undefined) updateData.brand = validatedData.brand;
    if (validatedData.model !== undefined) updateData.model = validatedData.model;
    if (validatedData.registrationNumber !== undefined) updateData.registrationNumber = validatedData.registrationNumber;
    if (validatedData.engineNumber !== undefined) updateData.engineNumber = validatedData.engineNumber;
    if (validatedData.fuelType !== undefined) updateData.fuelType = validatedData.fuelType;
    if (validatedData.purchaseDate !== undefined) updateData.purchaseDate = validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null;
    if (validatedData.companyId !== undefined) updateData.companyId = validatedData.companyId;
    if (validatedData.manufacturerId !== undefined) updateData.manufacturerId = validatedData.manufacturerId;
    if (validatedData.locationId !== undefined) updateData.locationId = validatedData.locationId;
    if (validatedData.assignedUserId !== undefined) updateData.assignedUserId = validatedData.assignedUserId;
    if (validatedData.condition !== undefined) updateData.condition = validatedData.condition;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.lastServiceDate !== undefined) updateData.lastServiceDate = validatedData.lastServiceDate ? new Date(validatedData.lastServiceDate) : null;
    if (validatedData.insuranceExpiryDate !== undefined) updateData.insuranceExpiryDate = validatedData.insuranceExpiryDate ? new Date(validatedData.insuranceExpiryDate) : null;
    if (validatedData.remarks !== undefined) updateData.remarks = validatedData.remarks;

    const asset = await prisma.vehicleAsset.update({
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
      entity: 'VEHICLE',
      entityId: asset.id,
      details: { old: oldAsset, new: validatedData },
    });

    return NextResponse.json({ success: true, data: asset, message: 'Vehicle asset updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating vehicle asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('vehicles', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const asset = await prisma.vehicleAsset.findUnique({ where: { id } });
    await prisma.vehicleAsset.delete({ where: { id } });

    if (asset) {
      await createAuditLog({
        action: 'DELETE',
        entity: 'VEHICLE',
        entityId: id,
        details: { deleted: asset },
      });
    }

    return NextResponse.json({ success: true, message: 'Vehicle asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vehicle asset' },
      { status: 500 }
    );
  }
}
