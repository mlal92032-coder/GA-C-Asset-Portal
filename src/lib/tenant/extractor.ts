import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { TenantContext } from '@/types/tenant';
import prisma from '@/lib/prisma';

/**
 * Extract tenant ID or slug from the current request
 * Priority order:
 * 1. X-Tenant-Id header (for API calls)
 * 2. X-Tenant-Slug header (for subdomain-based access)
 * 3. Subdomain from hostname (app.acme-inc.com -> acme-inc)
 * 4. From JWT token in session (stored at login)
 */
export async function extractTenantIdOrSlug(): Promise<string | null> {
  try {
    const headersList = await headers();

    // 1. Check X-Tenant-Id header
    const headerTenantId = headersList.get('x-tenant-id');
    if (headerTenantId) {
      return headerTenantId;
    }

    // 2. Check X-Tenant-Slug header
    const headerTenantSlug = headersList.get('x-tenant-slug');
    if (headerTenantSlug) {
      return headerTenantSlug;
    }

    // 3. Extract from subdomain
    const host = headersList.get('host') || '';
    // Match patterns like: acme-inc.app.local, tenant-1.app.example.com
    const subdomainMatch = host.match(/^([a-z0-9-]+)\.app/i);
    if (subdomainMatch) {
      return subdomainMatch[1];
    }

    // 4. Try to get from session
    const session = await getServerSession();
    if (session?.user && 'tenantId' in session.user) {
      return (session.user as any).tenantId;
    }

    return null;
  } catch (error) {
    console.error('Error extracting tenant ID:', error);
    return null;
  }
}

/**
 * Fetch tenant information from database
 * Accepts either tenant ID or slug
 */
export async function getTenantFromDatabase(
  tenantIdOrSlug: string
): Promise<TenantContext | null> {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id: tenantIdOrSlug },
              { slug: tenantIdOrSlug }
            ]
          },
          { status: 'ACTIVE' }
        ]
      }
    });

    if (!tenant) {
      console.warn(`Tenant not found: ${tenantIdOrSlug}`);
      return null;
    }

    // Parse features array
    let features: string[] = [];
    try {
      features = JSON.parse(tenant.enabledFeatures || '[]');
    } catch {
      features = [];
    }

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      slug: tenant.slug,
      tier: tenant.tier as any,
      status: tenant.status as any,
      features,
      storageQuotaGB: tenant.storageQuotaGB,
      maxUsers: tenant.maxUsers,
      maxAssets: tenant.maxAssets,
      maxAPICallsPerMonth: tenant.maxAPICallsPerMonth,
      customBrandingEnabled: tenant.customBranding,
      billingEmail: tenant.billingEmail
    };
  } catch (error) {
    console.error('Error fetching tenant from database:', error);
    return null;
  }
}

/**
 * Get tenant by ID only (for internal operations)
 */
export async function getTenantById(
  tenantId: string
): Promise<TenantContext | null> {
  return getTenantFromDatabase(tenantId);
}

/**
 * Get tenant by slug only
 */
export async function getTenantBySlug(
  slug: string
): Promise<TenantContext | null> {
  return getTenantFromDatabase(slug);
}

/**
 * Verify tenant access for user
 */
export async function verifyTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true }
    });

    return user?.tenantId === tenantId;
  } catch (error) {
    console.error('Error verifying tenant access:', error);
    return false;
  }
}

/**
 * Get all tenants for a user
 */
export async function getUserTenants(userId: string): Promise<TenantContext[]> {
  try {
    const users = await prisma.user.findMany({
      where: { id: userId },
      select: { tenantId: true }
    });

    const tenantIds = [...new Set(users.map(u => u.tenantId))];

    const tenants = await prisma.tenant.findMany({
      where: { id: { in: tenantIds }, status: 'ACTIVE' }
    });

    return tenants.map(tenant => ({
      tenantId: tenant.id,
      tenantName: tenant.name,
      slug: tenant.slug,
      tier: tenant.tier as any,
      status: tenant.status as any,
      features: JSON.parse(tenant.enabledFeatures || '[]'),
      storageQuotaGB: tenant.storageQuotaGB,
      maxUsers: tenant.maxUsers,
      maxAssets: tenant.maxAssets,
      maxAPICallsPerMonth: tenant.maxAPICallsPerMonth,
      customBrandingEnabled: tenant.customBranding,
      billingEmail: tenant.billingEmail
    }));
  } catch (error) {
    console.error('Error getting user tenants:', error);
    return [];
  }
}
