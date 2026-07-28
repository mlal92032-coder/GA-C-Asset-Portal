import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const CreateRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()),
})

/**
 * GET /api/admin/roles
 * List all custom roles
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email || '' },
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admins can manage roles' },
        { status: 403 },
      )
    }

    const roles = await prisma.customRole.findMany({
      include: {
        _count: { select: { users: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedRoles = roles.map(role => ({
      ...role,
      permissions: JSON.parse(role.permissions || '[]'),
      userCount: role._count.users,
    }))

    return NextResponse.json({
      success: true,
      data: formattedRoles,
      count: roles.length,
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/admin/roles
 * Create a new custom role
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email || '' },
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admins can create roles' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const validatedData = CreateRoleSchema.parse(body)

    // Check for duplicate role name
    const existingRole = await prisma.customRole.findFirst({
      where: { name: validatedData.name },
    })

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 },
      )
    }

    const role = await prisma.customRole.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        permissions: JSON.stringify(validatedData.permissions),
        createdById: user.id,
        isActive: true,
        tenantId: user.tenantId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'CUSTOM_ROLE',
        entityId: role.id,
        tenantId: user.tenantId,
        details: JSON.stringify({
          roleName: validatedData.name,
          permissions: validatedData.permissions,
        }),
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          ...role,
          permissions: JSON.parse(role.permissions || '[]'),
        },
        message: 'Role created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating role:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 },
    )
  }
}
