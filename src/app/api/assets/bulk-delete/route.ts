import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BulkDeleteSchema = z.object({
  assetIds: z.array(z.string()).min(1).max(100),
  assetType: z.enum(['FURNITURE', 'ELECTRONICS', 'VEHICLES']),
  reason: z.string().min(1).max(500),
});

type BulkDeleteRequest = z.infer<typeof BulkDeleteSchema>;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can bulk delete
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can perform bulk delete operations' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = BulkDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { assetIds, assetType, reason } = validation.data as BulkDeleteRequest;

    // Determine the model to query
    const modelMap = {
      FURNITURE: 'furnitureAsset',
      ELECTRONICS: 'electronicAsset',
      VEHICLES: 'vehicleAsset',
    } as const;

    const model = modelMap[assetType];

    // Get all assets to verify they exist and can be deleted
    const assets = await (prisma[model] as any).findMany({
      where: { id: { in: assetIds } },
      select: { id: true, assetName: true },
    });

    if (assets.length === 0) {
      return NextResponse.json(
        { error: 'No valid assets found to delete' },
        { status: 404 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Delete assets
      const deleteResult = await tx[model].deleteMany({
        where: { id: { in: assetIds } },
      });

      // Log audit for each deletion
      await Promise.all(
        assets.map((asset: any) =>
          tx.auditLog.create({
            data: {
              userId: session.user!.id,
              action: 'DELETE',
              entityType: assetType,
              entityId: asset.id,
              description: `Bulk deleted ${assetType.toLowerCase()} asset: ${asset.assetName}. Reason: ${reason}`,
              changes: { reason },
            },
          })
        )
      );

      return deleteResult;
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Successfully deleted ${result.count} ${assetType.toLowerCase()} asset(s)`,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete assets' },
      { status: 500 }
    );
  }
}
