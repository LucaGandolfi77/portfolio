/* Scalpel — service worker v2 con aggiornamenti */
var CACHE = 'scalpel-v2';
var CORE = [
  './',
  './index.html',
  './css/modern.css',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './js/data.js',
  './js/core.js',
  './js/meta/i18n.js',
  './js/meta/profile.js',
  './js/meta/missions.js',
  './js/meta/hooks.js',
  './js/meta/ui.js',
  './js/meta/main.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function(cache) {
        return Promise.allSettled(CORE.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[Scalpel] asset non cachato:', url, err && err.message);
          });
        }));
      })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; })
        .map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(function(hit) {
      if (hit) return hit;
      return fetch(req).then(function(res) {
        if (res && res.ok && req.url.indexOf(self.location.origin) === 0) {
          var copy = res.clone();
          caches.open(CACHE).then(function(cache) { cache.put(req, copy); });
        }
        return res;
      });
    }).catch(function() {
      if (req.mode === 'navigate') return caches.match('./index.html');
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
