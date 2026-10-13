import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { runNotificationChecks } from '@/lib/notifications';

// This endpoint can be called by a cron job or admin to generate notifications
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const currentUser = authResult.user;

    // Only admins can trigger notification checks
    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const result = await runNotificationChecks();

    return NextResponse.json({
      success: true,
      message: `Notification check completed. Generated ${result.total} notifications.`,
      data: result,
    });
  } catch (error) {
    console.error('Error running notification checks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run notification checks' },
      { status: 500 }
    );
  }
}
