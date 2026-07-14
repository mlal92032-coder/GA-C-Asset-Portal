// Service Worker for Progressive Web App
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `asset-manager-${CACHE_VERSION}`
const RUNTIME_CACHE = `asset-manager-runtime-${CACHE_VERSION}`
const API_CACHE = `asset-manager-api-${CACHE_VERSION}`

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[SW] Error caching static assets:', err)
      })
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - network first, cache as fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const cache = caches.open(API_CACHE)
            cache.then(c => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Fallback to cached API response
          return caches.match(request).then(cached => {
            if (cached) {
              return cached
            }
            // Return offline response
            return new Response(
              JSON.stringify({
                error: 'offline',
                message: 'You are offline. Please check your connection.',
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          })
        }),
    )
    return
  }

  // Static assets - cache first, network fallback
  if (
    request.method === 'GET' &&
    (request.destination === 'image' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          return cached
        }
        return fetch(request)
          .then(response => {
            if (response.ok) {
              caches.open(RUNTIME_CACHE).then(cache => {
                cache.put(request, response.clone())
              })
            }
            return response
          })
          .catch(() => {
            // Return offline asset
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999" font-size="12">Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } },
              )
            }
            return new Response('Offline', { status: 503 })
          })
      }),
    )
    return
  }

  // HTML pages - network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, response.clone())
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).catch(() => {
            return new Response(
              '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>Offline</h1><p>You are currently offline. Please check your connection.</p></body></html>',
              {
                status: 503,
                headers: { 'Content-Type': 'text/html' },
              },
            )
          })
        }),
    )
    return
  }

  // Default - network with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && request.method === 'GET') {
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, response.clone())
          })
        }
        return response
      })
      .catch(() => caches.match(request)),
  )
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-assets') {
    event.waitUntil(syncAssets())
  } else if (event.tag === 'sync-checkouts') {
    event.waitUntil(syncCheckouts())
  }
})

async function syncAssets() {
  try {
    const cache = await caches.open('offline-assets')
    const requests = await cache.keys()

    for (const request of requests) {
      try {
        const response = await fetch(request)
        if (response.ok) {
          await cache.delete(request)
        }
      } catch (err) {
        console.log('[SW] Sync failed for:', request.url)
      }
    }
  } catch (err) {
    console.error('[SW] Sync error:', err)
  }
}

async function syncCheckouts() {
  try {
    const cache = await caches.open('offline-checkouts')
    const requests = await cache.keys()

    for (const request of requests) {
      try {
        const response = await fetch(request)
        if (response.ok) {
          await cache.delete(request)
        }
      } catch (err) {
        console.log('[SW] Checkout sync failed')
      }
    }
  } catch (err) {
    console.error('[SW] Checkout sync error:', err)
  }
}

// Message handler for client communication
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName)
      })
    })
  }
})
