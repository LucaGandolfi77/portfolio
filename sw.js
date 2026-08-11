// Service Worker per supporto offline
const CACHE_NAME = 'portfolio-v3';
const scopedStaticPaths = [
    './',
    'index.html',
    'pages/main/timeline.html',
    'pages/main/books.html',
    'pages/main/technology.html',
    'pages/content/music.html',
    'pages/content/movies.html',
    'pages/main/piano.html',
    'pages/content/poem.html',
    'pages/content/photobook.html',
    'pages/content/memes.html',
    'pages/main/life_comic.html',
    'pages/main/blog.html',
    'pages/main/shop.html',
    'projects/quiz.html',
    'assets/css/main.css',
    'assets/js/main.js',
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
                return cache.addAll(urlsToCache).catch(err => {
                   console.warn("Alcuni file non sono stati cachati:", err);
                });
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
                });
            })
        );
        return;
    }

    // HTML / NAVIGAZIONE: Network First
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then(cachedResponse => {
                                if (cachedResponse) return cachedResponse;
                                 return caches.match(new URL('index.html', self.registration.scope).toString())
                                     .then(response => response || createOfflineResponse());
                        });
                })
        );
        return;
    }

    // DEFAULT: Network First
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
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
