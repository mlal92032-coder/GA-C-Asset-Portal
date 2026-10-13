// Reporting Service for PDF/Excel Export

interface ReportOptions {
  title: string
  filename: string
  timestamp?: boolean
  includeFooter?: boolean
}

export class ReportingService {
  // Export table data to CSV
  static exportToCSV(
    data: any[],
    columns: Array<{ key: string; label: string }>,
    filename: string,
  ): void {
    // Create CSV header
    const header = columns.map(col => col.label).join(',')

    // Create CSV rows
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key]
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      }).join(','),
    )

    // Combine header and rows
    const csv = [header, ...rows].join('\n')

    // Download
    this.downloadFile(csv, `${filename}.csv`, 'text/csv')
  }

  // Export to PDF
  static async exportToPDF(
    htmlContent: string,
    options: ReportOptions = { title: 'Report', filename: 'report' },
  ): Promise<void> {
    try {
      // Dynamic import jsPDF
      const { jsPDF } = await import('jspdf')
      const { html2canvas } = await import('html2canvas')

      // Create temporary container
      const container = document.createElement('div')
      container.innerHTML = htmlContent
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      document.body.appendChild(container)

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        logging: false,
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)

      // Add metadata
      if (options.timestamp) {
        pdf.setFontSize(8)
        pdf.text(
          `Generated on ${new Date().toLocaleString()}`,
          10,
          pageHeight - 10,
        )
      }

      // Download
      pdf.save(`${options.filename}.pdf`)

      // Cleanup
      document.body.removeChild(container)
    } catch (error) {
      console.error('PDF export error:', error)
      throw new Error('Failed to export PDF')
    }
  }

  // Generate asset report
  static generateAssetReport(assets: any[]): string {
    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Asset Inventory Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Asset Tag</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Name</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Condition</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Value</th>
            </tr>
          </thead>
          <tbody>
            ${assets
              .map(
                asset => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${asset.assetTag}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${asset.name}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${asset.status}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${asset.condition}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${asset.purchasePrice?.toLocaleString() || 'N/A'}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p><strong>Total Assets:</strong> ${assets.length}</p>
          <p><strong>Total Value:</strong> $${assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0).toLocaleString()}</p>
        </div>
      </div>
    `
    return html
  }

  // Generate checkout report
  static generateCheckoutReport(checkouts: any[]): string {
    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Checkout Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Asset</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">User</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Checkout Date</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Return Date</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${checkouts
              .map(
                c => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${c.assetName || c.assetId}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${c.userName || c.userId}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${new Date(c.checkoutDate).toLocaleDateString()}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${c.returnDate ? new Date(c.returnDate).toLocaleDateString() : 'Not returned'}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${c.status}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
    return html
  }

  // Generate maintenance report
  static generateMaintenanceReport(maintenances: any[]): string {
    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Maintenance Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Asset</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Type</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Date</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Cost</th>
            </tr>
          </thead>
          <tbody>
            ${maintenances
              .map(
                m => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${m.assetName || m.assetId}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${m.maintenanceType}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${new Date(m.maintenanceDate).toLocaleDateString()}</td>
                <td style="border: 1px solid #ddd; padding: 10px;">${m.status}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${m.actualCost?.toLocaleString() || m.estimatedCost?.toLocaleString() || 'N/A'}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
    return html
  }

  // Generate analytics report
  static generateAnalyticsReport(analytics: any): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Analytics Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>

        <div style="margin-top: 20px;">
          <h2>Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f3f4f6;">
              <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">Total Assets</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${analytics.totalAssets}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">Assets in Use</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${analytics.inUse}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">Total Value</td>
              <td style="border: 1px solid #ddd; padding: 10px;">$${analytics.totalValue?.toLocaleString() || 'N/A'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">Active Checkouts</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${analytics.activeCheckouts}</td>
            </tr>
          </table>
        </div>
      </div>
    `
  }

  // Download file helper
  private static downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Schedule report for later
  static scheduleReport(
    reportType: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    email?: string,
  ): Promise<void> {
    // Would integrate with backend job scheduling
    return Promise.resolve()
  }

  // Email report
  static async emailReport(reportContent: string, recipients: string[]): Promise<void> {
    try {
      const response = await fetch('/api/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          content: reportContent,
          timestamp: new Date(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to email report')
      }
    } catch (error) {
      console.error('Email report error:', error)
      throw error
    }
  }
}
