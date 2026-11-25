// Cache cleanup: delete only older versions of THIS app's cache (same name
// stem, e.g. 'app-v1' -> 'app-v2'). Other PWAs share the origin
// (lucagandolfi77.github.io) and their caches must not be touched.
/* Tower Defense — service worker con scope dedicato alla sottocartella.
   Non sovrascrive il service worker di Sky Ace (scope /games/). */

"use strict";

const CACHE = 'tower-defense-v1';

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
  './js/state.js',
  './js/entities.js',
  './js/engine.js',
  './js/audio.js',
  './js/render.js',
  './js/input.js',
  './js/ui.js',
  './js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => {
          console.warn('[TD] asset non cachato:', url, err && err.message);
        }))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k.replace(/-[^-]*$/, '') === CACHE.replace(/-[^-]*$/, '')).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isOurAsset(url) {
  return url.origin === self.location.origin &&
    url.pathname.indexOf('/games/tower-defense/') !== -1;
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

  /* Asset: cache-first con aggiornamento in background */
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then(c => c.put(request, copy));
        }
        return response;
      }).catch(() => null);

      if (cached) {
        network.catch(() => {});
        return cached;
      }
      return network.then(r => r || new Response('', { status: 504, statusText: 'Offline' }));
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
