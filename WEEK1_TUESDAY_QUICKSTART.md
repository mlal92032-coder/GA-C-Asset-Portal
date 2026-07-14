# ⚡ Week 1: Tuesday - Quick Start Implementation

## Current Status
- ✅ Docker Compose configuration ready (`docker-compose.yml`)
- ✅ PostgreSQL schema defined (`prisma/schema.prisma`)
- ✅ Database initialization script ready (`init.sql`)
- ✅ Data migration script ready (`scripts/migrate-data.ts`)
- ✅ Backup automation ready (`setup-db.sh` / `setup-db.ps1`)
- ❌ **BLOCKER**: Docker Desktop not installed

## 🚨 ACTION REQUIRED: Install Docker Desktop for Windows

### Quick Install (5 minutes)

1. **Download Docker Desktop**
   ```
   https://www.docker.com/products/docker-desktop
   ```

2. **Run Installer**
   - Double-click `Docker Desktop Installer.exe`
   - Select "Install required Windows components for WSL 2"
   - Complete setup wizard
   - **Restart your computer when prompted**

3. **Verify Installation** (PowerShell as Admin)
   ```powershell
   docker --version
   docker-compose --version
   ```

   Expected output:
   ```
   Docker version 26.x.x
   Docker Compose version 2.x.x
   ```

---

## 📋 Week 1: Tuesday Execution Steps

Once Docker is installed, run these commands in order:

### ✅ Step 1: Start Docker Containers (1 minute)

```powershell
cd C:\Users\Hp\asset-management
docker-compose up -d
```

Verify containers are running:
```powershell
docker-compose ps
```

Expected output shows 4 healthy containers:
- `postgres` (port 5432)
- `redis` (port 6379)
- `pgbouncer` (port 6432)
- `adminer` (port 8080)

### ✅ Step 2: Wait for PostgreSQL to Be Ready (2 minutes)

```powershell
Start-Sleep -Seconds 15

# Verify PostgreSQL is accepting connections
docker exec asset-management-db pg_isready -U admin -d asset_management
```

Expected: "accepting connections"

### ✅ Step 3: Initialize PostgreSQL Schema (1 minute)

```powershell
# Load custom initialization (triggers, functions, indexes)
Get-Content init.sql | docker exec -i asset-management-db psql -U admin -d asset_management -q
```

### ✅ Step 4: Install Node Dependencies (2 minutes)

```powershell
npm install
```

### ✅ Step 5: Generate Prisma Client (1 minute)

```powershell
npx prisma generate
```

### ✅ Step 6: Create Prisma Migration (2 minutes)

Option A - Create new migration:
```powershell
npx prisma migrate dev --name init_schema
```

Option B - Deploy existing migrations:
```powershell
npm run db:migrate
```

### ✅ Step 7: Migrate SQLite Data to PostgreSQL (5 minutes)

If you have existing `dev.db` (SQLite) data:

```powershell
npx ts-node scripts/migrate-data.ts
```

This will:
- Read all data from `dev.db`
- Migrate to PostgreSQL
- Show detailed migration report with counts

### ✅ Step 8: Seed Sample Data (1 minute)

```powershell
npm run db:seed
```

Creates test accounts and sample assets

### ✅ Step 9: Create Database Backup (1 minute)

```powershell
# Create backups folder
if (!(Test-Path "./backups")) { New-Item -ItemType Directory -Path "./backups" | Out-Null }

# Create backup with timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker exec asset-management-db pg_dump -U admin asset_management > "./backups/backup-$timestamp.sql"

Write-Host "✓ Backup created: ./backups/backup-$timestamp.sql"
```

### ✅ Step 10: Verify Setup (2 minutes)

```powershell
# Check PostgreSQL version
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT version();"

# Check table count
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Test Redis connectivity
docker exec asset-management-cache redis-cli ping
```

---

## 🧪 Verify Everything Works

```powershell
# Start development server
npm run dev

# In another PowerShell window, test the API
curl http://localhost:3000/api/health
```

Open browser: **http://localhost:3000**

---

## 📊 Access Points

After successful setup:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | Use seeded accounts |
| **PostgreSQL** | localhost:5432 | admin / admin@postgres123 |
| **PgBouncer** | localhost:6432 | admin / admin@postgres123 |
| **Redis** | localhost:6379 | (no auth required) |
| **Adminer** | http://localhost:8080 | admin / admin@postgres123 |

---

## 🔐 Seeded Test Accounts

After running seed:

```
Admin Account:
  Email: admin@company.com
  Password: admin123
  Role: SUPER_ADMIN

Regular User:
  Email: user@company.com
  Password: user123
  Role: USER
```

---

## ❌ Troubleshooting

### Docker containers won't start
```powershell
# Check logs
docker logs asset-management-db

# Force restart
docker-compose down -v
docker-compose up -d
```

### PostgreSQL connection refused
```powershell
# Wait longer and retry
Start-Sleep -Seconds 30
docker exec asset-management-db pg_isready -U admin -d asset_management
```

### Prisma migration fails
```powershell
# Check database connectivity
npx prisma db execute --stdin --file init.sql

# Or manually push schema
npx prisma db push --skip-generate
```

### Migration script fails
```powershell
# Check if SQLite file exists
Test-Path prisma/dev.db

# View migration errors
npx ts-node scripts/migrate-data.ts
```

---

## ⏱️ Total Time: ~20 minutes

If Docker is already installed, you can complete all steps in approximately 20 minutes.

---

## 📅 Next: Week 1 Wednesday

After successful Tuesday setup:
- ✅ Database replicated from SQLite to PostgreSQL
- ✅ All tables and indexes created
- ✅ Backup strategy in place
- ✅ Development environment ready

**Wednesday tasks:**
- Data integrity verification
- Performance baseline testing
- Connection pooling validation
- Disaster recovery testing

