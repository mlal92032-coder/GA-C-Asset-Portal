import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  address: z.string().optional().or(z.null()).transform(v => !v ? null : v),
  phone: z.string().optional().or(z.null()).transform(v => !v ? null : v),
  email: z.string()
    .optional()
    .or(z.null())
    .transform(v => !v ? null : v)
    .refine(v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email format'),
});

export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const authResult = await requirePermission('companies', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const companies = await prisma.company.findMany({
      where: search
        ? {
            OR: [
              { companyName: { contains: search } },
              { address: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const authResult = await requirePermission('companies', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const validatedData = companySchema.parse(body);

    // Get tenant from session
    const session = await getServerSession(authOptions);
    const tenantId = session?.user?.tenantId;

    const company = await prisma.company.create({
      data: {
        ...validatedData,
        tenantId: tenantId || undefined,
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      entity: 'COMPANY',
      entityId: company.id,
      details: validatedData,
    });

    return NextResponse.json({ success: true, data: company, message: 'Company created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return NextResponse.json(
        { success: false, error: error.issues[0].message, issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating company:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create company' },
      { status: 500 }
    );
  }
}
