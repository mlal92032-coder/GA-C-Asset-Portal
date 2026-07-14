# PHASE 4: ENTERPRISE SCALING - START HERE

**Date**: 2026-07-14  
**Phase Status**: ACTIVATION IN PROGRESS  
**Current Task**: 4.1 - Multi-Tenancy Architecture  

---

## WHAT IS PHASE 4?

Phase 4 transforms the asset management system from **single-tenant to enterprise-grade multi-tenant architecture** capable of supporting:

- ✅ 100,000+ concurrent users
- ✅ Multiple independent organizations (tenants)
- ✅ Complete data isolation
- ✅ Usage-based billing
- ✅ 99.99% uptime (4 nines)
- ✅ Global CDN distribution
- ✅ Microservices architecture
- ✅ Advanced ML/AI features

---

## PHASE 4 TASKS (30+ hours)

| # | Task | Hours | Status | Starts |
|---|------|-------|--------|--------|
| 4.1 | Multi-Tenancy Architecture | 6 | 🔄 IN PROGRESS | Now |
| 4.2 | Microservices Decomposition | 8 | ⏹️ Pending | After 4.1 |
| 4.3 | Global CDN & Caching | 5 | ⏹️ Pending | Week 2 |
| 4.4 | Advanced ML/AI Features | 6 | ⏹️ Pending | Week 2 |
| 4.5 | High-Availability & DR | 5 | ⏹️ Pending | Week 3 |
| 4.6 | Advanced Compliance | 5 | ⏹️ Pending | Week 3 |
| 4.7 | Monitoring & Analytics | 5 | ⏹️ Pending | Week 3 |
| 4.8 | Performance Optimization | 2 | ⏹️ Optional | Week 4 |

---

## TASK 4.1: MULTI-TENANCY ARCHITECTURE

### Overview

Convert from single-tenant (1 organization) to multi-tenant (many organizations) while maintaining:
- Shared infrastructure (1 database, 1 application)
- Complete data isolation (Tenant A cannot see Tenant B's data)
- Per-tenant configuration (branding, features, settings)
- Usage tracking & billing (track usage per tenant)

### Architecture

```
┌──────────────────────────────────────────┐
│   3 Customers (Tenants)                  │
│   ┌────────┐  ┌────────┐  ┌────────┐    │
│   │ Acme   │  │ TechCo │  │ Global │    │
│   │ Inc    │  │        │  │ Corp   │    │
│   └───┬────┘  └───┬────┘  └───┬────┘    │
└───────┼──────────┼──────────┼──────────┘
        │          │          │
        └──────┬───┴──────────┘
               │
        ┌──────▼─────────────┐
        │ Tenant Middleware  │
        │ Extract TenantId   │
        │ Load Config        │
        │ Inject Context     │
        └──────┬─────────────┘
               │
        ┌──────▼─────────────────────┐
        │ Shared PostgreSQL Database │
        │ WITH ROW-LEVEL SECURITY    │
        │ - 30+ tables               │
        │ - All have tenantId        │
        │ - Complete isolation       │
        └────────────────────────────┘
```

### Key Components

1. **Database Changes**
   - Add Tenant model
   - Add tenantId to all tables (30+)
   - Create RLS policies
   - Add indexes for performance

2. **Middleware**
   - Extract tenant from: header, subdomain, or session
   - Load tenant configuration
   - Inject context into all requests

3. **API Updates**
   - Add tenant filtering to all routes
   - Check quotas before operations
   - Track usage for billing

4. **Configuration**
   - Per-tenant branding (logo, colors)
   - Per-tenant features (enable/disable)
   - Per-tenant quotas (storage, users, assets)

5. **Billing**
   - Track API calls per tenant
   - Track storage usage per tenant
   - Calculate monthly charges

---

## QUICK IMPLEMENTATION PLAN

### Hour 1-2: Database Schema
- [x] Add Tenant, UsageMetric, BillingRecord models
- [x] Add tenantId to User model
- [ ] Add tenantId to 25+ other models
- [ ] Create migration
- [ ] Test on staging DB

### Hour 2-3: Middleware & Extraction
- [x] Create tenant types (src/types/tenant.ts)
- [x] Create extractor (src/lib/tenant/extractor.ts)
- [x] Create helpers (src/lib/tenant/helpers.ts)
- [ ] Create middleware (src/middleware/tenant-middleware.ts)
- [ ] Update main middleware (src/middleware.ts)

### Hour 3-4: Configuration & Features
- [ ] Create tenant config service
- [ ] Create configuration API
- [ ] Implement per-tenant settings
- [ ] Add feature flags

### Hour 4-5: Usage Metering
- [ ] Create metering service
- [ ] Track API calls
- [ ] Track storage usage
- [ ] Enforce quotas

### Hour 5-6: API Updates & Testing
- [ ] Update critical API routes
- [ ] Add tenant filtering everywhere
- [ ] Write tests
- [ ] Performance testing
- [ ] Debugging & fixes

---

## FILES CREATED SO FAR

✅ **Documentation**:
- `PHASE_4_TASK_4_1_MULTI_TENANCY.md` - Detailed architecture (100+ pages)
- `SCHEMA_UPDATE_GUIDE.md` - Exact schema changes needed
- `PHASE_4_IMPLEMENTATION_CHECKLIST.md` - Progress tracking
- `PHASE_4_IMPLEMENTATION_ROADMAP.md` - Implementation guide
- `PHASE_4_START_HERE.md` - This file!

✅ **Code**:
- `src/types/tenant.ts` - Type definitions
- `src/lib/tenant/extractor.ts` - Tenant extraction logic
- `src/lib/tenant/helpers.ts` - Helper functions

⏳ **Still to Create**:
- Update `prisma/schema.prisma` (add all models)
- Create migration
- `src/middleware/tenant-middleware.ts`
- `src/services/tenant-config.service.ts`
- `src/services/usage-metering.service.ts`
- API routes
- Tests

---

## HOW TO CONTINUE

### Step 1: Update Prisma Schema

Use the detailed guide in `SCHEMA_UPDATE_GUIDE.md` to update:
- `prisma/schema.prisma`

Add tenantId to:
- CustomRole ✅
- Company, Manufacturer, Location
- FurnitureAsset, ElectronicAsset, VehicleAsset
- AssetCheckout, Maintenance
- All other models...

### Step 2: Generate Migration

```bash
# From project root
npx prisma migrate dev --name add_multi_tenancy
```

This will:
1. Create a migration file in `prisma/migrations/`
2. Apply changes to your database
3. Update Prisma client types

### Step 3: Create Tenant Middleware

Create `src/middleware/tenant-middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { extractTenantIdOrSlug, getTenantFromDatabase } from '@/lib/tenant/extractor';
import { TenantRequest } from '@/types/tenant';

export async function tenantMiddleware(req: TenantRequest): Promise<NextResponse> {
  // Extract tenant ID from request
  const tenantIdOrSlug = await extractTenantIdOrSlug();
  if (!tenantIdOrSlug) return NextResponse.next();

  // Fetch tenant from database
  const tenant = await getTenantFromDatabase(tenantIdOrSlug);
  if (!tenant) {
    return NextResponse.json(
      { error: 'Tenant not found' },
      { status: 404 }
    );
  }

  // Store tenant in request
  (req as TenantRequest).tenant = tenant;
  (req as TenantRequest).tenantId = tenant.tenantId;

  // Add to response headers
  const response = NextResponse.next();
  response.headers.set('X-Tenant-Id', tenant.tenantId);
  response.headers.set('X-Tenant-Name', tenant.tenantName);

  return response;
}
```

### Step 4: Update Main Middleware

Update `src/middleware.ts` to use tenant middleware:

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { tenantMiddleware } from '@/middleware/tenant-middleware';

export default async function middleware(req) {
  // 1. Handle tenant context
  const tenantResponse = await tenantMiddleware(req);
  if (tenantResponse.status !== 200) return tenantResponse;

  // 2. Handle auth
  return withAuth(
    function authMiddleware(req) {
      // ... existing auth logic ...
    }
  )(req);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/admin/:path*',
    '/assets/:path*',
  ],
};
```

### Step 5: Update API Routes

For each route in `src/app/api/`, update like this:

```typescript
// BEFORE
export async function GET(req: NextRequest) {
  const items = await prisma.item.findMany();
  return NextResponse.json(items);
}

// AFTER
import { requireTenant, buildTenantQuery } from '@/lib/tenant/helpers';
import { TenantRequest } from '@/types/tenant';

export async function GET(req: TenantRequest) {
  const tenantId = await requireTenant(req);

  const items = await prisma.item.findMany(
    buildTenantQuery(tenantId, {
      select: { id: true, name: true } // never tenantId
    })
  );

  return NextResponse.json(items);
}
```

---

## TESTING LOCALLY

### Test Tenant Extraction

```bash
# Test with header
curl http://localhost:3000/api/test \
  -H "X-Tenant-Id: tenant-1"

# Test with subdomain (if you set up local DNS)
curl http://acme-inc.app.local:3000/api/test
```

### Test Isolation

```typescript
// In tests/multi-tenancy.test.ts
describe('Tenant Isolation', () => {
  it('User A cannot see Tenant B data', async () => {
    // Create two tenants
    const tenant1 = await createTenant('test-1');
    const tenant2 = await createTenant('test-2');

    // Create user in tenant 2
    const asset = await createAsset(tenant2);

    // Query as tenant 1
    const items = await getAssets(tenant1Token);

    // Should not see asset from tenant 2
    expect(items).not.toContainEqual(asset);
  });
});
```

---

## UNDERSTANDING THE FLOW

### 1. User Makes Request

```
User from Acme Inc:
GET /api/assets
Headers: { "X-Tenant-Id": "acme-inc" }
```

### 2. Middleware Extracts Tenant

```
tenantMiddleware runs:
1. See "acme-inc" in X-Tenant-Id header
2. Look up tenant in database
3. Load tenant config: name="Acme Inc", tier="PROFESSIONAL", etc.
4. Add to request: req.tenantId = "acme-inc-tenant-id"
5. Set response headers: X-Tenant-Id: acme-inc-tenant-id
```

### 3. API Route Filters by Tenant

```
Handler runs:
1. Get tenantId from request
2. Query: SELECT * FROM furniture_assets 
          WHERE tenant_id = 'acme-inc-tenant-id'
3. Return only Acme's assets
4. Never return tenantId to client
```

### 4. Database RLS Enforces Isolation

```
PostgreSQL RLS Policy:
CREATE POLICY "assets_tenant_isolation" ON furniture_assets
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

Even if a user tries to query other tenant's data:
SELECT * FROM furniture_assets WHERE tenant_id = 'other-tenant-id'
→ Returns empty (RLS blocks it)
```

---

## COMMON QUESTIONS

**Q: What happens to existing data?**
A: All existing data gets assigned to a "default" tenant. You can then migrate users to their own tenants.

**Q: Can a user belong to multiple tenants?**
A: Yes! A user can have separate accounts in different tenants. This is handled at login.

**Q: How does billing work?**
A: We track usage (API calls, storage, users) per tenant monthly. Each tenant gets billed based on their tier + overages.

**Q: What if RLS fails?**
A: Our code filters by tenantId anyway (defense in depth). RLS is a second layer of protection.

**Q: Can I migrate from single-tenant to multi-tenant without downtime?**
A: Yes! We do this gradually:
1. Deploy code with both old and new paths
2. Gradually route new requests through multi-tenant code
3. Keep old code as fallback
4. Once stable, remove old code

---

## SUPPORT & DEBUGGING

### Check Tenant Extraction

```typescript
// In API route
console.log('Tenant from request:', req.tenantId);
console.log('Tenant context:', req.tenant);
```

### Check Query Filtering

```typescript
// Run this SQL to verify tenantId is being used
SELECT * FROM furniture_assets WHERE tenant_id = 'YOUR-TENANT-ID' LIMIT 5;

// This should return empty (data isolation working)
SELECT * FROM furniture_assets WHERE tenant_id = 'OTHER-TENANT-ID' LIMIT 5;
```

### Check Middleware Logs

```bash
# In development
npm run dev

# Look for tenant extraction logs
[tenant-middleware] Extracted tenant: acme-inc-tenant-id
```

---

## ESTIMATED TIMELINE

- **Hour 1-2**: Database setup (schema + migration)
- **Hour 2-3**: Middleware (extraction + context)
- **Hour 3-4**: Configuration (settings + features)
- **Hour 4-5**: Metering (tracking + billing)
- **Hour 5-6**: API updates + testing

**Total: 6 hours** (can be done in 1-2 working days)

---

## BEFORE YOU START

✅ Verify you have:
- [ ] PostgreSQL database (for RLS support)
- [ ] Prisma CLI installed: `npm list prisma`
- [ ] Node.js 18+: `node --version`
- [ ] Git configured: `git config --list | grep user`
- [ ] Development database backup: `pg_dump asset_management > backup.sql`

✅ Read through:
- [ ] PHASE_4_TASK_4_1_MULTI_TENANCY.md
- [ ] SCHEMA_UPDATE_GUIDE.md
- [ ] This file (PHASE_4_START_HERE.md)

---

## WHAT HAPPENS AFTER 4.1?

Once multi-tenancy is stable:

**Task 4.2 - Microservices** (8 hours)
- Split monolith into 6 services
- Asset Service, Checkout Service, Maintenance Service, etc.
- Implement API Gateway for routing

**Task 4.3 - CDN & Caching** (5 hours)
- Global CDN for static assets
- Redis caching layer
- Database read replicas

**Task 4.4 - ML/AI** (6 hours)
- Predictive maintenance
- Anomaly detection
- Smart recommendations

And so on...

---

## LET'S BUILD THIS! 🚀

You're about to transform this system into an enterprise-grade platform.

The foundation (Task 4.1) enables everything that comes next.

**Next Step**: Start with `SCHEMA_UPDATE_GUIDE.md` and update `prisma/schema.prisma`

Questions? Check the detailed docs:
- Architecture: `PHASE_4_TASK_4_1_MULTI_TENANCY.md`
- Schema: `SCHEMA_UPDATE_GUIDE.md`
- Progress: `PHASE_4_IMPLEMENTATION_CHECKLIST.md`
- Implementation: `PHASE_4_IMPLEMENTATION_ROADMAP.md`

**Good luck!** 🎯
