import { z } from 'zod';

export const vehicleAssetSchema = z.object({
  assetName: z.string().min(2, 'Asset name must be at least 2 characters').max(255),
  assetTag: z.string().min(1, 'Asset tag is required').max(50),
  registrationNumber: z.string().min(1, 'Registration number is required').max(50),
  chassisNumber: z.string().min(1, 'Chassis number is required').max(100),
  engineNumber: z.string().min(1, 'Engine number is required').max(100),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  modelYear: z.number().int().min(1900, 'Invalid year').max(new Date().getFullYear() + 1),
  vehicleType: z.enum(['CAR', 'VAN', 'TRUCK', 'MOTORCYCLE', 'OTHER']).default('CAR'),
  description: z.string().optional().default(''),
  purchaseDate: z.string().pipe(z.coerce.date()),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).default('GOOD'),
  location: z.string().min(1, 'Location is required'),
  company: z.string().min(1, 'Company is required'),
  departmentAssigned: z.string().optional().default(''),
  status: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']).default('IN_STORE'),
  mileage: z.number().nonnegative('Mileage cannot be negative').optional(),
  fuelType: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'OTHER']).optional(),
  registrationExpiry: z.string().pipe(z.coerce.date()).optional(),
  insuranceExpiry: z.string().pipe(z.coerce.date()).optional(),
  salvageValue: z.number().nonnegative('Salvage value cannot be negative').optional(),
  remarks: z.string().optional().default(''),
  depreciation: z.object({
    method: z.enum(['STRAIGHT_LINE', 'DECLINING_BALANCE']).optional(),
    usefulLife: z.number().positive('Useful life must be positive').optional(),
  }).optional(),
});

export type VehicleAsset = z.infer<typeof vehicleAssetSchema>;
