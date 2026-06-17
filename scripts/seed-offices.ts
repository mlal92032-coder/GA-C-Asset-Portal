import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: dbUrl }),
});

const offices = [
  // Head Office
  { companyName: 'NICL Building', address: 'Current Rented Building, Karachi', phone: null, email: null },
  { companyName: 'Korangi Complex', address: 'Korangi, Karachi', phone: null, email: null },

  // Regional Offices
  { companyName: 'Regional Office Karachi', address: 'Current Rented Building, Karachi', phone: null, email: null },
  { companyName: 'Regional Office Hyderabad I', address: 'Current Rented Building, Hyderabad', phone: null, email: null },
  { companyName: 'Hyderabad Complex', address: 'Hyderabad', phone: null, email: null },
  { companyName: 'Regional Office Mirpurkhas', address: 'Current Rented Building, Mirpurkhas', phone: null, email: null },
  { companyName: 'Regional Office Shaheed Benazirabad', address: 'Current Rented Building, Shaheed Benazirabad', phone: null, email: null },
  { companyName: 'Regional Office Sukkur', address: 'Current Rented Building, Sukkur', phone: null, email: null },
  { companyName: 'Sukkur Complex', address: 'Sukkur', phone: null, email: null },
  { companyName: 'Regional Office Larkana', address: 'Current Rented Building, Larkana', phone: null, email: null },

  // District Offices
  { companyName: 'District Office Hyderabad II Thatta', address: 'Current Rented Building, Thatta', phone: null, email: null },
  { companyName: 'District Office Sehwan', address: 'Current Rented Building, Sehwan', phone: null, email: null },
  { companyName: 'District Office Dadu', address: 'Current Rented Building, Dadu', phone: null, email: null },
  { companyName: 'District Office Matiari', address: 'Current Rented Building, Matiari', phone: null, email: null },
  { companyName: 'District Office Badin', address: 'Current Rented Building, Badin', phone: null, email: null },
  { companyName: 'District Office Khairpur', address: 'Current Rented Building, Khairpur', phone: null, email: null },
  { companyName: 'District Office Umerkot', address: 'Current Rented Building, Umerkot', phone: null, email: null },
  { companyName: 'District Office Naushahro Feroze', address: 'Current Rented Building, Naushahro Feroze', phone: null, email: null },
  { companyName: 'District Office Kamber-Shahdadkot', address: 'Current Rented Building, Kamber-Shahdadkot', phone: null, email: null },
  { companyName: 'District Office Shikarpur', address: 'Current Rented Building, Shikarpur', phone: null, email: null },
  { companyName: 'District Office Mithi', address: 'Current Rented Building, Mithi', phone: null, email: null },
  { companyName: 'District Office Jamshoro', address: 'Current Rented Building, Jamshoro', phone: null, email: null },
  { companyName: 'District Office Ghotki', address: 'Current Rented Building, Ghotki', phone: null, email: null },
  { companyName: 'District Office Sanghar', address: 'Current Rented Building, Sanghar', phone: null, email: null },

  // Warehouses
  { companyName: 'Landhi Warehouse', address: 'Rented Building, Landhi', phone: null, email: null },
  { companyName: 'Record Room Mustafa Tower', address: 'Mustafa Tower, Karachi', phone: null, email: null },
];

async function main() {
  // First delete locations that were added by mistake
  console.log('Cleaning up locations...');
  await prisma.location.deleteMany({ where: { roomType: { in: ['Head Office', 'Regional Office', 'District Office', 'Warehouse'] } } });
  console.log('  ✓ Locations cleaned\n');

  // Seed offices
  console.log('Seeding offices...\n');
  for (const office of offices) {
    const exists = await prisma.company.findFirst({ where: { companyName: office.companyName } });
    if (exists) {
      console.log(`  ⏭  ${office.companyName} (already exists)`);
      continue;
    }
    await prisma.company.create({ data: office });
    console.log(`  ✓  ${office.companyName}`);
  }
  console.log(`\nDone! Added ${offices.length} offices.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());