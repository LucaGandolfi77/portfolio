/* Atlas — service worker.
   Shell versionata + cache separata per le tile OpenStreetMap visitate. */

var SHELL_CACHE = 'pf-atlas-shell-v1';
var TILE_CACHE = 'pf-atlas-tiles-v1';
var TILE_LIMIT = 180;

var CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './css/app.css',
  './js/app.js',
  './js/api.js',
  './js/geo.js',
  './js/i18n.js',
  './js/storage.js',
  './js/vendor/leaflet/leaflet.js',
  './js/vendor/leaflet/leaflet.css',
  './js/vendor/leaflet/images/layers.png',
  './js/vendor/leaflet/images/layers-2x.png',
  './js/vendor/leaflet/images/marker-icon.png',
  './js/vendor/leaflet/images/marker-icon-2x.png',
  './js/vendor/leaflet/images/marker-shadow.png',
  '../_shared/tokens.css',
  '../_shared/base.css',
  '../_shared/shell.css',
  '../_shared/shell.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(function (cache) {
        return cache.addAll(CORE);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              if (key.indexOf('pf-atlas-') !== 0) return false;
              return key !== SHELL_CACHE && key !== TILE_CACHE;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

function isTile(url) {
  return /(^|\.)tile\.openstreetmap\.org$/.test(url.hostname);
}

function trimTiles(cache) {
  return cache.keys().then(function (keys) {
    if (keys.length <= TILE_LIMIT) return undefined;
    return Promise.all(
      keys.slice(0, keys.length - TILE_LIMIT).map(function (request) {
        return cache.delete(request);
      })
    );
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }

  if (url.origin !== self.location.origin) {
    if (isTile(url)) {
      event.respondWith(
        caches.open(TILE_CACHE).then(function (cache) {
          return cache.match(request).then(function (hit) {
            if (hit) return hit;
            return fetch(request)
              .then(function (response) {
                if (response && (response.ok || response.type === 'opaque')) {
                  cache.put(request, response.clone()).then(function () {
                    trimTiles(cache);
                  });
                }
                return response;
              })
              .catch(function () {
                return new Response('', { status: 504, statusText: 'Tile offline' });
              });
          });
        })
      );
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(SHELL_CACHE).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (hit) {
            return hit || caches.match('./index.html');
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(SHELL_CACHE).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});
