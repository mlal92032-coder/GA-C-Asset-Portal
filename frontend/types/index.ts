// User types
export interface User {
  id: string;
  fullName: string;
  email: string;
  department?: string | null;
  designation?: string | null;
  phone?: string | null;
  role: 'SUPER_ADMIN' | 'USER' | 'VIEW_USER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

// Company types
export interface Company {
  id: string;
  companyName: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Manufacturer types
export interface Manufacturer {
  id: string;
  manufacturerName: string;
  country?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Location types
export interface Location {
  id: string;
  locationName: string;
  building?: string | null;
  floor?: string | null;
  room?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Furniture Asset types
export interface FurnitureAsset {
  id: string;
  assetTag?: string | null;
  assetName: string;
  imageUrl?: string | null;
  furnitureType?: string | null;
  material?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  companyId?: string | null;
  manufacturerId?: string | null;
  locationId?: string | null;
  assignedUserId?: string | null;
  condition: 'GOOD' | 'REPAIR' | 'DAMAGED';
  status: 'IN_USE' | 'IN_STORE' | 'DISPOSED';
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: Company | null;
  manufacturer?: Manufacturer | null;
  location?: Location | null;
  assignedUser?: User | null;
}

// Electronic Asset types
export interface ElectronicAsset {
  id: string;
  assetTag?: string | null;
  assetName: string;
  imageUrl?: string | null;
  deviceType?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  warrantyEndDate?: string | null;
  companyId?: string | null;
  manufacturerId?: string | null;
  locationId?: string | null;
  assignedUserId?: string | null;
  condition: 'GOOD' | 'REPAIR' | 'DAMAGED';
  status: 'IN_USE' | 'IN_STORE' | 'DISPOSED';
  lastMaintenanceDate?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: Company | null;
  manufacturer?: Manufacturer | null;
  location?: Location | null;
  assignedUser?: User | null;
}

// Vehicle Asset types
export interface VehicleAsset {
  id: string;
  assetTag?: string | null;
  assetName: string;
  serialNumber?: string | null;
  imageUrl?: string | null;
  vehicleType?: string | null;
  brand?: string | null;
  model?: string | null;
  registrationNumber: string;
  engineNumber?: string | null;
  chassisNumber?: string | null;
  fuelType?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  companyId?: string | null;
  manufacturerId?: string | null;
  locationId?: string | null;
  assignedUserId?: string | null;
  condition: 'GOOD' | 'REPAIR' | 'DAMAGED';
  status: 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION';
  lastServiceDate?: string | null;
  insuranceExpiryDate?: string | null;
  remarks?: string | null;
  usefulLifeYears?: number | null;
  salvageValue?: number | null;
  depreciationMethod?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: Company | null;
  manufacturer?: Manufacturer | null;
  location?: Location | null;
  assignedUser?: User | null;
}

// Pagination
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationState;
}

// Dashboard Stats
export interface DashboardStats {
  totalAssets: number;
  furnitureCount: number;
  electronicCount: number;
  vehicleCount: number;
  conditionBreakdown: {
    good: number;
    repair: number;
    damaged: number;
  };
  statusBreakdown: {
    inUse: number;
    inStore: number;
    disposed: number;
  };
  assetsByLocation: { locationName: string; count: number }[];
  assetsByCompany: { companyName: string; count: number }[];
  recentAssets: { id: string; name: string; type: string; date: string }[];
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

// Form types
export interface UserFormData {
  fullName: string;
  email: string;
  password?: string;
  department?: string;
  designation?: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'USER' | 'VIEW_USER';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CompanyFormData {
  companyName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface ManufacturerFormData {
  manufacturerName: string;
  country?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface LocationFormData {
  locationName: string;
  building?: string;
  floor?: string;
  room?: string;
  description?: string;
}

export interface FurnitureFormData {
  assetName: string;
  assetTag?: string;
  imageUrl?: string;
  furnitureType?: string;
  material?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  companyId?: string;
  manufacturerId?: string;
  locationId?: string;
  assignedUserId?: string;
  condition: 'GOOD' | 'REPAIR' | 'DAMAGED';
  status: 'IN_USE' | 'IN_STORE' | 'DISPOSED';
  usefulLifeYears?: number;
  salvageValue?: number;
  depreciationMethod?: string;
  remarks?: string;
}

export interface ElectronicFormData {
  assetName: string;
  assetTag?: string;
  imageUrl?: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  companyId?: string;
  manufacturerId?: string;
  locationId?: string;
  assignedUserId?: string;
  condition: 'GOOD' | 'REPAIR' | 'DAMAGED';
  status: 'IN_USE' | 'IN_STORE' | 'DISPOSED';
  lastMaintenanceDate?: string;
  usefulLifeYears?: number;
  salvageValue?: number;
  depreciationMethod?: string;
  remarks?: string;
}

export interface VehicleFormData {
  assetName: string;
  assetTag?: string;
  imageUrl?: string;
  vehicleType?: string;
  brand?: string;
  model?: string;
  registrationNumber: string;
  engineNumber?: string;
  chassisNumber?: string;
  fuelType?: string;
  purchaseDate?: string;
  companyId?: string;
  manufacturerId?: string;
  locationId?: string;
  assignedUserId?: string;
  condition: 'GOOD' | 'REPAIR' | 'DAMAGED';
  status: 'IN_USE' | 'IN_STORE' | 'DISPOSED' | 'AUCTION';
  lastServiceDate?: string;
  insuranceExpiryDate?: string;
  usefulLifeYears?: number;
  salvageValue?: number;
  depreciationMethod?: string;
  remarks?: string;
}

export interface Maintenance {
  id: string;
  assetId: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  maintenanceDate: string;
  description: string;
  cost?: number | null;
  performedBy?: string | null;
  nextDueDate?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  userId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceFormData {
  assetId: string;
  assetType: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE';
  maintenanceDate: string;
  description: string;
  cost?: number | null;
  performedBy?: string | null;
  nextDueDate?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}
