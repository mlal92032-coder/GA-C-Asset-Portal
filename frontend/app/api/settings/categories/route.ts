import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePermission('settings', 'view');
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    // Fetch categories based on user role
    const categories = await prisma.settingCategory.findMany({
      where: {
        isActive: true,
        // Only SUPER_ADMIN sees all categories, others see categories with their role or lower
        ...(user.role !== 'SUPER_ADMIN' && {
          requiredRole: { in: ['USER', 'VIEW_USER'] },
        }),
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        bgColor: true,
        order: true,
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching settings categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePermission('settings', 'create');
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { name, slug, description, icon, color, bgColor, requiredRole, isSystem } = body;

    if (!name || !slug || !icon || !color || !bgColor) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.settingCategory.findFirst({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Category slug already exists' },
        { status: 400 }
      );
    }

    // Get the highest order number
    const lastCategory = await prisma.settingCategory.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (lastCategory?.order || 0) + 1;

    const category = await prisma.settingCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        bgColor,
        order: newOrder,
        requiredRole: requiredRole || 'SUPER_ADMIN',
        isSystem: isSystem || false,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error('Error creating settings category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create settings category' },
      { status: 500 }
    );
  }
}
