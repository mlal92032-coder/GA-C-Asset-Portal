import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const AssignRoleSchema = z.object({
  roleType: z.enum(['SUPER_ADMIN', 'USER', 'VIEW_USER', 'CUSTOM']),
  customRoleId: z.string().optional(),
})

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * PATCH /api/admin/users/[id]/assign-role
 * Assign a role to a user
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

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    })

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admins can assign roles' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const validatedData = AssignRoleSchema.parse(body)

    // Prevent changing own role
    if (params.id === admin.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 },
      )
    }

    // Validate custom role if specified
    if (validatedData.roleType === 'CUSTOM' && validatedData.customRoleId) {
      const customRole = await prisma.customRole.findUnique({
        where: { id: validatedData.customRoleId },
      })

      if (!customRole) {
        return NextResponse.json(
          { error: 'Custom role not found' },
          { status: 404 },
        )
      }

      if (!customRole.isActive) {
        return NextResponse.json(
          { error: 'Custom role is inactive' },
          { status: 400 },
        )
      }
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        role: validatedData.roleType,
        customRoleId:
          validatedData.roleType === 'CUSTOM'
            ? validatedData.customRoleId
            : null,
      },
      include: { customRole: true },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'UPDATE',
        entity: 'USER_ROLE',
        entityId: user.id,
        details: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          newRole: validatedData.roleType,
          customRoleId: validatedData.customRoleId,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        customRole: user.customRole,
      },
      message: `Role updated for ${user.fullName}`,
    })
  } catch (error) {
    console.error('Error assigning role:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 },
    )
  }
}
