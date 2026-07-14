# PHASE 4: IMPLEMENTATION CHECKLIST

**Date Started**: 2026-07-14  
**Target Duration**: 30+ hours  
**Current Task**: 4.1 - Multi-Tenancy Architecture  

---

## QUICK STATUS

| Task | Status | Duration | Start | End |
|------|--------|----------|-------|-----|
| 4.1: Multi-Tenancy | IN PROGRESS ⏳ | 6h | 2026-07-14 | - |
| 4.2: Microservices | PENDING ⏹️ | 8h | - | - |
| 4.3: CDN & Caching | PENDING ⏹️ | 5h | - | - |
| 4.4: ML/AI Features | PENDING ⏹️ | 6h | - | - |
| 4.5: HA & DR | PENDING ⏹️ | 5h | - | - |
| 4.6: Compliance | PENDING ⏹️ | 5h | - | - |
| 4.7: Monitoring | PENDING ⏹️ | 5h | - | - |
| 4.8: Optimization | PENDING ⏹️ | 2h | - | - |

---

## TASK 4.1: MULTI-TENANCY ARCHITECTURE

### Subtask 1: Database Schema Updates (2 hours)

**1.1 Add Tenant Model & Usage Tables** ✅ DONE
- [x] Created Tenant model in schema.prisma
- [x] Created UsageMetric model
- [x] Created BillingRecord model
- [x] Added required fields and relations

**1.2 Add tenantId to User Model** ✅ DONE
- [x] Added tenantId foreign key
- [x] Made email unique per tenant: @@unique([tenantId, email])
- [x] Added tenant relation
- [x] Updated indexes

**1.3 Add tenantId to All Other Tables** ⏳ IN PROGRESS
Needs to be added to:
- [ ] CustomRole (custom_roles)
- [ ] Company (companies)
- [ ] Manufacturer (manufacturers)
- [ ] Location (locations)
- [ ] FurnitureAsset (furniture_assets)
- [ ] ElectronicAsset (electronic_assets)
- [ ] VehicleAsset (vehicle_assets)
- [ ] AssetCheckout (asset_checkouts)
- [ ] Maintenance (maintenances)
- [ ] SparePart (spare_parts)
- [ ] Review (reviews)
- [ ] AuditLog (audit_logs)
- [ ] Notification (notifications)
- [ ] Attachment (attachments)
- [ ] DeleteRequest (delete_requests)
- [ ] UserCreationRequest (user_creation_requests)
- [ ] UserDeleteRequest (user_delete_requests)
- [ ] AssetAddRequest (asset_add_requests)
- [ ] SettingCategory (setting_categories)
- [ ] SystemSetting (system_settings)
- [ ] SettingAuditLog (setting_audit_logs)
- [ ] SecurityPolicy (security_policies)
- [ ] NotificationPreference (notification_preferences)
- [ ] RolePermission (role_permissions) - might not need tenantId
- [ ] UserPermissionOverride (user_permission_overrides)
- [ ] OrganizationInfo (organization_info)
- [ ] AssetDefaults (asset_defaults)
- [ ] ReportConfiguration (report_configurations)
- [ ] SystemLog (system_logs)
- [ ] UserProfileSettings (user_profile_settings)

**1.4 Create RLS (Row-Level Security) Policies**
- [ ] Enable RLS on all tables
- [ ] Create policy for users table
- [ ] Create policy for assets tables
- [ ] Create policy for audit logs
- [ ] Test RLS policies

**1.5 Generate Prisma Migration**
- [ ] Run prisma migrate dev
- [ ] Verify migration SQL
- [ ] Test on staging database

---

### Subtask 2: Tenant Context Middleware (1.5 hours)

**2.1 Create Types** ✅ DONE
- [x] Created src/types/tenant.ts
- [x] Defined TenantContext interface
- [x] Defined TenantRequest interface
- [x] Defined related types (Quotas, Branding, etc.)

**2.2 Tenant Extraction Logic** ✅ DONE
- [x] Created src/lib/tenant/extractor.ts
- [x] Implemented extractTenantIdOrSlug()
- [x] Implemented getTenantFromDatabase()
- [x] Implemented utility functions

**2.3 Tenant Middleware**
- [ ] Create src/middleware/tenant-middleware.ts
- [ ] Implement middleware logic
- [ ] Add tenant context to request
- [ ] Return headers with tenant info

**2.4 Update Main Middleware**
- [ ] Update src/middleware.ts to call tenant middleware
- [ ] Integrate with existing auth middleware
- [ ] Test middleware chain

---

### Subtask 3: Helper Functions (1 hour)

**3.1 Create Tenant Helpers** ✅ DONE
- [x] Created src/lib/tenant/helpers.ts
- [x] Implemented requireTenant()
- [x] Implemented buildTenantQuery()
- [x] Implemented verification functions
- [x] Implemented stats functions

**3.2 Create API Helper Functions**
- [ ] Create src/lib/api/tenant-helpers.ts
- [ ] Implement response formatting
- [ ] Implement error handling

---

### Subtask 4: Tenant Configuration System (1 hour)

**4.1 Tenant Config Service**
- [ ] Create src/services/tenant-config.service.ts
- [ ] Implement getBranding()
- [ ] Implement isFeatureEnabled()
- [ ] Implement checkQuota()
- [ ] Implement settings getters

**4.2 Configuration API Endpoints**
- [ ] Create src/app/api/tenants/[id]/config/route.ts
- [ ] Implement GET endpoint
- [ ] Implement PUT endpoint
- [ ] Add authorization checks

---

### Subtask 5: Usage Metering & Billing (1.5 hours)

**5.1 Usage Metering Service**
- [ ] Create src/services/usage-metering.service.ts
- [ ] Implement trackAPICall()
- [ ] Implement trackStorageUsage()
- [ ] Implement trackUserCount()
- [ ] Implement getUsageReport()

**5.2 Metering Middleware**
- [ ] Create middleware to track API usage
- [ ] Implement storage tracking
- [ ] Add to middleware chain

**5.3 Billing Service** (optional for Phase 4.1)
- [ ] Create src/services/billing.service.ts
- [ ] Implement pricing calculation
- [ ] Implement invoice generation
- [ ] Implement payment tracking

---

### Subtask 6: Update API Routes

**6.1 Update Critical API Routes**
- [ ] /api/auth/* routes
- [ ] /api/assets/* routes
- [ ] /api/admin/* routes
- [ ] /api/users/* routes
- [ ] /api/reports/* routes

**6.2 Pattern for Each Route**
```typescript
// Extract tenantId
const tenantId = await requireTenant(req);

// Build query with tenant filter
const items = await prisma.item.findMany(
  buildTenantQuery(tenantId, { where: {...} })
);

// Return response (never include tenantId)
return NextResponse.json(excludeTenantId(items));
```

---

## TESTING CHECKLIST

### Unit Tests
- [ ] Tenant extraction works from headers
- [ ] Tenant extraction works from subdomains
- [ ] Tenant extraction works from session
- [ ] Tenant context injected into requests
- [ ] Query building includes tenantId
- [ ] Helpers work correctly

### Integration Tests
- [ ] User A cannot see User B's assets
- [ ] Quotas enforced per tenant
- [ ] Usage metrics tracked correctly
- [ ] Billing records generated
- [ ] RLS policies prevent data leakage

### Performance Tests
- [ ] Tenant extraction: <1ms
- [ ] Query with filter: <100ms
- [ ] No N+1 queries
- [ ] Memory usage stable under load

### Security Tests
- [ ] Cross-tenant access prevented
- [ ] Quotas prevent abuse
- [ ] User permissions respected
- [ ] Audit logs track everything

---

## IMPLEMENTATION NOTES

### Database Changes Required
1. Create migration to add Tenant table
2. Add tenantId column to 25+ existing tables
3. Create indexes on (tenantId, status, createdAt)
4. Set up RLS policies
5. Handle data migration (assign all existing data to default tenant)

### Code Changes Required
1. Update Prisma schema
2. Create tenant types
3. Create extraction logic
4. Create middleware
5. Update all API routes (50+)
6. Add metering service
7. Add configuration service

### Configuration Changes
1. Update env.example with TENANT_* vars
2. Add default tenant setup script
3. Create tenant management endpoints

---

## POTENTIAL BLOCKERS

1. **Database Migration**: Risk if production data not handled properly
   - Solution: Backup database, test migration on clone first

2. **API Route Updates**: 50+ routes need tenant filtering
   - Solution: Use helper functions, don't repeat code

3. **Authentication**: NextAuth needs to store tenantId in session
   - Solution: Extend session callback in [...nextauth]/route.ts

4. **Backward Compatibility**: Breaking change for existing clients
   - Solution: Support both old and new API versions during transition

---

## SUCCESS CRITERIA

✅ **Database**
- [ ] Tenant table created with all fields
- [ ] All 25+ tables have tenantId
- [ ] Indexes created for performance
- [ ] RLS policies deployed and tested
- [ ] Usage metrics tracking working

✅ **Code**
- [ ] Tenant middleware working
- [ ] All API routes updated
- [ ] Config service deployed
- [ ] Metering functional
- [ ] No data leakage in tests

✅ **Performance**
- [ ] Tenant extraction: <1ms average
- [ ] Query with filter: <100ms
- [ ] No performance regression
- [ ] Memory usage normal

✅ **Security**
- [ ] Complete tenant isolation
- [ ] RLS policies enforced
- [ ] Quotas working
- [ ] Audit logs tracking

---

## DEPENDENCIES

- PostgreSQL (for RLS support)
- Prisma Client with multi-db support
- Next.js middleware
- NextAuth.js (already installed)

---

## TIMELINE

**Hour 1-2**: Database schema updates + migration
**Hour 2-3**: Middleware and extraction logic
**Hour 3-4**: Configuration and metering services
**Hour 4-5**: Update critical API routes
**Hour 5-6**: Testing and debugging

---

## NEXT STEPS AFTER 4.1

Once multi-tenancy is working:
1. Set up staging environment with 3-5 test tenants
2. Prepare infrastructure for Task 4.2 (microservices)
3. Document tenant management procedures
4. Create monitoring for cross-tenant queries
5. Set up automated billing calculations
