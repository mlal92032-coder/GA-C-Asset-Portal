import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(255),
  abbreviation: z.string().min(1, 'Abbreviation is required').max(10),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  province: z.string().optional().default(''),
  contactNumber: z.string().optional().default(''),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  remarks: z.string().optional().default(''),
});

export type Company = z.infer<typeof companySchema>;
