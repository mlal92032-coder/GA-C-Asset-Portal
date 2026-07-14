import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

/**
 * Auto-create a maintenance task when asset condition changes to REPAIR
 */
export async function autoCreateMaintenanceTask(
  assetId: string,
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE',
  assetName: string,
  oldCondition: string | undefined,
  newCondition: string | undefined,
  userId: string
): Promise<void> {
  try {
    // Only auto-create if condition changed to REPAIR
    if (newCondition !== 'REPAIR' || oldCondition === 'REPAIR') {
      return;
    }

    // Determine priority based on asset type
    const priorityMap: Record<string, string> = {
      FURNITURE: 'Low',
      ELECTRONIC: 'High',
      VEHICLE: 'High',
    };

    const priority = priorityMap[assetType] || 'Medium';

    // Set estimated completion date (3-5 days based on priority)
    const estimatedDays = priority === 'High' ? 3 : 5;
    const estimatedCompletion = addDays(new Date(), estimatedDays);

    // Create maintenance record
    await prisma.maintenance.create({
      data: {
        assetId,
        assetType,
        userId,
        maintenanceDate: new Date(),
        description: `Auto-created maintenance task: ${assetName} requires repair`,
        workType: 'Repair',
        status: 'SCHEDULED',
        nextDueDate: estimatedCompletion,
        remarks: `Priority: ${priority}\nAuto-created when condition changed to REPAIR`,
      },
    });

    // Create notification for maintenance team
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    // Send notification to all admins
    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Maintenance Task Created',
          message: `A maintenance task has been auto-created for ${assetName} (${assetType}). Priority: ${priority}`,
          type: priority === 'High' ? 'WARNING' : 'INFO',
          link: `/assets/${assetType.toLowerCase()}s/${assetId}`,
          metadata: JSON.stringify({
            assetId,
            assetType,
            priority,
            estimatedDays,
          }),
        },
      });
    }
  } catch (error) {
    console.error('Error auto-creating maintenance task:', error);
    // Don't throw - this is a side effect and shouldn't break the main operation
  }
}

/**
 * Check for expired checkouts and send notifications
 */
export async function checkExpiredCheckouts(): Promise<void> {
  try {
    const now = new Date();

    // Find checkouts that were supposed to be returned
    const expiredCheckouts = await prisma.assetCheckout.findMany({
      where: {
        checkInDate: null, // Still checked out
        expectedReturnDate: {
          lt: now, // Return date is in the past
        },
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      take: 100, // Limit to prevent DB overload
    });

    for (const checkout of expiredCheckouts) {
      // Send notification to asset owner
      await prisma.notification.create({
        data: {
          userId: checkout.userId,
          title: 'Asset Checkout Expired',
          message: `Asset (ID: ${checkout.assetId}) checkout expired on ${checkout.expectedReturnDate?.toLocaleDateString()}. Please check in immediately.`,
          type: 'WARNING',
          link: `/assets`,
          metadata: JSON.stringify({
            assetId: checkout.assetId,
            checkoutId: checkout.id,
            daysOverdue: Math.floor((now.getTime() - checkout.expectedReturnDate!.getTime()) / (1000 * 60 * 60 * 24)),
          }),
        },
      });
    }
  } catch (error) {
    console.error('Error checking expired checkouts:', error);
  }
}

/**
 * Check for low stock and send notifications
 */
export async function checkLowStock(): Promise<void> {
  try {
    // This would check spare parts inventory
    // For now, we'll implement a basic version
    // In future, add a 'minimumQuantity' field to SparePart model if needed

    const spareParts = await prisma.sparePart.findMany({
      take: 100,
    });

    // For each spare part, if quantity is below a threshold (e.g., 5)
    // send a notification
    const threshold = 5;

    for (const part of spareParts) {
      if (part.quantity <= threshold) {
        // Send notification to procurement team (admins)
        const adminUsers = await prisma.user.findMany({
          where: {
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
          },
          select: { id: true },
          take: 100,
        });

        for (const admin of adminUsers) {
          // Check if we already sent a notification today
          const existingNotif = await prisma.notification.findFirst({
            where: {
              userId: admin.id,
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
              message: {
                contains: part.partName,
              },
            },
          });

          if (!existingNotif) {
            await prisma.notification.create({
              data: {
                userId: admin.id,
                title: 'Low Stock Alert',
                message: `${part.partName} stock is low (${part.quantity} units). Current threshold: ${threshold} units.`,
                type: 'WARNING',
                link: '/inventory',
                metadata: JSON.stringify({
                  partId: part.id,
                  currentQuantity: part.quantity,
                  threshold,
                  supplierName: part.supplierName,
                }),
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking low stock:', error);
  }
}
