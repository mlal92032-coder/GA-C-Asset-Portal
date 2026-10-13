// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++

  if (strength <= 2) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
}

// Phone validation
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// UUID validation
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Asset tag validation
export const isValidAssetTag = (tag: string): boolean => {
  return /^[A-Z]+-\d{6}$/.test(tag)
}

// VIN validation
export const isValidVIN = (vin: string): boolean => {
  // Basic VIN format (17 characters, no I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i
  return vinRegex.test(vin)
}

// License plate validation
export const isValidLicensePlate = (plate: string): boolean => {
  // Basic format: 2-3 letters, 2-4 numbers
  const plateRegex = /^[A-Z]{2,3}[-]?[0-9]{2,4}$/i
  return plateRegex.test(plate.replace(/\s/g, ''))
}

// Serial number validation
export const isValidSerialNumber = (serial: string): boolean => {
  // Basic: alphanumeric, 5-20 characters
  return /^[A-Z0-9]{5,20}$/i.test(serial.replace(/[-]/g, ''))
}

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 500)
}

// Sanitize email
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim()
}

// Validate date range
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate < endDate
}

// Validate price
export const isValidPrice = (price: number): boolean => {
  return price > 0 && price < 999999999
}

// Validate percentage
export const isValidPercentage = (percentage: number): boolean => {
  return percentage >= 0 && percentage <= 100
}

// Validate array not empty
export const isNotEmpty = <T>(arr: T[]): boolean => {
  return Array.isArray(arr) && arr.length > 0
}

// Validate string length
export const isValidLength = (
  str: string,
  min: number,
  max: number,
): boolean => {
  return str.length >= min && str.length <= max
}

// Get validation error message
export const getValidationError = (field: string, type: string): string => {
  const messages: Record<string, Record<string, string>> = {
    email: {
      invalid: 'Invalid email address',
      required: 'Email is required',
    },
    password: {
      weak: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      required: 'Password is required',
    },
    phone: {
      invalid: 'Invalid phone number',
      required: 'Phone number is required',
    },
    url: {
      invalid: 'Invalid URL',
      required: 'URL is required',
    },
    date: {
      invalid: 'Invalid date',
      required: 'Date is required',
    },
    price: {
      invalid: 'Price must be greater than 0',
      required: 'Price is required',
    },
  }

  return messages[field]?.[type] || `Invalid ${field}`
}
