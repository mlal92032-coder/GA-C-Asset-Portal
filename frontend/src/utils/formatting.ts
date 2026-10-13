// Currency formatting
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Date formatting
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Relative time
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDate(d)
}

// Asset tag formatting
export const generateAssetTag = (prefix: string, id: number): string => {
  return `${prefix}-${String(id).padStart(6, '0')}`
}

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

// Depreciation formatting
export const formatDepreciation = (
  purchasePrice: number,
  salvageValue: number,
  usefulLife: number,
  method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE',
): string => {
  if (method === 'STRAIGHT_LINE') {
    const annual = (purchasePrice - salvageValue) / usefulLife
    return formatCurrency(annual)
  } else {
    const rate = 2 / usefulLife
    const annual = purchasePrice * rate
    return formatCurrency(annual)
  }
}

// Depreciation percentage
export const getDepreciationPercentage = (
  purchasePrice: number,
  usefulLife: number,
  method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE',
): number => {
  if (method === 'STRAIGHT_LINE') {
    return 1 / usefulLife
  } else {
    return 2 / usefulLife
  }
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Status badge color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'IN_USE': 'bg-blue-100 text-blue-800',
    'IN_STORE': 'bg-green-100 text-green-800',
    'DISPOSED': 'bg-gray-100 text-gray-800',
    'AUCTION': 'bg-yellow-100 text-yellow-800',
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
    'CHECKED_OUT': 'bg-blue-100 text-blue-800',
    'CHECKED_IN': 'bg-green-100 text-green-800',
    'SCHEDULED': 'bg-yellow-100 text-yellow-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Condition color
export const getConditionColor = (condition: string): string => {
  const colors: Record<string, string> = {
    'GOOD': 'bg-green-100 text-green-800',
    'REPAIR': 'bg-yellow-100 text-yellow-800',
    'DAMAGED': 'bg-red-100 text-red-800',
  }
  return colors[condition] || 'bg-gray-100 text-gray-800'
}

// Name capitalization
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Snake case to title case
export const snakeCaseToTitleCase = (str: string): string => {
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ')
}
