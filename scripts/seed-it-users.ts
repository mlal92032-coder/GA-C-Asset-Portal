import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbPath.replace(/\\/g, '/')}` }) });

async function main() {
  const pass = await bcrypt.hash('Admin@123456', 10);

  // Create Mustafa Qazi - AD IT
  let mustafa = await prisma.user.findFirst({ where: { email: 'mustafa.qazi@sef.com' } });
  if (!mustafa) {
    mustafa = await prisma.user.create({
      data: { fullName: 'Mustafa Qazi', email: 'mustafa.qazi@sef.com', password: pass, role: 'USER', department: 'IT', designation: 'Assistant Director IT', status: 'ACTIVE' }
    });
    console.log('  ✓ User: Mustafa Qazi (AD IT)');
  } else console.log('  ⏭  Mustafa Qazi (exists)');

  // Create Khurram Jamal - IT Server Room
  let khurram = await prisma.user.findFirst({ where: { email: 'khurram.jamal@sef.com' } });
  if (!khurram) {
    khurram = await prisma.user.create({
      data: { fullName: 'Khurram Jamal', email: 'khurram.jamal@sef.com', password: pass, role: 'USER', department: 'IT', designation: 'IT Officer', status: 'ACTIVE' }
    });
    console.log('  ✓ User: Khurram Jamal (IT Server Room)');
  } else console.log('  ⏭  Khurram Jamal (exists)');

  // Assign: R-8 (AD IT) items → Mustafa
  const r8Loc = await prisma.location.findFirst({ where: { locationName: 'R-8' } });
  if (r8Loc) {
    const r8Furniture = await prisma.furnitureAsset.updateMany({ where: { locationId: r8Loc.id, assignedUserId: null }, data: { assignedUserId: mustafa.id } });
    const r8Electronics = await prisma.electronicAsset.updateMany({ where: { locationId: r8Loc.id, assignedUserId: null }, data: { assignedUserId: mustafa.id } });
    console.log(`  ✓ R-8: ${r8Furniture.count} furniture + ${r8Electronics.count} electronics → Mustafa Qazi`);
  }

  // Also assign AD-IT location items
  const aditLoc = await prisma.location.findFirst({ where: { locationName: 'AD-IT' } });
  if (aditLoc) {
    const aditF = await prisma.furnitureAsset.updateMany({ where: { locationId: aditLoc.id, assignedUserId: null }, data: { assignedUserId: mustafa.id } });
    const aditE = await prisma.electronicAsset.updateMany({ where: { locationId: aditLoc.id, assignedUserId: null }, data: { assignedUserId: mustafa.id } });
    console.log(`  ✓ AD-IT: ${aditF.count} furniture + ${aditE.count} electronics → Mustafa Qazi`);
  }

  // Assign: R-7 (IT Server Room) items → Khurram
  const r7Loc = await prisma.location.findFirst({ where: { locationName: 'R-7' } });
  if (r7Loc) {
    const r7Furniture = await prisma.furnitureAsset.updateMany({ where: { locationId: r7Loc.id, assignedUserId: null }, data: { assignedUserId: khurram.id } });
    const r7Electronics = await prisma.electronicAsset.updateMany({ where: { locationId: r7Loc.id, assignedUserId: null }, data: { assignedUserId: khurram.id } });
    console.log(`  ✓ R-7: ${r7Furniture.count} furniture + ${r7Electronics.count} electronics → Khurram Jamal`);
  }

  // Assign: Server Room IT location items → Khurram
  const serverLoc = await prisma.location.findFirst({ where: { locationName: 'Server Room IT' } });
  if (serverLoc) {
    const srvF = await prisma.furnitureAsset.updateMany({ where: { locationId: serverLoc.id, assignedUserId: null }, data: { assignedUserId: khurram.id } });
    const srvE = await prisma.electronicAsset.updateMany({ where: { locationId: serverLoc.id, assignedUserId: null }, data: { assignedUserId: khurram.id } });
    console.log(`  ✓ Server Room IT: ${srvF.count} furniture + ${srvE.count} electronics → Khurram Jamal`);
  }

  // Also: IT Room electronics → Khurram and Mustafa (split)
  const itRoomLoc = await prisma.location.findFirst({ where: { locationName: 'IT Room' } });
  if (itRoomLoc) {
    await prisma.electronicAsset.updateMany({ where: { locationId: itRoomLoc.id, assignedUserId: null }, data: { assignedUserId: khurram.id } });
    console.log(`  ✓ IT Room electronics → Khurram Jamal`);
  }

  console.log('\nDone!');
}

main().catch(console.error).finally(() => prisma.$disconnect());