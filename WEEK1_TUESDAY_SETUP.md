# Week 1: Tuesday - PostgreSQL Migration & Data Setup

## ⚠️ Prerequisites: Docker Installation Required

Docker is not currently installed on this system. Follow these steps to install Docker Desktop for Windows:

### 1. Install Docker Desktop for Windows

1. Download from: https://www.docker.com/products/docker-desktop
2. Run the installer and follow the setup wizard
3. Enable WSL 2 (Windows Subsystem for Linux 2) when prompted
4. Restart your computer
5. Open PowerShell and verify:
   ```powershell
   docker --version
   docker-compose --version
   ```

## Week 1: Tuesday Execution Plan

Once Docker is installed, follow these steps in order:

### Step 1: Start Docker Containers
```powershell
cd C:\Users\Hp\asset-management
docker-compose up -d
```

Verify containers are running:
```powershell
docker-compose ps
```

You should see:
- `postgres` (port 5432) - PostgreSQL database
- `redis` (port 6379) - Redis cache
- `pgbouncer` (port 6432) - Connection pooler
- `adminer` (port 8080) - Admin interface

### Step 2: Wait for PostgreSQL to be Ready
```powershell
# Wait until PostgreSQL is responding to connections (usually 10-15 seconds)
Start-Sleep -Seconds 15

# Test PostgreSQL connection
docker exec asset-management-db pg_isready -U admin -d asset_management
```

### Step 3: Initialize Database Schema
```powershell
# Load the init.sql script into PostgreSQL
docker exec -i asset-management-db psql -U admin -d asset_management < init.sql
```

### Step 4: Generate Prisma Client
```powershell
# Install dependencies if not already done
npm install

# Generate Prisma client for PostgreSQL
npx prisma generate
```

### Step 5: Create Initial Prisma Migration
```powershell
# Create migration from current schema
npx prisma migrate dev --name init_schema

# Or just deploy existing migrations
npm run db:migrate
```

### Step 6: Run Data Migration Script
If you have existing SQLite data:
```powershell
npx ts-node scripts/migrate-data.ts
```

This will:
- Read all data from `dev.db` (SQLite)
- Migrate to PostgreSQL
- Create detailed migration report

### Step 7: Verify Data Migration
```powershell
# Check record counts
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM companies) as companies,
  (SELECT COUNT(*) FROM locations) as locations,
  (SELECT COUNT(*) FROM furniture_assets) as furniture,
  (SELECT COUNT(*) FROM electronic_assets) as electronics,
  (SELECT COUNT(*) FROM vehicle_assets) as vehicles;"
```

### Step 8: Create Initial Backup
```powershell
# Create backups directory if it doesn't exist
if (!(Test-Path "./backups")) { New-Item -ItemType Directory -Path "./backups" }

# Create backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker exec asset-management-db pg_dump -U admin asset_management > "./backups/backup-$timestamp.sql"

Write-Host "✓ Backup created at: ./backups/backup-$timestamp.sql"
```

### Step 9: Seed Sample Data (Optional)
```powershell
npm run db:seed
```

### Step 10: Verify Setup
```powershell
# Check PostgreSQL version
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT version();"

# Check table count
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Test Redis
docker exec asset-management-cache redis-cli ping
```

## Access Points After Setup

- **PostgreSQL**: `localhost:5432` (credentials: admin/admin@postgres123)
- **PgBouncer**: `localhost:6432` (connection pooler)
- **Redis**: `localhost:6379`
- **Adminer**: http://localhost:8080 (web-based database admin)

## Quick Test: Verify Everything Works

```powershell
# Start development server
npm run dev

# In another PowerShell window, test API
curl http://localhost:3000/api/health

# Access application
# Open browser to http://localhost:3000
```

## Troubleshooting

### PostgreSQL Container Won't Start
```powershell
# Check logs
docker logs asset-management-db

# Remove and restart
docker-compose down -v
docker-compose up -d postgres
```

### Connection Issues
```powershell
# Check if containers are running
docker-compose ps

# Restart containers
docker-compose restart

# Verify network
docker network ls
docker inspect asset-management_default
```

### Migration Failed
```powershell
# Check Prisma status
npx prisma db push --skip-generate

# Review migration files
ls prisma/migrations/
```

## Next: Week 1 Wednesday Tasks

Once this completes:
- Backup and disaster recovery procedures
- Data integrity verification
- Performance baseline testing
- Connection pooling validation

