// Coverage Galaxy — service worker (copiato da Vite in site/ a ogni build).
// Precache minimo della shell; i bundle con hash in assets/ vengono messi in
// cache al primo uso, quindi non serve elencarli qui a ogni build.
// __BUILD_ID__ viene sostituito con lo SHA del commit dalla build del sito.
const CACHE_NAME = 'coverage-galaxy-__BUILD_ID__';
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k !== CACHE_NAME && k.startsWith('coverage-galaxy-'))
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const isNav = e.request.mode === 'navigate';
  e.respondWith(
    (isNav ? fetch(e.request).catch(() => caches.match('./index.html'))
      : caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        }
        return resp;
      })))
  );
});
