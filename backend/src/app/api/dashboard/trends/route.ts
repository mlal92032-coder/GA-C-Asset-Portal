import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getCheckoutTrends, getMaintenanceTrends, type TimeRange } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const timeRange = (request.nextUrl.searchParams.get('timeRange') || '30d') as TimeRange;
    const validRanges = ['7d', '30d', '90d', '1y'];
    if (!validRanges.includes(timeRange)) {
      return NextResponse.json(
        { success: false, error: 'Invalid timeRange parameter' },
        { status: 400 }
      );
    }

    const [checkoutTrends, maintenanceTrends] = await Promise.all([
      getCheckoutTrends(timeRange),
      getMaintenanceTrends(timeRange)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        timeRange,
        checkoutTrends,
        maintenanceTrends
      }
    });
  } catch (error) {
    console.error('Trends API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
