/**
 * Permission system — module-level + action-level access control.
 *
 * Permissions are stored as JSON in the User.permissions field:
 * {
 *   "dashboard":       ["view"],
 *   "furniture":       ["view", "create", "edit", "delete", "import", "export", "checkout", "checkin"],
 *   "electronics":     ["view", "create", "edit"],
 *   "vehicles":        ["view"],
 *   "users":           ["view", "create", "edit", "delete"],
 *   "companies":       ["view", "create", "edit", "delete"],
 *   "manufacturers":   ["view", "create", "edit", "delete"],
 *   "locations":       ["view", "create", "edit", "delete"],
 *   "maintenance":     ["view", "create", "edit", "delete"],
 *   "reviews":         ["view", "create", "edit", "delete"],
 *   "notifications":   ["view"],
 *   "reports":         ["view", "export"],
 *   "audit_logs":      ["view"],
 *   "settings":        ["manage"]
 * }
 *
 * Role-based shortcuts:
 * - SUPER_ADMIN: all permissions granted automatically (no permissions JSON needed)
 * - VIEW_USER: view-only across all modules (no permissions JSON needed)
 * - USER: must have explicit permissions JSON; access denied for anything not listed
 */

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'import'
  | 'export'
  | 'checkout'
  | 'checkin'
  | 'manage';

export type ModulePermissions = Record<string, PermissionAction[]>;

export const MODULES = [
  'dashboard',
  'furniture',
  'electronics',
  'vehicles',
  'users',
  'companies',
  'manufacturers',
  'locations',
  'maintenance',
  'reviews',
  'notifications',
  'reports',
  'audit_logs',
  'settings',
] as const;

export type Module = (typeof MODULES)[number];

export const MODULE_LABELS: Record<Module, string> = {
  dashboard: 'Dashboard',
  furniture: 'Furniture',
  electronics: 'Electronics',
  vehicles: 'Vehicles',
  users: 'Users',
  companies: 'Companies / Offices',
  manufacturers: 'Manufacturers',
  locations: 'Locations',
  maintenance: 'Maintenance',
  reviews: 'Reviews',
  notifications: 'Notifications',
  reports: 'Reports',
  audit_logs: 'Audit Logs',
  settings: 'Settings',
};

export const MODULE_ICONS: Record<Module, string> = {
  dashboard: '📊',
  furniture: '🪑',
  electronics: '💻',
  vehicles: '🚗',
  users: '👤',
  companies: '🏢',
  manufacturers: '🏭',
  locations: '📍',
  maintenance: '🔧',
  reviews: '⭐',
  notifications: '🔔',
  reports: '📈',
  audit_logs: '📋',
  settings: '⚙️',
};

/**
 * Parse a user's permissions JSON string into a structured object.
 * Returns null if permissions are not set, empty, or invalid.
 */
export function parsePermissions(permissionsJson: string | null | undefined): ModulePermissions | null {
  if (!permissionsJson) return null;
  try {
    const parsed = JSON.parse(permissionsJson);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as ModulePermissions;
  } catch {
    return null;
  }
}

/**
 * Check if a user has a specific permission action on a module.
 *
 * @param userRole      - The user's role (SUPER_ADMIN, USER, VIEW_USER)
 * @param permissionsJson - The raw permissions JSON string from the DB
 * @param module        - The module to check
 * @param action        - The action to check
 */
export function hasPermission(
  userRole: string,
  permissionsJson: string | null | undefined,
  module: Module,
  action: PermissionAction
): boolean {
  // SUPER_ADMIN has full unrestricted access
  if (userRole === 'SUPER_ADMIN') return true;

  // VIEW_USER can only view — no create, edit, delete, import, export, checkout, checkin, manage
  if (userRole === 'VIEW_USER') {
    return action === 'view';
  }

  // USER must have explicit permissions
  const perms = parsePermissions(permissionsJson);
  if (!perms) return false;

  const moduleActions = perms[module];
  if (!moduleActions || !Array.isArray(moduleActions)) return false;

  return moduleActions.includes(action);
}

/**
 * Convenience: can the user view this module?
 */
export function canView(userRole: string, permissionsJson: string | null | undefined, module: Module): boolean {
  return hasPermission(userRole, permissionsJson, module, 'view');
}

/**
 * Convenience: can the user create in this module?
 */
export function canCreate(userRole: string, permissionsJson: string | null | undefined, module: Module): boolean {
  return hasPermission(userRole, permissionsJson, module, 'create');
}

/**
 * Convenience: can the user edit in this module?
 */
export function canEdit(userRole: string, permissionsJson: string | null | undefined, module: Module): boolean {
  return hasPermission(userRole, permissionsJson, module, 'edit');
}

/**
 * Convenience: can the user delete from this module?
 */
export function canDelete(userRole: string, permissionsJson: string | null | undefined, module: Module): boolean {
  return hasPermission(userRole, permissionsJson, module, 'delete');
}

/**
 * Convenience: can the user import to this module?
 */
export function canImport(userRole: string, permissionsJson: string | null | undefined, module: Module): boolean {
  return hasPermission(userRole, permissionsJson, module, 'import');
}

/**
 * Convenience: can the user export from this module?
 */
export function canExport(userRole: string, permissionsJson: string | null | undefined, module: Module): boolean {
  return hasPermission(userRole, permissionsJson, module, 'export');
}

/**
 * Convenience: can the user checkout assets in this module?
 */
export function canCheckout(userRole: string, permissionsJson: string | null | undefined, module: Module): boolean {
  return hasPermission(userRole, permissionsJson, module, 'checkout');
}

/**
 * Convenience: can the user checkin assets in this module?
 */
export function canCheckin(userRole: string, permissionsJson: string | null | undefined, module: Module): boolean {
  return hasPermission(userRole, permissionsJson, module, 'checkin');
}

/**
 * Convenience: can the user manage settings?
 */
export function canManageSettings(userRole: string, permissionsJson: string | null | undefined): boolean {
  return hasPermission(userRole, permissionsJson, 'settings', 'manage');
}

/**
 * Check if user is read-only (has no create/edit/delete anywhere).
 * VIEW_USER role is always read-only. USER without any write permissions is also read-only.
 */
export function isViewOnly(userRole: string): boolean {
  return userRole === 'VIEW_USER';
}

/**
 * Get all modules the user can view.
 * Used by the sidebar to determine which nav items to show.
 */
export function getAccessibleModules(userRole: string, permissionsJson: string | null | undefined): Module[] {
  if (userRole === 'SUPER_ADMIN') return [...MODULES];
  if (userRole === 'VIEW_USER') return [...MODULES];

  const perms = parsePermissions(permissionsJson);
  if (!perms) return ['dashboard']; // Default: dashboard only

  return MODULES.filter((mod) => {
    const actions = perms[mod];
    return actions && Array.isArray(actions) && actions.includes('view');
  });
}

/**
 * Check if the user can perform ANY write action (create/edit/delete) across any module.
 * Used to determine if "Add" buttons should show in the UI.
 */
export function canModifyAnything(userRole: string, permissionsJson: string | null | undefined): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  if (userRole === 'VIEW_USER') return false;

  const perms = parsePermissions(permissionsJson);
  if (!perms) return false;

  for (const mod of MODULES) {
    const actions = perms[mod];
    if (actions && Array.isArray(actions)) {
      if (actions.some((a) => ['create', 'edit', 'delete', 'import', 'export', 'checkout', 'checkin', 'manage'].includes(a))) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Generate a permissions JSON string from selected actions per module.
 * Used when saving user permissions from the frontend.
 */
export function buildPermissionsJson(moduleSelections: Record<string, PermissionAction[]>): string {
  const cleaned: ModulePermissions = {};
  for (const [mod, actions] of Object.entries(moduleSelections)) {
    if (Array.isArray(actions) && actions.length > 0) {
      cleaned[mod] = [...new Set(actions)]; // deduplicate
    }
  }
  return JSON.stringify(cleaned);
}

/**
 * Get available actions for a given module.
 * Different modules support different actions.
 */
export function getAvailableActions(module: Module): PermissionAction[] {
  switch (module) {
    case 'dashboard':
      return ['view'];
    case 'settings':
      return ['manage'];
    case 'notifications':
      return ['view'];
    case 'audit_logs':
      return ['view'];
    case 'reports':
      return ['view', 'export'];
    case 'furniture':
    case 'electronics':
    case 'vehicles':
      return ['view', 'create', 'edit', 'delete', 'import', 'export', 'checkout', 'checkin'];
    case 'users':
    case 'companies':
    case 'manufacturers':
    case 'locations':
      return ['view', 'create', 'edit', 'delete'];
    case 'maintenance':
      return ['view', 'create', 'edit', 'delete'];
    case 'reviews':
      return ['view', 'create', 'edit', 'delete'];
    default:
      return ['view'];
  }
}

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  import: 'Import',
  export: 'Export',
  checkout: 'Checkout',
  checkin: 'Check-in',
  manage: 'Manage',
};