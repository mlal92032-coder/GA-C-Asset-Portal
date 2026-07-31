@echo off
chcp 65001 >nul

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 COMPLETE SETUP - Docker, Database & Everything     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is running
echo Checking Docker status...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ DOCKER NOT RUNNING!
    echo.
    echo Please follow these steps:
    echo 1. Open "Docker Desktop" application from Windows Start Menu
    echo 2. Wait for the Docker icon to show green checkmark (30-60 seconds)
    echo 3. Come back here and run this file again
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is running!
echo.

REM Stop existing containers
echo Stopping existing containers...
docker stop postgres-asset-mgmt redis-asset-mgmt >nul 2>&1
docker rm postgres-asset-mgmt redis-asset-mgmt >nul 2>&1

REM Start PostgreSQL
echo.
echo 🐘 Starting PostgreSQL...
docker run --name postgres-asset-mgmt ^
  -e POSTGRES_PASSWORD=password ^
  -e POSTGRES_DB=asset_management ^
  -p 5432:5432 ^
  -d postgres:15
echo ✅ PostgreSQL started

REM Wait for PostgreSQL
echo ⏳ Waiting for PostgreSQL (5 seconds)...
timeout /t 5 /nobreak

REM Start Redis
echo.
echo 📦 Starting Redis...
docker run --name redis-asset-mgmt ^
  -p 6379:6379 ^
  -d redis:7
echo ✅ Redis started

REM Wait for services
echo ⏳ Waiting for services to be ready...
timeout /t 3 /nobreak

REM Run migrations
echo.
echo 📊 Running database migrations...
cd /d C:\Users\Hp\asset-management
call npm run db:migrate

REM Seed database
echo.
echo 🌱 Seeding database...
call npm run db:seed

REM Summary
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  ✅ SETUP COMPLETE!                                    ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📋 LOGIN CREDENTIALS:
echo    Email:    admin@company.com
echo    Password: admin123
echo.
echo 🌐 OPEN IN BROWSER:
echo    http://localhost:3002
echo.
echo ✨ Everything is ready!
echo.
pause
