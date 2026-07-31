import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/api-auth';
import { z } from 'zod';

const sparePartUpdateSchema = z.object({
  partDate: z.string().datetime().or(z.string()).optional(),
  partName: z.string().min(1).optional(),
  quantity: z.number().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
  supplierName: z.string().min(1).optional(),
  vehicleId: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requirePermission('vehicles', 'edit');
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;
    const body = await request.json();

    // Verify spare part exists
    const existingSparePart = await prisma.sparePart.findUnique({
      where: { id },
    });

    if (!existingSparePart) {
      return NextResponse.json({ success: false, error: 'Spare part not found' }, { status: 404 });
    }

    let validatedData: z.infer<typeof sparePartUpdateSchema>;
    try {
      validatedData = sparePartUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 });
      }
      throw error;
    }

    // Verify vehicle if provided
    if (validatedData.vehicleId) {
      const vehicleExists = await prisma.vehicleAsset.findUnique({
        where: { id: validatedData.vehicleId },
        select: { id: true },
      });

      if (!vehicleExists) {
        return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
      }
    }

    const updateData: any = { ...validatedData };

    // Calculate totalCost if quantity or unitPrice changed
    if (validatedData.quantity !== undefined || validatedData.unitPrice !== undefined) {
      const quantity = validatedData.quantity ?? existingSparePart.quantity;
      const unitPrice = validatedData.unitPrice ?? existingSparePart.unitPrice;
      updateData.totalCost = quantity * unitPrice;
    }

    if (validatedData.partDate) {
      updateData.partDate = new Date(validatedData.partDate);
    }

    const sparePart = await prisma.sparePart.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        action: 'UPDATE',
        entity: 'SPARE_PART',
        entityId: id,
        details: JSON.stringify(validatedData),
      },
    });

    return NextResponse.json({
      success: true,
      data: sparePart,
      message: 'Spare part updated successfully',
    });
  } catch (error) {
    console.error('Error updating spare part:', error);
    return NextResponse.json({ success: false, error: 'Failed to update spare part' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requirePermission('vehicles', 'delete');
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;

    // Verify spare part exists
    const sparePart = await prisma.sparePart.findUnique({
      where: { id },
    });

    if (!sparePart) {
      return NextResponse.json({ success: false, error: 'Spare part not found' }, { status: 404 });
    }

    await prisma.sparePart.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        action: 'DELETE',
        entity: 'SPARE_PART',
        entityId: id,
        details: JSON.stringify(sparePart),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Spare part deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting spare part:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete spare part' }, { status: 500 });
  }
}
