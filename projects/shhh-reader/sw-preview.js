/* Cache offline per la preview del portfolio (la versione /app/ usa sw.js). */
const CACHE = 'shhh-preview-v2'
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './js/i18n.js',
  './js/audio.js',
  './js/reader.js',
  './js/browser.js',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.indexOf('shhh-preview-') === 0 && k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, copy))
        }
        return res
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html')
        return new Response('', { status: 503, statusText: 'Offline' })
      })
    })
  )
})
