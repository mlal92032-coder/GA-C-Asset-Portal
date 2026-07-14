# SCHEMA UPDATE GUIDE FOR MULTI-TENANCY

This document provides the exact Prisma schema changes needed to add `tenantId` to all tables.

---

## MODELS REQUIRING tenantId

### Critical (User-facing data)
1. **CustomRole** - roles per tenant
2. **Company** - company/organization per tenant
3. **Manufacturer** - manufacturers per tenant
4. **Location** - locations per tenant
5. **FurnitureAsset** - furniture assets per tenant
6. **ElectronicAsset** - electronic assets per tenant
7. **VehicleAsset** - vehicle assets per tenant
8. **AssetCheckout** - checkouts per tenant
9. **Maintenance** - maintenance records per tenant
10. **SparePart** - spare parts per tenant
11. **Review** - reviews per tenant
12. **DeleteRequest** - delete requests per tenant
13. **UserCreationRequest** - user requests per tenant
14. **UserDeleteRequest** - delete requests per tenant
15. **AssetAddRequest** - asset add requests per tenant

### System (Settings & Preferences)
16. **AuditLog** - audit logs per tenant
17. **Notification** - notifications per tenant
18. **Attachment** - attachments per tenant
19. **SettingCategory** - settings categories per tenant
20. **SystemSetting** - system settings per tenant
21. **SettingAuditLog** - setting audit logs per tenant
22. **SecurityPolicy** - security policies per tenant
23. **NotificationPreference** - notification preferences per tenant
24. **UserPermissionOverride** - permissions per tenant
25. **OrganizationInfo** - organization info per tenant
26. **AssetDefaults** - asset defaults per tenant
27. **ReportConfiguration** - reports per tenant
28. **SystemLog** - system logs per tenant
29. **UserProfileSettings** - profile settings per tenant

### Special Cases
30. **RolePermission** - MAYBE keep global (system-wide permissions)
31. **Attachment** - depends on asset type

---

## SCHEMA CHANGES (In Order)

### 1. CustomRole Model

```prisma
model CustomRole {
  id            String    @id @default(cuid())
  tenantId      String    @map("tenant_id")
  tenant        Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name          String
  description   String?
  permissions   String    // JSON array of permission strings
  isActive      Boolean   @default(true)
  
  createdById   String    @map("created_by_id")
  createdBy     User      @relation("RoleCreator", fields: [createdById], references: [id], onDelete: Restrict)
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  users         User[]

  @@unique([tenantId, name])
  @@index([tenantId])
  @@index([createdById])
  @@map("custom_roles")
}
```

### 2. Company Model

```prisma
model Company {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  companyName String   @map("company_name")
  address     String?
  phone       String?
  email       String?
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  furniture   FurnitureAsset[]
  electronic  ElectronicAsset[]
  vehicles    VehicleAsset[]

  @@unique([tenantId, companyName])
  @@index([tenantId])
  @@map("companies")
}
```

### 3. Manufacturer Model

```prisma
model Manufacturer {
  id             String   @id @default(cuid())
  tenantId       String   @map("tenant_id")
  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  manufacturerName String @map("manufacturer_name")
  country        String?
  supportEmail   String?  @map("support_email")
  supportPhone   String?  @map("support_phone")
  
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  
  furniture      FurnitureAsset[]
  electronic     ElectronicAsset[]
  vehicles       VehicleAsset[]

  @@unique([tenantId, manufacturerName])
  @@index([tenantId])
  @@map("manufacturers")
}
```

### 4. Location Model

```prisma
model Location {
  id            String   @id @default(cuid())
  tenantId      String   @map("tenant_id")
  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  locationName  String   @map("location_name")
  building      String?
  floor         String?
  room          String?
  roomType      String?  @map("room_type")
  description   String?
  
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  furniture     FurnitureAsset[]
  electronic    ElectronicAsset[]
  vehicles      VehicleAsset[]

  @@unique([tenantId, locationName])
  @@index([tenantId])
  @@map("locations")
}
```

### 5. FurnitureAsset Model

```prisma
model FurnitureAsset {
  id            String      @id @default(cuid())
  tenantId      String      @map("tenant_id")
  tenant        Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  assetTag      String?     @unique @map("asset_tag")
  assetName     String      @map("asset_name")
  serialNumber  String?     @map("serial_number")
  imageUrl      String?     @map("image_url")
  qrPassword    String?     @map("qr_password")
  furnitureType String?     @map("furniture_type")
  material      String?
  
  purchaseDate  DateTime?   @map("purchase_date")
  purchasePrice Float?      @map("purchase_price")
  
  companyId     String?     @map("company_id")
  manufacturerId String?    @map("manufacturer_id")
  locationId    String?     @map("location_id")
  assignedUserId String?    @map("assigned_user_id")
  
  condition     Condition   @default(GOOD)
  status        AssetStatus @default(IN_STORE)
  remarks       String?
  
  usefulLifeYears Int?     @map("useful_life_years")
  salvageValue  Float?     @map("salvage_value")
  depreciationMethod String? @map("depreciation_method")
  
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  company       Company?    @relation(fields: [companyId], references: [id], onDelete: SetNull)
  manufacturer  Manufacturer? @relation(fields: [manufacturerId], references: [id], onDelete: SetNull)
  location      Location?   @relation(fields: [locationId], references: [id], onDelete: SetNull)
  assignedUser  User?       @relation("AssignedUserFurniture", fields: [assignedUserId], references: [id], onDelete: SetNull)

  @@unique([tenantId, assetTag])
  @@index([tenantId])
  @@index([companyId])
  @@index([manufacturerId])
  @@index([locationId])
  @@index([assignedUserId])
  @@index([condition])
  @@index([status])
  @@index([createdAt])
  @@index([status, condition])
  @@map("furniture_assets")
}
```

### 6. ElectronicAsset Model

```prisma
model ElectronicAsset {
  id                  String      @id @default(cuid())
  tenantId            String      @map("tenant_id")
  tenant              Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  assetTag            String?     @unique @map("asset_tag")
  assetName           String      @map("asset_name")
  imageUrl            String?     @map("image_url")
  qrPassword          String?     @map("qr_password")
  
  deviceType          String?     @map("device_type")
  brand               String?
  model               String?
  serialNumber        String?     @map("serial_number")
  
  purchaseDate        DateTime?   @map("purchase_date")
  warrantyEndDate     DateTime?   @map("warranty_end_date")
  
  companyId           String?     @map("company_id")
  manufacturerId      String?     @map("manufacturer_id")
  locationId          String?     @map("location_id")
  assignedUserId      String?     @map("assigned_user_id")
  
  condition           Condition   @default(GOOD)
  status              AssetStatus @default(IN_STORE)
  lastMaintenanceDate DateTime?   @map("last_maintenance_date")
  remarks             String?
  
  usefulLifeYears     Int?       @map("useful_life_years")
  salvageValue        Float?     @map("salvage_value")
  depreciationMethod  String?    @map("depreciation_method")
  
  createdAt           DateTime    @default(now()) @map("created_at")
  updatedAt           DateTime    @updatedAt @map("updated_at")

  company             Company?    @relation(fields: [companyId], references: [id], onDelete: SetNull)
  manufacturer        Manufacturer? @relation(fields: [manufacturerId], references: [id], onDelete: SetNull)
  location            Location?   @relation(fields: [locationId], references: [id], onDelete: SetNull)
  assignedUser        User?       @relation("AssignedUserElectronic", fields: [assignedUserId], references: [id], onDelete: SetNull)

  @@unique([tenantId, assetTag])
  @@unique([tenantId, serialNumber])
  @@index([tenantId])
  @@index([companyId])
  @@index([manufacturerId])
  @@index([locationId])
  @@index([assignedUserId])
  @@map("electronic_assets")
}
```

### 7. VehicleAsset Model

```prisma
model VehicleAsset {
  id                  String      @id @default(cuid())
  tenantId            String      @map("tenant_id")
  tenant              Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  assetTag            String?     @unique @map("asset_tag")
  assetName           String      @map("asset_name")
  serialNumber        String?     @map("serial_number")
  imageUrl            String?     @map("image_url")
  qrPassword          String?     @map("qr_password")
  
  vehicleType         String?     @map("vehicle_type")
  brand               String?
  model               String?
  registrationNumber  String      @map("registration_number")
  engineNumber        String?     @map("engine_number")
  chassisNumber       String?     @map("chassis_number")
  fuelType            String?     @map("fuel_type")
  
  purchaseDate        DateTime?   @map("purchase_date")
  purchasePrice       Float?      @map("purchase_price")
  
  companyId           String?     @map("company_id")
  manufacturerId      String?     @map("manufacturer_id")
  locationId          String?     @map("location_id")
  assignedUserId      String?     @map("assigned_user_id")
  
  condition           Condition   @default(GOOD)
  status              AssetStatus @default(IN_STORE)
  lastServiceDate     DateTime?   @map("last_service_date")
  insuranceExpiryDate DateTime?   @map("insurance_expiry_date")
  remarks             String?
  
  usefulLifeYears     Int?       @map("useful_life_years")
  salvageValue        Float?     @map("salvage_value")
  depreciationMethod  String?    @map("depreciation_method")
  
  createdAt           DateTime    @default(now()) @map("created_at")
  updatedAt           DateTime    @updatedAt @map("updated_at")

  company             Company?    @relation(fields: [companyId], references: [id], onDelete: SetNull)
  manufacturer        Manufacturer? @relation(fields: [manufacturerId], references: [id], onDelete: SetNull)
  location            Location?   @relation(fields: [locationId], references: [id], onDelete: SetNull)
  assignedUser        User?       @relation("AssignedUserVehicle", fields: [assignedUserId], references: [id], onDelete: SetNull)
  spareParts          SparePart[]

  @@unique([tenantId, assetTag])
  @@unique([tenantId, registrationNumber])
  @@index([tenantId])
  @@index([companyId])
  @@map("vehicle_assets")
}
```

### 8. AssetCheckout Model

```prisma
model AssetCheckout {
  id                  String   @id @default(cuid())
  tenantId            String   @map("tenant_id")
  tenant              Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  assetId             String   @map("asset_id")
  assetType           String   @map("asset_type")
  userId              String   @map("user_id")
  
  checkedOutBy        String   @map("checked_out_by")
  checkedOutAt        DateTime @default(now()) @map("checked_out_at")
  
  expectedReturnDate  DateTime? @map("expected_return_date")
  checkInDate         DateTime? @map("check_in_date")
  checkedInBy         String?  @map("checked_in_by")
  
  checkoutNotes       String?  @map("checkout_notes")
  checkinNotes        String?  @map("checkin_notes")
  condition           String?
  
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([assetId])
  @@index([userId])
  @@index([checkedOutAt])
  @@map("asset_checkouts")
}
```

### 9-29. Other Models

[Similar pattern - add tenantId to all remaining models]

---

## MIGRATION STRATEGY

### Step 1: Backup
```bash
# Backup current database
pg_dump asset_management > backup_$(date +%s).sql
```

### Step 2: Update Schema
Update prisma/schema.prisma with all changes above

### Step 3: Create Migration
```bash
npx prisma migrate dev --name add_multi_tenancy
```

### Step 4: Review Migration
Check the generated migration SQL in `prisma/migrations/[timestamp]_add_multi_tenancy/migration.sql`

### Step 5: Handle Existing Data
Create a migration to assign all existing data to a default tenant:

```sql
-- Assuming you created a default tenant with id = 'default-tenant'
UPDATE users SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE companies SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
-- ... repeat for all tables
```

### Step 6: Test
```bash
npm run test
npm run test:e2e
```

### Step 7: Deploy
```bash
# On staging
npx prisma migrate deploy

# On production
npx prisma migrate deploy
```

---

## SQL FOR RLS POLICIES (PostgreSQL)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE electronic_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE delete_requests ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Create policies for each table
-- Pattern:
CREATE POLICY "table_name_tenant_isolation" ON table_name
  USING (tenant_id = current_setting('app.current_tenant_id')::text)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::text);
```

---

## IMPLEMENTATION ORDER

1. CustomRole (depends on User, which is done)
2. Company, Manufacturer, Location
3. FurnitureAsset, ElectronicAsset, VehicleAsset
4. SparePart, AssetCheckout
5. Maintenance, Review
6. DeleteRequest, UserCreationRequest, UserDeleteRequest, AssetAddRequest
7. AuditLog, Notification, Attachment
8. SettingCategory, SystemSetting, SettingAuditLog
9. SecurityPolicy, NotificationPreference, UserPermissionOverride
10. OrganizationInfo, AssetDefaults, ReportConfiguration
11. SystemLog, UserProfileSettings

---

## VERIFICATION QUERIES

After migration, run these to verify:

```sql
-- Check all tables have tenant_id
SELECT table_name FROM information_schema.columns 
WHERE column_name = 'tenant_id' 
ORDER BY table_name;

-- Check indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE indexname LIKE '%tenant%' 
ORDER BY tablename;

-- Check constraints
SELECT constraint_name, table_name FROM information_schema.table_constraints 
WHERE constraint_type = 'UNIQUE' AND table_name LIKE '%'
ORDER BY table_name;

-- Verify RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies 
ORDER BY tablename;
```

---

## ROLLBACK PLAN

If something goes wrong:

```bash
# Restore from backup
psql asset_management < backup_[timestamp].sql

# Or revert last migration
npx prisma migrate resolve --rolled-back "add_multi_tenancy"
```
