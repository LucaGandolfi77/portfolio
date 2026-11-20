/* Service Worker — Slot Neon PWA */
const CACHE_VERSION = 'slot-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.webmanifest',
    './offline.html',
    './js/rng.js',
    './js/slots.js',
    './js/gacha.js',
    './js/story.js',
    './js/modes.js',
    './js/audio.js',
    './js/storage.js',
    './js/ui.js',
    './js/main.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable.png',
    './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k.indexOf('slot-') === 0 && k !== CACHE_VERSION).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;

    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request).then(response => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
                }
                return response;
            }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html') || caches.match('./offline.html')))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cached => cached || fetch(request).then(response => {
            if (response && response.status === 200) {
                const copy = response.clone();
                caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
            }
            return response;
        }).catch(() => caches.match('./icons/icon-192.png')))
    );
});
