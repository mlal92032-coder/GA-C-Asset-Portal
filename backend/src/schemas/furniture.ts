import { z } from 'zod';

export const furnitureAssetSchema = z.object({
  assetName: z.string().min(2, 'Asset name must be at least 2 characters').max(255),
  assetTag: z.string().min(1, 'Asset tag is required').max(50),
  description: z.string().optional().default(''),
  purchaseDate: z.string().pipe(z.coerce.date()),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).default('GOOD'),
  location: z.string().min(1, 'Location is required'),
  company: z.string().min(1, 'Company is required'),
  manufacturer: z.string().optional().default(''),
  departmentAssigned: z.string().optional().default(''),
  status: z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']).default('IN_STORE'),
  salvageValue: z.number().nonnegative('Salvage value cannot be negative').optional(),
  remarks: z.string().optional().default(''),
  depreciation: z.object({
    method: z.enum(['STRAIGHT_LINE', 'DECLINING_BALANCE']).optional(),
    usefulLife: z.number().positive('Useful life must be positive').optional(),
  }).optional(),
});

export type FurnitureAsset = z.infer<typeof furnitureAssetSchema>;
