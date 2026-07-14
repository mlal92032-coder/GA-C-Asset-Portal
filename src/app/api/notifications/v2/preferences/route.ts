import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { WebSocketService } from '@/services/websocket.service'
import { successResponse, errorResponse, handleApiError } from '@/utils/api-response'
import { authOptions } from '@/lib/auth'

// GET user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 },
      )
    }

    const preferences = await WebSocketService.getUserNotificationPreferences(
      session.user.id,
    )

    return NextResponse.json(
      successResponse(preferences || {
        userId: session.user.id,
        emailNotifications: true,
        pushNotifications: true,
        checkoutAlerts: true,
        maintenanceAlerts: true,
        analyticsReports: false,
      }),
      { status: 200 },
    )
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}

// PUT update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 },
      )
    }

    const body = await request.json()

    const preferences = await WebSocketService.updateUserNotificationPreferences(
      session.user.id,
      body,
    )

    return NextResponse.json(successResponse(preferences), { status: 200 })
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}
