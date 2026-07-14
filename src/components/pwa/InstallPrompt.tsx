'use client'

import { useInstallPrompt } from '@/hooks/usePWA'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { useState } from 'react'

export const InstallPrompt = () => {
  const { canInstall, installApp } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 z-50 max-w-sm"
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Download size={20} className="flex-shrink-0 mt-0.5" />
            </motion.div>

            <div className="flex-1">
              <h3 className="font-semibold">Install App</h3>
              <p className="text-sm text-blue-100 mt-1">
                Install Asset Manager for quick access and offline support.
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    installApp()
                    setDismissed(true)
                  }}
                  className="px-4 py-2 bg-white text-blue-600 font-medium text-sm rounded hover:bg-blue-50 transition"
                >
                  Install
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="px-4 py-2 text-blue-100 hover:text-white text-sm font-medium transition"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="text-blue-200 hover:text-white transition flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
