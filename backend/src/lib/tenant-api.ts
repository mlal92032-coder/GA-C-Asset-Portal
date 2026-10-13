import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { createTenantPrisma, isTenantActive } from '@/lib/prisma-tenant';
import { extractTenantIdOrSlug, getTenantFromDatabase } from '@/lib/tenant/extractor';

/**
 * Tenant-aware API helpers
 *
 * These utilities simplify building tenant-isolated API routes.
 * Every API route should use these to ensure proper tenant filtering.
 */

export interface TenantApiRequest extends NextRequest {
  tenantId?: string;
  userId?: string;
}

/**
 * Extract tenant ID from request headers
 * Used by all API handlers to get tenant context
 */
export function getTenantIdFromHeaders(request: NextRequest): string | null {
  // Middleware sets this header
  return request.headers.get('x-tenant-id');
}

/**
 * Protected API handler wrapper
 *
 * Usage:
 * export async function GET(request: NextRequest) {
 *   return withTenantProtection(request, async (tenantId, tenantPrisma) => {
 *     const assets = await tenantPrisma.furnitureAsset.findMany();
 *     return NextResponse.json(assets);
 *   });
 * }
 */
export async function withTenantProtection(
  request: NextRequest,
  handler: (tenantId: string, tenantPrisma: any) => Promise<NextResponse | Response>
): Promise<NextResponse | Response> {
  try {
    // Get tenant from middleware-set header
    const tenantId = getTenantIdFromHeaders(request);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant context missing' },
        { status: 400 }
      );
    }

    // Verify tenant is active
    const isActive = await isTenantActive(prisma, tenantId);
    if (!isActive) {
      return NextResponse.json(
        { error: 'Tenant is not active' },
        { status: 403 }
      );
    }

    // Create tenant-filtered Prisma client
    const tenantPrisma = createTenantPrisma(prisma, tenantId);

    // Call handler with tenant context
    return await handler(tenantId, tenantPrisma);
  } catch (error) {
    console.error('Tenant API error:', error);

    if (error instanceof Error) {
      // Check for common Prisma errors
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }

      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: 'Resource already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Admin-only API handler wrapper
 *
 * Verifies user is SUPER_ADMIN in tenant before executing
 */
export async function withAdminProtection(
  request: NextRequest,
  handler: (tenantId: string, userId: string, tenantPrisma: any) => Promise<NextResponse | Response>
): Promise<NextResponse | Response> {
  return withTenantProtection(request, async (tenantId, tenantPrisma) => {
    // Get authenticated user
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await tenantPrisma.user.findFirst({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in tenant' },
        { status: 404 }
      );
    }

    // Check if SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return handler(tenantId, user.id, tenantPrisma);
  });
}

/**
 * Authenticated API handler wrapper
 *
 * Verifies user belongs to tenant
 */
export async function withAuthProtection(
  request: NextRequest,
  handler: (tenantId: string, userId: string, tenantPrisma: any) => Promise<NextResponse | Response>
): Promise<NextResponse | Response> {
  return withTenantProtection(request, async (tenantId, tenantPrisma) => {
    // Get authenticated user
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await tenantPrisma.user.findFirst({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in tenant' },
        { status: 404 }
      );
    }

    return handler(tenantId, user.id, tenantPrisma);
  });
}

/**
 * Build paginated response
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1
    }
  };
}

/**
 * Parse pagination params from request
 */
export function getPaginationParams(request: NextRequest, defaultPageSize = 25) {
  const searchParams = request.nextUrl.searchParams;

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || String(defaultPageSize), 10))
  );

  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

/**
 * Parse filter params from request
 */
export function getFilterParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  return {
    search: searchParams.get('search'),
    status: searchParams.get('status'),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  };
}

/**
 * Log API activity for audit trail
 */
export async function logApiActivity(
  tenantPrisma: any,
  tenantId: string,
  userId: string,
  action: string,
  module: string,
  entityId?: string,
  details?: any
) {
  try {
    await tenantPrisma.systemLog.create({
      data: {
        tenantId,
        userId,
        actionType: action,
        module,
        entityId,
        details: details ? JSON.stringify(details) : null,
        status: 'SUCCESS'
      }
    });
  } catch (error) {
    console.error('Failed to log API activity:', error);
    // Don't throw - logging failure shouldn't break the API
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  tenantPrisma: any,
  tenantId: string,
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: any
) {
  try {
    await tenantPrisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Send notification to user
 */
export async function sendNotification(
  tenantPrisma: any,
  tenantId: string,
  userId: string,
  title: string,
  message: string,
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
  link?: string,
  metadata?: any
) {
  try {
    await tenantPrisma.notification.create({
      data: {
        tenantId,
        userId,
        title,
        message,
        type,
        link,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Validate request body matches schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  validator: (data: any) => T
): Promise<{ valid: true; data: T } | { valid: false; error: string }> {
  try {
    const body = await request.json();
    const data = validator(body);
    return { valid: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body';
    return { valid: false, error: message };
  }
}
