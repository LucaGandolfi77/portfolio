// sw.js — Service Worker per Il Regno di Moneta PWA
const CACHE = 'rdm-v1';
const SHELL = [
  './',
  './index.html',
  './js/story.js',
  './js/save.js',
  './js/minigames.js',
  './js/empire.js',
  './js/main.js',
  './js/sounds.js',
  './js/achievements.js',
  './js/share.js',
  './js/onboarding.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/icon-96.png'
];

// Install — precache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(url =>
        c.add(url).catch(err => console.warn('Skip cache:', url, err.message))
      )))
      .then(() => self.skipWaiting())
  );
});

// Activate — pulisci vecchie cache
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — strategie differenziate
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navigazione HTML: network-first con cache fallback
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
          return r;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Assets statici: cache-first
  e.respondWith(
    caches.match(req)
      .then(r => r || fetch(req).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return resp;
      }).catch(() => new Response('', { status: 504, statusText: 'Offline' })))
  );
});
