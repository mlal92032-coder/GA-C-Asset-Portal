import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requirePermission, createAuditLog } from '@/lib/api-auth';

const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required').optional(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await requirePermission('companies', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: company });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await requirePermission('companies', 'edit');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();
    const validatedData = companySchema.parse(body);

    // Get old data for audit
    const oldCompany = await prisma.company.findUnique({ where: { id } });

    const company = await prisma.company.update({
      where: { id },
      data: validatedData,
    });

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      entity: 'COMPANY',
      entityId: company.id,
      details: { old: oldCompany, new: validatedData },
    });

    return NextResponse.json({ success: true, data: company, message: 'Company updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await requirePermission('companies', 'delete');
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    // Get data for audit before deleting
    const company = await prisma.company.findUnique({ where: { id } });

    await prisma.company.delete({ where: { id } });

    // Create audit log
    if (company) {
      await createAuditLog({
        action: 'DELETE',
        entity: 'COMPANY',
        entityId: id,
        details: { deleted: company },
      });
    }

    return NextResponse.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
