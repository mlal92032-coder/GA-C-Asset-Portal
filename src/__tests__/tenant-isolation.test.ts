import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import prisma from '@/lib/prisma';
import { createTenantPrisma, isTenantActive, checkTenantQuotas } from '@/lib/prisma-tenant';

/**
 * Comprehensive test suite for multi-tenancy isolation
 *
 * These tests verify:
 * 1. Data isolation between tenants
 * 2. Automatic tenant filtering
 * 3. Cross-tenant access prevention
 * 4. Quota enforcement
 * 5. Tenant status handling
 */

let tenant1Id: string;
let tenant2Id: string;
let user1Tenant1Id: string;
let user1Tenant2Id: string;

describe('Multi-Tenancy Isolation', () => {
  beforeAll(async () => {
    // Create test tenants
    const tenant1 = await prisma.tenant.create({
      data: {
        name: 'Test Tenant 1',
        slug: 'test-tenant-1',
        billingEmail: 'billing@tenant1.com',
        status: 'ACTIVE'
      }
    });
    tenant1Id = tenant1.id;

    const tenant2 = await prisma.tenant.create({
      data: {
        name: 'Test Tenant 2',
        slug: 'test-tenant-2',
        billingEmail: 'billing@tenant2.com',
        status: 'ACTIVE'
      }
    });
    tenant2Id = tenant2.id;

    // Create users in each tenant
    const user1 = await prisma.user.create({
      data: {
        tenantId: tenant1Id,
        fullName: 'User 1 Tenant 1',
        email: 'user1@tenant1.com',
        password: 'hashed_password'
      }
    });
    user1Tenant1Id = user1.id;

    const user2 = await prisma.user.create({
      data: {
        tenantId: tenant2Id,
        fullName: 'User 1 Tenant 2',
        email: 'user1@tenant2.com',
        password: 'hashed_password'
      }
    });
    user1Tenant2Id = user2.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
  });

  describe('Data Isolation', () => {
    it('should not allow cross-tenant user access', async () => {
      const tenant1Prisma = createTenantPrisma(prisma, tenant1Id);
      const tenant2Prisma = createTenantPrisma(prisma, tenant2Id);

      // User 1 should only see their own data in tenant 1
      const user1ViewTenant1 = await tenant1Prisma.user.findUnique({
        where: { id: user1Tenant1Id }
      });
      expect(user1ViewTenant1).toBeDefined();
      expect(user1ViewTenant1?.tenantId).toBe(tenant1Id);

      // User 1 should NOT be able to access tenant 2's data
      const user1ViewTenant2 = await tenant2Prisma.user.findUnique({
        where: { id: user1Tenant1Id }
      });
      expect(user1ViewTenant2).toBeNull();
    });

    it('should not allow finding users from different tenant', async () => {
      const tenant1Prisma = createTenantPrisma(prisma, tenant1Id);

      // Try to find user from tenant 2 while using tenant 1 context
      const result = await tenant1Prisma.user.findFirst({
        where: { email: 'user1@tenant2.com' }
      });

      expect(result).toBeNull();
    });

    it('should enforce tenantId on create operations', async () => {
      const tenant1Prisma = createTenantPrisma(prisma, tenant1Id);

      const newUser = await tenant1Prisma.user.create({
        data: {
          fullName: 'New User',
          email: 'newuser@test.com',
          password: 'hashed'
        }
      });

      // Verify the user was created with correct tenant
      expect(newUser.tenantId).toBe(tenant1Id);

      // Verify user 2 cannot see this user
      const tenant2Prisma = createTenantPrisma(prisma, tenant2Id);
      const notFound = await tenant2Prisma.user.findFirst({
        where: { email: 'newuser@test.com' }
      });
      expect(notFound).toBeNull();

      // Cleanup
      await prisma.user.delete({ where: { id: newUser.id } });
    });
  });

  describe('Asset Isolation', () => {
    let asset1Tenant1Id: string;

    beforeEach(async () => {
      // Create asset in tenant 1
      const asset = await prisma.furnitureAsset.create({
        data: {
          tenantId: tenant1Id,
          assetName: 'Test Desk',
          assetTag: 'DESK-001'
        }
      });
      asset1Tenant1Id = asset.id;
    });

    afterEach(async () => {
      await prisma.furnitureAsset.deleteMany({});
    });

    it('should isolate assets between tenants', async () => {
      const tenant1Prisma = createTenantPrisma(prisma, tenant1Id);
      const tenant2Prisma = createTenantPrisma(prisma, tenant2Id);

      // Tenant 1 should see the asset
      const asset1View = await tenant1Prisma.furnitureAsset.findUnique({
        where: { id: asset1Tenant1Id }
      });
      expect(asset1View).toBeDefined();
      expect(asset1View?.tenantId).toBe(tenant1Id);

      // Tenant 2 should NOT see the asset
      const asset2View = await tenant2Prisma.furnitureAsset.findUnique({
        where: { id: asset1Tenant1Id }
      });
      expect(asset2View).toBeNull();
    });

    it('should not allow cross-tenant asset updates', async () => {
      const tenant2Prisma = createTenantPrisma(prisma, tenant2Id);

      // Try to update asset from tenant 1 using tenant 2 context
      const updated = await tenant2Prisma.furnitureAsset.update({
        where: { id: asset1Tenant1Id },
        data: { assetName: 'Hacked Asset' }
      }).catch(() => null);

      expect(updated).toBeNull();

      // Verify asset wasn't actually updated
      const asset = await prisma.furnitureAsset.findUnique({
        where: { id: asset1Tenant1Id }
      });
      expect(asset?.assetName).toBe('Test Desk');
    });

    it('should not allow cross-tenant asset deletion', async () => {
      const tenant2Prisma = createTenantPrisma(prisma, tenant2Id);

      // Try to delete asset from tenant 1 using tenant 2 context
      const deleted = await tenant2Prisma.furnitureAsset.delete({
        where: { id: asset1Tenant1Id }
      }).catch(() => null);

      expect(deleted).toBeNull();

      // Verify asset still exists
      const asset = await prisma.furnitureAsset.findUnique({
        where: { id: asset1Tenant1Id }
      });
      expect(asset).toBeDefined();
    });
  });

  describe('Automatic Tenant Filtering', () => {
    let asset1: any;
    let asset2: any;

    beforeEach(async () => {
      // Create assets in both tenants
      asset1 = await prisma.furnitureAsset.create({
        data: {
          tenantId: tenant1Id,
          assetName: 'Asset 1',
          assetTag: 'A1'
        }
      });

      asset2 = await prisma.furnitureAsset.create({
        data: {
          tenantId: tenant2Id,
          assetName: 'Asset 2',
          assetTag: 'A2'
        }
      });
    });

    afterEach(async () => {
      await prisma.furnitureAsset.deleteMany({});
    });

    it('should automatically filter findMany queries', async () => {
      const tenant1Prisma = createTenantPrisma(prisma, tenant1Id);
      const tenant2Prisma = createTenantPrisma(prisma, tenant2Id);

      const assets1 = await tenant1Prisma.furnitureAsset.findMany();
      const assets2 = await tenant2Prisma.furnitureAsset.findMany();

      expect(assets1.length).toBe(1);
      expect(assets1[0].id).toBe(asset1.id);

      expect(assets2.length).toBe(1);
      expect(assets2[0].id).toBe(asset2.id);
    });

    it('should automatically filter count queries', async () => {
      const tenant1Prisma = createTenantPrisma(prisma, tenant1Id);
      const tenant2Prisma = createTenantPrisma(prisma, tenant2Id);

      const count1 = await tenant1Prisma.furnitureAsset.count();
      const count2 = await tenant2Prisma.furnitureAsset.count();

      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });
  });

  describe('Tenant Status Validation', () => {
    it('should prevent operations on inactive tenants', async () => {
      // Create suspended tenant
      const suspended = await prisma.tenant.create({
        data: {
          name: 'Suspended Tenant',
          slug: 'suspended-tenant',
          billingEmail: 'billing@suspended.com',
          status: 'SUSPENDED'
        }
      });

      const isActive = await isTenantActive(prisma, suspended.id);
      expect(isActive).toBe(false);

      // Cleanup
      await prisma.tenant.delete({ where: { id: suspended.id } });
    });

    it('should allow operations on active tenants', async () => {
      const isActive = await isTenantActive(prisma, tenant1Id);
      expect(isActive).toBe(true);
    });
  });

  describe('Quota Enforcement', () => {
    it('should track quota usage correctly', async () => {
      const quotas = await checkTenantQuotas(prisma, tenant1Id);

      expect(quotas.storage).toBeDefined();
      expect(quotas.storage.usage).toBeGreaterThanOrEqual(0);
      expect(quotas.storage.limit).toBeGreaterThan(0);
      expect(quotas.storage.exceeded).toBe(false);

      expect(quotas.users).toBeDefined();
      expect(quotas.users.usage).toBeGreaterThanOrEqual(1);

      expect(quotas.apiCalls).toBeDefined();
    });

    it('should calculate quota percentages correctly', async () => {
      const quotas = await checkTenantQuotas(prisma, tenant1Id);

      // Storage percentage
      const storagePercent = (quotas.storage.usage / quotas.storage.limit) * 100;
      expect(quotas.storage.percentage).toBe(Math.round(storagePercent));

      // Users percentage
      const usersPercent = (quotas.users.usage / quotas.users.limit) * 100;
      expect(quotas.users.percentage).toBe(Math.round(usersPercent));
    });
  });

  describe('Unique Constraint Enforcement', () => {
    it('should prevent duplicate email within same tenant', async () => {
      const tenant1Prisma = createTenantPrisma(prisma, tenant1Id);

      // Try to create duplicate email in same tenant
      const duplicate = await tenant1Prisma.user.create({
        data: {
          fullName: 'Duplicate',
          email: 'user1@tenant1.com', // Already exists
          password: 'hashed'
        }
      }).catch(() => null);

      expect(duplicate).toBeNull();
    });

    it('should allow same email in different tenants', async () => {
      const tenant1Prisma = createTenantPrisma(prisma, tenant1Id);
      const tenant2Prisma = createTenantPrisma(prisma, tenant2Id);

      const user1 = await tenant1Prisma.user.findFirst({
        where: { email: 'shared@test.com' }
      });

      const user2 = await tenant2Prisma.user.findFirst({
        where: { email: 'shared@test.com' }
      });

      // Both queries should return null (users don't exist yet)
      expect(user1).toBeNull();
      expect(user2).toBeNull();

      // Now create same email in both tenants
      const created1 = await tenant1Prisma.user.create({
        data: {
          fullName: 'Shared Email T1',
          email: 'shared@test.com',
          password: 'hashed'
        }
      });

      const created2 = await tenant2Prisma.user.create({
        data: {
          fullName: 'Shared Email T2',
          email: 'shared@test.com',
          password: 'hashed'
        }
      });

      expect(created1.tenantId).toBe(tenant1Id);
      expect(created2.tenantId).toBe(tenant2Id);

      // Cleanup
      await prisma.user.delete({ where: { id: created1.id } });
      await prisma.user.delete({ where: { id: created2.id } });
    });
  });
});
