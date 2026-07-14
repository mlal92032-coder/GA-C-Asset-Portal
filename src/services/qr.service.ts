import QRCode from 'qrcode'

export class QRService {
  // Generate QR code for asset
  static async generateQRCode(
    assetId: string,
    assetTag: string,
    options?: {
      width?: number
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
      type?: 'image/png' | 'image/jpeg' | 'image/webp'
    },
  ): Promise<string> {
    try {
      const data = {
        assetId,
        assetTag,
        timestamp: new Date().toISOString(),
      }

      const qrString = JSON.stringify(data)

      const qrCode = await QRCode.toDataURL(qrString, {
        width: options?.width || 300,
        errorCorrectionLevel: options?.errorCorrectionLevel || 'H',
        type: options?.type || 'image/png',
        quality: 0.95,
        margin: 1,
      })

      return qrCode
    } catch (error) {
      console.error('QR code generation error:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  // Generate bulk QR codes for multiple assets
  static async generateBulkQRCodes(
    assets: Array<{ id: string; tag: string }>,
  ): Promise<Map<string, string>> {
    const qrCodes = new Map<string, string>()

    for (const asset of assets) {
      try {
        const qr = await this.generateQRCode(asset.id, asset.tag)
        qrCodes.set(asset.id, qr)
      } catch (error) {
        console.error(`Failed to generate QR for asset ${asset.id}:`, error)
      }
    }

    return qrCodes
  }

  // Generate SVG QR code for printing
  static async generateSVGQRCode(
    assetId: string,
    assetTag: string,
  ): Promise<string> {
    try {
      const data = {
        assetId,
        assetTag,
        timestamp: new Date().toISOString(),
      }

      const qrString = JSON.stringify(data)

      const svgString = await QRCode.toString(qrString, {
        errorCorrectionLevel: 'H',
        type: 'svg',
        width: 10,
      })

      return svgString
    } catch (error) {
      console.error('SVG QR code generation error:', error)
      throw new Error('Failed to generate SVG QR code')
    }
  }

  // Parse QR code data
  static parseQRData(data: string): {
    assetId: string
    assetTag: string
    timestamp?: string
  } | null {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to parse QR data:', error)
      return null
    }
  }

  // Generate barcode number from asset ID
  static generateBarcodeNumber(assetId: string): string {
    // Convert asset ID to numeric barcode
    let num = 0
    for (let i = 0; i < assetId.length; i++) {
      num += assetId.charCodeAt(i)
    }
    return num.toString().padStart(12, '0')
  }

  // Validate QR code format
  static isValidQRData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.assetId === 'string' &&
      typeof data.assetTag === 'string'
    )
  }
}
