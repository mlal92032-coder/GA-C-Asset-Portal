import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/api-auth';

export async function GET() {
  try {
    const authResult = await requirePermission('users', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const requests = await prisma.userDeleteRequest.findMany({
      include: {
        requestedBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching user delete requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user delete requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, userName, userEmail, reason } = await req.json();

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if delete request already pending for this user
    const existingRequest = await prisma.userDeleteRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Delete request already pending for this user' },
        { status: 400 }
      );
    }

    const deleteRequest = await prisma.userDeleteRequest.create({
      data: {
        userId,
        userName,
        userEmail,
        reason,
        requestedById: authResult.user.id,
      },
      include: {
        requestedBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: deleteRequest });
  } catch (error) {
    console.error('Error creating user delete request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create delete request' },
      { status: 500 }
    );
  }
}
