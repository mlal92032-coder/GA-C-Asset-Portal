import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { AnalyticsService } from '@/services/analytics.service'
import { successResponse, errorResponse, forbiddenError, handleApiError } from '@/utils/api-response'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Not authenticated'),
        { status: 401 },
      )
    }

    const companyId = request.nextUrl.searchParams.get('companyId')
    const stats = await AnalyticsService.getDashboardStats(companyId || undefined)

    return NextResponse.json(
      successResponse(stats, request.nextUrl.pathname),
      { status: 200 },
    )
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}
