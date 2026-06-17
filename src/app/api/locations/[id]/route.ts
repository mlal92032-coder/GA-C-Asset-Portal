import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const locationSchema = z.object({
  locationName: z.string().min(1, 'Location name is required').optional(),
  building: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('locations', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const location = await prisma.location.findUnique({ where: { id } });

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: location });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('locations', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();
    const validatedData = locationSchema.parse(body);

    const oldLocation = await prisma.location.findUnique({ where: { id } });

    const location = await prisma.location.update({
      where: { id },
      data: validatedData,
    });

    await createAuditLog({
      action: 'UPDATE',
      entity: 'LOCATION',
      entityId: location.id,
      details: { old: oldLocation, new: validatedData },
    });

    return NextResponse.json({ success: true, data: location, message: 'Location updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('locations', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const location = await prisma.location.findUnique({ where: { id } });
    await prisma.location.delete({ where: { id } });

    if (location) {
      await createAuditLog({
        action: 'DELETE',
        entity: 'LOCATION',
        entityId: id,
        details: { deleted: location },
      });
    }

    return NextResponse.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
