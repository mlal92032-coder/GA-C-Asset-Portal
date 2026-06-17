import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetType = searchParams.get('assetType');

    if (!assetType) {
      return NextResponse.json(
        { success: false, error: 'assetType is required' },
        { status: 400 }
      );
    }

    let assets: Array<Record<string, string | number>> = [];

    switch (assetType) {
      case 'FURNITURE':
        const furniture = await prisma.furnitureAsset.findMany({
          include: {
            company: { select: { companyName: true } },
            manufacturer: { select: { manufacturerName: true } },
            location: { select: { locationName: true } },
          },
        });
        assets = furniture.map((f) => ({
          assetName: f.assetName,
          assetTag: f.assetTag || '',
          furnitureType: f.furnitureType || '',
          material: f.material || '',
          purchaseDate: f.purchaseDate ? f.purchaseDate.toISOString().split('T')[0] : '',
          purchasePrice: f.purchasePrice || '',
          condition: f.condition,
          status: f.status,
          company: f.company?.companyName || '',
          manufacturer: f.manufacturer?.manufacturerName || '',
          location: f.location?.locationName || '',
          usefulLifeYears: f.usefulLifeYears || '',
          salvageValue: f.salvageValue || '',
          remarks: f.remarks || '',
        }));
        break;

      case 'ELECTRONIC':
        const electronics = await prisma.electronicAsset.findMany({
          include: {
            company: { select: { companyName: true } },
            manufacturer: { select: { manufacturerName: true } },
            location: { select: { locationName: true } },
          },
        });
        assets = electronics.map((e) => ({
          assetName: e.assetName,
          assetTag: e.assetTag || '',
          deviceType: e.deviceType || '',
          brand: e.brand || '',
          model: e.model || '',
          serialNumber: e.serialNumber || '',
          purchaseDate: e.purchaseDate ? e.purchaseDate.toISOString().split('T')[0] : '',
          warrantyEndDate: e.warrantyEndDate ? e.warrantyEndDate.toISOString().split('T')[0] : '',
          condition: e.condition,
          status: e.status,
          company: e.company?.companyName || '',
          manufacturer: e.manufacturer?.manufacturerName || '',
          location: e.location?.locationName || '',
          usefulLifeYears: e.usefulLifeYears || '',
          salvageValue: e.salvageValue || '',
          remarks: e.remarks || '',
        }));
        break;

      case 'VEHICLE':
        const vehicles = await prisma.vehicleAsset.findMany({
          include: {
            company: { select: { companyName: true } },
            manufacturer: { select: { manufacturerName: true } },
            location: { select: { locationName: true } },
          },
        });
        assets = vehicles.map((v) => ({
          assetName: v.assetName,
          assetTag: v.assetTag || '',
          vehicleType: v.vehicleType || '',
          brand: v.brand || '',
          model: v.model || '',
          registrationNumber: v.registrationNumber,
          engineNumber: v.engineNumber || '',
          fuelType: v.fuelType || '',
          purchaseDate: v.purchaseDate ? v.purchaseDate.toISOString().split('T')[0] : '',
          company: v.company?.companyName || '',
          manufacturer: v.manufacturer?.manufacturerName || '',
          location: v.location?.locationName || '',
          condition: v.condition,
          status: v.status,
          usefulLifeYears: v.usefulLifeYears || '',
          salvageValue: v.salvageValue || '',
          remarks: v.remarks || '',
        }));
        break;
    }

    // Convert to CSV
    if (assets.length === 0) {
      return NextResponse.json({ success: true, data: { csv: '', count: 0 } });
    }

    const headers = Object.keys(assets[0]);
    const csvRows = [
      headers.join(','),
      ...assets.map((asset) =>
        headers.map((header) => {
          const value = asset[header];
          // Escape commas and quotes in CSV
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      ),
    ];

    const csv = csvRows.join('\n');

    return NextResponse.json({ success: true, data: { csv, count: assets.length } });
  } catch (error) {
    console.error('Error exporting assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export assets' },
      { status: 500 }
    );
  }
}
