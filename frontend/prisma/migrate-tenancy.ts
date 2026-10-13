import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateTenancy() {
  console.log('Starting tenant migration...');

  // Step 1: Create a default tenant if none exists
  let defaultTenant = await prisma.tenant.findFirst();

  if (!defaultTenant) {
    console.log('Creating default tenant...');
    defaultTenant = await prisma.tenant.create({
      data: {
        name: 'Default Organization',
        slug: 'default-org',
        billingEmail: 'admin@example.com',
        tier: 'PROFESSIONAL',
        status: 'ACTIVE',
      },
    });
    console.log(`Created default tenant: ${defaultTenant.id}`);
  } else {
    console.log(`Using existing tenant: ${defaultTenant.id}`);
  }

  // Step 2: Update all records without tenantId
  try {
    // Users
    const usersUpdated = await prisma.user.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${usersUpdated.count} users`);

    // Companies
    const companiesUpdated = await prisma.company.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${companiesUpdated.count} companies`);

    // Manufacturers
    const manufacturersUpdated = await prisma.manufacturer.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${manufacturersUpdated.count} manufacturers`);

    // Locations
    const locationsUpdated = await prisma.location.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${locationsUpdated.count} locations`);

    // Furniture Assets
    const furnitureUpdated = await prisma.furnitureAsset.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${furnitureUpdated.count} furniture assets`);

    // Electronic Assets
    const electronicUpdated = await prisma.electronicAsset.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${electronicUpdated.count} electronic assets`);

    // Vehicle Assets
    const vehicleUpdated = await prisma.vehicleAsset.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${vehicleUpdated.count} vehicle assets`);

    // Asset Checkouts
    const checkoutsUpdated = await prisma.assetCheckout.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${checkoutsUpdated.count} checkouts`);

    // Audit Logs
    const auditsUpdated = await prisma.auditLog.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${auditsUpdated.count} audit logs`);

    // Notifications
    const notificationsUpdated = await prisma.notification.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${notificationsUpdated.count} notifications`);

    // Reviews
    const reviewsUpdated = await prisma.review.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${reviewsUpdated.count} reviews`);

    // Maintenances
    const maintenanceUpdated = await prisma.maintenance.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${maintenanceUpdated.count} maintenances`);

    // Spare Parts
    const sparepartsUpdated = await prisma.sparePart.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${sparepartsUpdated.count} spare parts`);

    // Delete Requests
    const deleteRequestsUpdated = await prisma.deleteRequest.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${deleteRequestsUpdated.count} delete requests`);

    // User Creation Requests
    const userCreationUpdated = await prisma.userCreationRequest.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${userCreationUpdated.count} user creation requests`);

    // User Delete Requests
    const userDeleteUpdated = await prisma.userDeleteRequest.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${userDeleteUpdated.count} user delete requests`);

    // Asset Add Requests
    const assetAddUpdated = await prisma.assetAddRequest.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${assetAddUpdated.count} asset add requests`);

    // Custom Roles
    const rolesUpdated = await prisma.customRole.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${rolesUpdated.count} custom roles`);

    // Setting Categories
    const categoriesUpdated = await prisma.settingCategory.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${categoriesUpdated.count} setting categories`);

    // System Settings
    const settingsUpdated = await prisma.systemSetting.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${settingsUpdated.count} system settings`);

    // Security Policies
    const policiesUpdated = await prisma.securityPolicy.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${policiesUpdated.count} security policies`);

    // Notification Preferences
    const prefsUpdated = await prisma.notificationPreference.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${prefsUpdated.count} notification preferences`);

    // Organization Info
    const orgUpdated = await prisma.organizationInfo.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${orgUpdated.count} organization info`);

    // Asset Defaults
    const defaultsUpdated = await prisma.assetDefaults.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${defaultsUpdated.count} asset defaults`);

    // Report Configurations
    const reportsUpdated = await prisma.reportConfiguration.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${reportsUpdated.count} report configurations`);

    // System Logs
    const logsUpdated = await prisma.systemLog.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${logsUpdated.count} system logs`);

    // User Permission Overrides
    const overridesUpdated = await prisma.userPermissionOverride.updateMany({
      where: { tenantId: null as any },
      data: { tenantId: defaultTenant.id },
    });
    console.log(`Updated ${overridesUpdated.count} permission overrides`);

    console.log('\n✓ Tenant migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateTenancy().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
