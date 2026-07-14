import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { PDFService } from '@/services/pdf.service'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const GenerateReportSchema = z.object({
  reportType: z.enum(['inventory', 'maintenance', 'financial', 'checkout']),
  filters: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.string().optional(),
    condition: z.string().optional(),
    companyId: z.string().optional(),
    locationId: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user for audit logging
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = GenerateReportSchema.parse(body)

    // Permission check: only SUPER_ADMIN or USER can generate reports
    if (user.role === 'VIEW_USER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to generate reports' },
        { status: 403 },
      )
    }

    // Convert filter dates if provided
    const filters = {
      ...(validatedData.filters || {}),
      startDate: validatedData.filters?.startDate ? new Date(validatedData.filters.startDate) : undefined,
      endDate: validatedData.filters?.endDate ? new Date(validatedData.filters.endDate) : undefined,
    }

    // Generate appropriate report
    let pdfBuffer: Buffer
    const reportMetadata = {
      type: validatedData.reportType,
      generatedBy: user.fullName,
      generatedAt: new Date(),
      filters: validatedData.filters,
    }

    switch (validatedData.reportType) {
      case 'inventory':
        pdfBuffer = await PDFService.generateAssetInventoryReport(filters, {
          title: 'Asset Inventory Report',
          author: user.fullName,
        })
        break
      case 'maintenance':
        pdfBuffer = await PDFService.generateMaintenanceReport(filters, {
          title: 'Maintenance Report',
          author: user.fullName,
        })
        break
      case 'financial':
        pdfBuffer = await PDFService.generateFinancialReport(filters, {
          title: 'Financial Report',
          author: user.fullName,
        })
        break
      case 'checkout':
        pdfBuffer = await PDFService.generateCheckoutReport(filters, {
          title: 'Checkout Report',
          author: user.fullName,
        })
        break
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 },
        )
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EXPORT',
        entity: 'REPORT',
        details: JSON.stringify({
          reportType: validatedData.reportType,
          filters: validatedData.filters,
        }),
      },
    })

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${validatedData.reportType}-report-${Date.now()}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Report generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
