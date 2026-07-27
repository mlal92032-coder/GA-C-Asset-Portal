import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, requireAdmin } from '@/lib/api-auth';

interface AssetAddRequest {
  id: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  assetData: Record<string, any>;
  requestedById: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedById?: string;
  reviewNotes?: string;
  createdAt: Date;
}

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const requests = await prisma.assetAddRequest.findMany({
      include: {
        requestedBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching asset add requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset add requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const { assetType, assetData } = await req.json();

    if (!assetType || !assetData) {
      return NextResponse.json(
        { success: false, error: 'Asset type and data are required' },
        { status: 400 }
      );
    }

    // Store the request as JSON string
    const addRequest = await prisma.assetAddRequest.create({
      data: {
        assetType,
        assetData: JSON.stringify(assetData),
        requestedById: authResult.user.id,
        status: 'PENDING',
      },
      include: {
        requestedBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: addRequest });
  } catch (error) {
    console.error('Error creating asset add request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create asset add request' },
      { status: 500 }
    );
  }
}
