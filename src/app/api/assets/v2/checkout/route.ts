import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { CheckoutService } from '@/services/checkout.service'
import { AuditService } from '@/services/audit.service'
import { successResponse, errorResponse, notFoundError, handleApiError } from '@/utils/api-response'
import { authOptions } from '@/lib/auth'

// POST checkout asset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(errorResponse('UNAUTHORIZED', 'Not authenticated'), {
        status: 401,
      })
    }

    const body = await request.json()
    const { assetId, assetType, notes, expectedReturnDate } = body

    if (!assetId || !assetType) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Missing required fields'),
        { status: 400 },
      )
    }

    const checkout = await CheckoutService.checkoutAsset({
      assetId,
      assetType,
      userId: session.user.id,
      notes,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
    })

    // Log action
    await AuditService.logAction({
      userId: session.user.id,
      action: 'CHECKOUT',
      entity: `${assetType}_ASSET`,
      entityId: assetId,
      details: {
        checkoutId: checkout.id,
        expectedReturnDate,
      },
    })

    return NextResponse.json(successResponse(checkout), { status: 201 })
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}

// POST checkin asset
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(errorResponse('UNAUTHORIZED', 'Not authenticated'), {
        status: 401,
      })
    }

    const body = await request.json()
    const { checkoutId, notes } = body

    if (!checkoutId) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Missing checkoutId'),
        { status: 400 },
      )
    }

    const checkout = await CheckoutService.checkinAsset(checkoutId, notes)

    // Log action
    await AuditService.logAction({
      userId: session.user.id,
      action: 'CHECKIN',
      entity: 'ASSET_CHECKOUT',
      entityId: checkoutId,
      details: { returnNotes: notes },
    })

    return NextResponse.json(successResponse(checkout), { status: 200 })
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}

// GET checkout stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(errorResponse('UNAUTHORIZED', 'Not authenticated'), {
        status: 401,
      })
    }

    const stats = await CheckoutService.getCheckoutStats()

    return NextResponse.json(successResponse(stats), { status: 200 })
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}
