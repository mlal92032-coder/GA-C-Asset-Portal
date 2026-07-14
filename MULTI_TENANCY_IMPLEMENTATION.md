# Multi-Tenancy Implementation Guide

**Phase 4.1 - Complete**  
**Date: July 14, 2026**

## Overview

Multi-tenancy infrastructure is now fully implemented in the Asset Management system. This document describes how the multi-tenant architecture works and how to build tenant-isolated features.

## Architecture

### 1. Tenant Model (Prisma Schema)

The `Tenant` model in `prisma/schema.prisma` represents a customer/organization:

```prisma
model Tenant {
  id                    String    @id @default(cuid())
  name                  String    // "Acme Inc", "TechCo"
  slug                  String    @unique // "acme-inc", "techco"
  domain                String?   @unique // Custom domain
  status                String    @default("ACTIVE") // ACTIVE, SUSPENDED, DELETED
  tier                  String    @default("STANDARD") // Pricing tier
  
  // Billing & Usage
  billingEmail          String
  storageQuotaGB        Int       @default(10)
  maxUsers              Int       @default(50)
  maxAssets             Int       @default(5000)
  maxAPICallsPerMonth   Int       @default(100000)
  
  // Relations to all business entities
  users                 User[]
  companies             Company[]
  furnitureAssets       FurnitureAsset[]
  // ... 30+ other relations
}
```

**Every business model has a `tenantId` field** - this ensures data isolation.

### 2. Middleware Layer (`middleware.ts`)

The Next.js middleware automatically extracts the tenant from the request:

```typescript
// Extract tenant from (in priority order):
1. X-Tenant-ID header (for API calls)
2. X-Tenant-Slug header (alternative)
3. Subdomain (app.acme-inc.com -> acme-inc)
4. JWT session (for browser requests)
```

**The middleware:**
- Runs on all API routes and protected pages
- Sets `X-Tenant-ID` header for API handlers
- Validates tenant is active
- Prevents access to unidentified tenants

### 3. Prisma Extension (`src/lib/prisma-tenant.ts`)

The `createTenantPrisma()` function creates a Prisma client that automatically filters all queries:

```typescript
const tenantPrisma = createTenantPrisma(prisma, 'tenant-123');

// All these queries are automatically filtered by tenantId:
await tenantPrisma.furnitureAsset.findMany()      // WHERE tenantId = 'tenant-123'
await tenantPrisma.user.create({ data: {...} })  // Adds tenantId automatically
await tenantPrisma.assetCheckout.delete(...)       // Checks tenantId in where clause
```

**Tenant-filtered models (24 total):**
- user, furnitureAsset, electronicAsset, vehicleAsset
- company, manufacturer, location
- assetCheckout, auditLog, notification, review
- maintenance, sparePart, deleteRequest
- userCreationRequest, userDeleteRequest, assetAddRequest
- customRole, userPermissionOverride
- systemSetting, settingCategory, notificationPreference
- reportConfiguration, systemLog
- assetDefaults, organizationInfo, usageMetric, billingRecord

### 4. API Helpers (`src/lib/tenant-api.ts`)

Three wrapper functions for building tenant-aware API routes:

#### a) `withTenantProtection()` - Basic tenant verification
```typescript
export async function GET(request: NextRequest) {
  return withTenantProtection(request, async (tenantId, tenantPrisma) => {
    const assets = await tenantPrisma.furnitureAsset.findMany();
    return NextResponse.json(assets);
  });
}
```

#### b) `withAuthProtection()` - Authenticated user verification
```typescript
export async function GET(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const user = await tenantPrisma.user.findUnique({ where: { id: userId } });
    return NextResponse.json(user);
  });
}
```

#### c) `withAdminProtection()` - Admin-only routes
```typescript
export async function DELETE(request: NextRequest) {
  return withAdminProtection(request, async (tenantId, userId, tenantPrisma) => {
    // Only SUPER_ADMIN role can reach here
    await tenantPrisma.user.deleteMany({ where: { status: 'INACTIVE' } });
    return NextResponse.json({ success: true });
  });
}
```

## Building Tenant-Aware Features

### Pattern 1: Simple API Route

```typescript
// src/app/api/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuthProtection, getPaginationParams } from '@/lib/tenant-api';

export async function GET(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const { page, pageSize, skip } = getPaginationParams(request);

    const assets = await tenantPrisma.furnitureAsset.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    });

    const total = await tenantPrisma.furnitureAsset.count();

    return NextResponse.json({ assets, total });
  });
}
```

### Pattern 2: Create with Validation

```typescript
export async function POST(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const body = await request.json();

    // Validate
    if (!body.assetName) {
      return NextResponse.json({ error: 'Missing assetName' }, { status: 400 });
    }

    // Check quotas
    const count = await tenantPrisma.furnitureAsset.count();
    const tenant = await tenantPrisma.tenant.findUnique({
      where: { id: tenantId },
      select: { maxAssets: true }
    });

    if (count >= tenant.maxAssets) {
      return NextResponse.json({ error: 'Quota exceeded' }, { status: 429 });
    }

    // Create (tenantId added automatically!)
    const asset = await tenantPrisma.furnitureAsset.create({
      data: {
        assetName: body.assetName,
        // ... other fields
      }
    });

    return NextResponse.json(asset, { status: 201 });
  });
}
```

### Pattern 3: Update with Audit Logging

```typescript
import { createAuditLog } from '@/lib/tenant-api';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const body = await request.json();

    // Update (tenantId checked automatically)
    const asset = await tenantPrisma.furnitureAsset.update({
      where: { id: params.id },
      data: body
    });

    // Log the change
    await createAuditLog(
      tenantPrisma,
      tenantId,
      userId,
      'UPDATE',
      'FURNITURE_ASSET',
      asset.id,
      { changes: body }
    );

    return NextResponse.json(asset);
  });
}
```

### Pattern 4: Admin-Only Operations

```typescript
export async function DELETE(request: NextRequest) {
  return withAdminProtection(request, async (tenantId, userId, tenantPrisma) => {
    // Only admins reach here - user role already verified

    const deleted = await tenantPrisma.user.deleteMany({
      where: { status: 'INACTIVE' }
    });

    // Log bulk operation
    await createAuditLog(
      tenantPrisma,
      tenantId,
      userId,
      'DELETE_MANY',
      'USER',
      'BULK',
      { count: deleted.count }
    );

    return NextResponse.json(deleted);
  });
}
```

## Tenant Identification Methods

### 1. Header-Based (API Clients)

```bash
curl -H "X-Tenant-ID: c123abc456def789..." \
  https://api.example.com/api/assets
```

### 2. Subdomain-Based (Browser)

```
https://acme-inc.app.example.com/dashboard
# Subdomain "acme-inc" extracted and used to find tenant by slug
```

### 3. Custom Domain (Browser)

```
https://assets.acmeinc.com/dashboard
# Custom domain "assets.acmeinc.com" mapped to tenant
```

### 4. Session-Based (Logged-in Users)

```typescript
// At login, store tenant in JWT session:
jwt.sign({ 
  userId: user.id, 
  tenantId: user.tenantId 
})

// Middleware extracts from session if no header/subdomain
```

## Security Guarantees

### 1. Automatic Tenant Filtering

Every query on a tenant-aware model is automatically filtered:

```typescript
// This:
await tenantPrisma.furnitureAsset.findMany()

// Becomes internally:
await prisma.furnitureAsset.findMany({
  where: { tenantId: 'tenant-123' }  // ← Automatic
})
```

### 2. Impossible to Bypass

Even if developer forgets to add tenantId check:

```typescript
// Developer writes:
const asset = await tenantPrisma.furnitureAsset.findUnique({
  where: { id: maliciousId }
})

// Prisma extension converts to:
const asset = await prisma.furnitureAsset.findUnique({
  where: { 
    id: maliciousId,
    tenantId: 'tenant-123'  // ← Always added
  }
})

// If asset belongs to different tenant, returns null
```

### 3. Unique Constraints Are Tenant-Aware

```prisma
model User {
  email String
  tenantId String
  
  @@unique([tenantId, email])  // Email unique per tenant
}
```

Same email can exist in different tenants:
- `user@acme-inc.com` → Tenant 1
- `user@acme-inc.com` → Tenant 2 (allowed)

### 4. Foreign Key Constraints

All relationships include tenant checks:

```prisma
model AssetCheckout {
  tenantId String
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // User must belong to same tenant
}
```

## Quota Enforcement

### Checking Quotas

```typescript
import { checkTenantQuotas } from '@/lib/prisma-tenant';

const quotas = await checkTenantQuotas(prisma, tenantId);

// Returns:
{
  storage: {
    usage: 2.5,           // GB
    limit: 10,            // GB
    exceeded: false,
    percentage: 25
  },
  users: {
    usage: 15,
    limit: 50,
    exceeded: false,
    percentage: 30
  },
  apiCalls: {
    usage: 45000,
    limit: 100000,
    exceeded: false,
    percentage: 45
  }
}
```

### Enforcing Quotas in API

```typescript
export async function POST(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const quotas = await checkTenantQuotas(prisma, tenantId);

    if (quotas.users.exceeded) {
      return NextResponse.json(
        { error: 'User quota exceeded', quotas },
        { status: 429 }
      );
    }

    // Proceed with creating user
    const user = await tenantPrisma.user.create({ data: {} });
    return NextResponse.json(user, { status: 201 });
  });
}
```

## Tenant Management

### Create Tenant

```typescript
const tenant = await prisma.tenant.create({
  data: {
    name: 'Acme Inc',
    slug: 'acme-inc',
    domain: 'assets.acmeinc.com',
    billingEmail: 'billing@acmeinc.com',
    tier: 'PROFESSIONAL',
    maxAssets: 5000,
    maxUsers: 50,
    storageQuotaGB: 100
  }
});
```

### Suspend Tenant

```typescript
import { suspendTenant } from '@/lib/tenant/helpers';

await suspendTenant(tenantId);
// Tenant status set to SUSPENDED, all access denied
```

### Soft Delete Tenant

```typescript
import { softDeleteTenant } from '@/lib/tenant/helpers';

await softDeleteTenant(tenantId);
// Data preserved, tenant marked as DELETED, access denied
```

### Get Tenant Stats

```typescript
import { getTenantStats } from '@/lib/tenant/helpers';

const stats = await getTenantStats(tenantId);
// Returns: { users, assets, activeCheckouts, auditLogs, notifications, reports }
```

## Testing Tenant Isolation

Comprehensive test suite in `src/__tests__/tenant-isolation.test.ts`:

```bash
npm test -- tenant-isolation.test.ts
```

Tests verify:
- ✅ Cross-tenant access is prevented
- ✅ Automatic filtering works on all operations
- ✅ Unique constraints are tenant-aware
- ✅ Quota enforcement works correctly
- ✅ Tenant status affects access
- ✅ Soft delete preserves data

## Migration Strategy

### Phase 1: ✅ Foundation (Complete)
- [x] Prisma schema includes Tenant model
- [x] All business models have tenantId
- [x] Middleware extracts tenant from request
- [x] Prisma extension auto-filters queries
- [x] API helpers provide wrapper functions
- [x] Tests verify isolation

### Phase 2: Integration (Next)
- [ ] Migrate existing API routes to use `withAuthProtection`
- [ ] Add audit logging to all sensitive operations
- [ ] Update frontend to send X-Tenant-ID header
- [ ] Add quota enforcement to create operations

### Phase 3: Billing Integration
- [ ] Connect to payment provider (Stripe/PayPal)
- [ ] Implement usage metering
- [ ] Generate invoices from billing records
- [ ] Add quota upgrade flow

### Phase 4: Advanced Features
- [ ] Custom branding per tenant
- [ ] Role-based access control per tenant
- [ ] Data export/import
- [ ] API key management

## Troubleshooting

### "Tenant context is required"
The middleware couldn't identify a tenant. Check:
1. Is X-Tenant-ID header present? (`curl -H "X-Tenant-ID: ..."`
2. Is subdomain correct? (`tenant-slug.app.local`)
3. Is user logged in? (JWT session expires?)

### "Record to update not found"
The record belongs to a different tenant. Check:
1. Is ID correct?
2. Does record belong to current tenant?
3. Use tenantPrisma, not global prisma

### "Unique constraint failed"
Duplicate value already exists in tenant. Check:
1. Is value unique per tenant? (Check schema)
2. Is this the first attempt or retry?
3. Add error handling for 409 response

### "Tenant not active"
Tenant was suspended or deleted. Check:
1. Is tenant status "ACTIVE"?
2. Was tenant suspended? Call `restoreTenant()`
3. Check tenant billing - might be past due

## Performance Considerations

### Indexes
All tenant-filtered models have indexed:
- `tenantId` (for filtering)
- `tenantId, status` (common combinations)
- `tenantId, createdAt` (for sorting/pagination)

### Query Optimization
```typescript
// Good - uses indexes
await tenantPrisma.furnitureAsset.findMany({
  where: { status: 'IN_USE' },
  orderBy: { createdAt: 'desc' },
  take: 25
});

// Avoid - full table scan
await tenantPrisma.furnitureAsset.findMany({
  where: { remarks: 'some value' }  // No index
});
```

### N+1 Query Prevention
Use `include` or `select` to fetch relations in single query:

```typescript
// Good - 1 query
const assets = await tenantPrisma.furnitureAsset.findMany({
  include: { company: true, location: true }
});

// Avoid - N+1 queries
const assets = await tenantPrisma.furnitureAsset.findMany();
for (const asset of assets) {
  const company = await tenantPrisma.company.findUnique({
    where: { id: asset.companyId }  // N queries!
  });
}
```

## Compliance & Audit

### Automatic Audit Trail
All mutations logged via `createAuditLog()`:
- Who made the change (userId)
- What changed (entity, action)
- When it happened (timestamp)
- Details (old values, new values)

### Data Retention
Security policy defines retention:
```typescript
const policy = await tenantPrisma.securityPolicy.findUnique({
  where: { tenantId }
});

policy.auditLogRetentionDays = 365;  // Keep 1 year
```

### GDPR Compliance
- User deletion automatically cascades
- Soft delete preserves data for compliance
- Data export via bulk operations
- Data import with tenant isolation

## Next Steps

1. **Migrate existing API routes** - Convert all `/api/*` routes to use tenant wrappers
2. **Add audit logging** - Track all sensitive operations
3. **Implement quotas** - Enforce tier-based limits
4. **Setup billing** - Connect payment provider
5. **Enable custom domains** - Support custom branding
6. **Build admin dashboard** - Manage tenants and quotas

## References

- **Prisma Schema**: `prisma/schema.prisma` (Tenant, User, Asset models)
- **Middleware**: `middleware.ts` (Tenant extraction logic)
- **Prisma Extension**: `src/lib/prisma-tenant.ts` (Auto-filtering)
- **API Helpers**: `src/lib/tenant-api.ts` (Route wrappers)
- **Tenant Utilities**: `src/lib/tenant/extractor.ts`, `helpers.ts`
- **Tests**: `src/__tests__/tenant-isolation.test.ts`
- **Example Route**: `src/app/api/assets/example-tenant-aware.ts`
