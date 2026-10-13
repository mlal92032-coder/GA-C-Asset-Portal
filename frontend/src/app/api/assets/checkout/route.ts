import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth, createAuditLog } from '@/lib/api-auth';

const checkoutSchema = z.object({
  assetId: z.string(),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']),
  userId: z.string(),
  expectedReturnDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const currentUser = authResult.user;

    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    // Use transaction to prevent race conditions
    const checkout = await prisma.$transaction(async (tx) => {
      // Check if asset is already checked out
      const existingCheckout = await tx.assetCheckout.findFirst({
        where: {
          assetId: validatedData.assetId,
          assetType: validatedData.assetType,
          checkInDate: null,
        },
      });

      if (existingCheckout) {
        throw new Error('Asset is already checked out');
      }

      // Create checkout record
      const newCheckout = await tx.assetCheckout.create({
        data: {
          assetId: validatedData.assetId,
          assetType: validatedData.assetType,
          userId: validatedData.userId,
          checkedOutBy: currentUser.id,
          expectedReturnDate: validatedData.expectedReturnDate ? new Date(validatedData.expectedReturnDate) : null,
          checkoutNotes: validatedData.notes,
        },
      });

      // Update asset status to IN_USE
      if (validatedData.assetType === 'FURNITURE') {
        await tx.furnitureAsset.update({
          where: { id: validatedData.assetId },
          data: { status: 'IN_USE', assignedUserId: validatedData.userId },
        });
      } else if (validatedData.assetType === 'ELECTRONIC') {
        await tx.electronicAsset.update({
          where: { id: validatedData.assetId },
          data: { status: 'IN_USE', assignedUserId: validatedData.userId },
        });
      } else if (validatedData.assetType === 'VEHICLE') {
        await tx.vehicleAsset.update({
          where: { id: validatedData.assetId },
          data: { status: 'IN_USE', assignedUserId: validatedData.userId },
        });
      }

      return newCheckout;
    });

    await createAuditLog({
      action: 'UPDATE',
      entity: `${validatedData.assetType}_CHECKOUT`,
      entityId: validatedData.assetId,
      details: { action: 'CHECKOUT', userId: validatedData.userId, checkoutId: checkout.id },
    });

    return NextResponse.json({ success: true, data: checkout, message: 'Asset checked out successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'Asset is already checked out') {
      return NextResponse.json(
        { success: false, error: 'Asset is already checked out' },
        { status: 400 }
      );
    }
    console.error('Error checking out asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check out asset' },
      { status: 500 }
    );
  }
}
