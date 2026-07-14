# Week 1: Tuesday - Command Reference Card
# Copy and paste these commands in order

# =============================================================================
# PHASE 1: START DOCKER CONTAINERS
# =============================================================================

cd C:\Users\Hp\asset-management
docker-compose up -d
docker-compose ps  # Verify all 4 containers are running

# =============================================================================
# PHASE 2: INITIALIZE DATABASE
# =============================================================================

Start-Sleep -Seconds 15  # Wait for PostgreSQL to start
docker exec asset-management-db pg_isready -U admin -d asset_management

# Load initialization script (triggers, functions, indexes)
Get-Content init.sql | docker exec -i asset-management-db psql -U admin -d asset_management -q

# Verify tables were created
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"

# =============================================================================
# PHASE 3: SETUP PRISMA
# =============================================================================

npm install  # Install Node dependencies
npx prisma generate  # Generate Prisma client
npm run db:migrate  # Deploy migrations

# =============================================================================
# PHASE 4: MIGRATE DATA (Only if you have existing dev.db)
# =============================================================================

npx ts-node scripts/migrate-data.ts

# =============================================================================
# PHASE 5: SEED TEST DATA
# =============================================================================

npm run db:seed

# =============================================================================
# PHASE 6: CREATE BACKUP
# =============================================================================

if (!(Test-Path "./backups")) { New-Item -ItemType Directory -Path "./backups" | Out-Null }
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker exec asset-management-db pg_dump -U admin asset_management > "./backups/backup-$timestamp.sql"

# =============================================================================
# PHASE 7: VERIFY EVERYTHING
# =============================================================================

# PostgreSQL
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT version();"

# Redis
docker exec asset-management-cache redis-cli ping

# Adminer - Open in browser: http://localhost:8080
# Username: admin
# Password: admin@postgres123

# =============================================================================
# PHASE 8: START APPLICATION
# =============================================================================

npm run dev

# In another PowerShell window, test:
curl http://localhost:3000/api/health

# Open browser: http://localhost:3000
# Login with:
#   Email: admin@company.com
#   Password: admin123

# =============================================================================
# USEFUL COMMANDS DURING SETUP
# =============================================================================

# View container logs
docker logs asset-management-db
docker logs asset-management-cache

# Stop all containers
docker-compose down

# Remove everything and start fresh
docker-compose down -v

# Check container status
docker-compose ps

# Connect to PostgreSQL directly
docker exec -it asset-management-db psql -U admin -d asset_management

# Check Redis
docker exec asset-management-cache redis-cli
docker exec asset-management-cache redis-cli ping

# Check PgBouncer status
docker exec asset-management-pgbouncer psql -p 6432 -U admin -d asset_management -c "SHOW POOLS;"

# View current database size
docker exec asset-management-db psql -U admin -d asset_management -c "SELECT pg_size_pretty(pg_database_size('asset_management')) as size;"

# List all tables
docker exec asset-management-db psql -U admin -d asset_management -c "\dt"

# Count records per table
docker exec asset-management-db psql -U admin -d asset_management -c "
  SELECT
    schemaname,
    tablename,
    n_live_tup as row_count
  FROM pg_stat_user_tables
  ORDER BY n_live_tup DESC;"

# =============================================================================
# TROUBLESHOOTING COMMANDS
# =============================================================================

# If Docker containers won't start
docker-compose down -v
docker-compose up -d

# If PostgreSQL connection fails
# Wait longer:
Start-Sleep -Seconds 30
docker exec asset-management-db pg_isready -U admin -d asset_management

# Reset Prisma schema
npx prisma db push --force-reset

# View Prisma migrations
dir prisma/migrations/

# Recreate migration
npx prisma migrate dev --name init_schema

# Verify Node dependencies
npm list | head -20

# Check .env file
Get-Content .env

# =============================================================================
# OPTIONAL: DETAILED DATABASE INSPECTION
# =============================================================================

# Get comprehensive database stats
docker exec asset-management-db psql -U admin -d asset_management -c "
  SELECT
    'Total Tables' as metric,
    count(*) as value
  FROM information_schema.tables
  WHERE table_schema = 'public'
  UNION ALL
  SELECT 'Total Columns', count(*) FROM information_schema.columns WHERE table_schema = 'public'
  UNION ALL
  SELECT 'Total Indexes', count(*) FROM pg_indexes WHERE schemaname = 'public';"

# Check index usage
docker exec asset-management-db psql -U admin -d asset_management -c "
  SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
  FROM pg_stat_user_indexes
  ORDER BY idx_scan DESC;"

# View query performance
docker exec asset-management-db psql -U admin -d asset_management -c "
  SELECT query, calls, mean_exec_time, max_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;"

# =============================================================================
# END OF REFERENCE GUIDE
# =============================================================================
