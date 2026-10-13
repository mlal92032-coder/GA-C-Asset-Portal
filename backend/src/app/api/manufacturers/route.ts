import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const manufacturerSchema = z.object({
  manufacturerName: z.string().min(1, 'Manufacturer name is required'),
  country: z.string().optional().or(z.null()).transform(v => !v ? null : v),
  supportEmail: z.string()
    .optional()
    .or(z.null())
    .transform(v => !v ? null : v)
    .refine(v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email format'),
  supportPhone: z.string().optional().or(z.null()).transform(v => !v ? null : v),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission('manufacturers', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const manufacturers = await prisma.manufacturer.findMany({
      where: search
        ? {
            OR: [
              { manufacturerName: { contains: search } },
              { country: { contains: search } },
              { supportEmail: { contains: search } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: manufacturers });
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch manufacturers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission('manufacturers', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const validatedData = manufacturerSchema.parse(body);

    const session = await getServerSession(authOptions);
    const tenantId = session?.user?.tenantId;

    const manufacturer = await prisma.manufacturer.create({
      data: {
        ...validatedData,
        tenantId: tenantId || undefined,
      },
    });

    await createAuditLog({
      action: 'CREATE',
      entity: 'MANUFACTURER',
      entityId: manufacturer.id,
      details: validatedData,
    });

    return NextResponse.json({ success: true, data: manufacturer, message: 'Manufacturer created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating manufacturer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create manufacturer' },
      { status: 500 }
    );
  }
}
