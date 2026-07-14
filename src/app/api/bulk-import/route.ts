import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { assetType, assets } = body;

    if (!assetType || !assets || !Array.isArray(assets)) {
      return NextResponse.json(
        { success: false, error: 'assetType and assets array are required' },
        { status: 400 }
      );
    }

    const createdAssets: any[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      try {
        let createdAsset;

        switch (assetType) {
          case 'FURNITURE':
            createdAsset = await prisma.furnitureAsset.create({
              data: {
                assetName: asset.assetName,
                assetTag: asset.assetTag || null,
                furnitureType: asset.furnitureType || null,
                material: asset.material || null,
                purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
                purchasePrice: asset.purchasePrice ? parseFloat(asset.purchasePrice) : null,
                condition: asset.condition || 'GOOD',
                status: asset.status || 'IN_STORE',
                companyId: asset.companyId || null,
                manufacturerId: asset.manufacturerId || null,
                locationId: asset.locationId || null,
                usefulLifeYears: asset.usefulLifeYears ? parseInt(asset.usefulLifeYears) : null,
                salvageValue: asset.salvageValue ? parseFloat(asset.salvageValue) : null,
                remarks: asset.remarks || null,
              },
            });
            break;

          case 'ELECTRONIC':
            createdAsset = await prisma.electronicAsset.create({
              data: {
                assetName: asset.assetName,
                assetTag: asset.assetTag || null,
                deviceType: asset.deviceType || null,
                brand: asset.brand || null,
                model: asset.model || null,
                serialNumber: asset.serialNumber || null,
                purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
                warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate) : null,
                condition: asset.condition || 'GOOD',
                status: asset.status || 'IN_STORE',
                companyId: asset.companyId || null,
                manufacturerId: asset.manufacturerId || null,
                locationId: asset.locationId || null,
                usefulLifeYears: asset.usefulLifeYears ? parseInt(asset.usefulLifeYears) : null,
                salvageValue: asset.salvageValue ? parseFloat(asset.salvageValue) : null,
                remarks: asset.remarks || null,
              },
            });
            break;

          case 'VEHICLE':
            createdAsset = await prisma.vehicleAsset.create({
              data: {
                assetName: asset.assetName,
                assetTag: asset.assetTag || null,
                vehicleType: asset.vehicleType || null,
                brand: asset.brand || null,
                model: asset.model || null,
                registrationNumber: asset.registrationNumber,
                engineNumber: asset.engineNumber || null,
                fuelType: asset.fuelType || null,
                purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : null,
                companyId: asset.companyId || null,
                manufacturerId: asset.manufacturerId || null,
                locationId: asset.locationId || null,
                condition: asset.condition || 'GOOD',
                status: asset.status || 'IN_STORE',
                usefulLifeYears: asset.usefulLifeYears ? parseInt(asset.usefulLifeYears) : null,
                salvageValue: asset.salvageValue ? parseFloat(asset.salvageValue) : null,
                remarks: asset.remarks || null,
              },
            });
            break;

          default:
            errors.push({ row: i + 1, error: `Unknown asset type: ${assetType}` });
            continue;
        }

        if (createdAsset) {
          createdAssets.push(createdAsset);
        }
      } catch (error) {
        errors.push({ row: i + 1, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        created: createdAssets.length,
        failed: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error('Error importing assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import assets' },
      { status: 500 }
    );
  }
}
