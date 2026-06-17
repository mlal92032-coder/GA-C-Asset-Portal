const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const db = path.join(process.cwd(), 'prisma', 'dev.db');
const p = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: 'file:' + db.replace(/\\/g, '/') }) });

async function main() {
  const users = await p.user.findMany({
    select: { fullName: true, email: true, role: true, designation: true }
  });

  console.log('All Users:\n');
  users.forEach(u => console.log(`  ${u.role.padEnd(12)} ${u.fullName.padEnd(28)} ${u.email.padEnd(32)} ${u.designation || '-'}`));
  console.log('\nPassword for all: Admin@123456');
  await p.$disconnect();
}

main();