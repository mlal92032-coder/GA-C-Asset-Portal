import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  department: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(['SUPER_ADMIN', 'USER', 'VIEW_USER']).optional(),
  permissions: z.union([z.record(z.string(), z.array(z.string())), z.string(), z.null()]).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

function normalizePermissions(
  permissions: Record<string, string[]> | string | null | undefined
): string | null {
  if (!permissions) return null;
  if (typeof permissions === 'string') {
    try {
      JSON.parse(permissions);
      return permissions;
    } catch {
      return null;
    }
  }
  if (typeof permissions === 'object') {
    const cleaned: Record<string, string[]> = {};
    for (const [mod, actions] of Object.entries(permissions)) {
      if (Array.isArray(actions) && actions.length > 0) {
        cleaned[mod] = [...new Set(actions)];
      }
    }
    return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : null;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('users', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        designation: true,
        phone: true,
        role: true,
        permissions: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        assignedFurniture: { select: { id: true, assetName: true } },
        assignedElectronic: { select: { id: true, assetName: true } },
        assignedVehicle: { select: { id: true, assetName: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('users', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();

    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If email is being changed, check uniqueness
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { tenantId_email: { tenantId: existingUser.tenantId, email: validatedData.email } },
      });
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (validatedData.fullName !== undefined) updateData.fullName = validatedData.fullName;
    if (validatedData.email !== undefined) updateData.email = validatedData.email;
    if (validatedData.department !== undefined) updateData.department = validatedData.department ?? null;
    if (validatedData.designation !== undefined) updateData.designation = validatedData.designation ?? null;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone ?? null;
    if (validatedData.role !== undefined) updateData.role = validatedData.role;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    // Hash password if provided
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12);
    }

    // Handle permissions — normalize to JSON string
    if (validatedData.permissions !== undefined) {
      updateData.permissions = normalizePermissions(validatedData.permissions);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        designation: true,
        phone: true,
        role: true,
        permissions: true,
        status: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      action: 'UPDATE',
      entity: 'USER',
      entityId: user.id,
      details: { updatedFields: Object.keys(validatedData).filter((k) => k !== 'password') },
    });

    return NextResponse.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: `Validation error: ${error.issues[0].message}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('users', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    // Prevent self-deletion
    const sessionUser = await requirePermission('users', 'delete');
    if (!(sessionUser instanceof NextResponse) && id === sessionUser.user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });

    await createAuditLog({
      action: 'DELETE',
      entity: 'USER',
      entityId: id,
      details: { deletedUser: existingUser.fullName, email: existingUser.email },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}