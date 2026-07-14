import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { checkPermission } from '@/lib/advanced-permissions'
import prisma from '@/lib/prisma'

/**
 * Middleware to check permissions for API routes
 * Usage: Use in API routes to enforce permission checks
 */
export async function withPermissionCheck(
  request: NextRequest,
  requiredPermission: string,
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 },
      )
    }

    // Super admins always have permission
    if (user.role === 'SUPER_ADMIN') {
      return null // Permission granted
    }

    // Check permission
    const hasPermission = await checkPermission(user.id, requiredPermission)

    if (!hasPermission) {
      // Log denied access
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'PERMISSION_DENIED',
            entity: 'PERMISSION_CHECK',
            details: JSON.stringify({
              permission: requiredPermission,
              method: request.method,
              path: request.nextUrl.pathname,
            }),
          },
        })
      } catch {
        // Audit log error, continue
      }

      return new NextResponse(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403 },
      )
    }

    return null // Permission granted
  } catch (error) {
    console.error('Permission check error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Permission check failed' }),
      { status: 500 },
    )
  }
}

/**
 * Create a permission-protected API route handler
 */
export function withPermissions(
  requiredPermissions: string | string[],
) {
  return function protectedHandler(
    handler: (request: NextRequest) => Promise<Response>,
  ) {
    return async (request: NextRequest) => {
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions]

      for (const permission of permissions) {
        const result = await withPermissionCheck(request, permission)
        if (result) {
          return result
        }
      }

      return handler(request)
    }
  }
}
