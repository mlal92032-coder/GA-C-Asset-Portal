import { z } from 'zod';

export const checkoutSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  assetType: z.enum(['FURNITURE', 'ELECTRONIC', 'VEHICLE']),
  employeeId: z.string().min(1, 'Employee is required'),
  checkoutDate: z.string().pipe(z.coerce.date()),
  expectedReturnDate: z.string().pipe(z.coerce.date()),
  actualReturnDate: z.string().pipe(z.coerce.date()).optional(),
  purpose: z.string().min(2, 'Purpose must be at least 2 characters').max(500),
  remarks: z.string().optional().default(''),
  status: z.enum(['ACTIVE', 'RETURNED', 'OVERDUE', 'LOST']).default('ACTIVE'),
  isReturned: z.boolean().default(false),
});

export const checkoutReturnSchema = z.object({
  actualReturnDate: z.string().pipe(z.coerce.date()),
  condition: z.enum(['GOOD', 'REPAIR', 'DAMAGED']).default('GOOD'),
  remarks: z.string().optional().default(''),
  returnInspectionNotes: z.string().optional().default(''),
});

export type Checkout = z.infer<typeof checkoutSchema>;
export type CheckoutReturn = z.infer<typeof checkoutReturnSchema>;
