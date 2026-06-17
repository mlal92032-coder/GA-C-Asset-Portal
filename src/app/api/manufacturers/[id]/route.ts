import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const manufacturerSchema = z.object({
  manufacturerName: z.string().min(1, 'Manufacturer name is required').optional(),
  country: z.string().optional().nullable(),
  supportEmail: z.string().email().optional().nullable(),
  supportPhone: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('manufacturers', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const manufacturer = await prisma.manufacturer.findUnique({ where: { id } });

    if (!manufacturer) {
      return NextResponse.json(
        { success: false, error: 'Manufacturer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: manufacturer });
  } catch (error) {
    console.error('Error fetching manufacturer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch manufacturer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('manufacturers', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();
    const validatedData = manufacturerSchema.parse(body);

    const oldManufacturer = await prisma.manufacturer.findUnique({ where: { id } });

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: validatedData,
    });

    await createAuditLog({
      action: 'UPDATE',
      entity: 'MANUFACTURER',
      entityId: manufacturer.id,
      details: { old: oldManufacturer, new: validatedData },
    });

    return NextResponse.json({ success: true, data: manufacturer, message: 'Manufacturer updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating manufacturer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update manufacturer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('manufacturers', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const manufacturer = await prisma.manufacturer.findUnique({ where: { id } });
    await prisma.manufacturer.delete({ where: { id } });

    if (manufacturer) {
      await createAuditLog({
        action: 'DELETE',
        entity: 'MANUFACTURER',
        entityId: id,
        details: { deleted: manufacturer },
      });
    }

    return NextResponse.json({ success: true, message: 'Manufacturer deleted successfully' });
  } catch (error) {
    console.error('Error deleting manufacturer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete manufacturer' },
      { status: 500 }
    );
  }
}
