# PHASE 4 - TASK 4.1: Multi-Tenancy Architecture

**Duration**: 6 hours  
**Start Date**: 2026-07-14  
**Status**: IN PROGRESS

---

## OBJECTIVE

Transform the asset management system from single-tenant to **true multi-tenancy** with complete tenant isolation while maintaining shared infrastructure.

**Success Criteria**:
- ✅ All tables have `tenantId` column
- ✅ Tenant context auto-injected in all queries
- ✅ Zero data leakage between tenants
- ✅ Per-tenant configurations working
- ✅ Usage metering functional
- ✅ <1ms tenant context lookup
- ✅ No performance impact vs single-tenant

---

## ARCHITECTURE DECISIONS

### Multi-Tenancy Model: Shared Database with Row-Level Security

```
┌─────────────────────────────────────────┐
│     Multiple Tenants (Customers)        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Tenant  │ │ Tenant  │ │ Tenant  │  │
│  │ Acme    │ │ TechCo  │ │ Global  │  │
│  │ Inc     │ │         │ │ Corp    │  │
│  └────┬────┘ └────┬────┘ └────┬────┘  │
│       │           │           │       │
└───────┼───────────┼───────────┼───────┘
        │           │           │
        └─────┬─────┴─────┬─────┘
              │           │
        ┌─────▼───────────▼─────┐
        │  API Gateway          │
        │  - Auth               │
        │  - Tenant Extraction  │
        │  - Rate Limiting      │
        └─────┬───────────┬─────┘
              │           │
        ┌─────▼───────────▼──────────┐
        │  Tenant Context Middleware  │
        │  - Inject TenantId         │
        │  - Validate Access         │
        │  - Audit Log              │
        └─────┬───────────┬──────────┘
              │           │
        ┌─────▼───────────▼──────────────────┐
        │  Shared PostgreSQL Database        │
        │  WITH ROW-LEVEL SECURITY (RLS)     │
        │  - Users (tenantId)                │
        │  - Assets (tenantId)               │
        │  - Checkouts (tenantId)            │
        │  - All 30+ tables (tenantId)       │
        │  - Billing (tenantId)              │
        └────────────────────────────────────┘
```

### Why This Model?

**Pros**:
- **Cost-effective**: Single database cluster for all tenants
- **Operational simplicity**: One backup, one monitoring setup
- **Easier debugging**: Can query all tenant data if needed
- **Shared resources**: Better CPU/memory utilization

**Cons**:
- Requires strict RLS policies
- SQL queries must include tenantId filter
- Cannot have data-specific compliance (GDPR data residency)

**Tradeoff Decision**: For MVP multi-tenancy, shared database is best. We can migrate to separate DBs later if needed for compliance.

---

## IMPLEMENTATION PLAN (6 Hours)

### SUBTASK 1: Database Schema Updates (2 hours)

**1.1 Add `tenantId` to ALL tables** (1 hour)

Tables requiring `tenantId`:
- ✅ User (users)
- ✅ CustomRole (custom_roles)
- ✅ Company (companies) - RENAME to TenantCompany
- ✅ Manufacturer (manufacturers)
- ✅ Location (locations)
- ✅ FurnitureAsset (furniture_assets)
- ✅ ElectronicAsset (electronic_assets)
- ✅ VehicleAsset (vehicle_assets)
- ✅ AssetCheckout (asset_checkouts)
- ✅ Maintenance (maintenances)
- ✅ SparePart (spare_parts)
- ✅ Review (reviews)
- ✅ AuditLog (audit_logs)
- ✅ Notification (notifications)
- ✅ DeleteRequest (delete_requests)
- ✅ UserCreationRequest (user_creation_requests)
- ✅ UserDeleteRequest (user_delete_requests)
- ✅ AssetAddRequest (asset_add_requests)
- ✅ SettingAuditLog (setting_audit_logs)
- ✅ UserPermissionOverride (user_permission_overrides)
- ✅ NotificationPreference (notification_preferences)
- ✅ UserProfileSettings (user_profile_settings)
- ✅ SystemLog (system_logs)
- ✅ SecurityPolicy (security_policies) - now per-tenant
- ✅ ReportConfiguration (report_configurations) - per-tenant
- ✅ AssetDefaults (asset_defaults) - per-tenant
- ✅ OrganizationInfo (organization_info) - per-tenant

**1.2 Create Tenant Model** (30 min)

```prisma
model Tenant {
  id                    String    @id @default(cuid())
  name                  String    // "Acme Inc", "TechCo"
  slug                  String    @unique // "acme-inc", "techco"
  domain                String?   @unique // Optional: custom domain
  status                String    @default("ACTIVE") // ACTIVE, SUSPENDED, DELETED
  tier                  String    @default("STANDARD") // FREE, STARTER, PROFESSIONAL, ENTERPRISE
  
  // Billing
  billingEmail          String
  billingPhone          String?
  billingAddress        String?
  taxId                 String?
  
  // Usage Tracking
  monthlyUsageStorage   BigInt    @default(0) // bytes
  monthlyAPICallsCount  Int       @default(0)
  monthlyUserCount      Int       @default(0)
  
  // Limits & Quotas
  storageQuotaGB        Int       @default(10) // GB
  maxAPICallsPerMonth   Int       @default(100000)
  maxUsers              Int       @default(50)
  maxAssets             Int       @default(5000)
  
  // Features
  enabledFeatures       String    @default("[]") // JSON array of enabled features
  customBranding       Boolean   @default(false)
  
  // Timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime? // Soft delete
  
  // Relations
  users                 User[]
  companies             Company[]
  manufacturers         Manufacturer[]
  locations             Location[]
  assets                FurnitureAsset[]
  electronics           ElectronicAsset[]
  vehicles              VehicleAsset[]
  customRoles           CustomRole[]
  checkouts             AssetCheckout[]
  audits                AuditLog[]
  notifications         Notification[]
  settings              SystemSetting[]
  securityPolicy        SecurityPolicy[]
  notifications_prefs   NotificationPreference[]
  
  @@map("tenants")
}
```

**1.3 Prisma Migration**

```bash
# Generate migration
npx prisma migrate dev --name add_multi_tenancy

# This migration will:
# 1. Create tenants table
# 2. Add tenantId to all tables
# 3. Create indexes on (tenantId, status, createdAt)
# 4. Create composite unique constraints where needed
```

**1.4 Create RLS (Row-Level Security) Policies** (30 min)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- ... (for all 30+ tables)

-- Policy: Users can only see data from their tenant
CREATE POLICY users_tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY users_tenant_isolation_insert ON users
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::text);

-- Similar policies for all other tables...
```

---

### SUBTASK 2: Tenant Context Middleware (1.5 hours)

**2.1 Create Tenant Context Type**

File: `src/types/tenant.ts`

```typescript
export interface TenantContext {
  tenantId: string;
  tenantName: string;
  tier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  features: string[];
  storageQuotaGB: number;
  maxUsers: number;
  maxAssets: number;
  customBrandingEnabled: boolean;
}

export interface TenantRequest extends NextRequest {
  tenant?: TenantContext;
  tenantId?: string;
}
```

**2.2 Tenant Extraction Logic**

File: `src/lib/tenant/extractor.ts`

```typescript
import { headers } from 'next/headers';

export async function extractTenantId(): Promise<string | null> {
  const headersList = headers();
  
  // Priority order for tenant ID extraction:
  
  // 1. From X-Tenant-Id header (for API calls)
  const headerTenant = headersList.get('x-tenant-id');
  if (headerTenant) return headerTenant;
  
  // 2. From subdomain (app.acme-inc.com -> acme-inc)
  const host = headersList.get('host') || '';
  const subdomainMatch = host.match(/^([a-z0-9-]+)\.app\./);
  if (subdomainMatch) return subdomainMatch[1];
  
  // 3. From JWT token (stored when user logs in)
  const token = await getSessionToken();
  if (token?.tenantId) return token.tenantId;
  
  return null;
}

export async function getTenantFromDatabase(
  tenantIdOrSlug: string
): Promise<TenantContext | null> {
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { id: tenantIdOrSlug },
        { slug: tenantIdOrSlug }
      ],
      status: 'ACTIVE'
    }
  });
  
  if (!tenant) return null;
  
  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    tier: tenant.tier as any,
    features: JSON.parse(tenant.enabledFeatures || '[]'),
    storageQuotaGB: tenant.storageQuotaGB,
    maxUsers: tenant.maxUsers,
    maxAssets: tenant.maxAssets,
    customBrandingEnabled: tenant.customBranding
  };
}
```

**2.3 Tenant Middleware**

File: `src/middleware/tenant-middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { extractTenantId, getTenantFromDatabase } from '@/lib/tenant/extractor';
import { TenantRequest } from '@/types/tenant';

export async function tenantMiddleware(req: TenantRequest): Promise<NextResponse> {
  // Extract tenant ID
  const tenantIdOrSlug = await extractTenantId();
  
  if (!tenantIdOrSlug) {
    // No tenant context - might be on login/signup page
    return NextResponse.next();
  }
  
  // Fetch tenant from database
  const tenant = await getTenantFromDatabase(tenantIdOrSlug);
  
  if (!tenant) {
    return NextResponse.json(
      { error: 'Tenant not found or inactive' },
      { status: 404 }
    );
  }
  
  // Validate tenant status
  if (req.nextUrl.pathname !== '/auth/login' && 
      req.nextUrl.pathname !== '/auth/signup') {
    // Only allow access to active tenants (not SUSPENDED)
  }
  
  // Store tenant context in request
  (req as TenantRequest).tenant = tenant;
  (req as TenantRequest).tenantId = tenant.tenantId;
  
  // Add tenant ID to response headers for frontend
  const response = NextResponse.next();
  response.headers.set('X-Tenant-Id', tenant.tenantId);
  response.headers.set('X-Tenant-Name', tenant.tenantName);
  response.headers.set('X-Tenant-Tier', tenant.tier);
  
  return response;
}
```

**2.4 Update Main Middleware**

File: `src/middleware.ts`

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
    // ... rest of routes
  ],
};
```

---

### SUBTASK 3: Database Query Wrapper (1 hour)

**3.1 Create Tenant-Aware Prisma Client**

File: `src/lib/prisma/tenant-client.ts`

```typescript
import { PrismaClient } from '@prisma/client';

let prismaClientSingleton: PrismaClient;

export function getTenantPrisma(tenantId: string): PrismaClient {
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }
  
  // In production, use connection pooling per tenant
  // For now, use single client with middleware-level tenant injection
  return prisma;
}

// Middleware to auto-inject tenantId into all queries
export function withTenant(tenantId: string) {
  return {
    user: {
      findMany: (args: any) => {
        return prisma.user.findMany({
          ...args,
          where: {
            ...args.where,
            tenantId
          }
        });
      },
      findUnique: (args: any) => {
        return prisma.user.findUnique({
          ...args,
          where: {
            ...args.where,
            tenantId
          }
        });
      },
      // ... wrap all methods
    }
    // ... wrap all models
  };
}
```

**3.2 Create API Helper Functions**

File: `src/lib/api/tenant-helpers.ts`

```typescript
import { TenantRequest } from '@/types/tenant';

export async function requireTenant(req: TenantRequest) {
  if (!req.tenantId) {
    throw new Error('Tenant context required');
  }
  return req.tenantId;
}

export function buildTenantQuery(tenantId: string, query: any = {}) {
  return {
    ...query,
    where: {
      ...query.where,
      tenantId
    }
  };
}

// Usage in API routes
export async function getTenantAssets(tenantId: string) {
  return prisma.furnitureAsset.findMany(
    buildTenantQuery(tenantId, {
      select: {
        id: true,
        assetName: true,
        status: true
      }
    })
  );
}
```

---

### SUBTASK 4: Tenant Configuration System (1 hour)

**4.1 Per-Tenant Settings**

File: `src/services/tenant-config.service.ts`

```typescript
export class TenantConfigService {
  // Branding
  async getBranding(tenantId: string) {
    const config = await prisma.organizationInfo.findFirst({
      where: { tenantId }
    });
    
    return {
      name: config?.organizationName,
      logo: config?.organizationLogo,
      primaryColor: config?.primaryColor || '#2563eb',
      secondaryColor: config?.secondaryColor || '#1e40af',
      accentColor: config?.accentColor || '#f97316'
    };
  }
  
  // Features
  async isFeatureEnabled(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });
    
    const features = JSON.parse(tenant?.enabledFeatures || '[]');
    return features.includes(feature);
  }
  
  // Quotas
  async checkQuota(tenantId: string, resource: 'storage' | 'users' | 'assets') {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });
    
    const counts = await this.getResourceCounts(tenantId);
    
    switch (resource) {
      case 'storage':
        return counts.storage < (tenant?.storageQuotaGB || 10) * 1024 * 1024 * 1024;
      case 'users':
        return counts.users < (tenant?.maxUsers || 50);
      case 'assets':
        return counts.assets < (tenant?.maxAssets || 5000);
      default:
        return false;
    }
  }
  
  async getResourceCounts(tenantId: string) {
    const [users, assets, storage] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.furnitureAsset.count({ where: { tenantId } }),
      // Calculate storage from attachments
      prisma.attachment.aggregate({
        where: { /* tenantId filter */ },
        _sum: { fileSize: true }
      })
    ]);
    
    return {
      users,
      assets,
      storage: storage._sum?.fileSize || 0
    };
  }
  
  // Settings per tenant
  async getSetting(tenantId: string, key: string) {
    return prisma.systemSetting.findFirst({
      where: {
        key,
        category: {
          /* tenantId check */
        }
      }
    });
  }
}
```

**4.2 API Endpoints for Tenant Configuration**

File: `src/app/api/tenants/[id]/config/route.ts`

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tenantId = params.id;
  
  // Verify user belongs to this tenant
  const session = await getServerSession();
  if (session?.user?.tenantId !== tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const config = {
    branding: await tenantConfigService.getBranding(tenantId),
    quotas: {
      storage: await tenantConfigService.checkQuota(tenantId, 'storage'),
      users: await tenantConfigService.checkQuota(tenantId, 'users'),
      assets: await tenantConfigService.checkQuota(tenantId, 'assets')
    },
    features: await tenantConfigService.getEnabledFeatures(tenantId),
    tier: /* tenant tier */
  };
  
  return NextResponse.json(config);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tenantId = params.id;
  const updates = await req.json();
  
  // Validate user is admin of tenant
  // Update settings
  // Audit log changes
  
  return NextResponse.json({ success: true });
}
```

---

### SUBTASK 5: Usage Metering & Billing (1.5 hours)

**5.1 Usage Tracking Service**

File: `src/services/usage-metering.service.ts`

```typescript
export class UsageMeteringService {
  // Track API calls
  async trackAPICall(tenantId: string, endpoint: string) {
    const today = new Date().toISOString().split('T')[0];
    
    await prisma.usageMetric.upsert({
      where: {
        tenantId_date_metricType: {
          tenantId,
          date: new Date(today),
          metricType: 'API_CALLS'
        }
      },
      update: {
        count: { increment: 1 }
      },
      create: {
        tenantId,
        date: new Date(today),
        metricType: 'API_CALLS',
        count: 1,
        metadata: JSON.stringify({ endpoint })
      }
    });
  }
  
  // Track storage usage
  async trackStorageUsage(
    tenantId: string,
    sizeBytes: number,
    action: 'ADD' | 'REMOVE'
  ) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });
    
    const newUsage = action === 'ADD'
      ? tenant!.monthlyUsageStorage + BigInt(sizeBytes)
      : Math.max(0n, tenant!.monthlyUsageStorage - BigInt(sizeBytes));
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { monthlyUsageStorage: newUsage }
    });
    
    // Check if exceeded quota
    if (
      newUsage > BigInt(tenant!.storageQuotaGB * 1024 * 1024 * 1024)
    ) {
      // Send alert
      await this.sendOverquotaAlert(tenantId);
    }
  }
  
  // Track user additions
  async trackUserCount(tenantId: string) {
    const count = await prisma.user.count({
      where: { tenantId }
    });
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { monthlyUserCount: count }
    });
  }
  
  // Get usage report
  async getUsageReport(tenantId: string) {
    const [tenant, apiCallsMetric, storageMetric] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      prisma.usageMetric.groupBy({
        by: ['date'],
        where: {
          tenantId,
          metricType: 'API_CALLS',
          date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        _sum: { count: true }
      }),
      prisma.tenant.findUnique({ where: { id: tenantId } })
    ]);
    
    return {
      tier: tenant?.tier,
      apiCalls: {
        used: tenant?.monthlyAPICallsCount || 0,
        limit: tenant?.maxAPICallsPerMonth || 100000,
        percentUsed: ((tenant?.monthlyAPICallsCount || 0) / (tenant?.maxAPICallsPerMonth || 100000)) * 100
      },
      storage: {
        used: Number(tenant?.monthlyUsageStorage || 0) / (1024 * 1024 * 1024), // GB
        limit: tenant?.storageQuotaGB || 10,
        percentUsed: (Number(tenant?.monthlyUsageStorage || 0) / ((tenant?.storageQuotaGB || 10) * 1024 * 1024 * 1024)) * 100
      },
      users: {
        used: tenant?.monthlyUserCount || 0,
        limit: tenant?.maxUsers || 50,
        percentUsed: ((tenant?.monthlyUserCount || 0) / (tenant?.maxUsers || 50)) * 100
      }
    };
  }
  
  async sendOverquotaAlert(tenantId: string) {
    // Send notification to tenant admin
    const admins = await prisma.user.findMany({
      where: {
        tenantId,
        role: 'SUPER_ADMIN'
      }
    });
    
    for (const admin of admins) {
      // Send email / notification
    }
  }
}
```

**5.2 Usage Metrics Model**

Add to Prisma schema:

```prisma
model UsageMetric {
  id          String    @id @default(cuid())
  tenantId    String    @map("tenant_id")
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  date        DateTime
  metricType  String    // API_CALLS, STORAGE, USERS, ASSETS
  count       Int       @default(0)
  metadata    String?   // JSON for additional context
  
  createdAt   DateTime  @default(now())
  
  @@unique([tenantId, date, metricType])
  @@index([tenantId])
  @@index([date])
  @@map("usage_metrics")
}

model BillingRecord {
  id          String    @id @default(cuid())
  tenantId    String    @map("tenant_id")
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  billingPeriod DateTime  // Start of billing period
  totalAmount   Float
  
  apiCallsCharge Float
  storageCharge Float
  userCharge    Float
  
  status      String    @default("PENDING") // PENDING, PAID, OVERDUE
  invoiceUrl  String?
  
  createdAt   DateTime  @default(now())
  
  @@index([tenantId])
  @@index([billingPeriod])
  @@map("billing_records")
}
```

**5.3 Middleware to Track Usage**

File: `src/middleware/usage-tracker.ts`

```typescript
export async function usageTrackerMiddleware(req: TenantRequest) {
  const tenantId = req.tenantId;
  if (!tenantId || req.method === 'GET') return;
  
  // Track API calls asynchronously
  queueJob('track-api-usage', {
    tenantId,
    endpoint: req.nextUrl.pathname,
    method: req.method,
    timestamp: new Date()
  });
}
```

---

### SUBTASK 6: Update Existing API Routes (Included in each subtask)

All API routes must be updated to:
1. Extract tenantId from request
2. Include tenantId in all database queries
3. Validate user belongs to tenant

**Example Update**:

```typescript
// BEFORE
export async function GET(req: NextRequest) {
  const assets = await prisma.furnitureAsset.findMany();
  return NextResponse.json(assets);
}

// AFTER
export async function GET(req: TenantRequest) {
  const tenantId = await requireTenant(req);
  
  const assets = await prisma.furnitureAsset.findMany({
    where: { tenantId },
    select: {
      id: true,
      assetName: true,
      status: true,
      tenantId: false  // Never expose tenantId to client
    }
  });
  
  return NextResponse.json(assets);
}
```

---

## DATABASE MIGRATION SCRIPT

File: `prisma/migrations/[timestamp]_add_multi_tenancy/migration.sql`

```sql
-- Create Tenant table
CREATE TABLE "tenants" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "domain" TEXT UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "tier" TEXT NOT NULL DEFAULT 'STANDARD',
  
  "billing_email" TEXT NOT NULL,
  "billing_phone" TEXT,
  "billing_address" TEXT,
  "tax_id" TEXT,
  
  "monthly_usage_storage" BIGINT NOT NULL DEFAULT 0,
  "monthly_api_calls_count" INTEGER NOT NULL DEFAULT 0,
  "monthly_user_count" INTEGER NOT NULL DEFAULT 0,
  
  "storage_quota_gb" INTEGER NOT NULL DEFAULT 10,
  "max_api_calls_per_month" INTEGER NOT NULL DEFAULT 100000,
  "max_users" INTEGER NOT NULL DEFAULT 50,
  "max_assets" INTEGER NOT NULL DEFAULT 5000,
  
  "enabled_features" TEXT NOT NULL DEFAULT '[]',
  "custom_branding" BOOLEAN NOT NULL DEFAULT false,
  
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3)
);

-- Add tenantId to all existing tables
ALTER TABLE "users" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "custom_roles" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "companies" ADD COLUMN "tenant_id" TEXT;
-- ... (for all tables)

-- Create indexes
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "assets_tenant_id_idx" ON "furniture_assets"("tenant_id");
-- ... (for all tables)

-- Create Usage Metrics table
CREATE TABLE "usage_metrics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "metric_type" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "usage_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE,
  UNIQUE ("tenant_id", "date", "metric_type")
);

-- Create Billing Records table
CREATE TABLE "billing_records" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "billing_period" TIMESTAMP(3) NOT NULL,
  "total_amount" DOUBLE PRECISION NOT NULL,
  "api_calls_charge" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "storage_charge" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "user_charge" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "invoice_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "billing_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

-- Enable RLS (if using PostgreSQL)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "furniture_assets" ENABLE ROW LEVEL SECURITY;
-- ... (for all tables)

-- Create RLS policies
CREATE POLICY "users_tenant_isolation" ON "users"
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- ... (for all tables)
```

---

## VERIFICATION & TESTING

### Test Cases

1. **Tenant Isolation**
   - User A from Tenant 1 cannot see User B data from Tenant 2
   - Query filters always include tenantId
   - Database constraints prevent cross-tenant access

2. **Tenant Context Injection**
   - Every API request includes correct tenantId
   - tenantId extracted from correct source (header, subdomain, JWT)
   - Middleware adds <1ms overhead

3. **Usage Metering**
   - API calls tracked per tenant
   - Storage usage accurately calculated
   - Quotas enforced correctly

4. **Performance**
   - Query with tenant filter: <100ms
   - Tenant lookup: <50ms
   - No N+1 queries

### Test Script

File: `tests/multi-tenancy.test.ts`

```typescript
describe('Multi-Tenancy', () => {
  let tenant1: string;
  let tenant2: string;
  let user1Token: string;
  let user2Token: string;
  
  beforeAll(async () => {
    // Create two test tenants
    tenant1 = await createTenant('test-tenant-1');
    tenant2 = await createTenant('test-tenant-2');
    
    // Create users in each tenant
    user1Token = await createUserAndGetToken(tenant1);
    user2Token = await createUserAndGetToken(tenant2);
  });
  
  it('User from Tenant 1 cannot see Tenant 2 assets', async () => {
    const asset = await createAsset(tenant2, { name: 'Secret Asset' });
    
    const response = await fetchAssets(user1Token);
    
    expect(response.assets).not.toContainEqual(
      expect.objectContaining({ id: asset.id })
    );
  });
  
  it('Quotas are enforced per tenant', async () => {
    await setQuota(tenant1, 'users', 2);
    
    // Create 2 users - should succeed
    await createUser(tenant1);
    await createUser(tenant1);
    
    // Create 3rd user - should fail
    expect(
      createUser(tenant1)
    ).rejects.toThrow('Quota exceeded');
  });
  
  it('Usage metrics tracked accurately', async () => {
    await trackAPICall(tenant1, '/api/assets');
    
    const metrics = await getUsageMetrics(tenant1);
    
    expect(metrics.apiCalls.used).toBe(1);
  });
});
```

---

## ROLLOUT PLAN

### Phase 1: Preparation (1 hour)
- [ ] Review schema changes
- [ ] Create migration
- [ ] Set up test database

### Phase 2: Implementation (3 hours)
- [ ] Update Prisma schema
- [ ] Create tenant models and services
- [ ] Implement middleware
- [ ] Update API routes

### Phase 3: Testing (1 hour)
- [ ] Run test suite
- [ ] Verify tenant isolation
- [ ] Performance testing
- [ ] Load testing

### Phase 4: Deployment (1 hour)
- [ ] Run migration on staging
- [ ] Verify functionality
- [ ] Deploy to production
- [ ] Monitor for issues

---

## SUCCESS CRITERIA CHECKLIST

✅ **Database**
- [ ] Tenant table created
- [ ] tenantId added to all 25+ tables
- [ ] Indexes created
- [ ] RLS policies deployed
- [ ] Usage metrics table ready

✅ **Code**
- [ ] Tenant middleware working
- [ ] All API routes updated
- [ ] Tenant config service implemented
- [ ] Usage metering functional
- [ ] No data leakage in tests

✅ **Performance**
- [ ] Tenant context extraction: <1ms
- [ ] Query execution: <100ms
- [ ] No performance regression
- [ ] Memory usage stable

✅ **Operations**
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Documentation complete
- [ ] Team trained

---

## NEXT STEPS

Once Task 4.1 is complete:
1. Start Task 4.2: Microservices Decomposition
2. Break monolith into 6 independent services
3. Implement gRPC/REST communication
4. Deploy API Gateway

---

**Estimated Completion**: 6 hours from start  
**Dependencies**: PostgreSQL, Prisma, NextAuth already installed  
**Risk Level**: Medium (schema changes, potential data migration)  
**Rollback Plan**: Keep old database, point app back to it if issues arise
