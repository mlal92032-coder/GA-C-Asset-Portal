/**
 * Centralized color system for the application
 * Ensures consistency across all components
 */

// Button color variants
export const buttonColors = {
  primary: {
    bg: '#3b82f6',
    hover: '#2563eb',
    light: '#eff6ff',
    text: '#1e40af',
    shadow: 'rgba(59, 130, 246, 0.25)',
  },
  secondary: {
    bg: '#ffffff',
    hover: '#f1f5f9',
    border: '#e2e8f0',
    text: '#475569',
    shadow: 'rgba(0,0,0,0.04)',
  },
  success: {
    bg: '#10b981',
    hover: '#059669',
    light: '#ecfdf5',
    text: '#065f46',
    shadow: 'rgba(16, 185, 129, 0.25)',
  },
  danger: {
    bg: '#ef4444',
    hover: '#dc2626',
    light: '#fef2f2',
    text: '#991b1b',
    shadow: 'rgba(239, 68, 68, 0.25)',
  },
  warning: {
    bg: '#f59e0b',
    hover: '#d97706',
    light: '#fffbeb',
    text: '#92400e',
    shadow: 'rgba(245, 158, 11, 0.25)',
  },
  info: {
    bg: '#3b82f6',
    hover: '#2563eb',
    light: '#eff6ff',
    text: '#1e40af',
    shadow: 'rgba(59, 130, 246, 0.25)',
  },
} as const;

// Badge color variants
export const badgeColors = {
  success: {
    bg: '#ecfdf5',
    text: '#065f46',
    border: '#a7f3d0',
  },
  warning: {
    bg: '#fffbeb',
    text: '#92400e',
    border: '#fcd34d',
  },
  danger: {
    bg: '#fef2f2',
    text: '#991b1b',
    border: '#fecaca',
  },
  info: {
    bg: '#eff6ff',
    text: '#1e40af',
    border: '#bfdbfe',
  },
  secondary: {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#e2e8f0',
  },
  purple: {
    bg: '#f5f3ff',
    text: '#6d28d9',
    border: '#ddd6fe',
  },
  orange: {
    bg: '#fff7ed',
    text: '#c2410c',
    border: '#fed7aa',
  },
} as const;

// Icon color variants
export const iconColors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  secondary: '#64748b',
  slate: '#94a3b8',
  muted: '#cbd5e1',
} as const;

// Status-specific colors
export const statusColors = {
  IN_USE: {
    bg: '#eff6ff',
    text: '#1e40af',
    border: '#bfdbfe',
  },
  IN_STORE: {
    bg: '#ecfdf5',
    text: '#065f46',
    border: '#a7f3d0',
  },
  DISPOSED: {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#e2e8f0',
  },
  AUCTION: {
    bg: '#fff7ed',
    text: '#c2410c',
    border: '#fed7aa',
  },
} as const;

// Condition-specific colors
export const conditionColors = {
  GOOD: {
    bg: '#ecfdf5',
    text: '#065f46',
    border: '#a7f3d0',
  },
  REPAIR: {
    bg: '#fffbeb',
    text: '#92400e',
    border: '#fcd34d',
  },
  DAMAGED: {
    bg: '#fef2f2',
    text: '#991b1b',
    border: '#fecaca',
  },
} as const;

// Gradient combinations for headers
export const gradients = {
  primary: {
    from: '#e0f2fe',
    to: '#dbeafe',
  },
  success: {
    from: '#dcfce7',
    to: '#d1fae5',
  },
  danger: {
    from: '#fee2e2',
    to: '#fecaca',
  },
  warning: {
    from: '#fffbeb',
    to: '#fef3c7',
  },
  info: {
    from: '#e0f2fe',
    to: '#dbeafe',
  },
} as const;

// Get badge color by status
export function getBadgeColorByStatus(status: string) {
  return statusColors[status as keyof typeof statusColors] || statusColors.IN_STORE;
}

// Get badge color by condition
export function getBadgeColorByCondition(condition: string) {
  return conditionColors[condition as keyof typeof conditionColors] || conditionColors.GOOD;
}
