import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

/**
 * Comprehensive Permission System for Advanced RBAC
 * Supports Role-Based Access Control (RBAC) with custom roles and granular permissions
 */

// Define all available permissions
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD: {
    VIEW: 'dashboard.view',
    EXPORT_ANALYTICS: 'dashboard.export_analytics',
  },

  // Asset Management
  ASSET: {
    VIEW: 'asset.view',
    CREATE: 'asset.create',
    EDIT: 'asset.edit',
    DELETE: 'asset.delete',
    EXPORT: 'asset.export',
    IMPORT: 'asset.import',
    VIEW_FINANCIAL: 'asset.view_financial',
  },

  // Checkout System
  CHECKOUT: {
    VIEW: 'checkout.view',
    CREATE: 'checkout.create',
    CHECKIN: 'checkout.checkin',
    DELETE: 'checkout.delete',
    APPROVE_OVERDUE: 'checkout.approve_overdue',
  },

  // Maintenance
  MAINTENANCE: {
    VIEW: 'maintenance.view',
    CREATE: 'maintenance.create',
    EDIT: 'maintenance.edit',
    DELETE: 'maintenance.delete',
    SCHEDULE: 'maintenance.schedule',
  },

  // Reports
  REPORT: {
    VIEW: 'report.view',
    CREATE: 'report.create',
    EDIT: 'report.edit',
    DELETE: 'report.delete',
    EXPORT: 'report.export',
    SCHEDULE: 'report.schedule',
  },

  // User Management
  USER: {
    VIEW: 'user.view',
    CREATE: 'user.create',
    EDIT: 'user.edit',
    DELETE: 'user.delete',
    MANAGE_ROLES: 'user.manage_roles',
    MANAGE_PERMISSIONS: 'user.manage_permissions',
  },

  // Settings
  SETTINGS: {
    VIEW: 'settings.view',
    EDIT: 'settings.edit',
    MANAGE_COMPANY: 'settings.manage_company',
    MANAGE_SECURITY: 'settings.manage_security',
  },

  // Audit & Compliance
  AUDIT: {
    VIEW: 'audit.view',
    VIEW_SENSITIVE: 'audit.view_sensitive',
    EXPORT: 'audit.export',
  },

  // Admin Functions
  ADMIN: {
    SYSTEM_CONFIG: 'admin.system_config',
    BACKUP_RESTORE: 'admin.backup_restore',
    USER_MANAGEMENT: 'admin.user_management',
    ROLE_MANAGEMENT: 'admin.role_management',
  },
}

// Default role permission mappings
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: [
    // Full access to everything
    ...Object.values(PERMISSIONS.DASHBOARD).flatMap(v => typeof v === 'string' ? [v] : []),
    ...Object.values(PERMISSIONS.ASSET).flatMap(v => typeof v === 'string' ? [v] : []),
    ...Object.values(PERMISSIONS.CHECKOUT).flatMap(v => typeof v === 'string' ? [v] : []),
    ...Object.values(PERMISSIONS.MAINTENANCE).flatMap(v => typeof v === 'string' ? [v] : []),
    ...Object.values(PERMISSIONS.REPORT).flatMap(v => typeof v === 'string' ? [v] : []),
    ...Object.values(PERMISSIONS.USER).flatMap(v => typeof v === 'string' ? [v] : []),
    ...Object.values(PERMISSIONS.SETTINGS).flatMap(v => typeof v === 'string' ? [v] : []),
    ...Object.values(PERMISSIONS.AUDIT).flatMap(v => typeof v === 'string' ? [v] : []),
    ...Object.values(PERMISSIONS.ADMIN).flatMap(v => typeof v === 'string' ? [v] : []),
  ],
  USER: [
    // Standard user permissions
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.ASSET.VIEW,
    PERMISSIONS.ASSET.CREATE,
    PERMISSIONS.ASSET.EDIT,
    PERMISSIONS.ASSET.EXPORT,
    PERMISSIONS.CHECKOUT.VIEW,
    PERMISSIONS.CHECKOUT.CREATE,
    PERMISSIONS.CHECKOUT.CHECKIN,
    PERMISSIONS.MAINTENANCE.VIEW,
    PERMISSIONS.MAINTENANCE.CREATE,
    PERMISSIONS.REPORT.VIEW,
    PERMISSIONS.REPORT.CREATE,
    PERMISSIONS.REPORT.EXPORT,
    PERMISSIONS.AUDIT.VIEW,
  ],
  VIEW_USER: [
    // Read-only permissions
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.ASSET.VIEW,
    PERMISSIONS.CHECKOUT.VIEW,
    PERMISSIONS.MAINTENANCE.VIEW,
    PERMISSIONS.REPORT.VIEW,
    PERMISSIONS.AUDIT.VIEW,
  ],
  CUSTOM: [],
  // Custom roles will have their own permissions
}

/**
 * Flatten permission object to array
 */
export function flattenPermissions(permObj: any): string[] {
  const result: string[] = []
  for (const key in permObj) {
    const value = permObj[key]
    if (typeof value === 'string') {
      result.push(value)
    } else if (typeof value === 'object') {
      result.push(...flattenPermissions(value))
    }
  }
  return result
}

/**
 * Check if user has a specific permission
 */
export async function checkPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customRole: true },
    })

    if (!user) {
      return false
    }

    // Super admin always has access
    if (user.role === 'SUPER_ADMIN') {
      return true
    }

    // Check custom role permissions
    if (user.role === 'CUSTOM' && user.customRole) {
      try {
        const customPermissions = JSON.parse(user.customRole.permissions || '[]')
        return customPermissions.includes(permission)
      } catch {
        return false
      }
    }

    // Check default role permissions
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || []
    if (defaultPermissions.includes(permission)) {
      return true
    }

    // Check permission overrides
    const override = await prisma.userPermissionOverride.findFirst({
      where: {
        userId,
        action: permission.split('.')[1],
        module: permission.split('.')[0],
        validFrom: { lte: new Date() },
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
    })

    return override?.isAllowed ?? false
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customRole: true },
    })

    if (!user) {
      return []
    }

    let permissions: string[] = []

    // Start with default role permissions
    permissions = [...(DEFAULT_ROLE_PERMISSIONS[user.role] || [])]

    // Add custom role permissions if applicable
    if (user.role === 'CUSTOM' && user.customRole) {
      try {
        const customPermissions = JSON.parse(user.customRole.permissions || '[]')
        permissions = [...new Set([...permissions, ...customPermissions])]
      } catch {
        // JSON parse error, skip
      }
    }

    // Add permission overrides
    const overrides = await prisma.userPermissionOverride.findMany({
      where: {
        userId,
        validFrom: { lte: new Date() },
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
    })

    overrides.forEach(override => {
      const permission = `${override.module}.${override.action}`
      if (override.isAllowed && !permissions.includes(permission)) {
        permissions.push(permission)
      } else if (!override.isAllowed) {
        permissions = permissions.filter(p => p !== permission)
      }
    })

    return [...new Set(permissions)]
  } catch (error) {
    console.error('Get user permissions error:', error)
    return []
  }
}

/**
 * Batch check multiple permissions
 */
export async function checkPermissions(
  userId: string,
  permissions: string[],
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {}

  for (const permission of permissions) {
    result[permission] = await checkPermission(userId, permission)
  }

  return result
}

/**
 * Get all available permission groups
 */
export function getPermissionGroups(): Record<string, { label: string; permissions: string[] }> {
  return {
    dashboard: {
      label: 'Dashboard',
      permissions: Object.values(PERMISSIONS.DASHBOARD),
    },
    asset: {
      label: 'Asset Management',
      permissions: Object.values(PERMISSIONS.ASSET),
    },
    checkout: {
      label: 'Checkout System',
      permissions: Object.values(PERMISSIONS.CHECKOUT),
    },
    maintenance: {
      label: 'Maintenance',
      permissions: Object.values(PERMISSIONS.MAINTENANCE),
    },
    report: {
      label: 'Reports',
      permissions: Object.values(PERMISSIONS.REPORT),
    },
    user: {
      label: 'User Management',
      permissions: Object.values(PERMISSIONS.USER),
    },
    settings: {
      label: 'Settings',
      permissions: Object.values(PERMISSIONS.SETTINGS),
    },
    audit: {
      label: 'Audit & Compliance',
      permissions: Object.values(PERMISSIONS.AUDIT),
    },
    admin: {
      label: 'Admin Functions',
      permissions: Object.values(PERMISSIONS.ADMIN),
    },
  }
}
