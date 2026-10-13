import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  designation: z.string().optional(),
  department: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);

    console.log('[SIGNUP] Creating account for:', validatedData.email);

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user as SUPER_ADMIN if it's the first user
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'SUPER_ADMIN' : 'USER';

    console.log('[SIGNUP] Creating user with role:', role);

    // Create or get default tenant for new user
    let defaultTenant = await prisma.tenant.findFirst({
      where: { name: 'Default' },
    });

    if (!defaultTenant) {
      defaultTenant = await prisma.tenant.create({
        data: {
          name: 'Default',
          slug: 'default',
          billingEmail: validatedData.email,
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        password: hashedPassword,
        designation: validatedData.designation || null,
        department: validatedData.department || null,
        role: role as any,
        status: 'ACTIVE',
        tenantId: defaultTenant.id,
      },
    });

    console.log('[SIGNUP] User created successfully:', user.id);

    return NextResponse.json(
      {
        success: true,
        message: `Account created successfully as ${role}`,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SIGNUP] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create account: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
