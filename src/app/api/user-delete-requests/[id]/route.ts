import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('users', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const { action, reviewNotes } = await req.json();

    const deleteRequest = await prisma.userDeleteRequest.findUnique({
      where: { id },
    });

    if (!deleteRequest) {
      return NextResponse.json(
        { success: false, error: 'Delete request not found' },
        { status: 404 }
      );
    }

    if (action === 'APPROVE') {
      // Delete the user
      await prisma.user.delete({
        where: { id: deleteRequest.userId },
      });

      // Update request status
      await prisma.userDeleteRequest.update({
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
        entity: 'USER_DELETE_REQUEST',
        entityId: id,
        details: { userId: deleteRequest.userId, email: deleteRequest.userEmail },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: deleteRequest.requestedById,
          title: 'User Delete Request Approved',
          message: `User ${deleteRequest.userName} has been deleted`,
          type: 'SUCCESS',
          link: `/admin/requests`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
      });
    } else if (action === 'REJECT') {
      // Update request status
      await prisma.userDeleteRequest.update({
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
        entity: 'USER_DELETE_REQUEST',
        entityId: id,
        details: { userId: deleteRequest.userId, email: deleteRequest.userEmail },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: deleteRequest.requestedById,
          title: 'User Delete Request Rejected',
          message: `Delete request for ${deleteRequest.userName} has been rejected`,
          type: 'ERROR',
          link: `/admin/requests`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Delete request rejected',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing user delete request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process delete request' },
      { status: 500 }
    );
  }
}
