import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const requests = await prisma.deleteRequest.findMany({
      include: {
        requestedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching delete requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delete requests' },
      { status: 500 }
    );
  }
}

const deleteRequestSchema = z.object({
  assetId: z.string(),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']),
  assetName: z.string().min(1),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;
    const currentUser = authResult.user;

    const body = await request.json();

    let validatedData: z.infer<typeof deleteRequestSchema>;
    try {
      validatedData = deleteRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: error.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    const deleteRequest = await prisma.deleteRequest.create({
      data: {
        assetId: validatedData.assetId,
        assetType: validatedData.assetType,
        assetName: validatedData.assetName,
        requestedById: currentUser.id,
        reason: validatedData.reason || null,
        status: 'PENDING',
      },
      include: {
        requestedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create notification for Super Admin
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (superAdmin) {
      await prisma.notification.create({
        data: {
          userId: superAdmin.id,
          title: 'Delete Request Pending',
          message: `${currentUser.fullName} requested deletion of ${validatedData.assetName}`,
          type: 'WARNING',
          link: `/admin/requests`,
          tenantId: superAdmin.tenantId,
        },
      });
    }

    return NextResponse.json({ success: true, data: deleteRequest });
  } catch (error) {
    console.error('Error creating delete request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create delete request' },
      { status: 500 }
    );
  }
}
