# PHASE 4 - TASK 4.1: IMPLEMENTATION ROADMAP

**Quick Links**:
- [Multi-Tenancy Architecture](./PHASE_4_TASK_4_1_MULTI_TENANCY.md)
- [Schema Update Guide](./SCHEMA_UPDATE_GUIDE.md)
- [Implementation Checklist](./PHASE_4_IMPLEMENTATION_CHECKLIST.md)

---

## EXECUTIVE SUMMARY

PHASE 4 transforms the asset management system from single-tenant to **enterprise-grade multi-tenant architecture** supporting 100,000+ concurrent users across multiple organizations.

**Task 4.1 (6 hours)** establishes the multi-tenancy foundation:
1. Database isolation (tenantId on all tables)
2. Tenant context middleware
3. Configuration system
4. Usage metering & billing

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────┐
│   MULTIPLE TENANTS (CUSTOMERS)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │  Tenant  │ │  Tenant  │ │  Tenant  ││
│  │  Acme    │ │  TechCo  │ │  Global  ││
│  │  Inc     │ │          │ │  Corp    ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘│
└───────┼────────────┼────────────┼──────┘
        │            │            │
   ┌────▼────────────▼────────────▼─────┐
   │   API Gateway / Load Balancer       │
   │   - Request Routing                 │
   │   - TenantId Extraction             │
   │   - Rate Limiting                   │
   │   - Request Validation              │
   └────┬─────────────────────────────────┘
        │
   ┌────▼──────────────────────────────────┐
   │  Tenant Context Middleware            │
   │  - Extract TenantId                   │
   │  - Load Tenant Configuration          │
   │  - Validate Tenant Status             │
   │  - Inject Context into Request        │
   │  - Set Response Headers               │
   └────┬──────────────────────────────────┘
        │
   ┌────▼──────────────────────────────────┐
   │  Request Handler (API Route)          │
   │  - Verify User in Tenant              │
   │  - Check Permissions                  │
   │  - Execute Business Logic             │
   │  - Track Usage                        │
   │  - Audit Logging                      │
   └────┬──────────────────────────────────┘
        │
   ┌────▼──────────────────────────────────┐
   │  Database Access Layer                │
   │  - buildTenantQuery() helpers         │
   │  - Auto-inject tenantId filter        │
   │  - Row-Level Security (RLS)           │
   └────┬──────────────────────────────────┘
        │
   ┌────▼──────────────────────────────────┐
   │  Shared PostgreSQL Database           │
   │  WITH ROW-LEVEL SECURITY (RLS)        │
   │                                        │
   │  Tables with tenantId:                │
   │  - users (25 tenant users)            │
   │  - assets (100k+ assets)              │
   │  - checkouts (50k active)             │
   │  - ... (30+ tables)                   │
   │                                        │
   │  Indexed on:                          │
   │  - (tenantId, status)                 │
   │  - (tenantId, createdAt)              │
   │  - (tenantId, id)                     │
   └────────────────────────────────────────┘
```

---

## IMPLEMENTATION PHASES

### PHASE 4.1A: Database Foundation (2 hours)

**Goal**: Add tenant tables and update schema

**Deliverables**:
1. Tenant model created
2. UsageMetric model created
3. BillingRecord model created
4. tenantId added to User model (DONE ✅)
5. tenantId added to CustomRole, Company, Manufacturer, Location
6. tenantId added to all asset models
7. tenantId added to operation models (Checkout, Maintenance, etc.)
8. tenantId added to system models (Audit, Settings, etc.)

**Files to Update**:
- `prisma/schema.prisma` - Add all models and fields
- Create migration script

**Success Criteria**:
- [ ] Schema compiles without errors
- [ ] Migration generated successfully
- [ ] All indexes created
- [ ] Unique constraints work per tenant

---

### PHASE 4.1B: Middleware & Extraction (1.5 hours)

**Goal**: Extract tenant context from requests

**Deliverables**:
1. `src/types/tenant.ts` - Type definitions ✅ DONE
2. `src/lib/tenant/extractor.ts` - Extraction logic ✅ DONE
3. `src/lib/tenant/helpers.ts` - Helper functions ✅ DONE
4. `src/middleware/tenant-middleware.ts` - Middleware
5. Update `src/middleware.ts` - Integrate middleware

**Extraction Priority**:
1. X-Tenant-Id header (API calls)
2. X-Tenant-Slug header (fallback)
3. Subdomain extraction (app.acme-inc.com)
4. Session JWT (from NextAuth)

**Files to Create**:
```
src/
├── types/
│   └── tenant.ts ✅
├── lib/
│   ├── tenant/
│   │   ├── extractor.ts ✅
│   │   └── helpers.ts ✅
│   └── api/
│       └── tenant-helpers.ts
└── middleware/
    └── tenant-middleware.ts
```

**Success Criteria**:
- [ ] Tenant extracted from all sources
- [ ] Context injected into requests
- [ ] Response headers set correctly
- [ ] <1ms extraction time
- [ ] No errors on missing tenant

---

### PHASE 4.1C: Configuration & Features (1.5 hours)

**Goal**: Per-tenant settings and features

**Deliverables**:
1. `src/services/tenant-config.service.ts` - Config service
2. `src/app/api/tenants/[id]/config/route.ts` - Config API
3. Per-tenant branding
4. Per-tenant feature flags
5. Per-tenant quota checking

**Config Areas**:
- Branding (logo, colors, name)
- Features (enable/disable)
- Quotas (storage, users, assets, API calls)
- Notifications (email, SMS, Slack)
- Settings (timezone, language, currency)

**Files to Create**:
```
src/
├── services/
│   ├── tenant-config.service.ts
│   └── billing.service.ts
├── app/
│   └── api/
│       └── tenants/
│           └── [id]/
│               └── config/
│                   └── route.ts
└── hooks/
    └── useTenantConfig.ts
```

**Success Criteria**:
- [ ] Branding endpoints working
- [ ] Feature flags retrievable
- [ ] Quotas enforced
- [ ] Settings cached for performance
- [ ] Billing calculation working

---

### PHASE 4.1D: Usage Metering (1 hour)

**Goal**: Track usage for billing

**Deliverables**:
1. `src/services/usage-metering.service.ts` - Metering logic
2. Middleware to track API calls
3. Storage usage tracking
4. User count tracking
5. Quota alerts

**Metrics Tracked**:
- API calls per day
- Storage usage (GB)
- User count
- Asset count
- Active checkouts

**Files to Create**:
```
src/
└── services/
    ├── usage-metering.service.ts
    ├── quota-enforcer.service.ts
    └── billing.service.ts
```

**Success Criteria**:
- [ ] API calls tracked per tenant
- [ ] Storage usage calculated
- [ ] Quotas enforced in requests
- [ ] Billing records generated
- [ ] Usage reports available

---

### PHASE 4.1E: API Route Updates (1.5 hours)

**Goal**: Add tenant filtering to all routes

**Priority Routes** (update first):
1. `/api/auth/[...nextauth]` - Add tenantId to session
2. `/api/assets/*` - Filter by tenant
3. `/api/admin/*` - Admin operations per tenant
4. `/api/users/*` - User management per tenant
5. `/api/reports/*` - Reports per tenant

**Pattern for Each Route**:
```typescript
export async function GET(req: TenantRequest) {
  // 1. Extract tenantId
  const tenantId = await requireTenant(req);
  
  // 2. Verify user in tenant
  const userId = req.user?.id;
  if (!await verifyUserInTenant(userId, tenantId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // 3. Build query with tenant filter
  const items = await prisma.item.findMany(
    buildTenantQuery(tenantId, {
      where: { /* ... */ },
      select: { /* exclude tenantId */ }
    })
  );
  
  // 4. Return response
  return NextResponse.json(items);
}
```

**Files to Update**:
- All files in `src/app/api/**/*.ts` (~50+ files)

**Success Criteria**:
- [ ] All routes filter by tenantId
- [ ] No cross-tenant data leakage
- [ ] Performance maintained (<100ms)
- [ ] Tests pass

---

## CODE EXAMPLES

### Extract Tenant Context

```typescript
// In middleware or API route
import { extractTenantIdOrSlug, getTenantFromDatabase } from '@/lib/tenant/extractor';

const tenantIdOrSlug = await extractTenantIdOrSlug();
if (!tenantIdOrSlug) {
  return NextResponse.json({ error: 'Tenant required' }, { status: 400 });
}

const tenant = await getTenantFromDatabase(tenantIdOrSlug);
if (!tenant) {
  return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
}

// tenant is now a TenantContext object
console.log(tenant.tenantId, tenant.tier, tenant.features);
```

### Build Tenant Query

```typescript
import { buildTenantQuery } from '@/lib/tenant/helpers';

// Add tenantId filter automatically
const assets = await prisma.furnitureAsset.findMany(
  buildTenantQuery(tenantId, {
    where: {
      status: 'IN_USE',
      condition: 'GOOD'
    },
    select: {
      id: true,
      assetName: true,
      status: true
      // tenantId is automatically EXCLUDED
    }
  })
);
```

### Check Quotas

```typescript
import { TenantConfigService } from '@/services/tenant-config.service';

const configService = new TenantConfigService();

const canAddUser = await configService.checkQuota(tenantId, 'users');
if (!canAddUser) {
  return NextResponse.json(
    { error: 'User quota exceeded' },
    { status: 429 }
  );
}

// Add user...
```

### Track Usage

```typescript
import { UsageMeteringService } from '@/services/usage-metering.service';

const metering = new UsageMeteringService();

// Track API call
await metering.trackAPICall(tenantId, '/api/assets');

// Track storage
await metering.trackStorageUsage(tenantId, fileSize, 'ADD');

// Get usage report
const report = await metering.getUsageReport(tenantId);
console.log(`Storage: ${report.storage.used}GB / ${report.storage.limit}GB`);
```

---

## TESTING STRATEGY

### Unit Tests

```typescript
describe('Tenant Extraction', () => {
  it('extracts from X-Tenant-Id header', async () => {
    const tenantId = await extractTenantIdOrSlug(
      { headers: { 'x-tenant-id': 'acme-inc' } }
    );
    expect(tenantId).toBe('acme-inc');
  });

  it('extracts from subdomain', async () => {
    const tenantId = await extractTenantIdOrSlug(
      { headers: { 'host': 'acme-inc.app.local' } }
    );
    expect(tenantId).toBe('acme-inc');
  });

  it('returns null if tenant not found', async () => {
    const tenant = await getTenantFromDatabase('nonexistent');
    expect(tenant).toBeNull();
  });
});
```

### Integration Tests

```typescript
describe('Tenant Isolation', () => {
  let tenant1: string;
  let tenant2: string;

  beforeAll(async () => {
    tenant1 = await createTestTenant('test-tenant-1');
    tenant2 = await createTestTenant('test-tenant-2');
  });

  it('User A cannot see Tenant B data', async () => {
    const asset = await createAsset(tenant2);
    
    const response = await fetchAssets(tenant1Token);
    
    expect(response.assets).not.toContainEqual(
      expect.objectContaining({ id: asset.id })
    );
  });

  it('Quotas enforced per tenant', async () => {
    await setQuota(tenant1, 'users', 2);
    
    await createUser(tenant1);
    await createUser(tenant1);
    
    expect(createUser(tenant1))
      .rejects.toThrow('Quota exceeded');
  });

  it('Usage tracked separately', async () => {
    await trackAPICall(tenant1, '/api/assets');
    await trackAPICall(tenant2, '/api/assets');
    
    const metrics1 = await getUsageMetrics(tenant1);
    const metrics2 = await getUsageMetrics(tenant2);
    
    expect(metrics1.apiCalls.used).toBe(1);
    expect(metrics2.apiCalls.used).toBe(1);
  });
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  it('tenant extraction < 1ms', async () => {
    const start = performance.now();
    await extractTenantIdOrSlug();
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(1);
  });

  it('query with tenant filter < 100ms', async () => {
    const start = performance.now();
    await prisma.furnitureAsset.findMany(
      buildTenantQuery(tenantId, { take: 100 })
    );
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(100);
  });
});
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment (Staging)

- [ ] Schema changes tested on staging DB
- [ ] Migration runs without errors
- [ ] Data migrated to default tenant
- [ ] RLS policies created and tested
- [ ] Middleware works on staging
- [ ] API routes return correct tenant data
- [ ] Quotas enforced correctly
- [ ] Usage metering working
- [ ] Performance meets targets
- [ ] All tests passing

### Production Deployment

- [ ] Backup production database
- [ ] Schedule maintenance window (if needed)
- [ ] Deploy code changes
- [ ] Run migration
- [ ] Verify data integrity
- [ ] Check middleware logs
- [ ] Monitor error rates
- [ ] Verify cross-tenant isolation
- [ ] Test with real users
- [ ] Rollback plan ready

### Post-Deployment

- [ ] Monitor for 24 hours
- [ ] Check slow query logs
- [ ] Review error rates
- [ ] Verify billing calculations
- [ ] Update documentation
- [ ] Train team on multi-tenancy
- [ ] Plan next phase (4.2 Microservices)

---

## ROLLBACK PROCEDURE

If critical issues occur:

```bash
# 1. Restore from backup
psql asset_management < backup_[timestamp].sql

# 2. Revert code changes
git revert [commit-hash]

# 3. Redeploy old version
npm run build && npm start

# 4. Verify system
# - Check all endpoints
# - Review error logs
# - Contact affected users
```

---

## METRICS & MONITORING

### Key Metrics to Track

**Performance**:
- Tenant extraction time (target: <1ms)
- Query execution time (target: <100ms)
- Middleware overhead (target: <5ms)

**Usage**:
- API calls per tenant per day
- Storage usage per tenant
- Active users per tenant
- Error rate per tenant

**Billing**:
- Revenue per tenant per month
- Quota utilization per tier
- Overages per tenant

### Alerts to Set Up

- [ ] Tenant extraction > 5ms
- [ ] Query > 500ms
- [ ] API error rate > 1%
- [ ] Storage quota exceeded
- [ ] User quota exceeded
- [ ] API quota exceeded

---

## DOCUMENTATION NEEDED

After implementation:

1. **Tenant Setup Guide** - How to create new tenants
2. **Configuration Guide** - How to configure tenant features
3. **API Guide** - How to call multi-tenant APIs
4. **Monitoring Guide** - How to monitor usage per tenant
5. **Troubleshooting Guide** - Common issues and solutions
6. **Billing Guide** - How billing works

---

## SUCCESS CRITERIA

✅ **Database**
- All 30+ tables have tenantId
- Indexes created for performance
- RLS policies deployed
- Data integrity maintained

✅ **Code**
- Middleware working on all routes
- All APIs updated with tenant filtering
- Config service operational
- Metering tracking usage
- No cross-tenant data leakage

✅ **Performance**
- <1ms tenant extraction
- <100ms query execution
- <5ms middleware overhead
- No performance regression

✅ **Security**
- Complete tenant isolation
- RLS policies enforced
- Quotas working
- Audit logs tracking

✅ **Operations**
- Monitoring configured
- Alerts set up
- Documentation complete
- Team trained

---

## NEXT PHASE: 4.2 MICROSERVICES

Once multi-tenancy is stable (24+ hours monitoring):

1. Decompose into 6 services:
   - Asset Service
   - Checkout Service
   - Maintenance Service
   - Analytics Service
   - Notification Service
   - Reporting Service

2. Implement API Gateway
3. Set up service-to-service communication
4. Deploy independently

---

## RESOURCES & REFERENCES

**Prisma Multi-Tenancy**:
- https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/field-filtering-and-search

**Row-Level Security (PostgreSQL)**:
- https://www.postgresql.org/docs/current/ddl-rowsecurity.html

**Next.js Middleware**:
- https://nextjs.org/docs/advanced-features/middleware

**NextAuth.js Session**:
- https://next-auth.js.org/getting-started/example

---

**Timeline**: 6 hours total (can be done in 2 working days)
**Estimated Complexity**: High
**Risk Level**: Medium (database migration is the main risk)
**Contingency Time**: 2 hours (for debugging/testing)

Ready to begin implementation!
