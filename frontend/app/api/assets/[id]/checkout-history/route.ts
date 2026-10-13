import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    const checkoutHistory = await prisma.assetCheckout.findMany({
      where: { assetId: id },
      orderBy: { checkedOutAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: checkoutHistory });
  } catch (error) {
    console.error('Error fetching checkout history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch checkout history' },
      { status: 500 }
    );
  }
}
