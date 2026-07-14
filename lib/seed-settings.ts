import { prisma } from '@/lib/prisma';

export async function seedSettingsSystem() {
  console.log('Seeding Settings System...');

  try {
    // 1. Create Setting Categories
    const categories = await Promise.all([
      prisma.settingCategory.upsert({
        where: { slug: 'system' },
        update: {},
        create: {
          name: 'System Configuration',
          slug: 'system',
          description: 'Organization branding, localization, and general settings',
          icon: 'Settings',
          color: 'text-blue-600',
          bgColor: 'from-blue-50 to-blue-100',
          order: 1,
          isSystem: true,
          requiredRole: 'SUPER_ADMIN',
        },
      }),
      prisma.settingCategory.upsert({
        where: { slug: 'security' },
        update: {},
        create: {
          name: 'Security & Access',
          slug: 'security',
          description: 'Authentication, permissions, and access control',
          icon: 'Shield',
          color: 'text-red-600',
          bgColor: 'from-red-50 to-red-100',
          order: 2,
          isSystem: true,
          requiredRole: 'SUPER_ADMIN',
        },
      }),
      prisma.settingCategory.upsert({
        where: { slug: 'organization' },
        update: {},
        create: {
          name: 'Organization',
          slug: 'organization',
          description: 'Companies, departments, and organizational structure',
          icon: 'Building2',
          color: 'text-purple-600',
          bgColor: 'from-purple-50 to-purple-100',
          order: 3,
          isSystem: true,
          requiredRole: 'SUPER_ADMIN',
        },
      }),
      prisma.settingCategory.upsert({
        where: { slug: 'assets' },
        update: {},
        create: {
          name: 'Asset Structure',
          slug: 'assets',
          description: 'Categories, models, manufacturers, and depreciation settings',
          icon: 'Package',
          color: 'text-orange-600',
          bgColor: 'from-orange-50 to-orange-100',
          order: 4,
          isSystem: true,
          requiredRole: 'SUPER_ADMIN',
        },
      }),
      prisma.settingCategory.upsert({
        where: { slug: 'users' },
        update: {},
        create: {
          name: 'Users & Teams',
          slug: 'users',
          description: 'User management, permissions, and team structure',
          icon: 'Users',
          color: 'text-cyan-600',
          bgColor: 'from-cyan-50 to-cyan-100',
          order: 5,
          isSystem: true,
          requiredRole: 'SUPER_ADMIN',
        },
      }),
      prisma.settingCategory.upsert({
        where: { slug: 'notifications' },
        update: {},
        create: {
          name: 'Notifications & Alerts',
          slug: 'notifications',
          description: 'Email alerts, webhooks, and notification preferences',
          icon: 'Bell',
          color: 'text-yellow-600',
          bgColor: 'from-yellow-50 to-yellow-100',
          order: 6,
          isSystem: true,
          requiredRole: 'USER',
        },
      }),
      prisma.settingCategory.upsert({
        where: { slug: 'reports' },
        update: {},
        create: {
          name: 'Reports & Analytics',
          slug: 'reports',
          description: 'Report scheduling, dashboards, and analytics',
          icon: 'BarChart3',
          color: 'text-green-600',
          bgColor: 'from-green-50 to-green-100',
          order: 7,
          isSystem: true,
          requiredRole: 'USER',
        },
      }),
      prisma.settingCategory.upsert({
        where: { slug: 'maintenance' },
        update: {},
        create: {
          name: 'Maintenance & System',
          slug: 'maintenance',
          description: 'Backups, database, file storage, and system health',
          icon: 'Zap',
          color: 'text-indigo-600',
          bgColor: 'from-indigo-50 to-indigo-100',
          order: 8,
          isSystem: true,
          requiredRole: 'SUPER_ADMIN',
        },
      }),
      prisma.settingCategory.upsert({
        where: { slug: 'profile' },
        update: {},
        create: {
          name: 'Profile Settings',
          slug: 'profile',
          description: 'Personal profile, password, and preferences',
          icon: 'User',
          color: 'text-slate-600',
          bgColor: 'from-slate-50 to-slate-100',
          order: 9,
          isSystem: true,
          requiredRole: 'USER',
        },
      }),
    ]);

    console.log('✅ Created 9 setting categories');

    // 2. Get System category ID
    const systemCategory = await prisma.settingCategory.findUnique({
      where: { slug: 'system' },
    });

    if (!systemCategory) throw new Error('System category not found');

    // 3. Create System Settings
    const settings = await Promise.all([
      prisma.systemSetting.upsert({
        where: { categoryId_key: { categoryId: systemCategory.id, key: 'organizationName' } },
        update: {},
        create: {
          categoryId: systemCategory.id,
          key: 'organizationName',
          displayName: 'Organization Name',
          description: 'Full name of your organization',
          value: 'Sindh Education Foundation',
          dataType: 'string',
          fieldType: 'text',
          validation: 'required',
          placeholder: 'e.g., Sindh Education Foundation',
          isRequired: true,
          order: 1,
        },
      }),
      prisma.systemSetting.upsert({
        where: { categoryId_key: { categoryId: systemCategory.id, key: 'organizationEmail' } },
        update: {},
        create: {
          categoryId: systemCategory.id,
          key: 'organizationEmail',
          displayName: 'Organization Email',
          description: 'Main contact email address',
          value: 'info@sef.org.pk',
          dataType: 'string',
          fieldType: 'email',
          validation: 'required,email',
          placeholder: 'contact@organization.com',
          isRequired: true,
          order: 2,
        },
      }),
      prisma.systemSetting.upsert({
        where: { categoryId_key: { categoryId: systemCategory.id, key: 'organizationPhone' } },
        update: {},
        create: {
          categoryId: systemCategory.id,
          key: 'organizationPhone',
          displayName: 'Organization Phone',
          description: 'Main contact phone number',
          value: '+92-21-9261-2000',
          dataType: 'string',
          fieldType: 'phone',
          placeholder: '+92-21-XXXX-XXXX',
          order: 3,
        },
      }),
      prisma.systemSetting.upsert({
        where: { categoryId_key: { categoryId: systemCategory.id, key: 'timezone' } },
        update: {},
        create: {
          categoryId: systemCategory.id,
          key: 'timezone',
          displayName: 'Timezone',
          description: 'Default timezone for the system',
          value: 'Asia/Karachi',
          dataType: 'string',
          fieldType: 'select',
          options: JSON.stringify([
            { value: 'Asia/Karachi', label: 'Asia/Karachi' },
            { value: 'UTC', label: 'UTC' },
          ]),
          isRequired: true,
          order: 4,
        },
      }),
      prisma.systemSetting.upsert({
        where: { categoryId_key: { categoryId: systemCategory.id, key: 'currency' } },
        update: {},
        create: {
          categoryId: systemCategory.id,
          key: 'currency',
          displayName: 'Currency',
          description: 'Default currency for asset valuation',
          value: 'PKR',
          dataType: 'string',
          fieldType: 'select',
          options: JSON.stringify([
            { value: 'PKR', label: 'Pakistani Rupee (₨)' },
            { value: 'USD', label: 'US Dollar ($)' },
            { value: 'EUR', label: 'Euro (€)' },
          ]),
          isRequired: true,
          order: 5,
        },
      }),
      prisma.systemSetting.upsert({
        where: { categoryId_key: { categoryId: systemCategory.id, key: 'language' } },
        update: {},
        create: {
          categoryId: systemCategory.id,
          key: 'language',
          displayName: 'Default Language',
          description: 'Default language for the system',
          value: 'en',
          dataType: 'string',
          fieldType: 'select',
          options: JSON.stringify([
            { value: 'en', label: 'English' },
            { value: 'ur', label: 'Urdu' },
          ]),
          isRequired: true,
          order: 6,
        },
      }),
    ]);

    console.log('✅ Created 6 system settings');

    // 4. Create Security Policy
    const securityPolicy = await prisma.securityPolicy.upsert({
      where: { id: 'default-policy' },
      update: {},
      create: {
        id: 'default-policy',
        sessionTimeoutMinutes: 30,
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 15,
        passwordExpiryDays: 90,
        minPasswordLength: 8,
        require2FA: false,
        enableAuditLogging: true,
        auditLogRetentionDays: 365,
      },
    });

    console.log('✅ Created security policy');

    // 5. Create Organization Info
    const orgInfo = await prisma.organizationInfo.upsert({
      where: { id: 'default-org' },
      update: {},
      create: {
        id: 'default-org',
        organizationName: 'Sindh Education Foundation',
        address: 'Government of Sindh',
        city: 'Karachi',
        country: 'Pakistan',
        phone: '+92-21-9261-2000',
        email: 'info@sef.org.pk',
        registrationNumber: 'SEF-001',
        timezone: 'Asia/Karachi',
        language: 'en',
        currency: 'PKR',
      },
    });

    console.log('✅ Created organization info');

    // 6. Create Asset Defaults
    const assetDefaults = await prisma.assetDefaults.upsert({
      where: { id: 'default-assets' },
      update: {},
      create: {
        id: 'default-assets',
        assetTagPrefix: 'SEF-',
        autoGenerateTags: true,
        defaultDepreciationMethod: 'STRAIGHT_LINE',
        defaultUsefulLife: 5,
        enableQRCodes: true,
        stockReorderLevel: 5,
        itemsPerPage: 25,
      },
    });

    console.log('✅ Created asset defaults');

    // 7. Create Role Permissions
    const roles: Array<{ role: 'SUPER_ADMIN' | 'USER' | 'VIEW_USER'; modules: string[] }> = [
      {
        role: 'SUPER_ADMIN',
        modules: ['dashboard', 'furniture', 'electronics', 'vehicles', 'users', 'reports', 'settings', 'audit_logs'],
      },
      {
        role: 'USER',
        modules: ['dashboard', 'furniture', 'electronics', 'vehicles', 'reports'],
      },
      {
        role: 'VIEW_USER',
        modules: ['dashboard'],
      },
    ];

    for (const { role, modules } of roles) {
      for (const module of modules) {
        for (const action of ['view', 'create', 'edit', 'delete', 'export', 'import', 'approve', 'reject', 'checkout', 'checkin']) {
          await prisma.rolePermission.upsert({
            where: { role_module_action: { role, module, action } },
            update: {},
            create: {
              role,
              module,
              action,
              isAllowed: role === 'SUPER_ADMIN' || (role === 'USER' && action !== 'delete') || (role === 'VIEW_USER' && action === 'view'),
            },
          });
        }
      }
    }

    console.log('✅ Created role permissions');

    console.log('\n✅ Settings System seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSettingsSystem()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
