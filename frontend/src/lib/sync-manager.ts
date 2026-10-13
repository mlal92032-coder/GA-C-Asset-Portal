import {
  getPendingSyncActions,
  removePendingSync,
  savePendingSync,
  getPendingCheckouts,
} from './offline-storage'

interface SyncResult {
  success: boolean
  error?: string
  itemsSync: number
}

export class SyncManager {
  private static isSyncing = false
  private static syncInterval: NodeJS.Timeout | null = null

  static async startSync(): Promise<void> {
    if (this.isSyncing) return

    this.isSyncing = true
    console.log('🔄 Starting data sync...')

    try {
      const result = await this.performSync()
      console.log(`✓ Sync completed: ${result.itemsSync} items synced`)
    } catch (error) {
      console.error('❌ Sync error:', error)
    } finally {
      this.isSyncing = false
    }
  }

  private static async performSync(): Promise<SyncResult> {
    const pendingActions = await getPendingSyncActions()
    let synced = 0

    for (const action of pendingActions) {
      try {
        const success = await this.syncAction(action)
        if (success) {
          await removePendingSync(action.id)
          synced++
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error)
      }
    }

    // Sync pending checkouts
    const pendingCheckouts = await getPendingCheckouts()
    for (const checkout of pendingCheckouts) {
      try {
        const success = await this.syncCheckout(checkout)
        if (success) {
          synced++
        }
      } catch (error) {
        console.error('Failed to sync checkout:', checkout, error)
      }
    }

    return { success: true, itemsSync: synced }
  }

  private static async syncAction(action: {
    type: string
    data: any
    id?: number
  }): Promise<boolean> {
    const { type, data } = action

    try {
      let endpoint = ''
      let method = 'POST'

      switch (type) {
        case 'checkout':
          endpoint = '/api/assets/v2/checkout'
          break
        case 'checkin':
          endpoint = '/api/assets/v2/checkout'
          method = 'PUT'
          break
        case 'create':
          endpoint = '/api/assets/v2'
          break
        case 'update':
          endpoint = `/api/assets/v2/${data.id}`
          method = 'PUT'
          break
        default:
          return false
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error('Sync action failed:', error)
      return false
    }
  }

  private static async syncCheckout(checkout: any): Promise<boolean> {
    try {
      const response = await fetch('/api/assets/v2/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkout),
      })

      return response.ok
    } catch (error) {
      console.error('Sync checkout failed:', error)
      return false
    }
  }

  static startPeriodicSync(intervalMs = 30000): void {
    if (this.syncInterval) return

    console.log(`📍 Starting periodic sync every ${intervalMs}ms`)
    this.syncInterval = setInterval(() => {
      this.startSync()
    }, intervalMs)
  }

  static stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  static setupOnlineDetection(): void {
    // Sync when connection is restored
    window.addEventListener('online', () => {
      console.log('📡 Connection restored')
      this.startSync()
    })

    window.addEventListener('offline', () => {
      console.log('🔌 Connection lost - switching to offline mode')
    })
  }

  // Register for background sync
  static async registerBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register(tag)
        console.log(`✓ Background sync registered: ${tag}`)
      } catch (error) {
        console.error('Failed to register background sync:', error)
      }
    }
  }

  // Request persistent storage
  static async requestPersistentStorage(): Promise<boolean> {
    if (!navigator.storage || !navigator.storage.persist) {
      return false
    }

    try {
      const isPersistent = await navigator.storage.persist()
      console.log(`Storage persistence: ${isPersistent ? 'granted' : 'denied'}`)
      return isPersistent
    } catch (error) {
      console.error('Failed to request persistent storage:', error)
      return false
    }
  }

  // Get storage quota
  static async getStorageQuota(): Promise<{
    usage: number
    quota: number
    percentage: number
  } | null> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.usage && estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0,
      }
    } catch (error) {
      console.error('Failed to get storage quota:', error)
      return null
    }
  }
}

// Auto-setup on initialization
export function initializeSyncManager(): void {
  SyncManager.setupOnlineDetection()
  SyncManager.startPeriodicSync()
  SyncManager.requestPersistentStorage()
  console.log('✓ Sync manager initialized')
}
