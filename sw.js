// Service Worker per supporto offline
//
// CACHE_NAME e' volatile di proposito: con un numero fisso ('portfolio-v9') il
// nome della cache smetteva di cambiare e i visitatori di ritorno restavano
// inchiodati sugli stessi bundle JS per settimane. Ora `__BUILD_ID__` viene
// sostituito con il commit SHA dalla CI (deploy.yml, passo "Versiona il service
// worker"), quindi ogni deploy produce una cache nuova e activate elimina le
// vecchie. In locale resta il placeholder e il nome e' comunque valido.
const BUILD_ID = '__BUILD_ID__';
const CACHE_NAME = `portfolio-${BUILD_ID}`;
const scopedStaticPaths = [
    './',
    'index.html',
    // CSS della home: TUTTI i 14, non solo i primi due. Senza questi la
    // prima pagina offline e' senza layout.
    'assets/css/main.css',
    'assets/css/design-system.css',
    'assets/css/secret-themes.css',
    'assets/css/animations.css',
    'assets/css/recruiter-mode.css',
    'assets/css/cookies.css',
    'assets/css/twin-mode.css',
    'assets/css/nerve-center.css',
    'assets/css/terminal-mode.css',
    'assets/css/portfolio-xp.css',
    'assets/css/home-refresh.css',
    'assets/css/catalog.css',
    'assets/css/sections-modern.css',
    'assets/css/light-theme.css',
    // Core JS della home
    'assets/js/main.js',
    'assets/js/projects-data.js',
    'assets/js/catalog-data.js',
    'assets/js/catalog-home.js',
    'assets/js/portfolio-xp.js',
    'assets/js/easter-eggs.js',
    'assets/js/twin-mode.js',
    'assets/js/nerve-center.js',
    'assets/js/terminal-mode.js',
    'assets/js/cookies.js',
    'assets/js/reference-scene.js',
    // LCP: senza l'avatar il primo paint offline mostra un'immagine rotta.
    'assets/cv_gandolfi.jpeg',
    'assets/apple-touch-icon.png',
    // Icone + metadati PWA
    'assets/icon-192.png',
    'assets/icon-512.png',
    'assets/icon-192-maskable.png',
    'assets/icon-512-maskable.png',
    'assets/favicon.ico',
    'manifest.json',
    'robots.txt',
    'sitemap.xml',
];

const urlsToCache = [
    ...scopedStaticPaths.map(path => new URL(path, self.registration.scope).toString()),
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Nessun timestamp su sw.js: i browser loownload dalla rete perche' il
// max-age di default e' 0, quindi il worker stesso si aggiorna da solo.

// Installazione del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
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
//
// Nota sul perche' non basta "cache first": i bundle in /assets/ sono quasi
// sempre nomi non-hashati (main.js, non main.a1b2c3.js), quindi la cache non puo'
// sapere da sola che il file e' cambiato. Servono due policy diverse:
//
//   - STALE-WHILE-REVALIDATE per CSS/JS: rispondi subito dalla cache (veloce,
//     offline-capace) e in background scarichi la versione nuova. Il visitatore
//     vede il codice di adesso e al massimo alla visita successiva quello nuovo.
//     Il rischio residuo e' il reload subito dopo il fetch in background.
//   - CACHE-FIRST vero e proprio solo per i file immutabili (path con hash).
const REVALIDATE_MAX_AGE = 24 * 60 * 60 * 1000; // 24h: forza una risincronizzazione
const MAX_CACHE_ENTRIES = 120;                  // evita crescita illimitata della cache

function isImmutable(url) {
    // I bundle Vite hanno l'hash nel nome: /assets/index-qzHJ3DfX.js
    return /-[A-Za-z0-9_-]{8,}\.(js|css|woff2?|png|jpe?g|webp|avif|svg)$/.test(url);
}

function trimCache(cache, maxEntries) {
    return cache.keys().then(keys => {
        if (keys.length <= maxEntries) return;
        return Promise.all(
            keys.slice(0, keys.length - maxEntries).map(k => cache.delete(k))
        );
    });
}

self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    // 1) Documenti HTML: network first. Se la rete risponde, e' sempre la
    //    versione piu' recente; la cache serve solo come fallback offline.
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                            trimCache(cache, 60);
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
                        // Non restituire la home con HTTP 200 per un URL non
                        // cachato: e' un soft-404 che confonde crawler e utenti.
                        return caches.match(new URL('index.html', self.registration.scope).toString())
                            .then(response => response || createOfflineResponse());
                    });
                })
        );
        return;
    }

    // 2) Font: cache first. I file woff2 hanno hash nel nome e non cambiano
    //    senza un cambio di versione, quindi sono sicuri da servire dalla cache.
    if (request.destination === 'font') {
        event.respondWith(
            caches.match(request).then(cached => cached || fetchAndCache(request))
        );
        return;
    }

    // 3) CSS / JS / immagini: stale-while-revalidate.
    if (request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.url.includes('/assets/') ||
        request.url.includes('fonts.googleapis.com') ||
        request.url.includes('fonts.gstatic.com') ||
        request.url.includes('cdnjs.cloudflare.com')) {

        const useCacheFirst = isImmutable(request.url);

        event.respondWith(
            caches.open(CACHE_NAME).then(cache => cache.match(request).then(cached => {
                if (cached && useCacheFirst) {
                    return cached;
                }

                const network = fetch(request)
                    .then(response => {
                        if (response && response.status === 200 &&
                            (response.type === 'basic' || response.type === 'cors')) {
                            const copy = response.clone();
                            cache.put(request, copy).then(() => trimCache(cache, MAX_CACHE_ENTRIES));
                        }
                        return response;
                    })
                    .catch(() => null);

                if (!cached) {
                    // Prima visita (o cache scaduta): niente da mostrare subito,
                    // quindi si aspetta la rete. Offline -> risposta vuota 504.
                    return network.then(r => r || new Response('', { status: 504, statusText: 'Offline' }));
                }

                // Cache c'è: rispondi subito, e ricarica in background. Se il
                // file in cache è vecchio più di REVALIDATE_MAX_AGE, non rilanciare
                // la rete a ogni singola richiesta.
                const date = cached.headers.get('date');
                const stale = !date || (Date.now() - new Date(date).getTime()) > REVALIDATE_MAX_AGE;
                if (stale) {
                    network.catch(() => {});
                }
                return cached;
            }))
        );
        return;
    }

    // DEFAULT: network first con fallback in cache.
    event.respondWith(
        fetch(request)
            .catch(() => caches.match(request))
            .then(r => r || new Response('', { status: 504, statusText: 'Offline' }))
    );
});

function fetchAndCache(request) {
    return fetch(request).then(response => {
        if (response && response.status === 200 &&
            (response.type === 'basic' || response.type === 'cors')) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(request, copy).then(() => trimCache(cache, MAX_CACHE_ENTRIES));
            });
        }
        return response;
    });
}

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
