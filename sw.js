// Service Worker per supporto offline
const CACHE_NAME = 'portfolio-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/timeline.html',
    '/books.html',
    '/technology.html',
    '/music.html',
    '/movies.html',
    '/piano.html',
    '/poem.html',
    '/photobook.html',
    '/memes.html',
    '/life_comic.html',
    '/blog.html',
    '/shop.html',
    '/quiz.html',
    '/quiz01.html',
    '/quiz02.html',
    '/taylor_swift_quiz.html',
    '/toothpaste_quiz.html',
    '/engineer_quiz.html',
    '/morse.html',
    '/croquet.html',
    '/easter_egg.html',
    '/assets/css/main.css',
    '/assets/js/main.js',
    '/manifest.json',
    '/robots.txt',
    '/sitemap.xml',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installazione del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aperta');
                // Cache solo i file critici per evitare errori
                const criticalFiles = [
                    '/',
                    '/index.html',
                    '/timeline.html',
                    '/assets/css/main.css',
                    '/assets/js/main.js',
                    '/manifest.json'
                ];
                return cache.addAll(criticalFiles).catch(err => {
                    console.warn('Alcuni file non sono stati cachati:', err);
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
                        console.log('Eliminazione cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Strategia di fetch - Network first, fallback to cache
self.addEventListener('fetch', event => {
    const { request } = event;

    // Ignora le richieste non GET
    if (request.method !== 'GET') {
        return;
    }

    // Per le richieste API (JSON), usa network first
    if (request.url.includes('/i18n/') || request.url.includes('.json')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache anche le richieste JSON riuscite
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Se offline, prova la cache
                    return caches.match(request)
                        .then(cachedResponse => {
                            return cachedResponse || createOfflineResponse();
                        });
                })
        );
        return;
    }

    // Per le altre risorse (HTML, CSS, JS), usa cache first
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then(response => {
                        // Cache le risorse riuscite
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Fallback per file offline
                        if (request.destination === 'document') {
                            return caches.match('/index.html')
                                .then(response => response || createOfflineResponse());
                        }

                        // Per immagini e altre risorse
                        if (request.destination === 'image') {
                            return createOfflineImage();
                        }

                        return createOfflineResponse();
                    });
            })
    );
});

// Crea una risposta offline HTML
function createOfflineResponse() {
    return new Response(
        `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio - Modalità Offline</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a1628 0%, #1a2940 100%);
            background-attachment: fixed;
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .offline-container {
            text-align: center;
            max-width: 600px;
            animation: fadeIn 0.6s ease;
        }
        .offline-icon {
            font-size: 80px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 16px;
            background: linear-gradient(90deg, #00d4ff, #0099ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        p {
            font-size: 1.1rem;
            color: #a0c0e0;
            margin-bottom: 12px;
            line-height: 1.6;
        }
        .offline-status {
            background: rgba(26, 41, 64, 0.6);
            border: 2px solid rgba(0, 212, 255, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin: 30px 0;
            backdrop-filter: blur(10px);
        }
        .status-badge {
            display: inline-block;
            background: rgba(255, 107, 107, 0.2);
            border: 1px solid #ff6b6b;
            color: #ff8787;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .suggestions {
            text-align: left;
            background: rgba(0, 212, 255, 0.05);
            border-left: 3px solid #00d4ff;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .suggestions h3 {
            color: #00d4ff;
            margin-bottom: 12px;
            font-size: 1rem;
        }
        .suggestions ul {
            list-style: none;
            color: #a0c0e0;
        }
        .suggestions li {
            padding: 6px 0;
        }
        .suggestions li:before {
            content: "→ ";
            color: #00d4ff;
            margin-right: 8px;
        }
        .cached-message {
            color: #64ffda;
            font-size: 0.95rem;
            margin-top: 20px;
            font-weight: 500;
        }
        .retry-button {
            display: inline-block;
            margin-top: 24px;
            padding: 12px 32px;
            background: linear-gradient(90deg, #00d4ff, #0099ff);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .retry-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1>Sei Offline</h1>
        <p>Non c'è connessione a Internet, ma il tuo portfolio è disponibile in cache!</p>
        
        <div class="offline-status">
            <div class="status-badge">⚠️ Modalità Offline</div>
            <p>Il Service Worker sta mantenendo i contenuti in cache. Tornare online per aggiornamenti.</p>
        </div>

        <div class="suggestions">
            <h3>Cosa puoi fare:</h3>
            <ul>
                <li>Visualizzare le pagine cachate</li>
                <li>Leggere gli articoli salvati</li>
                <li>Consulta il profilo e i progetti</li>
                <li>Esplora la timeline della vita</li>
            </ul>
        </div>

        <div class="cached-message">
            ✓ Contenuto disponibile dal cache
        </div>

        <button class="retry-button" onclick="location.reload()">🔄 Riprova Connessione</button>
    </div>

    <script>
        // Monitora la connessione e aggiorna lo stato
        window.addEventListener('online', () => {
            console.log('Connessione ristabilita!');
            setTimeout(() => location.reload(), 1000);
        });
        
        window.addEventListener('offline', () => {
            console.log('Connessione persa');
        });
    </script>
</body>
</html>`,
        {
            status: 200,
            statusText: 'OK (from cache)',
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        }
    );
}

// Crea un'immagine placeholder offline
function createOfflineImage() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="#1a2940"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#00d4ff" font-size="16" font-family="Arial">
            Immagine offline
        </text>
    </svg>`;
    
    return new Response(svg, {
        status: 200,
        statusText: 'OK (from cache)',
        headers: {
            'Content-Type': 'image/svg+xml'
        }
    });
}

// Message handler per comunicare con i client
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
