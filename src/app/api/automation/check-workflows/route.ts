import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkExpiredCheckouts, checkLowStock } from '@/lib/maintenance-automation';

/**
 * Workflow automation check endpoint
 *
 * Runs periodic checks for:
 * - Expired checkouts
 * - Low stock items
 *
 * Can be called via:
 * - GET /api/automation/check-workflows
 * - Scheduled job/cron
 * - Manual trigger
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Optional: Add authentication token check for security
    const token = req.headers.get('x-automation-token');
    const validToken = process.env.AUTOMATION_TOKEN;

    if (validToken && token !== validToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run all automation checks
    const startTime = Date.now();

    await Promise.all([
      checkExpiredCheckouts(),
      checkLowStock(),
    ]);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Workflow automation checks completed',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in workflow automation check:', error);
    return NextResponse.json(
      { success: false, error: 'Workflow check failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual/scheduled triggers
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.headers.get('x-automation-token');
    const validToken = process.env.AUTOMATION_TOKEN;

    if (validToken && token !== validToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    const startTime = Date.now();
    let results: any = {};

    if (!action || action === 'all') {
      await Promise.all([
        checkExpiredCheckouts(),
        checkLowStock(),
      ]);
      results.checkExpiredCheckouts = 'completed';
      results.checkLowStock = 'completed';
    } else if (action === 'checkouts') {
      await checkExpiredCheckouts();
      results.checkExpiredCheckouts = 'completed';
    } else if (action === 'inventory') {
      await checkLowStock();
      results.checkLowStock = 'completed';
    } else {
      return NextResponse.json(
        { success: false, error: 'Unknown action' },
        { status: 400 }
      );
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Workflow automation checks completed',
      action,
      results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in workflow automation check:', error);
    return NextResponse.json(
      { success: false, error: 'Workflow check failed', details: String(error) },
      { status: 500 }
    );
  }
}
