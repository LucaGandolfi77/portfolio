/* Camera Tracker — service worker con scope dedicato */

"use strict";

const CACHE = 'camera-tracker-v1';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './js/config.js',
  './js/i18n.js',
  './js/loader.js',
  './js/camera.js',
  './js/ai.js',
  './js/filters.js',
  './js/gallery.js',
  './js/subtitles.js',
  './js/ui.js',
  './js/main.js',
  '../../assets/js/face_tracker.js',
  '../../assets/js/ai_tracker.js',
  '../../assets/js/hand_tracker.js',
  '../_shared/top_buttons.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(ASSETS.map(url =>
        cache.add(url).catch(err => console.warn('[Tracker] asset non cachato:', url, err && err.message))
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isKnownCdn(url) {
  return url.hostname.indexOf('jsdelivr.net') !== -1 ||
    url.hostname.indexOf('unpkg.com') !== -1;
}

function isOurAsset(url) {
  if (url.origin !== self.location.origin) return isKnownCdn(url);
  return url.pathname.indexOf('/projects/tracker/') !== -1 ||
    url.pathname.indexOf('/assets/js/face_tracker') !== -1 ||
    url.pathname.indexOf('/assets/js/ai_tracker') !== -1 ||
    url.pathname.indexOf('/assets/js/hand_tracker') !== -1 ||
    url.pathname === '/projects/_shared/top_buttons.js';
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!isOurAsset(url)) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then(c => c.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request)
          .then(hit => hit || caches.match('./index.html'))
          .then(hit => hit || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && (response.status === 200 || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE).then(c => c.put(request, copy));
        }
        return response;
      }).catch(() => null);
      if (cached) { network.catch(() => {}); return cached; }
      return network.then(r => r || new Response('', { status: 504, statusText: 'Offline' }));
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
