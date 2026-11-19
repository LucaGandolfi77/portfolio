/* Sky Ace — offline app shell (scope: /games/) */
"use strict";

const CACHE = 'skyace-v1';
const ASSETS = [
  './plane.html',
  './plane/styles.css',
  './plane/manifest.webmanifest',
  './plane/icon.svg',
  './plane/js/main.js',
  './plane/js/config.js',
  './plane/js/state.js',
  './plane/js/engine.js',
  './plane/js/entities.js',
  './plane/js/input.js',
  './plane/js/render.js',
  './plane/js/effects.js',
  './plane/js/audio.js',
  './plane/js/ui.js',
  './top_buttons.js',
  '../i18n/en.json',
  '../i18n/it.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isOurAsset(path) {
  return /\/plane\.html$/.test(path) ||
         /\/plane\//.test(path) ||
         /\/top_buttons\.js$/.test(path) ||
         /\/i18n\//.test(path);
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!isOurAsset(url.pathname)) return; // let other portfolio pages use their own SW

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match('./plane.html').then(hit => hit || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy));
      }
      return res;
    }))
  );
});
