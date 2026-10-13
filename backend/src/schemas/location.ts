import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().min(2, 'Location name must be at least 2 characters').max(255),
  description: z.string().optional().default(''),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  province: z.string().optional().default(''),
  contactPerson: z.string().optional().default(''),
  contactNumber: z.string().optional().default(''),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  company: z.string().min(1, 'Company is required'),
  isActive: z.boolean().default(true),
  remarks: z.string().optional().default(''),
});

export type Location = z.infer<typeof locationSchema>;
