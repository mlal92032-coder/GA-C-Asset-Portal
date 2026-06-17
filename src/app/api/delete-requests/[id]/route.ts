import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, createAuditLog } from '@/lib/api-auth';
import { z } from 'zod';

const deleteRequestPutSchema = z.object({
  requestId: z.string(),
  action: z.enum(['APPROVE', 'REJECT']),
  reviewedById: z.string().optional(),
  reviewNotes: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;
    const currentUser = authResult.user;

    const body = await request.json();

    let validatedData: z.infer<typeof deleteRequestPutSchema>;
    try {
      validatedData = deleteRequestPutSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    const deleteRequest = await prisma.deleteRequest.findUnique({
      where: { id: validatedData.requestId },
    });

    if (!deleteRequest) {
      return NextResponse.json(
        { success: false, error: 'Delete request not found' },
        { status: 404 }
      );
    }

    // Update the request status
    const updated = await prisma.deleteRequest.update({
      where: { id: validatedData.requestId },
      data: {
        status: validatedData.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedById: currentUser.id,
        reviewNotes: validatedData.reviewNotes || null,
      },
    });

    // If approved, delete the actual asset
    if (validatedData.action === 'APPROVE') {
      switch (deleteRequest.assetType) {
        case 'FURNITURE':
          await prisma.furnitureAsset.delete({
            where: { id: deleteRequest.assetId },
          });
          break;
        case 'ELECTRONIC':
          await prisma.electronicAsset.delete({
            where: { id: deleteRequest.assetId },
          });
          break;
        case 'VEHICLE':
          await prisma.vehicleAsset.delete({
            where: { id: deleteRequest.assetId },
          });
          break;
      }

      // Create audit log for asset deletion
      await createAuditLog({
        action: 'DELETE',
        entity: deleteRequest.assetType,
        entityId: deleteRequest.assetId,
        details: {
          reason: 'Delete request approved',
          requestId: validatedData.requestId,
          assetName: deleteRequest.assetName,
        },
      });

      // Notify the user who requested
      await prisma.notification.create({
        data: {
          userId: deleteRequest.requestedById,
          title: 'Delete Request Approved',
          message: `Your deletion request for "${deleteRequest.assetName}" has been approved and the asset has been deleted.`,
          type: 'SUCCESS',
        },
      });
    } else {
      // Notify the user who requested
      await prisma.notification.create({
        data: {
          userId: deleteRequest.requestedById,
          title: 'Delete Request Rejected',
          message: `Your deletion request for "${deleteRequest.assetName}" has been rejected. ${validatedData.reviewNotes || ''}`,
          type: 'ERROR',
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error processing delete request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process delete request' },
      { status: 500 }
    );
  }
}
