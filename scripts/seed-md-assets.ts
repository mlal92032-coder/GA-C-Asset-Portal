import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: dbUrl }),
});

async function main() {
  // 1. Get or create location: R-1 (Wing-1)
  let location = await prisma.location.findFirst({ where: { locationName: 'R-1 (Wing-1)' } });
  if (!location) {
    location = await prisma.location.create({
      data: { locationName: 'R-1 (Wing-1)', building: 'NICL Building', roomType: 'Office', description: 'Managing Director Office - Wing 1' }
    });
    console.log('  ✓ Location: R-1 (Wing-1)');
  } else {
    console.log('  ⏭  Location: R-1 (Wing-1) (exists)');
  }

  // 2. Get NICL Building company
  const company = await prisma.company.findFirst({ where: { companyName: 'NICL Building' } });
  if (!company) throw new Error('NICL Building company not found. Run seed-offices.ts first.');

  // 3. Get or create user: Managing Director
  let user = await prisma.user.findFirst({ where: { email: 'md@sef.com' } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    user = await prisma.user.create({
      data: {
        fullName: 'Managing Director',
        email: 'md@sef.com',
        password: hashedPassword,
        role: 'USER',
        department: 'Managing Director-SEF',
        designation: 'Managing Director',
        status: 'ACTIVE',
        permissions: JSON.stringify({ furniture: ['view', 'create', 'update', 'delete'] }),
      }
    });
    console.log('  ✓ User: Managing Director (md@sef.com / Admin@123456)');
  } else {
    console.log('  ⏭  User: Managing Director (exists)');
  }

  // 4. Create furniture assets
  const assets = [
    { assetTag: 'SEF/MD/Special Chair/001/25-26', assetName: 'Executive Chair', furnitureType: 'Chair', material: 'Leather', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Special Chair/002/25-26', assetName: 'Executive Chair', furnitureType: 'Chair', material: 'Leather', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Special Chair/003/25-26', assetName: 'Executive Chair', furnitureType: 'Chair', material: 'Leather', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Sofa/001/25-26', assetName: 'Sofa', furnitureType: 'Sofa', material: 'Fabric', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Sofa/002/25-26', assetName: 'Sofa', furnitureType: 'Sofa', material: 'Fabric', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Sofa/003/25-26', assetName: 'Sofa', furnitureType: 'Sofa', material: 'Fabric', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Court Hanger/001/25-26', assetName: 'Court Hanger', furnitureType: 'Hanger', material: 'Wood', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Table/001/25-26', assetName: 'Table', furnitureType: 'Table', material: 'Wood', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Table/002/25-26', assetName: 'Table', furnitureType: 'Table', material: 'Wood', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Table/003/25-26', assetName: 'Table', furnitureType: 'Table', material: 'Wood', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Table/004/25-26', assetName: 'Table', furnitureType: 'Table', material: 'Wood', condition: 'GOOD', status: 'IN_USE' },
    { assetTag: 'SEF/MD/Table/005/25-26', assetName: 'Table', furnitureType: 'Table', material: 'Wood', condition: 'GOOD', status: 'IN_USE' },
  ];

  console.log('\n  Adding furniture assets...');
  for (const asset of assets) {
    const exists = await prisma.furnitureAsset.findFirst({ where: { assetTag: asset.assetTag } });
    if (exists) {
      console.log(`    ⏭  ${asset.assetTag} (exists)`);
      continue;
    }
    await prisma.furnitureAsset.create({
      data: {
        ...asset,
        companyId: company.id,
        locationId: location.id,
        assignedUserId: user.id,
      } as any,
    });
    console.log(`    ✓  ${asset.assetTag}`);
  }

  console.log(`\nDone! 12 furniture assets added for Managing Director at R-1 (Wing-1).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());