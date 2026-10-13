import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const locationSchema = z.object({
  locationName: z.string().min(1, 'Location name is required'),
  building: z.string().optional().or(z.null()).transform(v => !v ? null : v),
  floor: z.string().optional().or(z.null()).transform(v => !v ? null : v),
  room: z.string().optional().or(z.null()).transform(v => !v ? null : v),
  description: z.string().optional().or(z.null()).transform(v => !v ? null : v),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission('locations', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const locations = await prisma.location.findMany({
      where: search
        ? {
            OR: [
              { locationName: { contains: search } },
              { building: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission('locations', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const validatedData = locationSchema.parse(body);

    const session = await getServerSession(authOptions);
    const tenantId = session?.user?.tenantId;

    const location = await prisma.location.create({
      data: {
        ...validatedData,
        tenantId: tenantId || undefined,
      },
    });

    await createAuditLog({
      action: 'CREATE',
      entity: 'LOCATION',
      entityId: location.id,
      details: validatedData,
    });

    return NextResponse.json({ success: true, data: location, message: 'Location created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
