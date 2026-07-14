import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { WebSocketService } from '@/services/websocket.service'
import { successResponse, errorResponse, handleApiError } from '@/utils/api-response'
import { authOptions } from '@/lib/auth'

// GET user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 },
      )
    }

    const unread = request.nextUrl.searchParams.get('unread') === 'true'

    let notifications

    if (unread) {
      notifications = await WebSocketService.getUnreadNotifications(session.user.id)
    } else {
      notifications = await WebSocketService.getUnreadNotifications(session.user.id)
      // Can extend to get all notifications with pagination
    }

    return NextResponse.json(
      successResponse({
        notifications,
        unreadCount: notifications.length,
      }),
      { status: 200 },
    )
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}

// POST mark notification as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 },
      )
    }

    const body = await request.json()
    const { action, notificationId } = body

    if (action === 'mark-read' && notificationId) {
      await WebSocketService.markAsRead(notificationId)
      return NextResponse.json(successResponse({ marked: true }), { status: 200 })
    }

    if (action === 'mark-all-read') {
      await WebSocketService.markAllAsRead(session.user.id)
      return NextResponse.json(successResponse({ markedAll: true }), { status: 200 })
    }

    if (action === 'clear') {
      await WebSocketService.clearNotifications(session.user.id)
      return NextResponse.json(successResponse({ cleared: true }), { status: 200 })
    }

    return NextResponse.json(
      errorResponse('INVALID_ACTION', 'Unknown action'),
      { status: 400 },
    )
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}
