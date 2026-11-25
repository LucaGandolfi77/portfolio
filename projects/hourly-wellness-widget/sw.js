// Hourly Wellness — service worker.
// La cache ha prefisso `hourly-wellness-` e il nome cambia a ogni deploy
// (__BUILD_ID__ viene sostituito dalla build): activate elimina solo le
// proprie cache vecchie e non tocca quelle delle altre PWA del portfolio.
const CACHE = 'hourly-wellness-__BUILD_ID__';
const PRECACHE = [
  './', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest',
  'js/i18n.js', 'js/streak.js', 'js/breathing.js', 'js/notification.js', 'js/settings.js',
  '../../assets/icon-192.png', '../../assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k.startsWith('hourly-wellness-') && k !== CACHE)
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(self.registration.scope));
});
