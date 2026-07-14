/**
 * Notification Preferences API Routes
 * GET: Retrieve user's notification preferences
 * PATCH: Update user's notification preferences
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

/**
 * Zod validation schema for notification preferences
 */
const notificationPreferenceSchema = z.object({
  emailNotificationsEnabled: z.boolean().optional(),
  emailAddress: z.string().email().optional(),
  emailFrequency: z.enum(['REALTIME', 'DAILY', 'WEEKLY']).optional(),
  inAppNotificationsEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  soundVolume: z.number().min(0).max(100).optional(),
  desktopNotificationsEnabled: z.boolean().optional(),
  maintenanceAlertDays: z.number().min(1).max(365).optional(),
  warrantyAlertDays: z.number().min(1).max(365).optional(),
  stockLevelAlertThreshold: z.number().min(1).optional(),
  budgetVarianceAlertPercent: z.number().min(1).max(100).optional(),
  overdueCheckoutAlertDays: z.number().min(1).max(365).optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  retentionDays: z.number().min(1).max(365).optional(),
  autoDeleteNotifications: z.boolean().optional(),
  alertTypes: z.record(z.boolean()).optional(),
});

type NotificationPreferenceUpdate = z.infer<typeof notificationPreferenceSchema>;

/**
 * GET /api/notifications/preferences
 * Retrieve user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      const newPreferences = await prisma.notificationPreference.create({
        data: {
          userId: session.user.id,
          emailNotificationsEnabled: true,
          emailAddress: session.user.email,
          emailFrequency: 'REALTIME',
          inAppNotificationsEnabled: true,
          soundEnabled: true,
          soundVolume: 50,
          desktopNotificationsEnabled: true,
        },
      });

      logger.info('Created default notification preferences', {
        userId: session.user.id,
      });

      return NextResponse.json(
        {
          success: true,
          data: newPreferences,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: preferences,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to fetch notification preferences', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = notificationPreferenceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.errors,
        },
        { status: 400 }
      );
    }

    const updateData: NotificationPreferenceUpdate = result.data;

    // Ensure user has preferences record
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: session.user.id,
          ...updateData,
        },
      });
    } else {
      preferences = await prisma.notificationPreference.update({
        where: { userId: session.user.id },
        data: updateData,
      });
    }

    // Log to audit trail
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        module: 'NOTIFICATIONS',
        changes: JSON.stringify(updateData),
        timestamp: new Date(),
      },
    });

    logger.info('Notification preferences updated', {
      userId: session.user.id,
      fields: Object.keys(updateData),
    });

    return NextResponse.json(
      {
        success: true,
        data: preferences,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to update notification preferences', error);
    return NextResponse.json(
      {
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
