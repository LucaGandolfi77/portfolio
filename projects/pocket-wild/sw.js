/* Pocket Wild — service worker (offline PWA)
 * Cache-first per gli asset dell'app; il gioco è un singolo file, quindi
 * la shell intera sta in poche decine di KB. Bump CACHE_VERSION per invalidare. */
'use strict';
const CACHE_VERSION = 'pocketwild-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
    './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f,
  './js/'+f
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  /* navigazioni: network-first con fallback cache (così gli update arrivano) */
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  /* asset: cache-first, aggiorna in background */
  e.respondWith(
    caches.match(e.request).then(hit => {
      const fetched = fetch(e.request).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || fetched;
    })
  );
});
