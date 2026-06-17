import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbPath.replace(/\\/g, '/')}` }) });

const manufacturers = [
  // Electronics brands from ACs & appliances
  { manufacturerName: 'Gree', country: 'China' },
  { manufacturerName: 'Haier', country: 'China' },
  { manufacturerName: 'Mitsubishi', country: 'Japan' },
  { manufacturerName: 'Daikin', country: 'Japan' },
  { manufacturerName: 'Acson', country: 'Malaysia' },
  { manufacturerName: 'Pel', country: 'Pakistan' },
  { manufacturerName: 'Dawlance', country: 'Pakistan' },

  // Vehicle brands
  { manufacturerName: 'Toyota', country: 'Japan' },
  { manufacturerName: 'Suzuki', country: 'Japan' },
  { manufacturerName: 'Kia', country: 'South Korea' },
  { manufacturerName: 'Honda', country: 'Japan' },
  { manufacturerName: 'Hyundai', country: 'South Korea' },
  { manufacturerName: 'Hino', country: 'Japan' },
  { manufacturerName: 'Master Foton', country: 'China' },
];

async function main() {
  console.log('Adding manufacturers...\n');
  let total = 0;
  for (const m of manufacturers) {
    const exists = await prisma.manufacturer.findFirst({ where: { manufacturerName: m.manufacturerName } });
    if (exists) { console.log(`  ⏭  ${m.manufacturerName}`); continue; }
    await prisma.manufacturer.create({ data: m });
    console.log(`  ✓  ${m.manufacturerName} (${m.country})`);
    total++;
  }
  console.log(`\nDone! ${total} manufacturers added.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());