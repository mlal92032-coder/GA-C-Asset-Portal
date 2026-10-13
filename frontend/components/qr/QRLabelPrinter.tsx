'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Printer, Download, Copy, Plus, Trash2 } from 'lucide-react'
import { QRService } from '@/services/qr.service'

interface Asset {
  id: string
  tag: string
  name: string
}

export const QRLabelPrinter = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [qrCodes, setQRCodes] = useState<Map<string, string>>(new Map())
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCode = async (asset: Asset) => {
    setIsGenerating(true)
    try {
      const qr = await QRService.generateQRCode(asset.id, asset.tag)
      setQRCodes(prev => new Map(prev).set(asset.id, qr))
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateAllQRCodes = async () => {
    setIsGenerating(true)
    try {
      const codes = await QRService.generateBulkQRCodes(
        assets.map(a => ({ id: a.id, tag: a.tag })),
      )
      setQRCodes(codes)
    } catch (error) {
      console.error('Failed to generate QR codes:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = (assetId: string) => {
    const qr = qrCodes.get(assetId)
    if (!qr) return

    const link = document.createElement('a')
    link.href = qr
    link.download = `qr-${assetId}.png`
    link.click()
  }

  const printQRCode = (assetId: string) => {
    const qr = qrCodes.get(assetId)
    if (!qr) return

    const printWindow = window.open('', '', 'height=400,width=400')
    if (printWindow) {
      printWindow.document.write(`<img src="${qr}" style="width:100%;">`)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const printAllLabels = () => {
    const printWindow = window.open('', '', 'height=800,width=800')
    if (!printWindow) return

    let html = '<html><body style="padding: 20px;">'

    assets.forEach(asset => {
      const qr = qrCodes.get(asset.id)
      if (qr) {
        html += `
          <div style="page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #ddd; padding: 10px;">
            <div style="text-align: center;">
              <img src="${qr}" style="width: 150px; height: 150px;">
            </div>
            <div style="text-align: center; margin-top: 10px;">
              <strong>${asset.tag}</strong>
              <p style="font-size: 12px; margin: 5px 0;">${asset.name}</p>
            </div>
          </div>
        `
      }
    })

    html += '</body></html>'

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Printer size={28} className="text-blue-500" />
          QR Code Label Printer
        </h2>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={generateAllQRCodes}
            disabled={isGenerating || assets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition font-medium"
          >
            {isGenerating ? '⏳ Generating...' : '✨ Generate All'}
          </button>

          <button
            onClick={printAllLabels}
            disabled={qrCodes.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
          >
            <Printer size={18} />
            Print All
          </button>

          <button
            onClick={() => {
              setAssets([])
              setQRCodes(new Map())
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            <Trash2 size={18} />
            Clear
          </button>
        </div>

        {/* Assets Grid */}
        {assets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset, idx) => {
              const qr = qrCodes.get(asset.id)
              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  {qr ? (
                    <>
                      <img src={qr} alt={asset.tag} className="w-full mb-3" />
                      <div className="text-center mb-3">
                        <p className="font-semibold text-gray-900">{asset.tag}</p>
                        <p className="text-xs text-gray-600">{asset.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadQRCode(asset.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                        >
                          <Download size={14} />
                          Download
                        </button>
                        <button
                          onClick={() => printQRCode(asset.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                        >
                          <Printer size={14} />
                          Print
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => generateQRCode(asset)}
                      className="w-full h-32 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border-2 border-dashed border-gray-300 transition"
                    >
                      Generate
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {assets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Printer size={48} className="mx-auto mb-4 opacity-50" />
            <p>No assets selected</p>
            <p className="text-sm mt-2">Select assets to generate QR labels</p>
          </div>
        )}
      </div>
    </div>
  )
}
