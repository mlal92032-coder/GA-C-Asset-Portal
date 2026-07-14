import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/api-auth';
import { z } from 'zod';

const maintenancePutSchema = z.object({
  assetId: z.string().min(1).optional(),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']).optional(),
  description: z.string().min(1).optional(),
  cost: z.number().optional().nullable(),
  performedBy: z.string().optional().nullable(),
  nextDueDate: z.string().optional().nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  maintenanceDate: z.string().optional(),
  odometerReading: z.number().optional().nullable(),
  workType: z.string().optional().nullable(),
  vendorName: z.string().optional().nullable(),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Card']).optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('maintenance', 'edit');
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    let validatedData: z.infer<typeof maintenancePutSchema>;
    try {
      validatedData = maintenancePutSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
      }
      throw error;
    }

    // Get existing record to track changes
    const existing = await prisma.maintenance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Maintenance record not found' }, { status: 404 });
    }

    // If asset is being changed, verify it exists
    if (validatedData.assetId && validatedData.assetId !== existing.assetId) {
      const assetType = validatedData.assetType || existing.assetType;
      let assetExists = false;

      if (assetType === 'FURNITURE') {
        assetExists = (await prisma.furnitureAsset.findUnique({
          where: { id: validatedData.assetId },
          select: { id: true },
        })) !== null;
      } else if (assetType === 'ELECTRONIC') {
        assetExists = (await prisma.electronicAsset.findUnique({
          where: { id: validatedData.assetId },
          select: { id: true },
        })) !== null;
      } else if (assetType === 'VEHICLE') {
        assetExists = (await prisma.vehicleAsset.findUnique({
          where: { id: validatedData.assetId },
          select: { id: true },
        })) !== null;
      }

      if (!assetExists) {
        return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
      }
    }

    // Build update data
    const updateData: any = {};
    if (validatedData.assetId) updateData.assetId = validatedData.assetId;
    if (validatedData.assetType) updateData.assetType = validatedData.assetType;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.cost !== undefined) updateData.cost = validatedData.cost;
    if (validatedData.performedBy !== undefined) updateData.performedBy = validatedData.performedBy;
    if (validatedData.nextDueDate !== undefined) updateData.nextDueDate = validatedData.nextDueDate ? new Date(validatedData.nextDueDate) : null;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.maintenanceDate) updateData.maintenanceDate = new Date(validatedData.maintenanceDate);
    if (validatedData.odometerReading !== undefined) updateData.odometerReading = validatedData.odometerReading;
    if (validatedData.workType !== undefined) updateData.workType = validatedData.workType;
    if (validatedData.vendorName !== undefined) updateData.vendorName = validatedData.vendorName;
    if (validatedData.paymentMethod !== undefined) updateData.paymentMethod = validatedData.paymentMethod;
    if (validatedData.remarks !== undefined) updateData.remarks = validatedData.remarks;

    const updated = await prisma.maintenance.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        entity: 'MAINTENANCE',
        entityId: id,
        details: JSON.stringify(validatedData),
      },
    });

    return NextResponse.json({ success: true, data: updated, message: 'Maintenance record updated' });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json({ success: false, error: 'Failed to update maintenance' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('maintenance', 'delete');
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;

    const existing = await prisma.maintenance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Maintenance record not found' }, { status: 404 });
    }

    await prisma.maintenance.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        entity: 'MAINTENANCE',
        entityId: id,
        details: JSON.stringify({ deleted: true }),
      },
    });

    return NextResponse.json({ success: true, message: 'Maintenance record deleted' });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete maintenance' }, { status: 500 });
  }
}
