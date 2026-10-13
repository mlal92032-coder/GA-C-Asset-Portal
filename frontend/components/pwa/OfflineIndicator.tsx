'use client'

import { useOfflineMode } from '@/hooks/usePWA'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export const OfflineIndicator = () => {
  const { isOffline, isSyncing, pendingActions, syncData } = useOfflineMode()

  if (!isOffline) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <WifiOff size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            </motion.div>

            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Offline Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You're currently offline. {pendingActions > 0 ? `${pendingActions} pending actions.` : 'Changes will sync when online.'}
              </p>

              {pendingActions > 0 && (
                <button
                  onClick={syncData}
                  disabled={isSyncing}
                  className="mt-2 flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded font-medium hover:bg-yellow-700 disabled:opacity-50 transition"
                >
                  {isSyncing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <RefreshCw size={16} />
                      </motion.div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Sync Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
