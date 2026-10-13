import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * GET /api/reports/templates/[id]
 * Get a specific report template
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

    const template = await prisma.reportConfiguration.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Error fetching report template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report template' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/reports/templates/[id]
 * Update a report template
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permission
    if (user.role === 'VIEW_USER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      )
    }

    const body = await request.json()

    const template = await prisma.reportConfiguration.update({
      where: { id: params.id },
      data: {
        ...(body.reportName && { reportName: body.reportName }),
        ...(body.reportType && { reportType: body.reportType }),
        ...(body.schedule !== undefined && {
          schedule: body.schedule,
          isScheduled: !!body.schedule,
        }),
        ...(body.recipients && { recipients: JSON.stringify(body.recipients) }),
        ...(body.includeCharts !== undefined && { includeCharts: body.includeCharts }),
        ...(body.includeSummary !== undefined && { includeSummary: body.includeSummary }),
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        entity: 'REPORT_TEMPLATE',
        entityId: params.id,
        details: JSON.stringify(body),
        tenantId: user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Report template updated successfully',
    })
  } catch (error) {
    console.error('Error updating report template:', error)
    return NextResponse.json(
      { error: 'Failed to update report template' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/reports/templates/[id]
 * Delete a report template
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permission
    if (user.role === 'VIEW_USER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      )
    }

    // Soft delete
    const template = await prisma.reportConfiguration.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        entity: 'REPORT_TEMPLATE',
        entityId: params.id,
        details: JSON.stringify({ templateName: template.reportName }),
        tenantId: user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Report template deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting report template:', error)
    return NextResponse.json(
      { error: 'Failed to delete report template' },
      { status: 500 },
    )
  }
}
