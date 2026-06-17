import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: dbUrl }),
});

const locations = [
  // Head Office
  { locationName: 'Current Rented NICL Building', building: 'NICL Building', roomType: 'Head Office', description: 'Corporate Head Office' },
  { locationName: 'Korangi Complex', building: 'Korangi Complex', roomType: 'Head Office', description: 'Corporate Complex' },

  // Regional Offices
  { locationName: 'Regional Office Karachi', building: 'Current Rented Building', roomType: 'Regional Office', description: 'Regional Office Karachi' },
  { locationName: 'Regional Office Hyderabad I', building: 'Current Rented Building', roomType: 'Regional Office', description: 'Regional Office Hyderabad' },
  { locationName: 'Hyderabad Complex', building: 'Hyderabad Complex', roomType: 'Regional Office', description: 'Hyderabad Complex' },
  { locationName: 'Regional Office Mirpurkhas', building: 'Current Rented Building', roomType: 'Regional Office', description: 'Regional Office Mirpurkhas' },
  { locationName: 'Regional Office Shaheed Benazirabad', building: 'Current Rented Building', roomType: 'Regional Office', description: 'Regional Office Shaheed Benazirabad' },
  { locationName: 'Regional Office Sukkur', building: 'Current Rented Building', roomType: 'Regional Office', description: 'Regional Office Sukkur' },
  { locationName: 'Sukkur Complex', building: 'Sukkur Complex', roomType: 'Regional Office', description: 'Sukkur Complex' },
  { locationName: 'Regional Office Larkana', building: 'Current Rented Building', roomType: 'Regional Office', description: 'Regional Office Larkana' },

  // District Offices
  { locationName: 'District Office Hyderabad II Thatta', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Thatta' },
  { locationName: 'District Office Sehwan', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Sehwan' },
  { locationName: 'District Office Dadu', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Dadu' },
  { locationName: 'District Office Matiari', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Matiari' },
  { locationName: 'District Office Badin', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Badin' },
  { locationName: 'District Office Khairpur', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Khairpur' },
  { locationName: 'District Office Umerkot', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Umerkot' },
  { locationName: 'District Office Naushahro Feroze', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Naushahro Feroze' },
  { locationName: 'District Office Kamber-Shahdadkot', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Kamber-Shahdadkot' },
  { locationName: 'District Office Shikarpur', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Shikarpur' },
  { locationName: 'District Office Mithi', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Mithi' },
  { locationName: 'District Office Jamshoro', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Jamshoro' },
  { locationName: 'District Office Ghotki', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Ghotki' },
  { locationName: 'District Office Sanghar', building: 'Current Rented Building', roomType: 'District Office', description: 'District Office Sanghar' },

  // Warehouses
  { locationName: 'Landhi Warehouse', building: 'Rented Building', roomType: 'Warehouse', description: 'Landhi Warehouse' },
  { locationName: 'Record Room at Mustafa Tower', building: 'Mustafa Tower', room: 'Record Room', roomType: 'Warehouse', description: 'Record Room at Mustafa Tower' },
];

async function main() {
  console.log('Seeding locations...\n');
  for (const loc of locations) {
    const exists = await prisma.location.findFirst({ where: { locationName: loc.locationName } });
    if (exists) {
      console.log(`  ⏭  ${loc.locationName} (already exists)`);
      continue;
    }
    await prisma.location.create({ data: loc as any });
    console.log(`  ✓  ${loc.locationName}`);
  }
  console.log(`\nDone!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());