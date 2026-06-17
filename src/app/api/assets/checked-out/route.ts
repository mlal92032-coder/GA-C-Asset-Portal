import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const where: { checkInDate: null; userId?: string } = { checkInDate: null };
    if (userId) {
      where.userId = userId;
    }

    const checkedOutAssets = await prisma.assetCheckout.findMany({
      where,
      orderBy: { checkedOutAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: checkedOutAssets });
  } catch (error) {
    console.error('Error fetching checked-out assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch checked-out assets' },
      { status: 500 }
    );
  }
}
