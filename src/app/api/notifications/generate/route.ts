import { NextRequest, NextResponse } from 'next/server';
import {
  generateMaintenanceNotifications,
  generateWarrantyExpiryNotifications,
  generateVehicleServiceNotifications,
} from '@/lib/notification-generator';

export async function POST(req: NextRequest) {
  try {
    // Optional: Add a secret header for security
    const authHeader = req.headers.get('x-notification-secret');
    if (authHeader !== process.env.NOTIFICATION_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const maintenanceCount = await generateMaintenanceNotifications();
    const warrantyCount = await generateWarrantyExpiryNotifications();
    const vehicleCount = await generateVehicleServiceNotifications();

    return NextResponse.json({
      success: true,
      message: 'Notifications generated successfully',
      generated: {
        maintenance: maintenanceCount,
        warranty: warrantyCount,
        vehicle: vehicleCount,
        total: maintenanceCount + warrantyCount + vehicleCount,
      },
    });
  } catch (error) {
    console.error('Error in notification generation endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate notifications' },
      { status: 500 }
    );
  }
}
