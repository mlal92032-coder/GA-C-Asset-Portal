import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
    }

    // Try to find asset in all three tables
    let asset: {
      id: string;
      assetTag: string | null;
      assetName: string;
      qrPassword: string | null;
      condition: string;
      status: string;
      purchaseDate?: Date | null;
      purchasePrice?: number | null;
      company?: { companyName: string } | null;
      manufacturer?: { manufacturerName: string } | null;
      location?: { locationName: string } | null;
      assignedUser?: { fullName: string } | null;
    } | null = null;
    let assetType = '';

    // Check furniture
    asset = await prisma.furnitureAsset.findUnique({
      where: { id: assetId },
      include: {
        company: true,
        manufacturer: true,
        location: true,
        assignedUser: true,
      },
    });
    if (asset) {
      assetType = 'Furniture';
    }

    // Check electronics
    if (!asset) {
      asset = await prisma.electronicAsset.findUnique({
        where: { id: assetId },
        include: {
          company: true,
          manufacturer: true,
          location: true,
          assignedUser: true,
        },
      });
      if (asset) assetType = 'Electronic';
    }

    // Check vehicles
    if (!asset) {
      asset = await prisma.vehicleAsset.findUnique({
        where: { id: assetId },
        include: {
          company: true,
          manufacturer: true,
          location: true,
          assignedUser: true,
        },
      });
      if (asset) assetType = 'Vehicle';
    }

    if (!asset) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    // Verify password
    if (asset.qrPassword && asset.qrPassword !== password) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }

    // Return full asset details
    return NextResponse.json({
      success: true,
      data: {
        id: asset.id,
        assetTag: asset.assetTag,
        assetName: asset.assetName,
        type: assetType,
        company: asset.company?.companyName || null,
        location: asset.location?.locationName || null,
        assignedTo: asset.assignedUser?.fullName || null,
        condition: asset.condition,
        status: asset.status,
        purchaseDate: asset.purchaseDate?.toISOString() || null,
        purchasePrice: asset.purchasePrice || null,
        manufacturer: asset.manufacturer?.manufacturerName || null,
      },
    });
  } catch (error) {
    console.error('QR verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
