import { prisma } from './prisma';
import { addDays, isBefore, isAfter } from 'date-fns';
import { sendNotificationEmail } from './email';

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'INFO',
  link,
  metadata,
}: {
  userId: string;
  title: string;
  message: string;
  type?: 'WARNING' | 'INFO' | 'SUCCESS' | 'ERROR';
  link?: string;
  metadata?: Record<string, any>;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  // Send email notification
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (user?.email) {
      await sendNotificationEmail({
        to: user.email,
        title,
        message,
        type,
        link,
      });
    }
  } catch (error) {
    // Log but don't fail the notification creation if email fails
    console.error('Failed to send email notification:', error);
  }

  return notification;
}

/**
 * Check for expiring warranties and create notifications
 * Run this daily or on-demand
 */
export async function checkExpiringWarranties() {
  const now = new Date();
  const thirtyDaysFromNow = addDays(now, 30);
  const sevenDaysFromNow = addDays(now, 7);

  // Find electronic assets with warranties expiring soon
  const expiringElectronics = await prisma.electronicAsset.findMany({
    where: {
      warrantyEndDate: {
        gte: now,
        lte: thirtyDaysFromNow,
      },
      status: {
        not: 'DISPOSED',
      },
    },
    include: {
      assignedUser: true,
    },
  });

  for (const electronic of expiringElectronics) {
    const daysUntilExpiry = Math.ceil(
      (electronic.warrantyEndDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let notificationType: 'WARNING' | 'INFO' = 'INFO';
    let title = 'Warranty Expiring Soon';
    
    if (daysUntilExpiry <= 7) {
      notificationType = 'WARNING';
      title = 'Warranty Expiring This Week!';
    }

    // Notify assigned user or all admins if not assigned
    if (electronic.assignedUserId) {
      await createNotification({
        userId: electronic.assignedUserId,
        title,
        message: `The warranty for "${electronic.assetName}" (${electronic.assetTag}) will expire in ${daysUntilExpiry} days.`,
        type: notificationType,
        link: `/assets/electronics/${electronic.id}`,
        metadata: { assetType: 'ELECTRONIC', daysUntilExpiry },
      });
    } else {
      // Notify all admins
      const admins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
      });

      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          title,
          message: `The warranty for "${electronic.assetName}" (${electronic.assetTag}) will expire in ${daysUntilExpiry} days.`,
          type: notificationType,
          link: `/assets/electronics/${electronic.id}`,
          metadata: { assetType: 'ELECTRONIC', daysUntilExpiry },
        });
      }
    }
  }

  return expiringElectronics.length;
}

/**
 * Check for expiring vehicle insurance
 */
export async function checkExpiringInsurance() {
  const now = new Date();
  const thirtyDaysFromNow = addDays(now, 30);

  const expiringInsurance = await prisma.vehicleAsset.findMany({
    where: {
      insuranceExpiryDate: {
        gte: now,
        lte: thirtyDaysFromNow,
      },
      status: {
        not: 'DISPOSED',
      },
    },
    include: {
      assignedUser: true,
    },
  });

  for (const vehicle of expiringInsurance) {
    const daysUntilExpiry = Math.ceil(
      (vehicle.insuranceExpiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const title = daysUntilExpiry <= 7 
      ? 'Vehicle Insurance Expiring This Week!' 
      : 'Vehicle Insurance Expiring Soon';

    if (vehicle.assignedUserId) {
      await createNotification({
        userId: vehicle.assignedUserId,
        title,
        message: `The insurance for "${vehicle.assetName}" (${vehicle.registrationNumber}) will expire in ${daysUntilExpiry} days.`,
        type: 'WARNING',
        link: `/assets/vehicles/${vehicle.id}`,
        metadata: { assetType: 'VEHICLE', daysUntilExpiry },
      });
    } else {
      const admins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
      });

      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          title,
          message: `The insurance for "${vehicle.assetName}" (${vehicle.registrationNumber}) will expire in ${daysUntilExpiry} days.`,
          type: 'WARNING',
          link: `/assets/vehicles/${vehicle.id}`,
          metadata: { assetType: 'VEHICLE', daysUntilExpiry },
        });
      }
    }
  }

  return expiringInsurance.length;
}

/**
 * Check for overdue expected returns
 */
export async function checkOverdueReturns() {
  const now = new Date();

  const overdueReturns = await prisma.assetCheckout.findMany({
    where: {
      expectedReturnDate: {
        lt: now,
      },
      checkInDate: null,
    },
    include: {
      user: true,
    },
  });

  for (const checkout of overdueReturns) {
    const daysOverdue = Math.ceil(
      (now.getTime() - checkout.expectedReturnDate!.getTime()) / (1000 * 60 * 60 * 24)
    );

    await createNotification({
      userId: checkout.userId,
      title: 'Asset Return Overdue',
      message: `You have an asset that was expected to be returned ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago. Please return it as soon as possible.`,
      type: 'ERROR',
      link: `/assets/${checkout.assetType.toLowerCase()}s/${checkout.assetId}`,
      metadata: { checkoutId: checkout.id, daysOverdue },
    });
  }

  return overdueReturns.length;
}

/**
 * Run all notification checks
 * Call this from a cron job or on-demand
 */
export async function runNotificationChecks() {
  const electronics = await checkExpiringWarranties();
  const vehicles = await checkExpiringInsurance();
  const returns = await checkOverdueReturns();

  return {
    electronics,
    vehicles,
    returns,
    total: electronics + vehicles + returns,
  };
}
