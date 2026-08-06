import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create or get default tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        name: 'Default Organization',
        slug: 'default',
        status: 'ACTIVE',
        tier: 'PROFESSIONAL',
        billingEmail: 'billing@company.com',
      },
    });

    console.log('✅ Tenant created/retrieved:', tenant.id);

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'admin@company.com' } },
      update: {},
      create: {
        email: 'admin@company.com',
        fullName: 'System Administrator',
        password: hashedPassword,
        department: 'IT',
        designation: 'System Administrator',
        phone: '+1-555-0100',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        tenantId: tenant.id,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Email: admin@company.com');
    console.log('  Password: admin123');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
