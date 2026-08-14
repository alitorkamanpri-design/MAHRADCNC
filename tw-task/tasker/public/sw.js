/* ═══════════════════════════════════════════════════════════════
   TASKER — Service Worker
   Cache-First strategy for static assets
   ═══════════════════════════════════════════════════════════════ */

const CACHE = 'tasker-v1'

const PRECACHE = [
  '/',
  '/index.html',
  '/src/pages/calendar.html',
  '/src/pages/tasks.html',
  '/src/pages/profile.html',
  '/manifest.json',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  // Skip cross-origin requests (fonts, CDN assets)
  if (!e.request.url.startsWith(self.location.origin)) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      }).catch(() => caches.match('/'))
    })
  )
})
