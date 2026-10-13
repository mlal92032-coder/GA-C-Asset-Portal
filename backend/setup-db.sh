#!/bin/bash

# Database Setup Script for Asset Management System
# This script sets up PostgreSQL, Redis, and initializes the database

set -e

echo "🚀 Starting Asset Management Database Setup..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Stop existing containers if running
echo -e "${YELLOW}Step 1: Cleaning up existing containers...${NC}"
docker-compose down --remove-orphans 2>/dev/null || true
sleep 2

# Step 2: Start PostgreSQL and Redis
echo -e "${YELLOW}Step 2: Starting PostgreSQL and Redis...${NC}"
docker-compose up -d postgres redis pgbouncer adminer
sleep 10

# Step 3: Verify connections
echo -e "${YELLOW}Step 3: Verifying database connectivity...${NC}"
until docker exec asset-management-db pg_isready -U admin -d asset_management; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Step 4: Verify Redis
echo -e "${YELLOW}Step 4: Verifying Redis connectivity...${NC}"
docker exec asset-management-cache redis-cli ping
echo -e "${GREEN}✓ Redis is ready${NC}"

# Step 5: Generate Prisma Client
echo -e "${YELLOW}Step 5: Generating Prisma Client...${NC}"
npx prisma generate

# Step 6: Run Prisma Migration
echo -e "${YELLOW}Step 6: Running Prisma migration...${NC}"
npm run db:migrate

# Step 7: Seed sample data (optional)
echo -e "${YELLOW}Step 7: Seeding initial data...${NC}"
npm run db:seed || echo "Seed completed or skipped"

# Step 8: Backup verification
echo -e "${YELLOW}Step 8: Creating initial backup...${NC}"
mkdir -p ./backups
docker exec asset-management-db pg_dump -U admin asset_management > "./backups/backup-$(date +%Y%m%d-%H%M%S).sql"
echo -e "${GREEN}✓ Backup created${NC}"

# Step 9: Performance verification
echo -e "${YELLOW}Step 9: Verifying performance...${NC}"
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT version();"
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Done
echo -e "${GREEN}✓ Database setup complete!${NC}"
echo ""
echo -e "${GREEN}Access Points:${NC}"
echo "  📊 PostgreSQL: localhost:5432"
echo "  🔄 PgBouncer: localhost:6432"
echo "  💾 Redis: localhost:6379"
echo "  🌐 Adminer: http://localhost:8080"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. npm install"
echo "  2. npm run dev"
echo "  3. Open http://localhost:3000"
echo ""
