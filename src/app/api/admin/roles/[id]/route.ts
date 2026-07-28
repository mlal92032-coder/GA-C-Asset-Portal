import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * GET /api/admin/roles/[id]
 * Get a specific custom role
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
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
        { error: 'Only super admins can view roles' },
        { status: 403 },
      )
    }

    const role = await prisma.customRole.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: { id: true, fullName: true, email: true, status: true },
        },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    })

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        permissions: JSON.parse(role.permissions || '[]'),
      },
    })
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/admin/roles/[id]
 * Update a custom role
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
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
        { error: 'Only super admins can update roles' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const validatedData = UpdateRoleSchema.parse(body)

    const role = await prisma.customRole.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.permissions && { permissions: JSON.stringify(validatedData.permissions) }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        entity: 'CUSTOM_ROLE',
        entityId: params.id,
        details: JSON.stringify(validatedData),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        permissions: JSON.parse(role.permissions || '[]'),
      },
      message: 'Role updated successfully',
    })
  } catch (error) {
    console.error('Error updating role:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/roles/[id]
 * Delete a custom role
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
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
        { error: 'Only super admins can delete roles' },
        { status: 403 },
      )
    }

    // Check if role is being used by any users
    const usersWithRole = await prisma.user.count({
      where: { customRoleId: params.id },
    })

    if (usersWithRole > 0) {
      return NextResponse.json(
        { error: `Cannot delete role that is assigned to ${usersWithRole} user(s)` },
        { status: 409 },
      )
    }

    await prisma.customRole.delete({
      where: { id: params.id },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        entity: 'CUSTOM_ROLE',
        entityId: params.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 },
    )
  }
}
