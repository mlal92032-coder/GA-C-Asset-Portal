import { NextRequest, NextResponse } from 'next/server';

const SETTINGS_KEY = 'system_settings';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        siteName: 'Asset Management System',
        tagPrefix: 'AST',
        itemsPerPage: 20,
        companyName: 'My Organization',
        supportEmail: '',
        supportPhone: '',
        currency: 'PKR',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Karachi',
        defaultDepreciationMethod: 'STRAIGHT_LINE',
        defaultUsefulLife: 5,
        autoGenerateAssetTag: true,
        enableEmailNotifications: false,
        warrantyAlertDays: 30,
        maintenanceAlertDays: 7,
        overdueCheckoutDays: 14,
        sessionTimeout: 480,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        defaultTheme: 'light',
        barcodeType: 'CODE128',
        barcodeWidth: 2,
        barcodeHeight: 50,
        showBarcodeLabel: true,
        maxFileSize: 10,
        allowedFileTypes: 'image/jpeg,image/png,image/webp',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    // In production, save to database or config file
    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      data: body,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
