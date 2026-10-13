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
    console.log('🔍 Bulk Delete API called');
    console.log('   Session:', session?.user?.email);
    console.log('   Role:', session?.user?.role);

    if (!session?.user) {
      console.log('❌ No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and SUPER_ADMIN can bulk delete
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      console.log('❌ Insufficient role:', session.user.role);
      return NextResponse.json(
        { error: 'Only administrators can perform bulk delete operations' },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log('📦 Request body:', { assetIds: body.assetIds?.length, assetType: body.assetType, reason: body.reason });

    const validation = BulkDeleteSchema.safeParse(body);

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.flatten());
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { assetIds, assetType, reason } = validation.data as BulkDeleteRequest;
    console.log('✅ Validation passed. Deleting', assetIds.length, 'assets of type', assetType);

    // Get user's tenant ID
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    });

    if (!userRecord?.tenantId) {
      console.log('❌ User tenant not found');
      return NextResponse.json(
        { error: 'User tenant information not found' },
        { status: 400 }
      );
    }

    const userTenantId = userRecord.tenantId;

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

    console.log('🔎 Found', assets.length, 'assets to delete');

    if (assets.length === 0) {
      console.log('❌ No assets found');
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
              tenantId: userTenantId,
              action: 'DELETE',
              entity: assetType === 'ELECTRONICS' ? 'ELECTRONIC' : assetType === 'VEHICLES' ? 'VEHICLE' : assetType,
              entityId: asset.id,
              details: JSON.stringify({
                assetName: asset.assetName,
                reason: reason,
                type: 'bulk_delete'
              }),
            },
          })
        )
      );

      return deleteResult;
    });

    console.log('✅ Successfully deleted', result.count, 'assets');
    console.log('📊 Response:', { success: true, deleted: result.count });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Successfully deleted ${result.count} ${assetType.toLowerCase()} asset(s)`,
    });
  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete assets', details: String(error) },
      { status: 500 }
    );
  }
}
