import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getPermissionGroups, getUserPermissions } from '@/lib/advanced-permissions'
import prisma from '@/lib/prisma'

/**
 * GET /api/admin/permissions
 * Get all available permissions and user's current permissions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only super admin can view all permissions
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admins can view permissions' },
        { status: 403 },
      )
    }

    const permissionGroups = getPermissionGroups()
    const userPermissions = await getUserPermissions(user.id)

    // Format permission groups
    const formattedGroups = Object.entries(permissionGroups).map(
      ([key, group]) => ({
        key,
        label: group.label,
        permissions: (group.permissions as string[]).map(p => ({
          value: p,
          label: p.replace(/[._]/g, ' ').toUpperCase(),
          granted: userPermissions.includes(p),
        })),
      }),
    )

    return NextResponse.json({
      success: true,
      data: {
        groups: formattedGroups,
        userPermissions,
        totalPermissions: userPermissions.length,
      },
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 },
    )
  }
}
