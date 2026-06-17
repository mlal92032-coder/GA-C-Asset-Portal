import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { type PermissionAction } from '@/lib/permissions';

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  department: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(['SUPER_ADMIN', 'USER', 'VIEW_USER']),
  permissions: z.union([z.record(z.string(), z.array(z.string())), z.string(), z.null()]).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

/**
 * Normalize the permissions field to a JSON string for storage.
 * Handles: object (new format), string (old format or pre-stringified), null/undefined.
 */
function normalizePermissions(
  permissions: Record<string, string[]> | string | null | undefined
): string | null {
  if (!permissions) return null;

  // Already a string — try parsing to validate, return as-is if valid JSON
  if (typeof permissions === 'string') {
    try {
      JSON.parse(permissions);
      return permissions;
    } catch {
      return null;
    }
  }

  // Object — convert to JSON string
  if (typeof permissions === 'object') {
    const keys = Object.keys(permissions);
    if (keys.length === 0) return null;

    // Clean: only include modules that have at least one action
    const cleaned: Record<string, string[]> = {};
    for (const [mod, actions] of Object.entries(permissions)) {
      if (Array.isArray(actions) && actions.length > 0) {
        cleaned[mod] = [...new Set(actions)]; // deduplicate
      }
    }
    return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : null;
  }

  return null;
}

export async function GET() {
  try {
    const authResult = await requirePermission('users', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
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
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission('users', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();

    const validatedData = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (12 rounds)
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Normalize permissions
    const permissionsJson = normalizePermissions(validatedData.permissions);

    const user = await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        password: hashedPassword,
        department: validatedData.department ?? null,
        designation: validatedData.designation ?? null,
        phone: validatedData.phone ?? null,
        role: validatedData.role,
        permissions: permissionsJson,
        status: validatedData.status,
      },
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
      },
    });

    await createAuditLog({
      action: 'CREATE',
      entity: 'USER',
      entityId: user.id,
      details: { fullName: validatedData.fullName, email: validatedData.email, role: validatedData.role },
    });

    return NextResponse.json(
      { success: true, data: user, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: `Validation error: ${error.issues[0].message}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create user: ' + (error as Error).message },
      { status: 500 }
    );
  }
}