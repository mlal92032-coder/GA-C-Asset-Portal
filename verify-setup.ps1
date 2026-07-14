# Verification script for database setup
# Run with: .\verify-setup.ps1

Write-Host "🔍 Verifying Asset Management Database Setup..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Docker
Write-Host "1️⃣  Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✓ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker not installed or not in PATH" -ForegroundColor Red
    Write-Host "   📥 Install from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    $allGood = $false
}

# Check 2: Docker Daemon Running
Write-Host "2️⃣  Checking Docker daemon..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "   ✓ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker daemon is not running" -ForegroundColor Red
    Write-Host "   💡 Start Docker Desktop and try again" -ForegroundColor Yellow
    $allGood = $false
}

# Check 3: Docker Compose
Write-Host "3️⃣  Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "   ✓ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker Compose not found" -ForegroundColor Red
    $allGood = $false
}

# Check 4: docker-compose.yml
Write-Host "4️⃣  Checking docker-compose.yml..." -ForegroundColor Yellow
if (Test-Path "./docker-compose.yml") {
    Write-Host "   ✓ docker-compose.yml found" -ForegroundColor Green
} else {
    Write-Host "   ❌ docker-compose.yml not found" -ForegroundColor Red
    $allGood = $false
}

# Check 5: Running Containers
Write-Host "5️⃣  Checking running containers..." -ForegroundColor Yellow
try {
    $containers = docker-compose ps --format "json" | ConvertFrom-Json
    if ($containers.Count -gt 0) {
        Write-Host "   ✓ Found $($containers.Count) running containers:" -ForegroundColor Green
        foreach ($container in $containers) {
            $status = $container.State
            $icon = if ($status -eq "running") { "✓" } else { "⚠️" }
            Write-Host "     $icon $($container.Service): $status" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ⚠️  No containers running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not check containers" -ForegroundColor Yellow
}

# Check 6: PostgreSQL Connectivity
Write-Host "6️⃣  Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgStatus = docker exec asset-management-db pg_isready -U admin -d asset_management 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ PostgreSQL is accepting connections" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PostgreSQL is not responding" -ForegroundColor Red
        Write-Host "   💡 Container may still be starting, wait 10-15 seconds" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host "   ⚠️  PostgreSQL container not accessible" -ForegroundColor Yellow
}

# Check 7: Redis Connectivity
Write-Host "7️⃣  Checking Redis..." -ForegroundColor Yellow
try {
    $redisStatus = docker exec asset-management-cache redis-cli ping 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Redis is responding" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Redis is not responding" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Redis container not accessible" -ForegroundColor Yellow
}

# Check 8: Node.js
Write-Host "8️⃣  Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not installed" -ForegroundColor Red
    Write-Host "   📥 Install from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

# Check 9: npm Packages
Write-Host "9️⃣  Checking npm packages..." -ForegroundColor Yellow
if (Test-Path "./node_modules/.package-lock.json") {
    Write-Host "   ✓ npm packages installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  npm packages not installed" -ForegroundColor Yellow
    Write-Host "   💡 Run: npm install" -ForegroundColor Cyan
}

# Check 10: Prisma Schema
Write-Host "🔟 Checking Prisma schema..." -ForegroundColor Yellow
if (Test-Path "./prisma/schema.prisma") {
    $content = Get-Content "./prisma/schema.prisma" -Raw
    if ($content -match 'provider = "postgresql"') {
        Write-Host "   ✓ Prisma configured for PostgreSQL" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Prisma not configured for PostgreSQL" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Prisma schema not found" -ForegroundColor Red
    $allGood = $false
}

# Check 11: Migration Scripts
Write-Host "1️⃣1️⃣  Checking migration scripts..." -ForegroundColor Yellow
$scripts = @(
    "./scripts/migrate-data.ts",
    "./setup-db.ps1",
    "./init.sql"
)
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "   ✓ Found: $script" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Missing: $script" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ All critical checks passed! Ready to run setup." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. npm install (if not done)" -ForegroundColor White
    Write-Host "  2. .\setup-db.ps1" -ForegroundColor White
    Write-Host "  3. npm run dev" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues found. Please address them above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  • Docker not running → Start Docker Desktop" -ForegroundColor White
    Write-Host "  • Containers won't start → Run: docker-compose down -v" -ForegroundColor White
    Write-Host "  • npm packages missing → Run: npm install" -ForegroundColor White
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
