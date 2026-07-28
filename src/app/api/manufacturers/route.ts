import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const manufacturerSchema = z.object({
  manufacturerName: z.string().min(1, 'Manufacturer name is required'),
  country: z.string().optional().nullable(),
  supportEmail: z.string().email().optional().nullable(),
  supportPhone: z.string().optional().nullable(),
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
    const { user } = authResult;

    const body = await req.json();
    const validatedData = manufacturerSchema.parse(body);

    const manufacturer = await prisma.manufacturer.create({
      data: {
        ...validatedData,
        tenant: {
          connect: { id: user.tenantId },
        },
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
