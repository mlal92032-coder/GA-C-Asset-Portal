# PostgreSQL Migration Guide
## From SQLite to Enterprise PostgreSQL

**Version:** 2.0  
**Date:** July 13, 2026  
**Scope:** Complete migration of Asset Management System

---

## TABLE OF CONTENTS

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Environment Setup](#environment-setup)
3. [Schema Migration](#schema-migration)
4. [Data Migration Strategy](#data-migration-strategy)
5. [Connection Pool Configuration](#connection-pool-configuration)
6. [Performance Tuning](#performance-tuning)
7. [Verification & Testing](#verification--testing)
8. [Cutover Process](#cutover-process)
9. [Rollback Plan](#rollback-plan)

---

## PRE-MIGRATION CHECKLIST

```markdown
Infrastructure:
  [ ] PostgreSQL 16+ cluster provisioned
  [ ] VPC/Network security configured
  [ ] Backup strategy defined
  [ ] Monitoring systems ready
  [ ] Disaster recovery plan documented

Team:
  [ ] Database administrators assigned
  [ ] Application team briefed
  [ ] Stakeholders notified
  [ ] Maintenance window scheduled
  [ ] Rollback procedure tested

Data:
  [ ] Database backup taken (SQLite)
  [ ] Data validation rules defined
  [ ] ETL process documented
  [ ] Data quality checks prepared
  [ ] Archive strategy established

Code:
  [ ] Connection string parameterized
  [ ] Prisma schema updated
  [ ] Migration scripts tested
  [ ] Rollback scripts created
  [ ] Environment variables configured
```

---

## ENVIRONMENT SETUP

### PostgreSQL Installation (Ubuntu/Debian)

```bash
#!/bin/bash
set -e

echo "Installing PostgreSQL 16..."
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16 postgresql-16-pg-trgm

echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "Checking version..."
psql --version

echo "PostgreSQL installation complete!"
```

### Docker Setup (Recommended for Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: asset-management-postgres
    environment:
      POSTGRES_DB: assetdb
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - asset-management
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d assetdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: asset-management-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - asset-management

  redis:
    image: redis:7-alpine
    container_name: asset-management-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - asset-management
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:

networks:
  asset-management:
    driver: bridge
```

### AWS RDS Setup (Production)

```bash
#!/bin/bash

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier asset-management-db \
  --db-instance-class db.t4g.large \
  --engine postgres \
  --engine-version 16.0 \
  --master-username dbadmin \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --multi-az \
  --backup-retention-period 30 \
  --backup-window "03:00-04:00" \
  --maintenance-window "mon:04:00-mon:05:00" \
  --enable-cloudwatch-logs-exports postgresql \
  --enable-iam-database-authentication \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name asset-management-subnet-group

# Wait for instance to be available
aws rds wait db-instance-available \
  --db-instance-identifier asset-management-db

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier asset-management-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

---

## SCHEMA MIGRATION

### Step 1: Update Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// [Schema definitions from ENTERPRISE_ARCHITECTURE.md]
// Copy all model definitions here

model User {
  id            String    @id @default(cuid())
  fullName      String    @map("full_name")
  email         String    @unique
  password      String
  department    String?
  designation   String?
  phone         String?
  role          Role      @default(VIEW_USER)
  status        Status    @default(ACTIVE)
  permissions   String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations...
  @@map("users")
  @@index([email])
  @@index([status])
}

// ... [all other models]
```

### Step 2: Create Migration

```bash
# Generate initial migration
npx prisma migrate dev --name init

# Or for production (without running)
npx prisma migrate dev --create-only --name init

# Review generated migration
cat prisma/migrations/*/migration.sql
```

### Step 3: Enhanced Schema with Indexes

```sql
-- Create schema file: prisma/migrations/001_create_base_schema/migration.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "earthdistance";
CREATE EXTENSION IF NOT EXISTS "cube";

-- Organizations Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(512),
  settings JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(active);
CREATE INDEX idx_organizations_created_at ON organizations(created_at DESC);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  department_id UUID,
  role VARCHAR(50) DEFAULT 'EMPLOYEE',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  login_count INT DEFAULT 0,
  two_fa_enabled BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_org_email ON users(org_id, email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);

-- Assets Table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_code VARCHAR(50) NOT NULL,
  serial_number VARCHAR(255),
  barcode VARCHAR(255),
  qr_code_data TEXT,
  asset_name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID,
  brand VARCHAR(100),
  model VARCHAR(100),
  purchase_date DATE,
  purchase_price DECIMAL(15,2),
  warranty_end_date DATE,
  last_maintenance_date DATE,
  condition VARCHAR(50) DEFAULT 'GOOD',
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  current_location_id UUID,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP,
  lifecycle_stage VARCHAR(50) DEFAULT 'IN_USE',
  depreciation_percentage DECIMAL(5,2) DEFAULT 0,
  current_value DECIMAL(15,2),
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX idx_assets_org_code ON assets(org_id, asset_code);
CREATE INDEX idx_assets_status ON assets(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_condition ON assets(condition);
CREATE INDEX idx_assets_location ON assets(current_location_id);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to_id);
CREATE INDEX idx_assets_created_at ON assets(created_at DESC);
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);
CREATE INDEX idx_assets_composite ON assets(org_id, status, assigned_to_id) WHERE deleted_at IS NULL;

-- Asset Movements Table
CREATE TABLE asset_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  from_employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  movement_type VARCHAR(50) NOT NULL,
  reason VARCHAR(255),
  expected_return_date DATE,
  actual_return_date DATE,
  notes TEXT,
  recorded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_movements_asset_id ON asset_movements(asset_id);
CREATE INDEX idx_asset_movements_type ON asset_movements(movement_type);
CREATE INDEX idx_asset_movements_recorded_at ON asset_movements(recorded_at DESC);

-- Maintenance Records Table
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,
  completion_date DATE,
  maintenance_type VARCHAR(100),
  description TEXT,
  cost DECIMAL(15,2),
  vendor_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_asset_id ON maintenance_records(asset_id);
CREATE INDEX idx_maintenance_date ON maintenance_records(maintenance_date DESC);
CREATE INDEX idx_maintenance_status ON maintenance_records(status);

-- Audit Logs Table (Immutable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_timestamp_range ON audit_logs(created_at DESC) 
  WHERE created_at > CURRENT_DATE - INTERVAL '1 year';
```

---

## DATA MIGRATION STRATEGY

### Step 1: SQLite Backup & Export

```bash
#!/bin/bash

# Backup SQLite database
cp dev.db dev.db.backup

# Export to SQL
sqlite3 dev.db .dump > sqlite_export.sql

# Export to CSV for verification
sqlite3 dev.db <<EOF
.mode csv
.output users_export.csv
SELECT * FROM users;
.output assets_export.csv
SELECT * FROM furniture_assets UNION ALL SELECT * FROM electronic_assets UNION ALL SELECT * FROM vehicle_assets;
EOF

echo "Export complete: sqlite_export.sql"
```

### Step 2: Create Migration Script

```typescript
// scripts/migrate-sqlite-to-postgres.ts

import { PrismaClient as SQLitePrisma } from '@prisma/client/sqlite';
import { PrismaClient as PostgresPrisma } from '@prisma/client/postgres';
import fs from 'fs';
import path from 'path';

const sqlitePrisma = new SQLitePrisma({
  datasources: { db: { url: 'file:./dev.db' } }
});

const postgresPrisma = new PostgresPrisma({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function migrateData() {
  console.log('Starting data migration from SQLite to PostgreSQL...\n');

  try {
    // 1. Migrate Organizations
    console.log('Migrating organizations...');
    const organizations = await sqlitePrisma.organization.findMany();
    for (const org of organizations) {
      await postgresPrisma.organization.create({ data: org });
    }
    console.log(`✓ Migrated ${organizations.length} organizations\n`);

    // 2. Migrate Users
    console.log('Migrating users...');
    const users = await sqlitePrisma.user.findMany();
    const userMap = new Map<string, string>();
    
    for (const user of users) {
      const newUser = await postgresPrisma.user.create({
        data: {
          email: user.email,
          full_name: user.fullName,
          password: user.password,
          department: user.department,
          designation: user.designation,
          phone: user.phone,
          role: user.role,
          status: user.status,
          permissions: user.permissions
        }
      });
      userMap.set(user.id, newUser.id);
    }
    console.log(`✓ Migrated ${users.length} users\n`);

    // 3. Migrate Companies (Organizations)
    console.log('Migrating companies...');
    const companies = await sqlitePrisma.company.findMany();
    const companyMap = new Map<string, string>();
    
    for (const company of companies) {
      const newCompany = await postgresPrisma.company.create({
        data: {
          company_name: company.companyName,
          address: company.address,
          phone: company.phone,
          email: company.email
        }
      });
      companyMap.set(company.id, newCompany.id);
    }
    console.log(`✓ Migrated ${companies.length} companies\n`);

    // 4. Migrate Locations
    console.log('Migrating locations...');
    const locations = await sqlitePrisma.location.findMany();
    const locationMap = new Map<string, string>();
    
    for (const loc of locations) {
      const newLoc = await postgresPrisma.location.create({
        data: {
          location_name: loc.locationName,
          building: loc.building,
          floor: loc.floor,
          room: loc.room,
          room_type: loc.roomType,
          description: loc.description
        }
      });
      locationMap.set(loc.id, newLoc.id);
    }
    console.log(`✓ Migrated ${locations.length} locations\n`);

    // 5. Migrate Furniture Assets
    console.log('Migrating furniture assets...');
    const furniture = await sqlitePrisma.furnitureAsset.findMany();
    let furnitureCount = 0;
    
    for (const asset of furniture) {
      await postgresPrisma.furnitureAsset.create({
        data: {
          asset_tag: asset.assetTag,
          asset_name: asset.assetName,
          serial_number: asset.serialNumber,
          image_url: asset.imageUrl,
          qr_password: asset.qrPassword,
          furniture_type: asset.furnitureType,
          material: asset.material,
          purchase_date: asset.purchaseDate,
          purchase_price: asset.purchasePrice,
          company_id: asset.companyId ? companyMap.get(asset.companyId) : null,
          location_id: asset.locationId ? locationMap.get(asset.locationId) : null,
          assigned_user_id: asset.assignedUserId ? userMap.get(asset.assignedUserId) : null,
          condition: asset.condition,
          status: asset.status,
          remarks: asset.remarks
        }
      });
      furnitureCount++;
    }
    console.log(`✓ Migrated ${furnitureCount} furniture assets\n`);

    // 6. Migrate Electronic Assets
    console.log('Migrating electronic assets...');
    const electronics = await sqlitePrisma.electronicAsset.findMany();
    let electronicsCount = 0;
    
    for (const asset of electronics) {
      await postgresPrisma.electronicAsset.create({
        data: {
          asset_tag: asset.assetTag,
          asset_name: asset.assetName,
          image_url: asset.imageUrl,
          qr_password: asset.qrPassword,
          device_type: asset.deviceType,
          brand: asset.brand,
          model: asset.model,
          serial_number: asset.serialNumber,
          purchase_date: asset.purchaseDate,
          warranty_end_date: asset.warrantyEndDate,
          company_id: asset.companyId ? companyMap.get(asset.companyId) : null,
          location_id: asset.locationId ? locationMap.get(asset.locationId) : null,
          assigned_user_id: asset.assignedUserId ? userMap.get(asset.assignedUserId) : null,
          condition: asset.condition,
          status: asset.status,
          last_maintenance_date: asset.lastMaintenanceDate
        }
      });
      electronicsCount++;
    }
    console.log(`✓ Migrated ${electronicsCount} electronic assets\n`);

    // 7. Migrate Vehicle Assets
    console.log('Migrating vehicle assets...');
    const vehicles = await sqlitePrisma.vehicleAsset.findMany();
    let vehicleCount = 0;
    
    for (const asset of vehicles) {
      await postgresPrisma.vehicleAsset.create({
        data: {
          asset_tag: asset.assetTag,
          asset_name: asset.assetName,
          serial_number: asset.serialNumber,
          image_url: asset.imageUrl,
          qr_password: asset.qrPassword,
          vehicle_type: asset.vehicleType,
          brand: asset.brand,
          model: asset.model,
          registration_number: asset.registrationNumber,
          engine_number: asset.engineNumber,
          chassis_number: asset.chassisNumber,
          fuel_type: asset.fuelType,
          purchase_date: asset.purchaseDate,
          purchase_price: asset.purchasePrice,
          company_id: asset.companyId ? companyMap.get(asset.companyId) : null,
          location_id: asset.locationId ? locationMap.get(asset.locationId) : null,
          assigned_user_id: asset.assignedUserId ? userMap.get(asset.assignedUserId) : null,
          condition: asset.condition,
          status: asset.status,
          last_service_date: asset.lastServiceDate,
          insurance_expiry_date: asset.insuranceExpiryDate
        }
      });
      vehicleCount++;
    }
    console.log(`✓ Migrated ${vehicleCount} vehicle assets\n`);

    // 8. Migrate Audit Logs
    console.log('Migrating audit logs...');
    const auditLogs = await sqlitePrisma.auditLog.findMany();
    
    for (const log of auditLogs) {
      await postgresPrisma.auditLog.create({
        data: {
          user_id: log.userId ? userMap.get(log.userId) : null,
          action: log.action,
          entity: log.entity,
          entity_id: log.entityId,
          details: log.details,
          created_at: log.createdAt
        }
      });
    }
    console.log(`✓ Migrated ${auditLogs.length} audit logs\n`);

    console.log('='.repeat(50));
    console.log('Migration Summary:');
    console.log('='.repeat(50));
    console.log(`Organizations: ${organizations.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Companies: ${companies.length}`);
    console.log(`Locations: ${locations.length}`);
    console.log(`Furniture Assets: ${furnitureCount}`);
    console.log(`Electronic Assets: ${electronicsCount}`);
    console.log(`Vehicle Assets: ${vehicleCount}`);
    console.log(`Audit Logs: ${auditLogs.length}`);
    console.log('='.repeat(50));
    console.log('\n✅ Migration complete!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('All data migrated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
```

### Step 3: Data Validation

```typescript
// scripts/validate-migration.ts

async function validateMigration() {
  console.log('Validating data migration...\n');

  const validations = [
    {
      name: 'User Count',
      query: () => postgresPrisma.user.count(),
      expected: sqliteUserCount
    },
    {
      name: 'Asset Count',
      query: async () => {
        const furniture = await postgresPrisma.furnitureAsset.count();
        const electronics = await postgresPrisma.electronicAsset.count();
        const vehicles = await postgresPrisma.vehicleAsset.count();
        return furniture + electronics + vehicles;
      },
      expected: sqliteAssetCount
    },
    {
      name: 'Unique Asset Tags',
      query: () => postgresPrisma.furnitureAsset.findMany({
        select: { asset_tag: true },
        distinct: ['asset_tag']
      }).then(a => a.length),
      expected: uniqueAssetTags
    },
    {
      name: 'Valid User Emails',
      query: async () => {
        const users = await postgresPrisma.user.findMany();
        return users.filter(u => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)).length;
      },
      expected: totalUserCount
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const validation of validations) {
    try {
      const result = await validation.query();
      const isValid = result === validation.expected;
      
      if (isValid) {
        console.log(`✓ ${validation.name}: ${result} (Expected: ${validation.expected})`);
        passed++;
      } else {
        console.log(`✗ ${validation.name}: ${result} (Expected: ${validation.expected})`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${validation.name}: Error - ${error.message}`);
      failed++;
    }
  }

  console.log(`\nValidation Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}
```

---

## CONNECTION POOL CONFIGURATION

### Update .env

```bash
# .env
DATABASE_URL="postgresql://admin:password@localhost:5432/assetdb?schema=public&connection_limit=20&pool_timeout=180"

# Optional Prisma specific settings
PRISMA_DATABASE_URL="postgresql://admin:password@localhost:5432/assetdb?schema=public"

# PgBouncer configuration (for connection pooling)
PGBOUNCER_CONNECTION_STRING="postgresql://admin:password@pgbouncer:6432/assetdb"
```

### PgBouncer Configuration

```ini
# pgbouncer.ini

[databases]
assetdb = host=postgres port=5432 dbname=assetdb user=admin password=password
default_pool_size = 25

[pgbouncer]
logfile = /var/log/pgbouncer/pgbouncer.log
pidfile = /var/run/pgbouncer/pgbouncer.pid
listen_port = 6432
listen_addr = 0.0.0.0
auth_type = plain
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
server_lifetime = 3600
server_idle_timeout = 600
query_wait_timeout = 120
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
max_client_conn = 1000
log_connections = 1
log_disconnections = 1
```

### Prisma Pool Configuration

```typescript
// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Enable query logging in development
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
  });

// Configure connection pool
prisma.$on('beforeExit', async () => {
  console.log('Disconnecting from database...');
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection pool monitoring
export async function getPoolStats() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        datname,
        count(*) as connections,
        max(now() - backend_start) as oldest_connection
      FROM pg_stat_activity
      WHERE datname IS NOT NULL
      GROUP BY datname
    `;
    return result;
  } catch (error) {
    console.error('Error getting pool stats:', error);
  }
}
```

---

## PERFORMANCE TUNING

### PostgreSQL Configuration Optimization

```sql
-- postgresql.conf (production settings)

-- Memory
shared_buffers = 256MB              -- 25% of system RAM
effective_cache_size = 1GB          -- 50% of system RAM
work_mem = 4MB                      -- Total RAM / (max_connections * 2)
maintenance_work_mem = 64MB

-- WAL (Write-Ahead Logging)
wal_buffers = 16MB
max_wal_size = 4GB
min_wal_size = 1GB
wal_level = replica

-- Parallelism
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4

-- Query Tuning
random_page_cost = 1.1              -- For SSD
effective_io_concurrency = 200
jit = on
jit_above_cost = 100000

-- Connections
max_connections = 200
superuser_reserved_connections = 10

-- Logging
log_statement = 'all'
log_duration = true
log_min_duration_statement = 1000   -- Log queries > 1 second
log_lock_waits = on
log_autovacuum_min_duration = 0
```

### Query Performance Analysis

```sql
-- Enable auto_explain for slow queries
CREATE EXTENSION IF NOT EXISTS auto_explain;
SET auto_explain.log_min_duration = 1000;  -- Log queries > 1s
SET auto_explain.log_analyze = true;

-- Check query execution plan
EXPLAIN ANALYZE
SELECT * FROM assets 
WHERE org_id = '123' AND status = 'AVAILABLE'
ORDER BY created_at DESC
LIMIT 10;

-- Identify missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY abs(correlation);

-- Monitor index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## VERIFICATION & TESTING

### Data Consistency Checks

```typescript
// scripts/verify-data-consistency.ts

async function verifyConsistency() {
  console.log('Running data consistency checks...\n');

  const checks = [
    {
      name: 'Orphaned Users',
      query: `
        SELECT COUNT(*) FROM users u
        WHERE u.org_id NOT IN (SELECT id FROM organizations)
      `
    },
    {
      name: 'Orphaned Assets',
      query: `
        SELECT COUNT(*) FROM assets a
        WHERE a.org_id NOT IN (SELECT id FROM organizations)
      `
    },
    {
      name: 'Assets with Invalid Assigned Users',
      query: `
        SELECT COUNT(*) FROM assets a
        WHERE a.assigned_to_id IS NOT NULL
          AND a.assigned_to_id NOT IN (SELECT id FROM users)
      `
    },
    {
      name: 'Duplicate Asset Codes',
      query: `
        SELECT org_id, asset_code, COUNT(*) as cnt
        FROM assets
        GROUP BY org_id, asset_code
        HAVING COUNT(*) > 1
      `
    },
    {
      name: 'Invalid Status Values',
      query: `
        SELECT DISTINCT status FROM assets
        WHERE status NOT IN ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'DISPOSED', 'LOST', 'STOLEN')
      `
    }
  ];

  for (const check of checks) {
    try {
      const result = await postgresPrisma.$queryRawUnsafe(check.query);
      console.log(`✓ ${check.name}:`, result);
    } catch (error) {
      console.log(`✗ ${check.name}: ${error.message}`);
    }
  }
}
```

### Load Testing

```bash
#!/bin/bash

# Using wrk for load testing
wrk -t12 -c400 -d30s \
  -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:3000/api/v1/assets

# Using k6 for more detailed load testing
k6 run scripts/load-test.js

# Monitor performance
watch -n 1 'psql -U admin -d assetdb -c "SELECT count(*) FROM pg_stat_activity;"'
```

```javascript
// scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
  rampUp: '10s',
};

export default function () {
  // Test asset listing
  const listRes = http.get('http://localhost:3000/api/v1/assets?page=1&limit=25');
  check(listRes, {
    'list status is 200': (r) => r.status === 200,
    'list time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test asset detail
  const detailRes = http.get('http://localhost:3000/api/v1/assets/asset-123');
  check(detailRes, {
    'detail status is 200': (r) => r.status === 200,
    'detail time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
```

---

## CUTOVER PROCESS

### Step 1: Pre-Cutover Validation

```bash
#!/bin/bash

echo "Pre-Cutover Checklist:"
echo "====================="

# Check database connectivity
echo "Testing PostgreSQL connection..."
psql -h localhost -U admin -d assetdb -c "SELECT 1;" || exit 1
echo "✓ PostgreSQL connection successful"

# Verify data migration
echo "Verifying data counts..."
SQLITE_COUNT=$(sqlite3 dev.db "SELECT COUNT(*) FROM users;" | head -1)
POSTGRES_COUNT=$(psql -h localhost -U admin -d assetdb -t -c "SELECT COUNT(*) FROM users;")
echo "SQLite users: $SQLITE_COUNT"
echo "PostgreSQL users: $POSTGRES_COUNT"

if [ "$SQLITE_COUNT" -eq "$POSTGRES_COUNT" ]; then
  echo "✓ User counts match"
else
  echo "✗ User counts don't match - aborting cutover!"
  exit 1
fi

# Test application against PostgreSQL
echo "Testing application..."
DATABASE_URL="postgresql://admin:password@localhost:5432/assetdb" npm test

# Check backup
if [ -f "dev.db.backup" ]; then
  echo "✓ Backup exists"
else
  echo "✗ No backup found - aborting cutover!"
  exit 1
fi

echo "✓ All pre-cutover checks passed!"
```

### Step 2: Switch Connection String

```bash
# Update .env to use PostgreSQL
echo 'DATABASE_URL="postgresql://admin:password@postgres:5432/assetdb"' > .env.production

# Deploy application
git commit -am "Switch to PostgreSQL"
git push origin main

# Monitor deployment
kubectl rollout status deployment/asset-management-api -n production
```

### Step 3: Post-Cutover Verification

```typescript
// Monitor application health after cutover

async function postCutoverVerification() {
  console.log('Post-Cutover Verification...\n');

  const tests = [
    {
      name: 'API Health Check',
      test: () => fetch('http://localhost:3000/health').then(r => r.ok)
    },
    {
      name: 'Database Connectivity',
      test: () => prisma.user.count().then(count => count >= 0)
    },
    {
      name: 'Assets Accessible',
      test: () => prisma.asset.findMany({ take: 1 }).then(a => a.length >= 0)
    },
    {
      name: 'Audit Logs Recording',
      test: async () => {
        const before = await prisma.auditLog.count();
        // Create a test audit log
        await createAuditLog({ ... });
        const after = await prisma.auditLog.count();
        return after > before;
      }
    },
    {
      name: 'Cache Functionality',
      test: async () => {
        await redis.set('test-key', 'test-value');
        const value = await redis.get('test-key');
        return value === 'test-value';
      }
    }
  ];

  let passedCount = 0;
  for (const test of tests) {
    try {
      const result = await test.test();
      console.log(result ? `✓ ${test.name}` : `✗ ${test.name}`);
      if (result) passedCount++;
    } catch (error) {
      console.log(`✗ ${test.name}: ${error.message}`);
    }
  }

  console.log(`\n${passedCount}/${tests.length} tests passed`);
  return passedCount === tests.length;
}
```

---

## ROLLBACK PLAN

### If Issues Occur

```bash
#!/bin/bash

echo "Rolling back to SQLite..."

# 1. Stop application
kubectl scale deployment/asset-management-api --replicas=0 -n production

# 2. Restore SQLite backup
cp dev.db.backup dev.db

# 3. Switch connection string back
echo 'DATABASE_URL="file:./dev.db"' > .env.production

# 4. Redeploy with previous version
git checkout HEAD~1
git push --force origin main

# 5. Resume application
kubectl scale deployment/asset-management-api --replicas=3 -n production

# 6. Verify
kubectl rollout status deployment/asset-management-api -n production

echo "Rollback complete!"
```

---

## MIGRATION TIMING GUIDE

| Phase | Duration | Notes |
|-------|----------|-------|
| Setup & Preparation | 2-3 days | Infrastructure, backups, team briefing |
| Schema Creation | 1-2 hours | Create PostgreSQL schema |
| Data Migration | 2-4 hours | Depends on data volume (current ~100K records = <1hr) |
| Validation & Testing | 2-3 hours | Run consistency checks, load tests |
| Application Testing | 1-2 hours | Integration tests, smoke tests |
| Cutover | 30 minutes | Switch connection string, deploy |
| Post-Cutover Monitoring | 24 hours | Monitor application performance |

---

## SUCCESS CRITERIA

- All data migrated without loss
- Response times < 200ms (improvement from SQLite)
- Zero data inconsistencies
- All audit logs recorded
- Application performance improved by 50%+
- Zero downtime cutover achieved
- Rollback plan validated

---

**Document Version:** 1.0  
**Last Updated:** July 13, 2026
