import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/api-auth';

export async function GET() {
  try {
    const authResult = await requirePermission('users', 'view');
    if (authResult instanceof NextResponse) return authResult;
    const requests = await prisma.userCreationRequest.findMany({
      include: {
        requestedBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission('users', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const { fullName, email, role, department, designation, phone, reason } = await req.json();

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: 'Full name and email are required' },
        { status: 400 }
      );
    }

    // Validate role if provided
    const validRoles = ['SUPER_ADMIN', 'USER', 'VIEW_USER'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if request already pending for this email
    const existingRequest = await prisma.userCreationRequest.findFirst({
      where: { email, status: 'PENDING' },
    });
    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Request already pending for this email' },
        { status: 400 }
      );
    }

    const userRequest = await prisma.userCreationRequest.create({
      data: {
        fullName,
        email,
        role: role || 'VIEW_USER',
        department,
        designation,
        phone,
        reason,
        requestedById: authResult.user.id,
      },
      include: {
        requestedBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: userRequest });
  } catch (error) {
    console.error('Error creating user request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user request' },
      { status: 500 }
    );
  }
}
