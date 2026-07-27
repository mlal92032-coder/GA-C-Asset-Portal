const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seed() {
  const prisma = new PrismaClient();
  
  try {
    // Create tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'default-org' },
      update: {},
      create: {
        name: 'SEF Organization',
        slug: 'default-org',
        billingEmail: 'admin@sef.pk.com',
        status: 'ACTIVE',
        tier: 'ENTERPRISE'
      }
    });
    
    console.log('✓ Tenant:', tenant.id);
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123456', 12);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        fullName: 'Mohanlal',
        email: 'mohanlal@sef.pk.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        designation: 'System Administrator',
        department: 'IT'
      }
    });
    
    console.log('\n✅ ADMIN USER CREATED!\n');
    console.log('📋 Credentials:');
    console.log('├─ Email: mohanlal@sef.pk.com');
    console.log('├─ Password: Admin@123456');
    console.log('└─ Role: SUPER_ADMIN\n');
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
