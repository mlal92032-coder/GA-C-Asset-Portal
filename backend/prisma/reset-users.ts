import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🗑️ Deleting all existing users...');
  await prisma.user.deleteMany();
  console.log('✅ All users deleted');

  // Create default Super Admin
  console.log('👑 Creating default Super Admin...');
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const superAdmin = await prisma.user.create({
    data: {
      fullName: 'System Admin',
      email: 'admin@company.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      permissions: null, // Super Admin has all access
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email} / admin123`);
  console.log('🎉 Database reset complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
