import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
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

    const company = await prisma.company.create({
      data: validatedData,
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
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
