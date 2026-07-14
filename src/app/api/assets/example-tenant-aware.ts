/**
 * EXAMPLE: Tenant-Aware API Route
 *
 * This file demonstrates how to build tenant-isolated API endpoints
 * using the new tenant utilities.
 *
 * To use this pattern in your API routes:
 * 1. Import withTenantProtection or withAuthProtection
 * 2. Wrap your handler logic
 * 3. Use the tenantPrisma instance instead of global prisma
 * 4. Never worry about tenant filtering - it's automatic
 *
 * Location: src/app/api/assets/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuthProtection, getPaginationParams, getFilterParams, buildPaginatedResponse, createAuditLog } from '@/lib/tenant-api';

/**
 * GET /api/assets
 * Fetch all assets for current tenant with pagination and filters
 */
export async function GET(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    try {
      const { page, pageSize, skip } = getPaginationParams(request);
      const { search, status, sortBy, sortOrder } = getFilterParams(request);

      // Build where clause with tenant filtering (automatic via tenantPrisma)
      const where: any = {};

      if (search) {
        where.OR = [
          { assetName: { contains: search, mode: 'insensitive' } },
          { assetTag: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (status) {
        where.status = status;
      }

      // Get total count
      const total = await tenantPrisma.furnitureAsset.count({ where });

      // Fetch paginated results
      const assets = await tenantPrisma.furnitureAsset.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: true,
          location: true,
          assignedUser: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      // Log the activity
      await createAuditLog(
        tenantPrisma,
        tenantId,
        userId,
        'VIEW',
        'FURNITURE_ASSET',
        'LIST',
        { page, pageSize, filters: { search, status } }
      );

      return NextResponse.json(buildPaginatedResponse(assets, total, page, pageSize));
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assets' },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/assets
 * Create a new asset in current tenant
 */
export async function POST(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    try {
      const body = await request.json();

      // Validate required fields
      if (!body.assetName) {
        return NextResponse.json(
          { error: 'assetName is required' },
          { status: 400 }
        );
      }

      // Check tenant quotas before creating
      const existingCount = await tenantPrisma.furnitureAsset.count();
      const tenant = await tenantPrisma.tenant.findUnique({
        where: { id: tenantId },
        select: { maxAssets: true }
      });

      if (existingCount >= (tenant?.maxAssets || 5000)) {
        return NextResponse.json(
          { error: 'Asset quota exceeded' },
          { status: 429 }
        );
      }

      // Create asset (tenantId added automatically)
      const asset = await tenantPrisma.furnitureAsset.create({
        data: {
          assetName: body.assetName,
          assetTag: body.assetTag,
          serialNumber: body.serialNumber,
          furnitureType: body.furnitureType,
          material: body.material,
          purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
          purchasePrice: body.purchasePrice,
          companyId: body.companyId,
          manufacturerId: body.manufacturerId,
          locationId: body.locationId,
          assignedUserId: body.assignedUserId,
          condition: body.condition || 'GOOD',
          status: body.status || 'IN_STORE',
          remarks: body.remarks
        },
        include: {
          company: true,
          location: true
        }
      });

      // Log the action
      await createAuditLog(
        tenantPrisma,
        tenantId,
        userId,
        'CREATE',
        'FURNITURE_ASSET',
        asset.id,
        { assetName: asset.assetName, assetTag: asset.assetTag }
      );

      return NextResponse.json(asset, { status: 201 });
    } catch (error) {
      console.error('Failed to create asset:', error);

      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Asset tag already exists in this tenant' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create asset' },
        { status: 500 }
      );
    }
  });
}

/**
 * Key patterns demonstrated:
 *
 * 1. withAuthProtection wrapper:
 *    - Automatically verifies user is authenticated
 *    - Passes tenantId and userId to handler
 *    - Tenant filtering is automatic
 *
 * 2. tenantPrisma usage:
 *    - All queries are automatically filtered by tenantId
 *    - No need to manually add tenantId to where clauses
 *    - Prevents accidental cross-tenant access
 *
 * 3. Pagination:
 *    - Use getPaginationParams() to extract page/pageSize
 *    - Use buildPaginatedResponse() for consistent format
 *
 * 4. Filters:
 *    - Use getFilterParams() to extract search/status/sort
 *    - Apply to where clause
 *
 * 5. Audit logging:
 *    - Use createAuditLog() to track all changes
 *    - Includes user, action, entity, and metadata
 *
 * 6. Error handling:
 *    - Catch specific Prisma errors (unique constraint, not found)
 *    - Return appropriate HTTP status codes
 *    - Log errors for debugging
 */
