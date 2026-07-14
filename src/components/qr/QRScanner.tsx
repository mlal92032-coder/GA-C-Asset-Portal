'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Zap } from 'lucide-react'
import { QRService } from '@/services/qr.service'

interface Props {
  onScan: (data: { assetId: string; assetTag: string }) => void
  onClose: () => void
}

export const QRScanner = ({ onScan, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string>('')
  const [scanCount, setScanCount] = useState(0)

  useEffect(() => {
    if (!videoRef.current || !isScanning) return

    let stream: MediaStream | null = null
    let animationFrameId: number

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          scanQRFrame()
        }
      } catch (err) {
        setError('Camera access denied. Please enable camera permissions.')
      }
    }

    const scanQRFrame = () => {
      if (!canvasRef.current || !videoRef.current) {
        animationFrameId = requestAnimationFrame(scanQRFrame)
        return
      }

      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        animationFrameId = requestAnimationFrame(scanQRFrame)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Try to decode QR code
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = decodeQRCode(imageData)

        if (code && code !== lastScanned) {
          const parsed = QRService.parseQRData(code)
          if (parsed && QRService.isValidQRData(parsed)) {
            setLastScanned(code)
            setScanCount(prev => prev + 1)
            onScan(parsed)

            // Visual feedback
            ctx.strokeStyle = '#00ff00'
            ctx.lineWidth = 3
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
          }
        }
      } catch (err) {
        // Continue scanning
      }

      animationFrameId = requestAnimationFrame(scanQRFrame)
    }

    startCamera()

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isScanning, lastScanned, onScan])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="bg-black/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Camera size={24} />
            <h2 className="text-xl font-semibold">Scan QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Camera Feed */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning Overlay */}
          <motion.div
            animate={{ scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 border-4 border-green-500 m-8 rounded-lg"
          />

          {/* Center Reticle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, linear: true }}
              className="w-12 h-12 border-2 border-green-500 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={24} className="text-green-500" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-20 left-4 right-4 bg-red-500/90 text-white p-4 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-black/50 p-4 text-white text-center">
          <p className="text-sm">Scans detected: {scanCount}</p>
          <p className="text-xs text-gray-400 mt-1">Point camera at QR code</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Simple QR decoder (simplified - in production use a library)
function decodeQRCode(imageData: ImageData): string | null {
  // This is a placeholder - in production use jsQR or similar library
  try {
    // Analyze image data for QR patterns
    // Return decoded string or null
    return null
  } catch {
    return null
  }
}
