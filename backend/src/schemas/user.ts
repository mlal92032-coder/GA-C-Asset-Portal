import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER', 'VIEW_USER']).default('USER'),
  permissions: z.record(z.string(), z.boolean()).optional(),
  isActive: z.boolean().default(true),
});

export type User = z.infer<typeof userSchema>;

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type UserLogin = z.infer<typeof userLoginSchema>;

export const userPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UserPasswordChange = z.infer<typeof userPasswordChangeSchema>;
