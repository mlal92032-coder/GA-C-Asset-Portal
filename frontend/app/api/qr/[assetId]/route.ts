import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    // Try furniture
    const furn = await prisma.furnitureAsset.findUnique({
      where: { id: assetId },
      include: { company: true, manufacturer: true, location: true, assignedUser: true },
    });
    if (furn) {
      return NextResponse.json({ success: true, data: {
        id: furn.id, assetTag: furn.assetTag, assetName: furn.assetName, type: 'Furniture',
        furnitureType: furn.furnitureType, material: furn.material,
        condition: furn.condition, status: furn.status,
        purchaseDate: furn.purchaseDate, purchasePrice: furn.purchasePrice,
        company: furn.company?.companyName, location: furn.location?.locationName,
        assignedTo: furn.assignedUser?.fullName, manufacturer: furn.manufacturer?.manufacturerName,
        serialNumber: furn.serialNumber,
      }});
    }

    // Try electronics
    const elec = await prisma.electronicAsset.findUnique({
      where: { id: assetId },
      include: { company: true, manufacturer: true, location: true, assignedUser: true },
    });
    if (elec) {
      return NextResponse.json({ success: true, data: {
        id: elec.id, assetTag: elec.assetTag, assetName: elec.assetName, type: 'Electronic',
        deviceType: elec.deviceType, brand: elec.brand, model: elec.model,
        condition: elec.condition, status: elec.status,
        purchaseDate: elec.purchaseDate,
        company: elec.company?.companyName, location: elec.location?.locationName,
        assignedTo: elec.assignedUser?.fullName, manufacturer: elec.manufacturer?.manufacturerName,
        serialNumber: elec.serialNumber,
      }});
    }

    // Try vehicles
    const veh = await prisma.vehicleAsset.findUnique({
      where: { id: assetId },
      include: { company: true, manufacturer: true, location: true, assignedUser: true },
    });
    if (veh) {
      return NextResponse.json({ success: true, data: {
        id: veh.id, assetTag: veh.assetTag, assetName: veh.assetName, type: 'Vehicle',
        vehicleType: veh.vehicleType, brand: veh.brand, model: veh.model,
        registrationNumber: veh.registrationNumber, engineNumber: veh.engineNumber,
        condition: veh.condition, status: veh.status,
        purchaseDate: veh.purchaseDate,
        company: veh.company?.companyName, location: veh.location?.locationName,
        assignedTo: veh.assignedUser?.fullName, manufacturer: veh.manufacturer?.manufacturerName,
        serialNumber: veh.serialNumber,
      }});
    }

    return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
  } catch (error) {
    console.error('QR fetch error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}