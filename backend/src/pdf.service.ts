import PDFDocument from 'pdfkit'
import { Readable } from 'stream'
import prisma from '@/lib/prisma'

interface PdfGenerationOptions {
  title: string
  author?: string
  subject?: string
}

interface ReportFilters {
  startDate?: Date
  endDate?: Date
  status?: string
  condition?: string
  companyId?: string
  locationId?: string
}

/**
 * PDF Service - Generates professional PDF reports for various asset management scenarios
 * All functions return Buffer for either file storage or email attachment
 */
export class PDFService {
  /**
   * Generate Asset Inventory Report PDF
   * Includes all assets with QR codes, values, conditions, and depreciation info
   */
  static async generateAssetInventoryReport(
    filters: ReportFilters = {},
    options: PdfGenerationOptions = { title: 'Asset Inventory Report' },
  ): Promise<Buffer> {
    const pdf = new PDFDocument({
      size: 'A4',
      margin: 40,
    })

    const buffer = await this.streamToBuffer(pdf)

    try {
      // Header
      pdf.fontSize(24).font('Helvetica-Bold').text(options.title, { align: 'center' })
      pdf.moveDown(0.5)
      pdf.fontSize(10).font('Helvetica').fillColor('#666').text(
        `Generated on ${new Date().toLocaleString()}`,
        { align: 'center' },
      )
      pdf.moveDown(1)

      // Fetch assets
      const assets = await prisma.furnitureAsset.findMany({
        where: {
          ...(filters.status && { status: filters.status }),
          ...(filters.condition && { condition: filters.condition }),
          ...(filters.companyId && { companyId: filters.companyId }),
          ...(filters.locationId && { locationId: filters.locationId }),
        },
        include: {
          company: true,
          manufacturer: true,
          location: true,
        },
        take: 1000,
      })

      const electronicsAssets = await prisma.electronicAsset.findMany({
        where: {
          ...(filters.status && { status: filters.status }),
          ...(filters.condition && { condition: filters.condition }),
          ...(filters.companyId && { companyId: filters.companyId }),
          ...(filters.locationId && { locationId: filters.locationId }),
        },
        include: {
          company: true,
          manufacturer: true,
          location: true,
        },
        take: 1000,
      })

      const vehicleAssets = await prisma.vehicleAsset.findMany({
        where: {
          ...(filters.status && { status: filters.status }),
          ...(filters.condition && { condition: filters.condition }),
          ...(filters.companyId && { companyId: filters.companyId }),
          ...(filters.locationId && { locationId: filters.locationId }),
        },
        include: {
          company: true,
          manufacturer: true,
          location: true,
        },
        take: 1000,
      })

      const allAssets = [...assets, ...electronicsAssets, ...vehicleAssets]
      const totalValue = allAssets.reduce((sum, a) => {
        const price = (a as any).purchasePrice || 0
        return sum + (typeof price === 'number' ? price : 0)
      }, 0)

      // Summary Section
      pdf.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Summary', { underline: true })
      pdf.fontSize(10).font('Helvetica').moveDown(0.3)
      const summaryData = [
        ['Total Assets:', `${allAssets.length}`],
        ['Total Value:', `${this.formatCurrency(totalValue)}`],
        ['By Type:', `Furniture: ${assets.length} | Electronics: ${electronicsAssets.length} | Vehicles: ${vehicleAssets.length}`],
      ]

      summaryData.forEach(([label, value]) => {
        pdf.text(`${label} ${value}`, { indent: 10 })
      })

      pdf.moveDown(1)

      // Table Headers
      pdf
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#fff')
        .rect(40, pdf.y, 515, 25)
        .fill('#2563eb')

      const tableY = pdf.y
      const cellHeight = 25
      const pageWidth = pdf.page.width - 80
      const colWidths = {
        tag: pageWidth * 0.12,
        name: pageWidth * 0.2,
        type: pageWidth * 0.12,
        status: pageWidth * 0.12,
        condition: pageWidth * 0.12,
        value: pageWidth * 0.12,
        location: pageWidth * 0.2,
      }

      let xPos = 50
      pdf.text('Tag', xPos, tableY + 5, { width: colWidths.tag, align: 'left' })
      xPos += colWidths.tag
      pdf.text('Asset Name', xPos, tableY + 5, { width: colWidths.name, align: 'left' })
      xPos += colWidths.name
      pdf.text('Type', xPos, tableY + 5, { width: colWidths.type, align: 'left' })
      xPos += colWidths.type
      pdf.text('Status', xPos, tableY + 5, { width: colWidths.status, align: 'center' })
      xPos += colWidths.status
      pdf.text('Condition', xPos, tableY + 5, { width: colWidths.condition, align: 'center' })
      xPos += colWidths.condition
      pdf.text('Value', xPos, tableY + 5, { width: colWidths.value, align: 'right' })
      xPos += colWidths.value
      pdf.text('Location', xPos, tableY + 5, { width: colWidths.location, align: 'left' })

      pdf.moveDown()

      // Table Rows
      pdf.font('Helvetica').fontSize(9).fillColor('#000')
      let rowColor = false
      const maxRowsPerPage = 15

      allAssets.slice(0, maxRowsPerPage).forEach((asset, index) => {
        const yPos = pdf.y
        if (rowColor) {
          pdf.rect(40, yPos, 515, 20).fill('#f3f4f6')
          pdf.fillColor('#000')
        }

        xPos = 50
        const assetTag = (asset as any).assetTag || 'N/A'
        const assetName = (asset as any).assetName || 'N/A'
        const assetType = (asset as any).furnitureType || (asset as any).deviceType || (asset as any).vehicleType || 'N/A'
        const status = (asset as any).status || 'N/A'
        const condition = (asset as any).condition || 'N/A'
        const value = (asset as any).purchasePrice ? this.formatCurrency((asset as any).purchasePrice) : 'N/A'
        const location = (asset as any).location?.locationName || 'N/A'

        pdf.text(assetTag.substring(0, 10), xPos, yPos + 2, { width: colWidths.tag, align: 'left' })
        xPos += colWidths.tag
        pdf.text(assetName.substring(0, 15), xPos, yPos + 2, { width: colWidths.name, align: 'left' })
        xPos += colWidths.name
        pdf.text(assetType.substring(0, 10), xPos, yPos + 2, { width: colWidths.type, align: 'left' })
        xPos += colWidths.type
        pdf.text(status, xPos, yPos + 2, { width: colWidths.status, align: 'center' })
        xPos += colWidths.status
        pdf.text(condition, xPos, yPos + 2, { width: colWidths.condition, align: 'center' })
        xPos += colWidths.condition
        pdf.text(value, xPos, yPos + 2, { width: colWidths.value, align: 'right' })
        xPos += colWidths.value
        pdf.text(location.substring(0, 15), xPos, yPos + 2, { width: colWidths.location, align: 'left' })

        pdf.moveDown(1.2)
        rowColor = !rowColor
      })

      pdf.moveDown(1)

      // Footer
      this.addFooter(pdf, options.author)

      pdf.end()
      return buffer
    } catch (error) {
      console.error('Asset inventory report generation error:', error)
      throw new Error(`Failed to generate asset inventory report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate Maintenance Report PDF
   * Includes maintenance history, costs, and trends
   */
  static async generateMaintenanceReport(
    filters: ReportFilters = {},
    options: PdfGenerationOptions = { title: 'Maintenance Report' },
  ): Promise<Buffer> {
    const pdf = new PDFDocument({
      size: 'A4',
      margin: 40,
    })

    const buffer = await this.streamToBuffer(pdf)

    try {
      pdf.fontSize(24).font('Helvetica-Bold').text(options.title, { align: 'center' })
      pdf.moveDown(0.5)
      pdf.fontSize(10).font('Helvetica').fillColor('#666').text(
        `Generated on ${new Date().toLocaleString()}`,
        { align: 'center' },
      )
      pdf.moveDown(1)

      const startDate = filters.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      const endDate = filters.endDate || new Date()

      const maintenances = await prisma.maintenance.findMany({
        where: {
          maintenanceDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          user: true,
        },
        orderBy: { maintenanceDate: 'desc' },
        take: 500,
      })

      const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0)
      const completedCount = maintenances.filter(m => m.status === 'COMPLETED').length
      const scheduledCount = maintenances.filter(m => m.status === 'SCHEDULED').length

      // Summary
      pdf.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Summary', { underline: true })
      pdf.fontSize(10).font('Helvetica').moveDown(0.3)
      pdf.text(`Total Maintenance Records: ${maintenances.length}`, { indent: 10 })
      pdf.text(`Total Cost: ${this.formatCurrency(totalCost)}`, { indent: 10 })
      pdf.text(`Completed: ${completedCount} | Scheduled: ${scheduledCount}`, { indent: 10 })
      pdf.moveDown(1)

      // Table
      pdf.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
      pdf.rect(40, pdf.y, 515, 25).fill('#2563eb')

      const tableY = pdf.y
      const pageWidth = pdf.page.width - 80
      const colWidths = {
        date: pageWidth * 0.12,
        asset: pageWidth * 0.2,
        type: pageWidth * 0.15,
        status: pageWidth * 0.12,
        cost: pageWidth * 0.12,
        vendor: pageWidth * 0.2,
        remarks: pageWidth * 0.09,
      }

      let xPos = 50
      pdf.text('Date', xPos, tableY + 5, { width: colWidths.date, align: 'center' })
      xPos += colWidths.date
      pdf.text('Asset ID', xPos, tableY + 5, { width: colWidths.asset, align: 'left' })
      xPos += colWidths.asset
      pdf.text('Work Type', xPos, tableY + 5, { width: colWidths.type, align: 'left' })
      xPos += colWidths.type
      pdf.text('Status', xPos, tableY + 5, { width: colWidths.status, align: 'center' })
      xPos += colWidths.status
      pdf.text('Cost', xPos, tableY + 5, { width: colWidths.cost, align: 'right' })
      xPos += colWidths.cost
      pdf.text('Vendor', xPos, tableY + 5, { width: colWidths.vendor, align: 'left' })
      xPos += colWidths.vendor
      pdf.text('Remarks', xPos, tableY + 5, { width: colWidths.remarks, align: 'left' })

      pdf.moveDown()
      pdf.font('Helvetica').fontSize(9).fillColor('#000')

      let rowColor = false
      maintenances.slice(0, 20).forEach((m) => {
        const yPos = pdf.y
        if (rowColor) {
          pdf.rect(40, yPos, 515, 20).fill('#f3f4f6')
          pdf.fillColor('#000')
        }

        xPos = 50
        const date = new Date(m.maintenanceDate).toLocaleDateString()
        const assetId = m.assetId.substring(0, 8)
        const workType = m.workType || 'N/A'
        const status = m.status || 'N/A'
        const cost = m.cost ? this.formatCurrency(m.cost) : 'N/A'
        const vendor = m.vendorName || 'N/A'
        const remarks = m.remarks?.substring(0, 10) || 'N/A'

        pdf.text(date, xPos, yPos + 2, { width: colWidths.date, align: 'center' })
        xPos += colWidths.date
        pdf.text(assetId, xPos, yPos + 2, { width: colWidths.asset, align: 'left' })
        xPos += colWidths.asset
        pdf.text(workType, xPos, yPos + 2, { width: colWidths.type, align: 'left' })
        xPos += colWidths.type
        pdf.text(status, xPos, yPos + 2, { width: colWidths.status, align: 'center' })
        xPos += colWidths.status
        pdf.text(cost, xPos, yPos + 2, { width: colWidths.cost, align: 'right' })
        xPos += colWidths.cost
        pdf.text(vendor, xPos, yPos + 2, { width: colWidths.vendor, align: 'left' })
        xPos += colWidths.vendor
        pdf.text(remarks, xPos, yPos + 2, { width: colWidths.remarks, align: 'left' })

        pdf.moveDown(1.2)
        rowColor = !rowColor
      })

      pdf.moveDown(1)
      this.addFooter(pdf, options.author)

      pdf.end()
      return buffer
    } catch (error) {
      console.error('Maintenance report generation error:', error)
      throw new Error(`Failed to generate maintenance report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate Financial Report PDF
   * Includes asset values, depreciation calculations, and financial summary
   */
  static async generateFinancialReport(
    filters: ReportFilters = {},
    options: PdfGenerationOptions = { title: 'Financial Report' },
  ): Promise<Buffer> {
    const pdf = new PDFDocument({
      size: 'A4',
      margin: 40,
    })

    const buffer = await this.streamToBuffer(pdf)

    try {
      pdf.fontSize(24).font('Helvetica-Bold').text(options.title, { align: 'center' })
      pdf.moveDown(0.5)
      pdf.fontSize(10).font('Helvetica').fillColor('#666').text(
        `Generated on ${new Date().toLocaleString()}`,
        { align: 'center' },
      )
      pdf.moveDown(1)

      // Fetch assets
      const allAssets = await Promise.all([
        prisma.furnitureAsset.findMany({ take: 1000 }),
        prisma.electronicAsset.findMany({ take: 1000 }),
        prisma.vehicleAsset.findMany({ take: 1000 }),
      ])

      const assets = [...allAssets[0], ...allAssets[1], ...allAssets[2]]

      const totalPurchaseValue = assets.reduce((sum, a) => {
        const price = (a as any).purchasePrice || 0
        return sum + (typeof price === 'number' ? price : 0)
      }, 0)

      const totalDepreciation = assets.reduce((sum, a) => {
        const price = (a as any).purchasePrice || 0
        const usefulLife = (a as any).usefulLifeYears || 5
        const yearsUsed = (new Date().getFullYear() - new ((a as any).purchaseDate || new Date()).getFullYear())
        const annualDepreciation = (typeof price === 'number' ? price : 0) / usefulLife
        return sum + annualDepreciation * Math.max(0, yearsUsed)
      }, 0)

      const netValue = totalPurchaseValue - totalDepreciation

      // Financial Summary
      pdf.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Financial Summary', { underline: true })
      pdf.fontSize(10).font('Helvetica').moveDown(0.3)

      const financialData = [
        ['Total Assets:', `${assets.length}`],
        ['Gross Value:', this.formatCurrency(totalPurchaseValue)],
        ['Total Depreciation:', this.formatCurrency(totalDepreciation)],
        ['Net Book Value:', this.formatCurrency(Math.max(0, netValue))],
        ['Depreciation Rate:', `${((totalDepreciation / totalPurchaseValue) * 100).toFixed(2)}%`],
      ]

      financialData.forEach(([label, value]) => {
        pdf.text(`${label} ${value}`, { indent: 10 })
      })

      pdf.moveDown(1)

      // Assets Table
      pdf.fontSize(12).font('Helvetica-Bold').text('Assets by Category', { underline: true })
      pdf.moveDown(0.5)

      const categories = [
        { name: 'Furniture', count: allAssets[0].length, value: allAssets[0].reduce((s, a) => s + ((a as any).purchasePrice || 0), 0) },
        { name: 'Electronics', count: allAssets[1].length, value: allAssets[1].reduce((s, a) => s + ((a as any).purchasePrice || 0), 0) },
        { name: 'Vehicles', count: allAssets[2].length, value: allAssets[2].reduce((s, a) => s + ((a as any).purchasePrice || 0), 0) },
      ]

      pdf.fontSize(9).font('Helvetica')
      categories.forEach(cat => {
        pdf.text(`${cat.name}: ${cat.count} assets | Value: ${this.formatCurrency(cat.value)}`, { indent: 10 })
      })

      pdf.moveDown(2)
      this.addFooter(pdf, options.author)

      pdf.end()
      return buffer
    } catch (error) {
      console.error('Financial report generation error:', error)
      throw new Error(`Failed to generate financial report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate Checkout Report PDF
   * Includes checkout analytics, overdue items, and return tracking
   */
  static async generateCheckoutReport(
    filters: ReportFilters = {},
    options: PdfGenerationOptions = { title: 'Checkout Report' },
  ): Promise<Buffer> {
    const pdf = new PDFDocument({
      size: 'A4',
      margin: 40,
    })

    const buffer = await this.streamToBuffer(pdf)

    try {
      pdf.fontSize(24).font('Helvetica-Bold').text(options.title, { align: 'center' })
      pdf.moveDown(0.5)
      pdf.fontSize(10).font('Helvetica').fillColor('#666').text(
        `Generated on ${new Date().toLocaleString()}`,
        { align: 'center' },
      )
      pdf.moveDown(1)

      const checkouts = await prisma.assetCheckout.findMany({
        include: { user: true },
        orderBy: { checkedOutAt: 'desc' },
        take: 500,
      })

      const activeCheckouts = checkouts.filter(c => !c.checkInDate)
      const overdueCheckouts = activeCheckouts.filter(
        c => c.expectedReturnDate && new Date(c.expectedReturnDate) < new Date(),
      )

      // Summary
      pdf.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Checkout Summary', { underline: true })
      pdf.fontSize(10).font('Helvetica').moveDown(0.3)
      pdf.text(`Total Checkouts: ${checkouts.length}`, { indent: 10 })
      pdf.text(`Active Checkouts: ${activeCheckouts.length}`, { indent: 10 })
      pdf.text(`Overdued Items: ${overdueCheckouts.length}`, { indent: 10 })
      pdf.text(`Returned Items: ${checkouts.length - activeCheckouts.length}`, { indent: 10 })
      pdf.moveDown(1)

      if (overdueCheckouts.length > 0) {
        pdf.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('OVERDUE ITEMS - ACTION REQUIRED', { underline: true })
        pdf.fontSize(9).font('Helvetica').fillColor('#000').moveDown(0.3)

        overdueCheckouts.slice(0, 10).forEach(c => {
          const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(c.expectedReturnDate || new Date()).getTime()) / (1000 * 60 * 60 * 24),
          )
          pdf.text(`Asset ${c.assetId} checked out to ${c.user?.fullName} - ${daysOverdue} days overdue`, { indent: 10 })
        })
        pdf.moveDown(1)
      }

      // Active Checkouts Table
      pdf.fontSize(12).font('Helvetica-Bold').text('Active Checkouts', { underline: true })
      pdf.moveDown(0.5)

      pdf.fontSize(11).font('Helvetica-Bold').fillColor('#fff')
      pdf.rect(40, pdf.y, 515, 25).fill('#2563eb')

      const tableY = pdf.y
      const pageWidth = pdf.page.width - 80
      const colWidths = {
        asset: pageWidth * 0.2,
        user: pageWidth * 0.2,
        checkoutDate: pageWidth * 0.15,
        expectedReturn: pageWidth * 0.15,
        status: pageWidth * 0.3,
      }

      let xPos = 50
      pdf.text('Asset ID', xPos, tableY + 5, { width: colWidths.asset, align: 'left' })
      xPos += colWidths.asset
      pdf.text('User', xPos, tableY + 5, { width: colWidths.user, align: 'left' })
      xPos += colWidths.user
      pdf.text('Checkout Date', xPos, tableY + 5, { width: colWidths.checkoutDate, align: 'center' })
      xPos += colWidths.checkoutDate
      pdf.text('Expected Return', xPos, tableY + 5, { width: colWidths.expectedReturn, align: 'center' })
      xPos += colWidths.expectedReturn
      pdf.text('Status', xPos, tableY + 5, { width: colWidths.status, align: 'center' })

      pdf.moveDown()
      pdf.font('Helvetica').fontSize(9).fillColor('#000')

      let rowColor = false
      activeCheckouts.slice(0, 15).forEach((c) => {
        const yPos = pdf.y
        if (rowColor) {
          pdf.rect(40, yPos, 515, 20).fill('#f3f4f6')
          pdf.fillColor('#000')
        }

        xPos = 50
        const assetId = c.assetId.substring(0, 12)
        const userName = c.user?.fullName?.substring(0, 15) || 'N/A'
        const checkoutDate = new Date(c.checkedOutAt).toLocaleDateString()
        const expectedReturn = c.expectedReturnDate ? new Date(c.expectedReturnDate).toLocaleDateString() : 'TBD'
        const isOverdue = c.expectedReturnDate && new Date(c.expectedReturnDate) < new Date()
        const status = isOverdue ? 'OVERDUE' : 'Active'

        pdf.text(assetId, xPos, yPos + 2, { width: colWidths.asset, align: 'left' })
        xPos += colWidths.asset
        pdf.text(userName, xPos, yPos + 2, { width: colWidths.user, align: 'left' })
        xPos += colWidths.user
        pdf.text(checkoutDate, xPos, yPos + 2, { width: colWidths.checkoutDate, align: 'center' })
        xPos += colWidths.checkoutDate
        pdf.text(expectedReturn, xPos, yPos + 2, { width: colWidths.expectedReturn, align: 'center' })
        xPos += colWidths.expectedReturn
        pdf.fillColor(isOverdue ? '#dc2626' : '#059669')
        pdf.text(status, xPos, yPos + 2, { width: colWidths.status, align: 'center' })
        pdf.fillColor('#000')

        pdf.moveDown(1.2)
        rowColor = !rowColor
      })

      pdf.moveDown(1)
      this.addFooter(pdf, options.author)

      pdf.end()
      return buffer
    } catch (error) {
      console.error('Checkout report generation error:', error)
      throw new Error(`Failed to generate checkout report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Helper: Convert Buffer to stream
   */
  private static streamToBuffer(stream: PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.on('data', chunk => chunks.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', reject)
    })
  }

  /**
   * Helper: Format currency
   */
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  /**
   * Helper: Add footer to PDF
   */
  private static addFooter(pdf: PDFDocument, author?: string): void {
    const pageCount = (pdf as any).bufferedPageRange().count
    for (let i = 0; i < pageCount; i++) {
      pdf.switchToPage(i)
      pdf.fontSize(8).fillColor('#999')
      pdf.text(
        `${author || 'Asset Management System'} | Page ${i + 1} of ${pageCount}`,
        40,
        pdf.page.height - 30,
        { align: 'center' },
      )
    }
  }
}
