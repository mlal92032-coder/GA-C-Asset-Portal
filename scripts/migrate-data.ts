/**
 * Data Migration Script
 * Migrates data from SQLite (old) to PostgreSQL (new)
 * Run with: npx ts-node scripts/migrate-data.ts
 */

import { PrismaClient as PrismaClientSQLite } from '@prisma/client';
import { PrismaClient as PrismaClientPostgres } from '@prisma/client';

const oldDb = new PrismaClientSQLite({
  datasources: {
    db: {
      url: 'file:./dev.db', // SQLite
    },
  },
});

const newDb = new PrismaClientPostgres({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // PostgreSQL
    },
  },
});

interface MigrationStats {
  users: number;
  companies: number;
  locations: number;
  manufacturers: number;
  furniture: number;
  electronics: number;
  vehicles: number;
  checkouts: number;
  maintenance: number;
  auditLogs: number;
  total: number;
}

const stats: MigrationStats = {
  users: 0,
  companies: 0,
  locations: 0,
  manufacturers: 0,
  furniture: 0,
  electronics: 0,
  vehicles: 0,
  checkouts: 0,
  maintenance: 0,
  auditLogs: 0,
  total: 0,
};

async function migrateData() {
  try {
    console.log('🚀 Starting Data Migration (SQLite → PostgreSQL)...\n');

    // Step 1: Migrate Companies
    console.log('📦 Migrating Companies...');
    const companies = await oldDb.company.findMany();
    for (const company of companies) {
      try {
        await newDb.company.upsert({
          where: { id: company.id },
          update: company,
          create: company,
        });
        stats.companies++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating company ${company.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.companies} companies\n`);

    // Step 2: Migrate Locations
    console.log('📍 Migrating Locations...');
    const locations = await oldDb.location.findMany();
    for (const location of locations) {
      try {
        await newDb.location.upsert({
          where: { id: location.id },
          update: location,
          create: location,
        });
        stats.locations++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating location ${location.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.locations} locations\n`);

    // Step 3: Migrate Manufacturers
    console.log('🏭 Migrating Manufacturers...');
    const manufacturers = await oldDb.manufacturer.findMany();
    for (const manufacturer of manufacturers) {
      try {
        await newDb.manufacturer.upsert({
          where: { id: manufacturer.id },
          update: manufacturer,
          create: manufacturer,
        });
        stats.manufacturers++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating manufacturer ${manufacturer.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.manufacturers} manufacturers\n`);

    // Step 4: Migrate Users
    console.log('👥 Migrating Users...');
    const users = await oldDb.user.findMany();
    for (const user of users) {
      try {
        await newDb.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
        stats.users++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating user ${user.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.users} users\n`);

    // Step 5: Migrate Furniture Assets
    console.log('🪑 Migrating Furniture Assets...');
    const furniture = await oldDb.furnitureAsset.findMany();
    for (const item of furniture) {
      try {
        await newDb.furnitureAsset.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
        stats.furniture++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating furniture ${item.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.furniture} furniture items\n`);

    // Step 6: Migrate Electronic Assets
    console.log('💻 Migrating Electronic Assets...');
    const electronics = await oldDb.electronicAsset.findMany();
    for (const item of electronics) {
      try {
        await newDb.electronicAsset.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
        stats.electronics++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating electronic ${item.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.electronics} electronic items\n`);

    // Step 7: Migrate Vehicle Assets
    console.log('🚗 Migrating Vehicle Assets...');
    const vehicles = await oldDb.vehicleAsset.findMany();
    for (const item of vehicles) {
      try {
        await newDb.vehicleAsset.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        });
        stats.vehicles++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating vehicle ${item.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.vehicles} vehicle items\n`);

    // Step 8: Migrate Checkouts
    console.log('📤 Migrating Asset Checkouts...');
    const checkouts = await oldDb.assetCheckout.findMany();
    for (const checkout of checkouts) {
      try {
        await newDb.assetCheckout.upsert({
          where: { id: checkout.id },
          update: checkout,
          create: checkout,
        });
        stats.checkouts++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating checkout ${checkout.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.checkouts} checkouts\n`);

    // Step 9: Migrate Maintenance
    console.log('🔧 Migrating Maintenance Records...');
    const maintenance = await oldDb.maintenance.findMany();
    for (const record of maintenance) {
      try {
        await newDb.maintenance.upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
        stats.maintenance++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating maintenance ${record.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.maintenance} maintenance records\n`);

    // Step 10: Migrate Audit Logs
    console.log('📋 Migrating Audit Logs...');
    const auditLogs = await oldDb.auditLog.findMany();
    for (const log of auditLogs) {
      try {
        await newDb.auditLog.upsert({
          where: { id: log.id },
          update: log,
          create: log,
        });
        stats.auditLogs++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating audit log ${log.id}:`, error.message);
      }
    }
    console.log(`  ✓ Migrated ${stats.auditLogs} audit logs\n`);

    // Calculate total
    stats.total =
      stats.users +
      stats.companies +
      stats.locations +
      stats.manufacturers +
      stats.furniture +
      stats.electronics +
      stats.vehicles +
      stats.checkouts +
      stats.maintenance +
      stats.auditLogs;

    // Print summary
    console.log('📊 Migration Summary:');
    console.log(`  ✓ Users: ${stats.users}`);
    console.log(`  ✓ Companies: ${stats.companies}`);
    console.log(`  ✓ Locations: ${stats.locations}`);
    console.log(`  ✓ Manufacturers: ${stats.manufacturers}`);
    console.log(`  ✓ Furniture Assets: ${stats.furniture}`);
    console.log(`  ✓ Electronic Assets: ${stats.electronics}`);
    console.log(`  ✓ Vehicle Assets: ${stats.vehicles}`);
    console.log(`  ✓ Checkouts: ${stats.checkouts}`);
    console.log(`  ✓ Maintenance: ${stats.maintenance}`);
    console.log(`  ✓ Audit Logs: ${stats.auditLogs}`);
    console.log(`\n  📈 Total Records Migrated: ${stats.total}\n`);

    console.log('✅ Data migration completed successfully!\n');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  }
}

// Run migration
migrateData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
