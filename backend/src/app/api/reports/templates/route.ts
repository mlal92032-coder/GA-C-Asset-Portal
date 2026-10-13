import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const ReportTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['inventory', 'maintenance', 'financial', 'checkout']),
  metrics: z.array(z.string()).optional(),
  filters: z.object({
    status: z.string().optional(),
    condition: z.string().optional(),
    companyId: z.string().optional(),
    locationId: z.string().optional(),
  }).optional(),
  schedule: z.string().optional(), // Cron expression or schedule name
})

/**
 * GET /api/reports/templates
 * List all report templates for the current user
 */
export async function GET(request: NextRequest) {
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

    // Get all report configurations (templates)
    const templates = await prisma.reportConfiguration.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
    })
  } catch (error) {
    console.error('Error fetching report templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report templates' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/reports/templates
 * Create a new report template
 */
export async function POST(request: NextRequest) {
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

    // Permission check
    if (user.role === 'VIEW_USER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const validatedData = ReportTemplateSchema.parse(body)

    // Create report template
    const template = await prisma.reportConfiguration.create({
      data: {
        reportName: validatedData.name,
        reportType: validatedData.type,
        description: `Report created by ${user.fullName}`,
        schedule: validatedData.schedule || null,
        isScheduled: !!validatedData.schedule,
        format: 'PDF',
        recipients: JSON.stringify([user.email]),
        includeCharts: true,
        includeSummary: true,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'REPORT_TEMPLATE',
        entityId: template.id,
        details: JSON.stringify(validatedData),
        tenantId: user.tenantId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: template,
        message: 'Report template created successfully',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating report template:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create report template' },
      { status: 500 },
    )
  }
}
