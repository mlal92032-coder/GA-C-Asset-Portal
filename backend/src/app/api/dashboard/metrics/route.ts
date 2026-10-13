import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import {
  getAssetDistribution,
  getConditionDistribution,
  getLocationDistribution,
  getUtilizationRate,
  type TimeRange
} from '@/lib/analytics';

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

    const [assetDistribution, conditionDistribution, locationDistribution, utilizationRate] = await Promise.all([
      getAssetDistribution(timeRange),
      getConditionDistribution(timeRange),
      getLocationDistribution(timeRange),
      getUtilizationRate(timeRange)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        timeRange,
        assetDistribution,
        conditionDistribution,
        locationDistribution,
        utilizationRate
      }
    });
  } catch (error) {
    console.error('Metrics API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
