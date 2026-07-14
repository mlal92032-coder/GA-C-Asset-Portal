# Multi-Tenancy Quick Reference

## Quick Start (30 seconds)

### Convert Any API Route (3 lines)

**Before:**
```typescript
export async function GET(request: NextRequest) {
  const assets = await prisma.furnitureAsset.findMany();
  return NextResponse.json(assets);
}
```

**After:**
```typescript
import { withAuthProtection } from '@/lib/tenant-api';

export async function GET(request: NextRequest) {
  return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
    const assets = await tenantPrisma.furnitureAsset.findMany();
    return NextResponse.json(assets);
  });
}
```

That's it! Tenant filtering is now automatic.

---

## Wrapper Functions

### 1. Basic Tenant Verification
```typescript
return withTenantProtection(request, async (tenantId, tenantPrisma) => {
  // Can access tenantId and tenantPrisma
  const assets = await tenantPrisma.furnitureAsset.findMany();
  return NextResponse.json(assets);
});
```

### 2. Authenticated User Verification
```typescript
return withAuthProtection(request, async (tenantId, userId, tenantPrisma) => {
  // Verifies user is logged in and belongs to tenant
  const user = await tenantPrisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json(user);
});
```

### 3. Admin-Only Routes
```typescript
return withAdminProtection(request, async (tenantId, userId, tenantPrisma) => {
  // Verifies user is SUPER_ADMIN
  const users = await tenantPrisma.user.findMany();
  return NextResponse.json(users);
});
```

---

## Common Patterns

### Pagination
```typescript
import { getPaginationParams, buildPaginatedResponse } from '@/lib/tenant-api';

const { page, pageSize, skip } = getPaginationParams(request, 25);

const [assets, total] = await Promise.all([
  tenantPrisma.furnitureAsset.findMany({ skip, take: pageSize }),
  tenantPrisma.furnitureAsset.count()
]);

return NextResponse.json(buildPaginatedResponse(assets, total, page, pageSize));
```

### Filtering
```typescript
import { getFilterParams } from '@/lib/tenant-api';

const { search, status, sortBy, sortOrder } = getFilterParams(request);

const assets = await tenantPrisma.furnitureAsset.findMany({
  where: {
    ...(search && { assetName: { contains: search } }),
    ...(status && { status })
  },
  orderBy: { [sortBy]: sortOrder }
});
```

### Audit Logging
```typescript
import { createAuditLog } from '@/lib/tenant-api';

const asset = await tenantPrisma.furnitureAsset.create({ data: body });

await createAuditLog(
  tenantPrisma,
  tenantId,
  userId,
  'CREATE',
  'FURNITURE_ASSET',
  asset.id,
  { name: asset.assetName }
);
```

### Error Handling
```typescript
try {
  const asset = await tenantPrisma.furnitureAsset.update({
    where: { id: assetId },
    data: body
  });
  return NextResponse.json(asset);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Already exists' }, { status: 409 });
    }
  }
  return NextResponse.json({ error: 'Internal error' }, { status: 500 });
}
```

---

## Key Points to Remember

### ✅ DO's

- ✅ Use `tenantPrisma` instead of `prisma`
- ✅ Wrap API handlers with protection functions
- ✅ Log mutations with `createAuditLog()`
- ✅ Use pagination for list endpoints
- ✅ Handle errors with appropriate status codes
- ✅ Store tenant ID from request/user
- ✅ Validate user role before sensitive operations

### ❌ DON'Ts

- ❌ Don't use global `prisma` in routes
- ❌ Don't manually add `tenantId` to where clauses (it's automatic)
- ❌ Don't assume user belongs to tenant (verify with wrapper)
- ❌ Don't leak tenantId in response bodies
- ❌ Don't skip audit logging for mutations
- ❌ Don't forget to handle pagination params
- ❌ Don't query all records without filtering

---

## Tenant Identification

### How Tenant is Extracted (Priority Order)

1. **X-Tenant-ID Header** (for API calls)
   ```bash
   curl -H "X-Tenant-ID: c123abc..." https://api.example.com/api/assets
   ```

2. **Subdomain** (for browser)
   ```
   https://acme-inc.app.example.com/dashboard
   # "acme-inc" is extracted
   ```

3. **Custom Domain** (for custom DNS)
   ```
   https://assets.acmeinc.com/dashboard
   # Mapped to tenant via domain lookup
   ```

4. **JWT Session** (fallback)
   ```javascript
   // Session contains { tenantId, userId }
   ```

---

## Quota Checking

### Check Quotas Before Creating

```typescript
import { checkTenantQuotas } from '@/lib/prisma-tenant';

const quotas = await checkTenantQuotas(prisma, tenantId);

if (quotas.users.exceeded) {
  return NextResponse.json(
    { error: 'User quota exceeded', quotas },
    { status: 429 }
  );
}

const user = await tenantPrisma.user.create({ data: {} });
```

### Quota Object Structure

```typescript
{
  storage: {
    usage: 2.5,        // GB
    limit: 10,         // GB
    exceeded: false,
    percentage: 25     // %
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

---

## Testing

### Run Tests
```bash
npm test -- tenant-isolation.test.ts
```

### Test Your Route Manually
```bash
# Get tenant ID
TENANT_ID=$(npx prisma db execute --stdin <<< "SELECT id FROM tenants LIMIT 1")

# Test with header
curl -H "X-Tenant-ID: $TENANT_ID" http://localhost:3000/api/assets

# Test without tenant (should fail)
curl http://localhost:3000/api/assets
```

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| "Tenant context missing" | Is X-Tenant-ID header set? Is user logged in? |
| "Record not found" | Does record belong to current tenant? |
| "Unique constraint failed" | Does duplicate exist in tenant? |
| "Tenant not active" | Is tenant status "ACTIVE"? |
| Still seeing other tenant's data | Are you using `tenantPrisma`? |

---

## Important Files

- **Main Wrapper:** `src/lib/tenant-api.ts`
- **Prisma Extension:** `src/lib/prisma-tenant.ts`
- **Middleware:** `middleware.ts`
- **Examples:** `src/app/api/assets/example-tenant-aware.ts`
- **Full Guide:** `MULTI_TENANCY_IMPLEMENTATION.md`
- **Migration Guide:** `PHASE_4_1_MIGRATION_CHECKLIST.md`

---

## Key Security Facts

1. **Tenant filtering is automatic** - Even if you forget to check, the Prisma extension adds it
2. **Cross-tenant access is impossible** - All queries include tenantId in where clause
3. **Same email allowed in different tenants** - Unique constraints are tenant-aware
4. **All operations are logged** - Use `createAuditLog()` for audit trail
5. **Quotas are enforced** - Check with `checkTenantQuotas()` before creating

---

## Next Steps

1. **Identify routes to migrate** - See `PHASE_4_1_MIGRATION_CHECKLIST.md`
2. **Start with high-traffic routes** - Priority 1 list
3. **Add tests** - Use example tests as template
4. **Deploy gradually** - Week-by-week rollout
5. **Monitor in production** - Watch for quota breaches, auth errors

---

**Need more details?** See:
- Architecture: `MULTI_TENANCY_IMPLEMENTATION.md`
- Migration: `PHASE_4_1_MIGRATION_CHECKLIST.md`
- Examples: `src/app/api/assets/example-tenant-aware.ts`
