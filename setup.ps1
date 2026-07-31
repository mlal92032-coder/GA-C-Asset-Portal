# 🚀 Asset Management System - Complete Setup Script
# Run this script to set up everything

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Asset Management System - Complete Setup Script       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "`n📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green

    # Start Docker services
    Write-Host "`n🐘 Starting PostgreSQL..." -ForegroundColor Yellow
    docker stop postgres-asset-mgmt redis-asset-mgmt 2>$null
    docker rm postgres-asset-mgmt redis-asset-mgmt 2>$null

    docker run --name postgres-asset-mgmt `
        -e POSTGRES_PASSWORD=password `
        -e POSTGRES_DB=asset_management `
        -p 5432:5432 `
        -d postgres:15

    Start-Sleep -Seconds 2

    Write-Host "✅ PostgreSQL started on port 5432" -ForegroundColor Green

    Write-Host "`n📦 Starting Redis..." -ForegroundColor Yellow
    docker run --name redis-asset-mgmt `
        -p 6379:6379 `
        -d redis:7

    Write-Host "✅ Redis started on port 6379" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker error. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "`n📚 Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 3: Database setup
Write-Host "`n🔄 Running database migrations..." -ForegroundColor Yellow
npm run db:migrate
Write-Host "✅ Migrations complete" -ForegroundColor Green

Write-Host "`n🌱 Seeding database..." -ForegroundColor Yellow
npm run db:seed
Write-Host "✅ Database seeded" -ForegroundColor Green

# Step 4: Environment check
Write-Host "`n🔧 Environment configuration:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
}

# Step 5: Ready to start
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✨ Setup Complete! ✨                                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📋 DEFAULT CREDENTIALS:" -ForegroundColor Cyan
Write-Host "   Email:    admin@company.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Run: npm run dev" -ForegroundColor White
Write-Host "   2. Open: http://localhost:3001" -ForegroundColor White
Write-Host "   3. Login with credentials above" -ForegroundColor White

Write-Host "`n🌐 VERCEL DEPLOYMENT:" -ForegroundColor Cyan
Write-Host "   Read: VERCEL_DEPLOYMENT.md" -ForegroundColor White

Write-Host "`n📊 OPTIONAL SERVICES:" -ForegroundColor Yellow
Write-Host "   WebSocket: npm run ws" -ForegroundColor Gray
Write-Host "   Jobs:      npm run jobs" -ForegroundColor Gray

Write-Host "`n✅ All done! Happy coding! 🎉`n" -ForegroundColor Green
