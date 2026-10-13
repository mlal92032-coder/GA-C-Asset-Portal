import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BulkUpdateSchema = z.object({
  assetIds: z.array(z.string()).min(1),
  newStatus: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']).optional(),
  newCondition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).optional(),
  newLocationId: z.string().optional(),
  newAssigneeId: z.string().optional(),
  assetType: z.enum(['FURNITURE', 'ELECTRONICS', 'VEHICLE']),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN' && session.user.role !== 'USER') {
    return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    // Get user with tenantId
    const user = await prisma.user.findFirst({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = BulkUpdateSchema.parse(body);

    const { assetIds, newStatus, newCondition, newLocationId, newAssigneeId, assetType } = validatedData;

    if (!newStatus && !newCondition && !newLocationId && !newAssigneeId) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be updated' },
        { status: 400 }
      );
    }

    let updated = 0;

    // Handle different asset types
    if (assetType === 'FURNITURE') {
      updated = await prisma.furnitureAsset.updateMany({
        where: { id: { in: assetIds } },
        data: {
          ...(newStatus && { status: newStatus }),
          ...(newCondition && { condition: newCondition }),
          ...(newLocationId && { locationId: newLocationId }),
          ...(newAssigneeId && { assignedUserId: newAssigneeId }),
        },
      }).catch(() => ({ count: 0 })).then((result: any) => result.count || 0);
    } else if (assetType === 'ELECTRONICS') {
      updated = await prisma.electronicAsset.updateMany({
        where: { id: { in: assetIds } },
        data: {
          ...(newStatus && { status: newStatus }),
          ...(newCondition && { condition: newCondition }),
          ...(newLocationId && { locationId: newLocationId }),
          ...(newAssigneeId && { assignedUserId: newAssigneeId }),
        },
      }).catch(() => ({ count: 0 })).then((result: any) => result.count || 0);
    } else if (assetType === 'VEHICLE') {
      updated = await prisma.vehicleAsset.updateMany({
        where: { id: { in: assetIds } },
        data: {
          ...(newStatus && { status: newStatus }),
          ...(newCondition && { condition: newCondition }),
          ...(newLocationId && { locationId: newLocationId }),
          ...(newAssigneeId && { assignedUserId: newAssigneeId }),
        },
      }).catch(() => ({ count: 0 })).then((result: any) => result.count || 0);
    }

    // Create audit logs for each asset updated
    const auditLogEntries = assetIds.map((assetId) => ({
      userId: session.user.id,
      action: 'UPDATE',
      entity: assetType,
      entityId: assetId,
      tenantId: user.tenantId,
      details: JSON.stringify({
        status: newStatus,
        condition: newCondition,
        locationId: newLocationId,
        assignedUserId: newAssigneeId,
      }),
    }));

    await prisma.auditLog.createMany({
      data: auditLogEntries,
    });

    return NextResponse.json({
      success: true,
      message: `${updated} asset(s) updated successfully`,
      updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      const message = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation error';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    console.error('Bulk update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assets' },
      { status: 500 }
    );
  }
}
