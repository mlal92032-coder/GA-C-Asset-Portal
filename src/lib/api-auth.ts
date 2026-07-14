import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { prisma } from './prisma';
import { NextResponse } from 'next/server';
import {
  hasPermission,
  canView,
  parsePermissions,
  type Module,
  type PermissionAction,
} from './permissions';

export type UserSession = {
  id: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'USER' | 'VIEW_USER';
  status: 'ACTIVE' | 'INACTIVE';
  department: string | null;
  designation: string | null;
  phone: string | null;
  permissions: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get the current authenticated user from the session.
 * Fetches fresh data from the DB to ensure permissions are up-to-date.
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        department: true,
        designation: true,
        phone: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.status === 'INACTIVE') return null;
    return user as UserSession;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication — returns user or 401 response.
 */
export async function requireAuth(): Promise<{ user: UserSession } | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: You must be logged in to perform this action' },
      { status: 401 }
    );
  }
  return { user };
}

/**
 * Require admin role (SUPER_ADMIN or USER).
 * VIEW_USER is blocked.
 */
export async function requireAdmin(): Promise<{ user: UserSession } | NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.user.role !== 'SUPER_ADMIN' && authResult.user.role !== 'USER') {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Require a specific permission (module + action).
 * Returns user or 401/403 response.
 *
 * @param module  - The module to check
 * @param action  - The action to check
 */
export async function requirePermission(
  module: Module,
  action: PermissionAction
): Promise<{ user: UserSession } | NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  if (!hasPermission(user.role, user.permissions, module, action)) {
    return NextResponse.json(
      {
        success: false,
        error: `Forbidden: You do not have '${action}' permission for ${module}`,
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Require view permission on a module.
 */
export async function requireView(module: Module): Promise<{ user: UserSession } | NextResponse> {
  return requirePermission(module, 'view');
}

/**
 * Require create permission on a module.
 */
export async function requireCreate(module: Module): Promise<{ user: UserSession } | NextResponse> {
  return requirePermission(module, 'create');
}

/**
 * Require edit permission on a module.
 */
export async function requireEdit(module: Module): Promise<{ user: UserSession } | NextResponse> {
  return requirePermission(module, 'edit');
}

/**
 * Require delete permission on a module.
 */
export async function requireDelete(module: Module): Promise<{ user: UserSession } | NextResponse> {
  return requirePermission(module, 'delete');
}

/**
 * Check if a user can write (create/edit/delete) and return 403 if not.
 * Allows SUPER_ADMIN (full), blocks VIEW_USER entirely.
 * For USER, checks if they have any write action on the module.
 */
export async function requireWrite(module: Module): Promise<{ user: UserSession } | NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  if (user.role === 'SUPER_ADMIN') return { user };

  if (user.role === 'VIEW_USER') {
    return NextResponse.json(
      { success: false, error: 'Forbidden: View-only users cannot modify data' },
      { status: 403 }
    );
  }

  // USER: check if they have create, edit, or delete on this module
  const perms = parsePermissions(user.permissions);
  if (!perms) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: No permissions assigned' },
      { status: 403 }
    );
  }

  const moduleActions = perms[module];
  if (!moduleActions || !Array.isArray(moduleActions)) {
    return NextResponse.json(
      { success: false, error: `Forbidden: No access to ${module}` },
      { status: 403 }
    );
  }

  const canWrite = moduleActions.some((a) =>
    ['create', 'edit', 'delete', 'import', 'export', 'checkout', 'checkin', 'manage'].includes(a)
  );

  if (!canWrite) {
    return NextResponse.json(
      { success: false, error: `Forbidden: No write permission for ${module}` },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Create an audit log entry.
 */
export async function createAuditLog(data: {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT';
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}