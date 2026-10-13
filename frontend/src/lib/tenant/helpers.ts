import { TenantRequest } from '@/types/tenant';
import prisma from '@/lib/prisma';

/**
 * Require tenant context from request
 * Throws error if not present
 */
export async function requireTenant(req: TenantRequest): Promise<string> {
  if (!req.tenantId) {
    throw new Error('Tenant context is required for this operation');
  }
  return req.tenantId;
}

/**
 * Build a database query with automatic tenant filtering
 * Ensures data isolation by including tenantId in where clause
 */
export function buildTenantQuery<T extends { where?: any }>(
  tenantId: string,
  query: T = {} as T
): T {
  return {
    ...query,
    where: {
      ...(query.where || {}),
      tenantId
    }
  } as T;
}

/**
 * Helper to build select clause that excludes tenantId
 * Client code should never see tenantId
 */
export function excludeTenantId<T extends { select?: any }>(
  query: T = {} as T
): T {
  if (!query.select) {
    return query;
  }

  const select = { ...query.select };
  delete select.tenantId;

  return {
    ...query,
    select
  } as T;
}

/**
 * Verify user belongs to tenant
 */
export async function verifyUserInTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId
    }
  });

  return !!user;
}

/**
 * Get user's role in tenant
 */
export async function getUserRole(
  userId: string,
  tenantId: string
): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId
    },
    select: { role: true }
  });

  return user?.role || null;
}

/**
 * Check if user is admin of tenant
 */
export async function isUserAdminOfTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const role = await getUserRole(userId, tenantId);
  return role === 'SUPER_ADMIN' || role === 'USER';
}

/**
 * Check if user is super admin of tenant
 */
export async function isUserSuperAdminOfTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const role = await getUserRole(userId, tenantId);
  return role === 'SUPER_ADMIN';
}

/**
 * Validate operation is allowed for tenant
 */
export async function validateTenantOperation(
  tenantId: string,
  operationType: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'
): Promise<boolean> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant || tenant.status !== 'ACTIVE') {
      return false;
    }

    // Additional checks based on tenant tier or settings
    // could be added here

    return true;
  } catch (error) {
    console.error('Error validating tenant operation:', error);
    return false;
  }
}

/**
 * Format response to exclude sensitive fields
 */
export function formatTenantResponse<T extends Record<string, any>>(
  data: T,
  excludeFields: string[] = []
): Partial<T> {
  const excluded = ['tenantId', ...excludeFields];
  const result = { ...data };

  excluded.forEach(field => {
    delete result[field];
  });

  return result;
}

/**
 * Build composite where clause for tenant filtering
 */
export function tenantWhere(tenantId: string, additionalWhere: any = {}) {
  return {
    AND: [
      { tenantId },
      additionalWhere
    ]
  };
}

/**
 * Count resources for tenant
 */
export async function countTenantResources(tenantId: string) {
  const [users, assets, checkouts, maintenance] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),
    prisma.furnitureAsset.count({ where: { tenantId } }),
    prisma.assetCheckout.count({ where: { tenantId } }),
    prisma.maintenance.count({ where: { tenantId } })
  ]);

  return {
    users,
    assets,
    checkouts,
    maintenance
  };
}

/**
 * Soft delete tenant (mark as deleted, don't remove data)
 */
export async function softDeleteTenant(tenantId: string): Promise<void> {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      status: 'DELETED',
      deletedAt: new Date()
    }
  });
}

/**
 * Restore deleted tenant
 */
export async function restoreTenant(tenantId: string): Promise<void> {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      status: 'ACTIVE',
      deletedAt: null
    }
  });
}

/**
 * Suspend tenant (prevent access but keep data)
 */
export async function suspendTenant(tenantId: string): Promise<void> {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: 'SUSPENDED' }
  });
}

/**
 * Get tenant stats
 */
export async function getTenantStats(tenantId: string) {
  const [
    users,
    assets,
    checkouts,
    audits,
    notifications,
    reports
  ] = await Promise.all([
    prisma.user.count({ where: { tenantId } }),
    prisma.furnitureAsset.count({ where: { tenantId } }),
    prisma.assetCheckout.count({ where: { tenantId, checkInDate: null } }), // Active checkouts
    prisma.auditLog.count({ where: { user: { tenantId } } }),
    prisma.notification.count({ where: { user: { tenantId } } }),
    prisma.reportConfiguration.count({ where: { /* tenantId */ } })
  ]);

  return {
    users,
    assets,
    activeCheckouts: checkouts,
    auditLogs: audits,
    notifications,
    reports
  };
}
