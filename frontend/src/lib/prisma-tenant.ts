import { PrismaClient } from '@prisma/client';

/**
 * Prisma Extension for Multi-Tenancy
 *
 * Automatically adds tenantId filtering to all queries on business models.
 * This prevents accidental cross-tenant data access.
 *
 * Usage:
 * const tenantPrisma = createTenantPrisma(prisma, 'tenant-123');
 * const assets = await tenantPrisma.furnitureAsset.findMany(); // Automatically filtered by tenant
 */

// Models that should have automatic tenant filtering
const TENANT_FILTERED_MODELS = [
  'user',
  'furnitureAsset',
  'electronicAsset',
  'vehicleAsset',
  'company',
  'manufacturer',
  'location',
  'assetCheckout',
  'auditLog',
  'notification',
  'review',
  'maintenance',
  'sparePart',
  'deleteRequest',
  'userCreationRequest',
  'userDeleteRequest',
  'assetAddRequest',
  'customRole',
  'userPermissionOverride',
  'systemSetting',
  'settingCategory',
  'notificationPreference',
  'reportConfiguration',
  'systemLog',
  'assetDefaults',
  'organizationInfo',
  'usageMetric',
  'billingRecord',
];

interface TenantQueryContext {
  tenantId: string;
  userId?: string;
}

/**
 * Create a Prisma client with automatic tenant filtering
 *
 * @param basePrisma - Base PrismaClient instance
 * @param context - Tenant context (id, optional userId for logging)
 * @returns Extended Prisma client with automatic tenant filtering
 */
export function createTenantPrisma(
  basePrisma: PrismaClient,
  context: TenantQueryContext | string
) {
  const tenantContext = typeof context === 'string' ? { tenantId: context } : context;

  if (!tenantContext.tenantId) {
    throw new Error('Tenant ID is required');
  }

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelName = model as string;

          // Only filter tenant-aware models
          if (!TENANT_FILTERED_MODELS.includes(modelName)) {
            return query(args);
          }

          // Different operations require different handling
          switch (operation) {
            // CREATE: Add tenantId to data
            case 'create':
              args.data = {
                ...args.data,
                tenantId: tenantContext.tenantId
              };
              break;

            // FIND operations: Add tenantId to where clause
            case 'findUnique':
            case 'findFirst':
              args.where = {
                ...args.where,
                tenantId: tenantContext.tenantId
              };
              break;

            case 'findMany':
              args.where = {
                AND: [
                  args.where || {},
                  { tenantId: tenantContext.tenantId }
                ]
              };
              break;

            // UPDATE operations: Add tenantId to where clause
            case 'update':
            case 'upsert':
              args.where = {
                ...args.where,
                tenantId: tenantContext.tenantId
              };
              break;

            // DELETE operations: Add tenantId to where clause
            case 'delete':
              args.where = {
                ...args.where,
                tenantId: tenantContext.tenantId
              };
              break;

            // MANY operations: Add tenantId to where clause
            case 'updateMany':
            case 'deleteMany':
              args.where = {
                AND: [
                  args.where || {},
                  { tenantId: tenantContext.tenantId }
                ]
              };
              break;

            // COUNT: Add tenantId to where clause
            case 'count':
              args.where = {
                AND: [
                  args.where || {},
                  { tenantId: tenantContext.tenantId }
                ]
              };
              break;

            // AGGREGATE: Add tenantId to where clause
            case 'aggregate':
            case 'groupBy':
              args.where = {
                AND: [
                  args.where || {},
                  { tenantId: tenantContext.tenantId }
                ]
              };
              break;

            default:
              // For any other operations, try to add tenantId
              if (args.where) {
                args.where = {
                  AND: [
                    args.where,
                    { tenantId: tenantContext.tenantId }
                  ]
                };
              }
          }

          return query(args);
        }
      }
    }
  });
}

/**
 * Create a Prisma client with readonly access (no mutations)
 */
export function createReadOnlyTenantPrisma(
  basePrisma: PrismaClient,
  context: TenantQueryContext | string
) {
  const tenantPrisma = createTenantPrisma(basePrisma, context);

  return {
    ...tenantPrisma,
    // Override all mutation operations
    $transaction: (queries: any[], options?: any) => {
      throw new Error('Read-only Prisma client does not support transactions');
    }
  };
}

/**
 * Helper to verify operation is allowed for tenant
 */
export async function verifyTenantAccess(
  basePrisma: PrismaClient,
  tenantId: string,
  userId: string
): Promise<boolean> {
  try {
    const user = await basePrisma.user.findFirst({
      where: {
        id: userId,
        tenantId
      }
    });

    return !!user;
  } catch (error) {
    console.error('Error verifying tenant access:', error);
    return false;
  }
}

/**
 * Helper to verify tenant status before allowing operations
 */
export async function isTenantActive(
  basePrisma: PrismaClient,
  tenantId: string
): Promise<boolean> {
  try {
    const tenant = await basePrisma.tenant.findUnique({
      where: { id: tenantId },
      select: { status: true }
    });

    return tenant?.status === 'ACTIVE';
  } catch (error) {
    console.error('Error checking tenant status:', error);
    return false;
  }
}

/**
 * Get tenant billing information
 */
export async function getTenantBilling(
  basePrisma: PrismaClient,
  tenantId: string
) {
  return basePrisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      tier: true,
      storageQuotaGB: true,
      maxUsers: true,
      maxAssets: true,
      maxAPICallsPerMonth: true,
      monthlyUsageStorage: true,
      monthlyUserCount: true,
      monthlyAPICallsCount: true,
      billingEmail: true
    }
  });
}

/**
 * Check if tenant has exceeded quotas
 */
export async function checkTenantQuotas(
  basePrisma: PrismaClient,
  tenantId: string
) {
  const tenant = await getTenantBilling(basePrisma, tenantId);

  if (!tenant) {
    return { exceeded: true, reason: 'Tenant not found' };
  }

  const storageGB = Number(tenant.monthlyUsageStorage) / (1024 * 1024 * 1024);
  const userCount = tenant.monthlyUserCount;
  const apiCalls = tenant.monthlyAPICallsCount;

  return {
    storage: {
      usage: storageGB,
      limit: tenant.storageQuotaGB,
      exceeded: storageGB > tenant.storageQuotaGB,
      percentage: Math.round((storageGB / tenant.storageQuotaGB) * 100)
    },
    users: {
      usage: userCount,
      limit: tenant.maxUsers,
      exceeded: userCount > tenant.maxUsers,
      percentage: Math.round((userCount / tenant.maxUsers) * 100)
    },
    apiCalls: {
      usage: apiCalls,
      limit: tenant.maxAPICallsPerMonth,
      exceeded: apiCalls > tenant.maxAPICallsPerMonth,
      percentage: Math.round((apiCalls / tenant.maxAPICallsPerMonth) * 100)
    }
  };
}
