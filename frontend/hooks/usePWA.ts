import { useEffect, useState, useCallback } from 'react'
import {
  initOfflineStorage,
  getStorageUsage,
  clearOfflineStorage,
  savePendingSync,
} from '@/lib/offline-storage'
import { SyncManager, initializeSyncManager } from '@/lib/sync-manager'

interface PWAState {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  isSyncing: boolean
  storageUsage: {
    assets: number
    checkouts: number
    notifications: number
    pending: number
  }
  storageQuota: {
    usage: number
    quota: number
    percentage: number
  } | null
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstalled: false,
    canInstall: false,
    isSyncing: false,
    storageUsage: { assets: 0, checkouts: 0, notifications: 0, pending: 0 },
    storageQuota: null,
  })

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  // Initialize PWA features
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialize offline storage
    initOfflineStorage()
    initializeSyncManager()

    // Check if app is installed
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setState(prev => ({ ...prev, isInstalled: isInstalled }))

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState(prev => ({ ...prev, canInstall: true }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Update storage info
    updateStorageInfo()
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateStorageInfo = useCallback(async () => {
    const usage = await getStorageUsage()
    const quota = await SyncManager.getStorageQuota()

    setState(prev => ({
      ...prev,
      storageUsage: usage,
      storageQuota: quota,
    }))
  }, [])

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setState(prev => ({
          ...prev,
          isInstalled: true,
          canInstall: false,
        }))
        console.log('✓ App installed')
      }
    } catch (error) {
      console.error('Installation error:', error)
    }
  }, [deferredPrompt])

  const syncData = useCallback(async () => {
    setState(prev => ({ ...prev, isSyncing: true }))
    try {
      await SyncManager.startSync()
      await updateStorageInfo()
    } finally {
      setState(prev => ({ ...prev, isSyncing: false }))
    }
  }, [updateStorageInfo])

  const clearCache = useCallback(async () => {
    try {
      await clearOfflineStorage()
      await updateStorageInfo()
      console.log('✓ Cache cleared')
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }, [updateStorageInfo])

  const addPendingAction = useCallback(
    async (type: 'checkout' | 'checkin' | 'create' | 'update', data: any) => {
      try {
        await savePendingSync({ type, data })
        await updateStorageInfo()
      } catch (error) {
        console.error('Failed to save pending action:', error)
      }
    },
    [updateStorageInfo],
  )

  const requestPersistentStorage = useCallback(async () => {
    try {
      const granted = await SyncManager.requestPersistentStorage()
      return granted
    } catch (error) {
      console.error('Failed to request persistent storage:', error)
      return false
    }
  }, [])

  return {
    // State
    isOnline: state.isOnline,
    isInstalled: state.isInstalled,
    canInstall: state.canInstall,
    isSyncing: state.isSyncing,
    storageUsage: state.storageUsage,
    storageQuota: state.storageQuota,

    // Actions
    installApp,
    syncData,
    clearCache,
    addPendingAction,
    requestPersistentStorage,
    updateStorageInfo,
  }
}

// Hook for install prompt
export const useInstallPrompt = () => {
  const { canInstall, installApp, isInstalled } = usePWA()

  return {
    canInstall: canInstall && !isInstalled,
    installApp,
    isInstalled,
  }
}

// Hook for offline detection
export const useOfflineMode = () => {
  const { isOnline, isSyncing, storageUsage, syncData } = usePWA()

  return {
    isOffline: !isOnline,
    isOnline,
    isSyncing,
    pendingActions: storageUsage.pending,
    syncData,
  }
}
