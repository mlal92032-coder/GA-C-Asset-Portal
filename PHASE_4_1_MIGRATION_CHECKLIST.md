# Phase 4.1 - API Route Migration Checklist

## Overview

This checklist guides you through converting existing API routes to use the new tenant-isolation system.

## Before/After Comparison

### Before (Not Tenant-Aware)
```typescript
// src/app/api/assets/route.ts
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const assets = await prisma.furnitureAsset.findMany();
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**Problems:**
- ❌ No tenant checking - all users see all assets
- ❌ Cross-tenant access vulnerability
- ❌ No authentication verification
- ❌ No audit logging
- ❌ No quota enforcement

### After (Tenant-Aware)
```typescript
// src/app/api/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuthProtection, getPaginationParams } from '@/lib/tenant-api';

export async function GET(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const { page, pageSize, skip } = getPaginationParams(request);

    const assets = await tenantPrisma.furnitureAsset.findMany({
      skip,
      take: pageSize
    });

    const total = await tenantPrisma.furnitureAsset.count();

    return NextResponse.json({ assets, total });
  });
}
```

**Benefits:**
- ✅ Automatic tenant filtering
- ✅ Authentication verified
- ✅ User ID available for logging
- ✅ Pagination support
- ✅ Consistent error handling

## Migration Steps

### Step 1: Identify Route Category

Classify the route by what it needs:

| Category | Pattern | Wrapper | Needs |
|----------|---------|---------|-------|
| Public | `/api/auth/*` | None | No tenant context |
| Basic Read | `GET /api/assets` | `withTenantProtection` | Tenant only |
| Authenticated | `GET /api/profile` | `withAuthProtection` | User + tenant |
| Admin | `DELETE /api/users` | `withAdminProtection` | Admin verification |

### Step 2: Update Imports

```typescript
// Old
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// New
import { NextRequest, NextResponse } from 'next/server';
import { 
  withAuthProtection,        // For authenticated routes
  withAdminProtection,       // For admin-only routes
  getPaginationParams,       // For list pagination
  getFilterParams,          // For filtering
  createAuditLog            // For logging
} from '@/lib/tenant-api';
```

### Step 3: Wrap Handler Function

```typescript
// Old
export async function GET(request: NextRequest) {
  const assets = await prisma.furnitureAsset.findMany();
  return NextResponse.json(assets);
}

// New
export async function GET(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const assets = await tenantPrisma.furnitureAsset.findMany();
    return NextResponse.json(assets);
  });
}
```

### Step 4: Replace Global Prisma with tenantPrisma

```typescript
// Old
const assets = await prisma.furnitureAsset.findMany();
const count = await prisma.furnitureAsset.count();
const user = await prisma.user.findUnique({ where: { id: userId } });

// New
const assets = await tenantPrisma.furnitureAsset.findMany();
const count = await tenantPrisma.furnitureAsset.count();
const user = await tenantPrisma.user.findUnique({ where: { id: userId } });
// tenantId filtering is automatic!
```

### Step 5: Add Pagination & Filters (for List Endpoints)

```typescript
// Old
export async function GET(request: NextRequest) {
  const assets = await prisma.furnitureAsset.findMany();
  return NextResponse.json(assets);
}

// New
export async function GET(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const { page, pageSize, skip } = getPaginationParams(request);
    const { search, status, sortBy, sortOrder } = getFilterParams(request);

    const where: any = {};
    if (search) {
      where.OR = [
        { assetName: { contains: search } },
        { assetTag: { contains: search } }
      ];
    }
    if (status) where.status = status;

    const [assets, total] = await Promise.all([
      tenantPrisma.furnitureAsset.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder }
      }),
      tenantPrisma.furnitureAsset.count({ where })
    ]);

    return NextResponse.json({ assets, total, page, pageSize });
  });
}
```

### Step 6: Add Audit Logging (for Mutations)

```typescript
// Old
export async function POST(request: NextRequest) {
  const body = await request.json();
  const asset = await prisma.furnitureAsset.create({ data: body });
  return NextResponse.json(asset, { status: 201 });
}

// New
import { createAuditLog } from '@/lib/tenant-api';

export async function POST(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const body = await request.json();
    
    const asset = await tenantPrisma.furnitureAsset.create({ data: body });
    
    // Log the action
    await createAuditLog(
      tenantPrisma,
      tenantId,
      userId,
      'CREATE',
      'FURNITURE_ASSET',
      asset.id,
      { name: asset.assetName }
    );
    
    return NextResponse.json(asset, { status: 201 });
  });
}
```

### Step 7: Add Error Handling

```typescript
// Better error handling
return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
  try {
    // ... your code
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ error: 'Already exists' }, { status: 409 });
      }
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
});
```

## API Routes to Migrate

### Priority 1: High-Traffic Routes (Do First)

- [ ] `GET /api/assets` - List all assets
- [ ] `POST /api/assets` - Create asset
- [ ] `GET /api/assets/[id]` - Get single asset
- [ ] `PUT /api/assets/[id]` - Update asset
- [ ] `DELETE /api/assets/[id]` - Delete asset
- [ ] `GET /api/users` - List users
- [ ] `GET /api/checkouts` - List checkouts
- [ ] `GET /api/maintenance` - List maintenance records

### Priority 2: Admin Routes (Do Second)

- [ ] `DELETE /api/admin/users/[id]` - Delete user (admin only)
- [ ] `POST /api/admin/roles` - Create custom role
- [ ] `PUT /api/admin/settings` - Update settings
- [ ] `GET /api/admin/audit-logs` - View audit logs
- [ ] `POST /api/admin/users/[id]/assign-role` - Assign role

### Priority 3: Supporting Routes (Do Last)

- [ ] `GET /api/companies` - List companies
- [ ] `GET /api/locations` - List locations
- [ ] `GET /api/manufacturers` - List manufacturers
- [ ] `POST /api/reports/[id]/download` - Download report
- [ ] `GET /api/notifications` - Get notifications

## Example Migrations

### Example 1: Simple List Endpoint

**File:** `src/app/api/assets/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuthProtection, getPaginationParams } from '@/lib/tenant-api';

export async function GET(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const { page, pageSize, skip } = getPaginationParams(request);

    const [assets, total] = await Promise.all([
      tenantPrisma.furnitureAsset.findMany({
        skip,
        take: pageSize,
        include: { company: true, location: true },
        orderBy: { createdAt: 'desc' }
      }),
      tenantPrisma.furnitureAsset.count()
    ]);

    return NextResponse.json({ assets, total, page, pageSize });
  });
}
```

### Example 2: Create with Validation

**File:** `src/app/api/users/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAdminProtection, createAuditLog } from '@/lib/tenant-api';

export async function POST(request: NextRequest) {
  return withAdminProtection(request, async (tenantId, userId, tenantPrisma) => {
    const body = await request.json();

    // Validate
    if (!body.email || !body.fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check quota
    const count = await tenantPrisma.user.count();
    const tenant = await tenantPrisma.tenant.findUnique({
      where: { id: tenantId },
      select: { maxUsers: true }
    });

    if (count >= tenant.maxUsers) {
      return NextResponse.json(
        { error: 'User quota exceeded' },
        { status: 429 }
      );
    }

    try {
      const user = await tenantPrisma.user.create({
        data: {
          email: body.email,
          fullName: body.fullName,
          password: 'temp_password', // Should be hashed
          role: body.role || 'VIEW_USER'
        }
      });

      await createAuditLog(
        tenantPrisma,
        tenantId,
        userId,
        'CREATE',
        'USER',
        user.id,
        { email: user.email }
      );

      return NextResponse.json(user, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  });
}
```

### Example 3: Update with Logging

**File:** `src/app/api/assets/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuthProtection, createAuditLog } from '@/lib/tenant-api';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const body = await request.json();

    // Get original for audit
    const original = await tenantPrisma.furnitureAsset.findUnique({
      where: { id: params.id }
    });

    if (!original) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Update
    const updated = await tenantPrisma.furnitureAsset.update({
      where: { id: params.id },
      data: body
    });

    // Log changes
    const changes = Object.keys(body).reduce((acc, key) => {
      if (original[key as keyof typeof original] !== body[key]) {
        acc[key] = { from: original[key as keyof typeof original], to: body[key] };
      }
      return acc;
    }, {} as Record<string, any>);

    await createAuditLog(
      tenantPrisma,
      tenantId,
      userId,
      'UPDATE',
      'FURNITURE_ASSET',
      updated.id,
      changes
    );

    return NextResponse.json(updated);
  });
}
```

### Example 4: Admin-Only Delete

**File:** `src/app/api/users/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAdminProtection, createAuditLog } from '@/lib/tenant-api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminProtection(request, async (tenantId, userId, tenantPrisma) => {
    // Don't allow deleting yourself
    if (params.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await tenantPrisma.user.delete({
      where: { id: params.id }
    });

    await createAuditLog(
      tenantPrisma,
      tenantId,
      userId,
      'DELETE',
      'USER',
      user.id,
      { email: user.email }
    );

    return NextResponse.json({ success: true });
  });
}
```

## Testing After Migration

### 1. Test Tenant Isolation

```bash
# Get X-Tenant-ID from Tenant table
TENANT_ID1=c123abc...
TENANT_ID2=c456def...

# Create asset in tenant 1
curl -H "X-Tenant-ID: $TENANT_ID1" \
  -H "Content-Type: application/json" \
  -d '{"assetName": "Desk 1"}' \
  POST http://localhost:3000/api/assets

# Try to access with tenant 2 (should fail/be empty)
curl -H "X-Tenant-ID: $TENANT_ID2" \
  http://localhost:3000/api/assets
```

### 2. Test Authentication

```bash
# Without auth (should fail)
curl http://localhost:3000/api/assets

# With invalid tenant
curl -H "X-Tenant-ID: invalid" \
  http://localhost:3000/api/assets
```

### 3. Test Pagination

```bash
curl "http://localhost:3000/api/assets?page=2&pageSize=50"
```

### 4. Test Filters

```bash
curl "http://localhost:3000/api/assets?search=desk&status=IN_USE&sortBy=createdAt&sortOrder=desc"
```

## Rollout Plan

### Week 1: Priority 1 Routes
- Migrate high-traffic read endpoints
- Deploy with feature flag
- Monitor for errors
- Get team feedback

### Week 2: Priority 1 + Mutations
- Migrate POST/PUT/DELETE routes
- Add audit logging
- Update tests
- Document patterns

### Week 3: Priority 2 Routes
- Migrate admin endpoints
- Implement quota checks
- Add rate limiting
- Security review

### Week 4: Priority 3 + Polish
- Migrate remaining routes
- Add comprehensive tests
- Performance optimization
- Launch to production

## Validation Checklist

After each migration, verify:

- [ ] Route uses `withAuthProtection` or `withAdminProtection`
- [ ] Uses `tenantPrisma` instead of global `prisma`
- [ ] Handles missing/null tenant gracefully
- [ ] No manual `tenantId` checks (should be automatic)
- [ ] Mutations have audit logging
- [ ] Error messages don't leak tenant info
- [ ] Tests pass with new implementation
- [ ] Performance metrics unchanged

## Troubleshooting

### "Tenant context missing" error
- ✅ Middleware is running on this route
- ✅ X-Tenant-ID header is set
- ✅ Or user is logged in with tenantId in session

### Tests still using global prisma
- Replace all `prisma.` with `tenantPrisma.`
- Use `createTenantPrisma(prisma, tenantId)` in tests
- See `src/__tests__/tenant-isolation.test.ts` for examples

### Unique constraint errors on migration
- May have duplicate data from before multi-tenancy
- Add data cleanup migration if needed
- Use soft delete for historical data

### Performance regression
- Add indexes if querying on non-indexed fields
- Use `include` instead of N+1 queries
- Consider caching frequently accessed data

## References

- Full implementation guide: `MULTI_TENANCY_IMPLEMENTATION.md`
- API helpers: `src/lib/tenant-api.ts`
- Example route: `src/app/api/assets/example-tenant-aware.ts`
- Tests: `src/__tests__/tenant-isolation.test.ts`
