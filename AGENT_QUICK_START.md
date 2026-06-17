# Asset Management System - Agent Quick Start Guide

**Purpose:** Quick reference for understanding and working with the multi-agent system  
**Audience:** Development team, architects, project managers  
**Updated:** June 17, 2026

---

## 🎯 Quick Summary

Your **Asset Management System** is an enterprise-grade Next.js application managing 3 asset types (Furniture, Electronics, Vehicles) with complex workflows, multi-user authorization, and comprehensive tracking.

### System at a Glance
- **Scale:** 50+ API endpoints, 16 database models
- **Users:** Multi-role (SUPER_ADMIN, USER, VIEW_USER)
- **Assets:** 3 types with unified checkout system
- **Operations:** Maintenance, reviews, depreciation, auditing
- **Tech:** Next.js 16, React 19, Prisma, SQLite, NextAuth.js

---

## 🤖 Six Specialized Agents

### 1️⃣ **ASSET MANAGEMENT AGENT**
- **Job:** Handle all asset operations
- **Owns:** Asset CRUD, checkout/checkin, depreciation, QR codes
- **Key APIs:** `/api/assets/*`, `/api/furniture/*`, `/api/electronics/*`, `/api/vehicles/*`
- **Files:** `src/app/api/assets/`, `src/components/Modal*.tsx`
- **Skills:** Multi-type asset management, bulk operations, lifecycle tracking

### 2️⃣ **SECURITY & AUTH AGENT**
- **Job:** Protect the system
- **Owns:** Authentication, authorization, audit logs, rate limiting
- **Key APIs:** `/api/auth/*`, middleware, permissions
- **Files:** `src/lib/auth-options.ts`, `src/middleware.ts`, `src/lib/permissions.ts`
- **Skills:** RBAC, fine-grained permissions, security headers, compliance

### 3️⃣ **BACKEND & DATA AGENT**
- **Job:** Manage data & database
- **Owns:** Database schema, ORM operations, validation, data integrity
- **Key Files:** `prisma/schema.prisma`, API routes, Zod schemas
- **Databases:** SQLite with 16 models, 50+ endpoints
- **Skills:** Query optimization, constraint management, data modeling

### 4️⃣ **FRONTEND & UX AGENT**
- **Job:** Build user experiences
- **Owns:** All pages, components, styling, responsiveness
- **Key Files:** `src/components/`, `src/app/*/page.tsx`
- **Stack:** React 19, Tailwind CSS 4, Framer Motion, Lucide Icons
- **Skills:** Responsive design, form validation UX, accessibility

### 5️⃣ **TESTING & QA AGENT**
- **Job:** Ensure quality
- **Owns:** Tests, code quality, type safety, performance
- **Tools:** Jest, TypeScript strict mode, ESLint
- **Standards:** > 80% coverage, 100% types, zero ESLint warnings
- **Skills:** Unit/integration testing, performance profiling, security audits

### 6️⃣ **ANALYTICS & REPORTS AGENT**
- **Job:** Provide insights
- **Owns:** Dashboard, reporting, exports, analytics
- **Key APIs:** `/api/dashboard/*`, `/api/analytics/*`, `/api/bulk-export/*`
- **Tech:** Recharts, aggregation queries, CSV export
- **Skills:** Data visualization, trend analysis, report generation

---

## 🔄 Agent Communication Flow

### Typical Request Flow
```
User Action
    ↓
Frontend & UX Agent (renders form)
    ↓
Security & Auth Agent (checks permissions) ← ← ← ← ←
    ↓                                           │
Asset/Backend Agent (executes operation)       │
    ↓                                           │
Backend & Data Agent (queries database)        │
    ↓                                           │
Security & Auth Agent (logs audit trail) ← ← ← ← ←
    ↓
Frontend & UX Agent (shows result)
    ↓
Testing & QA Agent (validates quality)
```

### Permission Check (Happens on Every Action)
```
User → Security Agent → Check Role
                          ├─ SUPER_ADMIN? → Allow All
                          ├─ VIEW_USER? → View Only
                          └─ USER? → Check Module Permissions
                                      └─ Has action permission? → Allow/Deny
```

---

## 📁 File Organization by Agent

### Asset Management Agent
```
src/app/api/assets/
├── checkout/route.ts          # Checkout operation
├── checkin/route.ts           # Checkin operation
└── checked-out/route.ts       # Get active checkouts

src/app/api/furniture/
├── route.ts                   # CRUD endpoints
└── [id]/route.ts              # Detail endpoints

src/app/api/electronics/
src/app/api/vehicles/          # Same pattern

src/components/
├── Modern*Modal.tsx           # Asset creation/editing
├── CheckoutModal.tsx
└── MaintenanceSection.tsx

src/lib/
├── depreciation.ts            # Depreciation calculations
├── asset-tag.ts              # Asset tag generation
└── serial-number.ts          # Serial number handling
```

### Security & Auth Agent
```
src/lib/
├── auth-options.ts           # NextAuth configuration
├── api-auth.ts              # API authentication helpers
├── permissions.ts           # RBAC system
└── rate-limiter.ts          # Login rate limiting

src/
├── middleware.ts            # Route protection
└── types/next-auth.d.ts     # Auth type definitions

next.config.ts               # Security headers
```

### Backend & Data Agent
```
prisma/
└── schema.prisma            # Database models (16 models)

src/lib/
└── prisma.ts               # Prisma client singleton

src/types/
└── index.ts                # All TypeScript types

src/app/api/
├── users/route.ts          # User management
├── companies/route.ts       # Company management
├── manufacturers/route.ts   # Manufacturer management
└── locations/route.ts       # Location management
```

### Frontend & UX Agent
```
src/
├── app/
│   ├── dashboard/page.tsx
│   ├── assets/*/page.tsx
│   ├── admin/*/page.tsx
│   ├── settings/page.tsx
│   ├── reports/page.tsx
│   └── layout.tsx

├── components/
│   ├── form/
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   └── FormDateInput.tsx
│   ├── Sidebar.tsx
│   ├── DashboardLayout.tsx
│   └── PageHeader.tsx

└── context/
    └── ThemeContext.tsx
```

### Testing & QA Agent
```
(When tests are created)
__tests__/
├── unit/
├── integration/
└── e2e/

Configuration:
- jest.config.js
- .eslintrc
- tsconfig.json
```

### Analytics & Reports Agent
```
src/app/api/
├── analytics/route.ts
├── dashboard/stats/route.ts
└── bulk-export/route.ts

src/
├── app/dashboard/page.tsx
├── app/reports/page.tsx
└── components/AnalyticsDashboard.tsx
```

---

## 🎯 Key Responsibilities Checklist

### Asset Agent Must Handle
- [ ] Furniture CRUD (create, read, update, delete)
- [ ] Electronics CRUD
- [ ] Vehicle CRUD
- [ ] Asset checkout (allocate to user)
- [ ] Asset checkin (return from user)
- [ ] Track checkout history
- [ ] Generate QR codes
- [ ] Support barcodes
- [ ] Calculate depreciation
- [ ] Asset image upload
- [ ] Bulk import assets
- [ ] Bulk export assets

### Security Agent Must Handle
- [ ] User login (email + password)
- [ ] Rate limiting (5 attempts / 15 min)
- [ ] Password hashing (bcrypt)
- [ ] Session management
- [ ] Role-based access (3 roles)
- [ ] Permission-based access (per user)
- [ ] Audit logging (all actions)
- [ ] Route protection
- [ ] API authentication
- [ ] Security headers (CSP, HSTS, etc.)

### Backend Agent Must Handle
- [ ] 16 database models
- [ ] 50+ API endpoints
- [ ] Zod validation schemas
- [ ] Query optimization
- [ ] Constraint enforcement
- [ ] Pagination
- [ ] Error responses
- [ ] Data relationships
- [ ] Cascade deletes

### Frontend Agent Must Handle
- [ ] Responsive design (mobile to desktop)
- [ ] Form validation UX
- [ ] Loading states
- [ ] Error notifications
- [ ] Success notifications
- [ ] Dark mode support
- [ ] Navigation (sidebar)
- [ ] Filtering & sorting
- [ ] Modal dialogs
- [ ] Accessibility (WCAG 2.1 AA)

### Testing Agent Must Handle
- [ ] Unit tests (> 80% coverage)
- [ ] Type checking (100% types)
- [ ] ESLint compliance (zero warnings)
- [ ] Performance profiling
- [ ] Security scanning
- [ ] Regression testing
- [ ] Integration tests

### Analytics Agent Must Handle
- [ ] Dashboard statistics
- [ ] Asset counts by type
- [ ] Condition breakdown
- [ ] Location analysis
- [ ] Company analysis
- [ ] Recent activity
- [ ] CSV export
- [ ] Report generation
- [ ] Trend analysis

---

## 🔌 Critical Integration Points

### Database Models Used By Each Agent
```
Asset Agent:
  ├─ FurnitureAsset
  ├─ ElectronicAsset
  ├─ VehicleAsset
  ├─ AssetCheckout
  ├─ Review
  ├─ Maintenance
  └─ Attachment

Security Agent:
  ├─ User
  ├─ AuditLog
  └─ Notification

Backend Agent:
  ├─ Company
  ├─ Manufacturer
  ├─ Location
  └─ DeleteRequest

Frontend Agent:
  └─ Uses above through APIs

Analytics Agent:
  └─ Reads from all models
```

### Permission Checks Required
```
create asset    → need: "furniture:create" permission
checkout asset  → need: "furniture:checkout" permission
view reports    → need: "reports:view" permission
delete user     → need: "users:delete" permission
export data     → need: "reports:export" permission
view audit logs → need: "audit_logs:view" permission
manage settings → need: "settings:manage" permission
```

---

## 💾 Database Schema Summary

### 3 Asset Models (Main Focus)
- **FurnitureAsset:** Name, type, material, depreciation, condition, status
- **ElectronicAsset:** Brand, model, warranty, maintenance date
- **VehicleAsset:** Registration, engine, fuel, insurance, service date

### All Share Common Fields
```typescript
{
  assetTag?: string              // Unique identifier
  imageUrl?: string              // Asset photo
  companyId?: string             // Organization
  manufacturerId?: string        // Vendor
  locationId?: string            // Where stored
  assignedUserId?: string        // Current owner
  condition: 'GOOD' | 'REPAIR' | 'DAMAGED'
  status: 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION'
  usefulLifeYears?: number       // Depreciation
  salvageValue?: number          // End value
  depreciationMethod?: string    // Calculation method
}
```

### Supporting Models
- **AssetCheckout:** Track allocation to users
- **User:** 3 roles (SUPER_ADMIN, USER, VIEW_USER)
- **Maintenance:** Service history
- **Review:** Condition feedback
- **Notification:** User alerts
- **AuditLog:** Complete change history
- **Attachment:** Asset documents

---

## 🚀 Quick Start: Adding New Feature

### Example: Add "Asset Warranty Alert"

**Step 1: Database** (Backend Agent)
```typescript
// prisma/schema.prisma
model Notification {
  // Already supports warranty alerts via metadata field
}
```

**Step 2: API** (Asset Agent + Security Agent)
```typescript
// src/app/api/electronics/warranty-check/route.ts
// Check warranty status
// Requires: electronics:view permission
```

**Step 3: Business Logic** (Asset Agent)
```typescript
// src/lib/warranty-check.ts
// Calculate warranty status
// Generate notifications
```

**Step 4: UI** (Frontend Agent)
```typescript
// src/components/WarrantyAlert.tsx
// Display warning for expired warranties
```

**Step 5: Tests** (Testing Agent)
```typescript
// __tests__/warranty-check.test.ts
// Validate warranty calculation
```

---

## 📊 Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| Asset List Load | < 200ms | ⏳ TBD |
| Checkout Operation | < 500ms | ⏳ TBD |
| Login | < 500ms | ⏳ TBD |
| Search | < 200ms | ⏳ TBD |
| Bulk Import (1000) | < 1min | ⏳ TBD |
| Page Load | < 2s | ⏳ TBD |
| API Response (p95) | < 200ms | ⏳ TBD |

---

## 🎓 Agent Decision Framework

When adding a feature, ask:

1. **Is it about assets?**
   → Asset Management Agent

2. **Is it about security/permissions/audit?**
   → Security & Auth Agent

3. **Is it about data/database/ORM?**
   → Backend & Data Agent

4. **Is it about UI/UX/forms?**
   → Frontend & UX Agent

5. **Is it about insights/reports?**
   → Analytics & Reports Agent

6. **Is it about quality/testing?**
   → Testing & QA Agent

---

## 🔗 Common Patterns

### Creating an Asset
```
Frontend renders form
  ↓ (user submits)
Security checks "furniture:create" permission
  ↓ (allowed)
Backend validates input with Zod
  ↓ (valid)
Asset Agent creates FurnitureAsset
  ↓ (success)
Security Agent logs CREATE audit
  ↓ (logged)
Frontend shows success notification
  ↓ (user sees result)
Analytics Agent updates dashboard cache
```

### Checking Out an Asset
```
Frontend shows checkout modal
  ↓ (user selects asset & user)
Security checks "furniture:checkout" permission
  ↓ (allowed)
Asset Agent verifies asset availability
  ↓ (available)
Backend creates AssetCheckout record
  ↓ (created)
Asset Agent updates asset status → IN_USE
  ↓ (updated)
Security Agent logs CHECKOUT audit
  ↓ (logged)
Notification Agent notifies assigned user
  ↓ (notified)
Frontend shows success
```

---

## ⚡ Tips for Efficient Development

1. **Use the Agent Structure:** Don't cross boundaries unnecessarily
2. **Check Permissions First:** Security Agent runs on every operation
3. **Validate Input:** Backend Agent uses Zod for all inputs
4. **Log Actions:** Security Agent logs all changes automatically
5. **Test Thoroughly:** Testing Agent validates quality gates
6. **Reuse Components:** Frontend Agent has component library
7. **Cache Results:** Analytics Agent caches dashboard data

---

## 🆘 Troubleshooting Guide

### "Permission Denied" Errors
→ Check Security Agent's permission configuration for user

### "Validation Error" on API
→ Check Backend Agent's Zod schema in API route

### "Asset Not Found"
→ Check if asset exists in correct table (Furniture/Electronic/Vehicle)

### "Checkout Failed"
→ Check if asset is already checked out (missing checkin)

### "Slow Performance"
→ Check Backend Agent's database indexes & query optimization

### "UI Not Updating"
→ Check Frontend Agent's state management & rerender triggers

---

## 📞 Quick Reference

**Need to:**
- **Manage assets?** → Asset Agent
- **Add a permission?** → Security Agent
- **Query data?** → Backend Agent
- **Create UI?** → Frontend Agent
- **Validate quality?** → Testing Agent
- **Generate reports?** → Analytics Agent

---

## ✅ Success Checklist

Your system is healthy when:
- ✅ All 50+ API endpoints work
- ✅ Asset checkout/checkin flows smoothly
- ✅ Permissions enforce correctly
- ✅ Audit logs capture all actions
- ✅ UI is responsive & fast
- ✅ Dashboard shows real-time stats
- ✅ Tests pass (> 80% coverage)
- ✅ No TypeScript errors
- ✅ Performance meets targets
- ✅ Users are satisfied

---

**Last Updated:** June 17, 2026  
**For Questions:** Refer to ADVANCED_AGENTS.md and PROJECT_ANALYSIS.md

