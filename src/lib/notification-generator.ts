import { prisma } from '@/lib/prisma';

export async function generateMaintenanceNotifications() {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find maintenance records with upcoming due dates (next 7 days)
    const upcomingMaintenance = await prisma.maintenance.findMany({
      where: {
        nextDueDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
        status: { not: 'COMPLETED' },
      },
      include: {
        user: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Create notifications for each upcoming maintenance
    for (const maintenance of upcomingMaintenance) {
      if (maintenance.user?.id) {
        await prisma.notification.create({
          data: {
            tenantId: maintenance.tenantId || 'default',
            userId: maintenance.user.id,
            title: 'Maintenance Due',
            message: `Maintenance for asset ${maintenance.assetId} is due on ${maintenance.nextDueDate?.toLocaleDateString()}. ${maintenance.description}`,
            type: 'WARNING',
          },
        });
      }
    }

    return upcomingMaintenance.length;
  } catch (error) {
    console.error('Error generating maintenance notifications:', error);
    return 0;
  }
}

export async function generateWarrantyExpiryNotifications() {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find electronics with warranty expiring soon
    const expiringWarranty = await prisma.electronicAsset.findMany({
      where: {
        warrantyEndDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
        assignedUserId: { not: null },
      },
      select: {
        id: true,
        assetName: true,
        warrantyEndDate: true,
        assignedUserId: true,
        tenantId: true,
      },
    });

    // Create notifications for each expiring warranty
    for (const asset of expiringWarranty) {
      if (asset.assignedUserId) {
        await prisma.notification.create({
          data: {
            tenantId: asset.tenantId,
            userId: asset.assignedUserId,
            title: 'Warranty Expiring Soon',
            message: `Warranty for "${asset.assetName}" expires on ${asset.warrantyEndDate?.toLocaleDateString()}`,
            type: 'WARNING',
          },
        });
      }
    }

    return expiringWarranty.length;
  } catch (error) {
    console.error('Error generating warranty notifications:', error);
    return 0;
  }
}

export async function generateVehicleServiceNotifications() {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find vehicles with insurance/service expiring soon
    const expiringServices = await prisma.vehicleAsset.findMany({
      where: {
        insuranceExpiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
        assignedUserId: { not: null },
      },
      select: {
        id: true,
        assetName: true,
        insuranceExpiryDate: true,
        assignedUserId: true,
        tenantId: true,
      },
    });

    // Create notifications for each expiring service
    for (const vehicle of expiringServices) {
      if (vehicle.assignedUserId) {
        await prisma.notification.create({
          data: {
            tenantId: vehicle.tenantId,
            userId: vehicle.assignedUserId,
            title: 'Insurance Expiring Soon',
            message: `Insurance for "${vehicle.assetName}" expires on ${vehicle.insuranceExpiryDate?.toLocaleDateString()}`,
            type: 'WARNING',
          },
        });
      }
    }

    return expiringServices.length;
  } catch (error) {
    console.error('Error generating vehicle service notifications:', error);
    return 0;
  }
}
