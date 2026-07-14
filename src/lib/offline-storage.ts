// Offline Storage Manager for PWA
interface StoredAsset {
  id: string
  name: string
  status: string
  condition: string
  timestamp: number
}

interface StoredCheckout {
  id: string
  assetId: string
  userId: string
  checkoutDate: string
  expectedReturnDate?: string
  timestamp: number
}

const DB_NAME = 'AssetManagementDB'
const STORE_ASSETS = 'assets'
const STORE_CHECKOUTS = 'checkouts'
const STORE_NOTIFICATIONS = 'notifications'
const STORE_PENDING_SYNC = 'pendingSync'

let db: IDBDatabase | null = null

// Initialize IndexedDB
export async function initOfflineStorage(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onerror = () => {
      console.error('Failed to open IndexedDB')
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      console.log('✓ IndexedDB initialized')
      resolve()
    }

    request.onupgradeneeded = event => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create object stores
      if (!database.objectStoreNames.contains(STORE_ASSETS)) {
        database.createObjectStore(STORE_ASSETS, { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(STORE_CHECKOUTS)) {
        database.createObjectStore(STORE_CHECKOUTS, { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(STORE_NOTIFICATIONS)) {
        database.createObjectStore(STORE_NOTIFICATIONS, { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(STORE_PENDING_SYNC)) {
        database.createObjectStore(STORE_PENDING_SYNC, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

// Save asset offline
export async function saveAssetOffline(asset: StoredAsset): Promise<void> {
  if (!db) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_ASSETS, 'readwrite')
    const store = transaction.objectStore(STORE_ASSETS)
    const request = store.put({ ...asset, timestamp: Date.now() })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get all offline assets
export async function getOfflineAssets(): Promise<StoredAsset[]> {
  if (!db) return []

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_ASSETS, 'readonly')
    const store = transaction.objectStore(STORE_ASSETS)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Get single offline asset
export async function getOfflineAsset(id: string): Promise<StoredAsset | null> {
  if (!db) return null

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_ASSETS, 'readonly')
    const store = transaction.objectStore(STORE_ASSETS)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

// Save checkout offline
export async function saveCheckoutOffline(checkout: StoredCheckout): Promise<void> {
  if (!db) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_CHECKOUTS, 'readwrite')
    const store = transaction.objectStore(STORE_CHECKOUTS)
    const request = store.put({ ...checkout, timestamp: Date.now() })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get pending checkouts
export async function getPendingCheckouts(): Promise<StoredCheckout[]> {
  if (!db) return []

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_CHECKOUTS, 'readonly')
    const store = transaction.objectStore(STORE_CHECKOUTS)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Save pending sync action
export async function savePendingSync(action: {
  type: 'checkout' | 'checkin' | 'create' | 'update'
  data: any
  timestamp?: number
}): Promise<void> {
  if (!db) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_PENDING_SYNC, 'readwrite')
    const store = transaction.objectStore(STORE_PENDING_SYNC)
    const request = store.add({
      ...action,
      timestamp: action.timestamp || Date.now(),
    })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get pending sync actions
export async function getPendingSyncActions(): Promise<any[]> {
  if (!db) return []

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_PENDING_SYNC, 'readonly')
    const store = transaction.objectStore(STORE_PENDING_SYNC)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Remove pending sync action after successful sync
export async function removePendingSync(id: number): Promise<void> {
  if (!db) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_PENDING_SYNC, 'readwrite')
    const store = transaction.objectStore(STORE_PENDING_SYNC)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Save notification offline
export async function saveNotificationOffline(notification: any): Promise<void> {
  if (!db) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NOTIFICATIONS, 'readwrite')
    const store = transaction.objectStore(STORE_NOTIFICATIONS)
    const request = store.put({ ...notification, timestamp: Date.now() })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get offline notifications
export async function getOfflineNotifications(): Promise<any[]> {
  if (!db) return []

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NOTIFICATIONS, 'readonly')
    const store = transaction.objectStore(STORE_NOTIFICATIONS)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Clear all offline data
export async function clearOfflineStorage(): Promise<void> {
  if (!db) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(
      [STORE_ASSETS, STORE_CHECKOUTS, STORE_NOTIFICATIONS, STORE_PENDING_SYNC],
      'readwrite',
    )

    let completed = 0
    const stores = [STORE_ASSETS, STORE_CHECKOUTS, STORE_NOTIFICATIONS, STORE_PENDING_SYNC]

    stores.forEach(storeName => {
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        completed++
        if (completed === stores.length) {
          resolve()
        }
      }
    })
  })
}

// Get storage usage
export async function getStorageUsage(): Promise<{
  assets: number
  checkouts: number
  notifications: number
  pending: number
}> {
  if (!db) return { assets: 0, checkouts: 0, notifications: 0, pending: 0 }

  const [assets, checkouts, notifications, pending] = await Promise.all([
    new Promise<number>((resolve, reject) => {
      const transaction = db!.transaction(STORE_ASSETS, 'readonly')
      const store = transaction.objectStore(STORE_ASSETS)
      const request = store.count()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    }),
    new Promise<number>((resolve, reject) => {
      const transaction = db!.transaction(STORE_CHECKOUTS, 'readonly')
      const store = transaction.objectStore(STORE_CHECKOUTS)
      const request = store.count()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    }),
    new Promise<number>((resolve, reject) => {
      const transaction = db!.transaction(STORE_NOTIFICATIONS, 'readonly')
      const store = transaction.objectStore(STORE_NOTIFICATIONS)
      const request = store.count()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    }),
    new Promise<number>((resolve, reject) => {
      const transaction = db!.transaction(STORE_PENDING_SYNC, 'readonly')
      const store = transaction.objectStore(STORE_PENDING_SYNC)
      const request = store.count()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    }),
  ])

  return { assets, checkouts, notifications, pending }
}
