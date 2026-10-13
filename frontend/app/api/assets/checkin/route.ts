import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth, createAuditLog } from '@/lib/api-auth';

const checkinSchema = z.object({
  checkoutId: z.string(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const currentUser = authResult.user;

    const body = await req.json();
    const validatedData = checkinSchema.parse(body);

    // Get checkout record
    const checkout = await prisma.assetCheckout.findUnique({
      where: { id: validatedData.checkoutId },
    });

    if (!checkout) {
      return NextResponse.json(
        { success: false, error: 'Checkout record not found' },
        { status: 404 }
      );
    }

    if (checkout.checkInDate) {
      return NextResponse.json(
        { success: false, error: 'Asset is already checked in' },
        { status: 400 }
      );
    }

    // Update checkout record
    await prisma.assetCheckout.update({
      where: { id: validatedData.checkoutId },
      data: {
        checkInDate: new Date(),
        checkedInBy: currentUser.id,
        checkinNotes: validatedData.notes,
      },
    });

    // Update asset status to IN_STORE
    if (checkout.assetType === 'FURNITURE') {
      await prisma.furnitureAsset.update({
        where: { id: checkout.assetId },
        data: { status: 'IN_STORE', assignedUserId: null },
      });
    } else if (checkout.assetType === 'ELECTRONIC') {
      await prisma.electronicAsset.update({
        where: { id: checkout.assetId },
        data: { status: 'IN_STORE', assignedUserId: null },
      });
    } else {
      await prisma.vehicleAsset.update({
        where: { id: checkout.assetId },
        data: { status: 'IN_STORE', assignedUserId: null },
      });
    }

    await createAuditLog({
      action: 'UPDATE',
      entity: `${checkout.assetType}_CHECKIN`,
      entityId: checkout.assetId,
      details: { action: 'CHECKIN', checkoutId: validatedData.checkoutId },
    });

    return NextResponse.json({ success: true, message: 'Asset checked in successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error checking in asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check in asset' },
      { status: 500 }
    );
  }
}
