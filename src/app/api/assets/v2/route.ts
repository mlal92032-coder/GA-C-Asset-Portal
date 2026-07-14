import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { AssetService } from '@/services/asset.service'
import { AuditService } from '@/services/audit.service'
import { successResponse, errorResponse, validationError, handleApiError } from '@/utils/api-response'
import { authOptions } from '@/lib/auth'

// GET all assets with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(errorResponse('UNAUTHORIZED', 'Not authenticated'), {
        status: 401,
      })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') || undefined
    const condition = searchParams.get('condition') || undefined
    const search = searchParams.get('search') || undefined

    const filters = {
      status: status as any,
      condition: condition as any,
      search,
      limit,
      offset,
    }

    let assets: any = []

    if (type === 'furniture' || type === 'all') {
      const furnitureAssets = await AssetService.getFurnitureAssets(filters)
      assets = [...assets, ...furnitureAssets.map(a => ({ ...a, type: 'FURNITURE' }))]
    }

    if (type === 'electronics' || type === 'all') {
      const electronicAssets = await AssetService.getElectronicAssets(filters)
      assets = [...assets, ...electronicAssets.map(a => ({ ...a, type: 'ELECTRONIC' }))]
    }

    if (type === 'vehicles' || type === 'all') {
      const vehicleAssets = await AssetService.getVehicleAssets(filters)
      assets = [...assets, ...vehicleAssets.map(a => ({ ...a, type: 'VEHICLE' }))]
    }

    return NextResponse.json(
      successResponse({
        assets: assets.slice(offset, offset + limit),
        total: assets.length,
        limit,
        offset,
      }),
      { status: 200 },
    )
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}

// POST create asset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(errorResponse('UNAUTHORIZED', 'Not authenticated'), {
        status: 401,
      })
    }

    const body = await request.json()
    const { type, ...assetData } = body

    if (!type || !['FURNITURE', 'ELECTRONIC', 'VEHICLE'].includes(type)) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Invalid asset type'),
        { status: 400 },
      )
    }

    let asset: any

    if (type === 'FURNITURE') {
      asset = await AssetService.createFurnitureAsset(assetData)
    } else if (type === 'ELECTRONIC') {
      asset = await AssetService.createElectronicAsset(assetData)
    } else {
      asset = await AssetService.createVehicleAsset(assetData)
    }

    // Log action
    await AuditService.logAction({
      userId: session.user.id,
      action: 'CREATE',
      entity: `${type}_ASSET`,
      entityId: asset.id,
      details: asset,
    })

    return NextResponse.json(
      successResponse({ asset, type }, request.nextUrl.pathname),
      { status: 201 },
    )
  } catch (error: any) {
    const { statusCode, response } = handleApiError(error, request.nextUrl.pathname)
    return NextResponse.json(response, { status: statusCode })
  }
}
