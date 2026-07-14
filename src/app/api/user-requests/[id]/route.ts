import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth-utils';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('users', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const { action, reviewNotes } = await req.json();

    const request = await prisma.userCreationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: 'User request not found' },
        { status: 404 }
      );
    }

    if (action === 'APPROVE') {
      // Create the user
      const newUser = await prisma.user.create({
        data: {
          fullName: request.fullName,
          email: request.email,
          password: await hashPassword('DefaultPassword@123'), // Temporary password
          role: request.role,
          department: request.department,
          designation: request.designation,
          phone: request.phone,
          status: 'ACTIVE',
        },
      });

      // Update request status
      await prisma.userCreationRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedById: authResult.user.id,
          reviewNotes,
        },
      });

      // Create audit log
      await createAuditLog({
        action: 'APPROVE',
        entity: 'USER_CREATION_REQUEST',
        entityId: id,
        details: { userId: newUser.id, email: request.email },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          title: 'User Request Approved',
          message: `Your request to add ${request.fullName} has been approved`,
          type: 'SUCCESS',
          link: `/admin/requests`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        data: newUser,
      });
    } else if (action === 'REJECT') {
      // Update request status
      await prisma.userCreationRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedById: authResult.user.id,
          reviewNotes,
        },
      });

      // Create audit log
      await createAuditLog({
        action: 'REJECT',
        entity: 'USER_CREATION_REQUEST',
        entityId: id,
        details: { email: request.email, reason: reviewNotes },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          title: 'User Request Rejected',
          message: `Your request to add ${request.fullName} has been rejected`,
          type: 'ERROR',
          link: `/admin/user-requests`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User request rejected',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing user request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process user request' },
      { status: 500 }
    );
  }
}
