const CACHE = 'shhh-v2'
const SHELL = [
  '/app/', '/app/app.html', '/app/styles.css', '/app/app.js',
  '/app/js/audio.js', '/app/js/reader.js', '/app/js/browser.js',
  '/app/manifest.webmanifest',
  '/app/icons/icon-192.png', '/app/icons/icon-512.png', '/app/icons/icon-maskable-512.png', '/app/icons/icon-180.png',
]
const CDN = [
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
]

self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      await c.addAll(SHELL)
      for (const url of CDN) {
        try { await c.add(url) } catch {}
      }
    })
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

/* Push notifications for daily focus reminders */
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'SHHH', body: 'Time to find silence and read! 📖' }
  e.waitUntil(
    self.registration.showNotification(data.title || 'SHHH', {
      body: data.body || 'Time to find silence and read! 📖',
      icon: '/app/icons/icon-192.png',
      badge: '/app/icons/icon-192.png',
      tag: 'shhh-focus-reminder',
      renotify: true,
      actions: [{ action: 'open', title: 'Open SHHH' }]
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  if (e.action === 'open' || !e.action) {
    e.waitUntil(
      clients.openWindow('/app/')
    )
  }
})

/* Share Target — handle shared files via POST */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (CDN.some(c => url.href.startsWith(c.split('?')[0]))) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r.ok) {
          const clone = r.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return r
      }).catch(() => caches.match(e.request))
    )
    return
  }
  /* Share Target POST handling */
  if (e.request.method === 'POST' && url.pathname.includes('share-target')) {
    e.respondWith(
      new Response(JSON.stringify({ status: 'received' }), { status: 200 })
    )
    return
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(r => {
      if (r.ok) {
        const clone = r.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return r
    }).catch(() => {
      if (e.request.mode === 'navigate') return caches.match('/app/app.html')
      return new Response('', { status: 503, statusText: 'Offline' })
    }))
  )
})
