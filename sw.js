// Service Worker per supporto offline
const CACHE_NAME = 'portfolio-v9';
const scopedStaticPaths = [
    './',
    'index.html',
    // Core CSS per il primo paint della home
    'assets/css/main.css',
    'assets/css/design-system.css',
    // Core JS della home
    'assets/js/main.js',
    'assets/js/projects-data.js',
    'assets/js/catalog-data.js',
    'assets/js/catalog-home.js',
    // Icone + metadati PWA
    'assets/icon-192.png',
    'assets/icon-512.png',
    'manifest.json',
    'robots.txt',
    'sitemap.xml',
];

const urlsToCache = [
    ...scopedStaticPaths.map(path => new URL(path, self.registration.scope).toString()),
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installazione del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aperta');
                // Cache file per file (non addAll, che è atomica): se una
                // richiesta fallisce — es. redirect CORS verso il login in
                // ambienti di preview come github.dev — le altre vengono
                // comunque salvate e l'install non si blocca.
                return Promise.allSettled(urlsToCache.map(url =>
                    cache.add(url).catch(err => {
                        console.warn('File non cachato:', url, err && err.message);
                    })
                ));
            })
            .then(() => self.skipWaiting())
    );
});

// Attivazione del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminazione vecchia cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Strategia di fetch
self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    // LISTA DI FILE STATICI o IMMAGINI: Cache First
    if (request.url.includes('/assets/') || 
        request.url.includes('fonts.googleapis.com') || 
        request.url.includes('cdnjs.cloudflare.com') ||
        request.destination === 'image' ||
        request.destination === 'style' ||
        request.destination === 'script') {
        
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                }).catch(() => new Response('', { status: 504, statusText: 'Offline' }));
            })
        );
        return;
    }

    // HTML / NAVIGAZIONE: Network First
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Offline: usa la cache SOLO se recente (max 10 min), così
                    // non si vedono mai versioni vecchie di giorni. Altrimenti
                    // pagina offline.
                    return caches.match(request).then(cached => {
                        if (cached) {
                            const d = cached.headers.get('date');
                            if (!d || (Date.now() - new Date(d).getTime()) < 10*60*1000) {
                                return cached;
                            }
                        }
                        return caches.match(new URL('index.html', self.registration.scope).toString())
                            .then(response => response || createOfflineResponse());
                    });
                })
        );
        return;
    }

    // DEFAULT: Network First (con risposta di riserva, mai undefined)
    event.respondWith(
        fetch(request)
            .catch(() => caches.match(request))
            .then(r => r || new Response('', { status: 504, statusText: 'Offline' }))
    );
});

function createOfflineResponse() {
  return new Response(
      `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline</title>
  <style>
      body { font-family: sans-serif; background: #0a1628; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
      h1 { color: #00d4ff; }
      p { color: #a0c0e0; }
      button { padding: 10px 20px; background: #00d4ff; border: none; border-radius: 5px; cursor: pointer; color: #000; font-weight: bold; }
  </style>
</head>
<body>
  <div>
      <h1>Sei Offline 📡</h1>
      <p>Questa pagina non è disponibile senza connessione.</p>
      <button onclick="window.location.reload()">Riprova</button>
  </div>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html' } }
  );
}
