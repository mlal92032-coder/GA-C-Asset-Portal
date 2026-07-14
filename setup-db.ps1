# PowerShell Database Setup Script for Asset Management System
# Run with: .\setup-db.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Asset Management Database Setup..." -ForegroundColor Green

# Step 1: Check Docker
Write-Host "Step 1: Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop for Windows." -ForegroundColor Red
    Write-Host "   Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Step 2: Stop existing containers if running
Write-Host "Step 2: Cleaning up existing containers..." -ForegroundColor Yellow
try {
    docker-compose down --remove-orphans 2>$null
    Start-Sleep -Seconds 2
    Write-Host "✓ Existing containers removed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No existing containers to remove" -ForegroundColor Yellow
}

# Step 3: Start PostgreSQL, Redis, PgBouncer, and Adminer
Write-Host "Step 3: Starting PostgreSQL, Redis, PgBouncer, and Adminer..." -ForegroundColor Yellow
docker-compose up -d postgres redis pgbouncer adminer
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 4: Verify PostgreSQL connection
Write-Host "Step 4: Verifying PostgreSQL connectivity..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        docker exec asset-management-db pg_isready -U admin -d asset_management | Out-Null
        Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
        break
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "  Waiting for PostgreSQL... ($retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        } else {
            Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
            exit 1
        }
    }
}

# Step 5: Verify Redis
Write-Host "Step 5: Verifying Redis connectivity..." -ForegroundColor Yellow
docker exec asset-management-cache redis-cli ping
Write-Host "✓ Redis is ready" -ForegroundColor Green

# Step 6: Initialize PostgreSQL with custom SQL
Write-Host "Step 6: Initializing PostgreSQL schema..." -ForegroundColor Yellow
$initSql = Get-Content "init.sql" -Raw
docker exec -i asset-management-db psql -U admin -d asset_management -q <<< $initSql
Write-Host "✓ PostgreSQL schema initialized" -ForegroundColor Green

# Step 7: Generate Prisma Client
Write-Host "Step 7: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✓ Prisma Client generated" -ForegroundColor Green

# Step 8: Run Prisma Migration
Write-Host "Step 8: Running Prisma migrations..." -ForegroundColor Yellow
npm run db:migrate
Write-Host "✓ Prisma migrations deployed" -ForegroundColor Green

# Step 9: Create Backup Directory
Write-Host "Step 9: Creating backup directory..." -ForegroundColor Yellow
if (!(Test-Path "./backups")) {
    New-Item -ItemType Directory -Path "./backups" | Out-Null
}
Write-Host "✓ Backup directory created" -ForegroundColor Green

# Step 10: Create Initial Backup
Write-Host "Step 10: Creating initial database backup..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "./backups/backup-$timestamp.sql"
docker exec asset-management-db pg_dump -U admin asset_management > $backupPath
Write-Host "✓ Backup created: $backupPath" -ForegroundColor Green

# Step 11: Verify Database Setup
Write-Host "Step 11: Verifying database setup..." -ForegroundColor Yellow
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT version();" | Out-Null
$tableCount = docker exec asset-management-db psql -U admin -d asset_management -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
Write-Host "✓ Database verified with $($tableCount.Trim()) tables" -ForegroundColor Green

# Step 12: Seed Data (Optional)
Write-Host "Step 12: Seeding initial data (if available)..." -ForegroundColor Yellow
try {
    npm run db:seed
    Write-Host "✓ Seed data loaded" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Seed completed or skipped" -ForegroundColor Yellow
}

# Final Summary
Write-Host ""
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Green
Write-Host "  📊 PostgreSQL:  localhost:5432" -ForegroundColor Cyan
Write-Host "  🔄 PgBouncer:   localhost:6432" -ForegroundColor Cyan
Write-Host "  💾 Redis:       localhost:6379" -ForegroundColor Cyan
Write-Host "  🌐 Adminer:     http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. npm install" -ForegroundColor White
Write-Host "  2. npm run dev" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000" -ForegroundColor White
Write-Host ""
