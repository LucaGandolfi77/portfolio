// Cache cleanup: delete only older versions of THIS app's cache (same name
// stem, e.g. 'app-v1' -> 'app-v2'). Other PWAs share the origin
// (lucagandolfi77.github.io) and their caches must not be touched.
/* Steel Waves — service worker PWA */
"use strict";
var CACHE = 'steel-waves-v1';
var ASSETS = [
  './', './index.html', './css/modern.css', './manifest.webmanifest',
  './icon.svg', './icon-192.png', './icon-512.png', './icon-512-maskable.png',
  './js/battle.js', './js/meta/i18n.js', './js/meta/gacha.js',
  './js/meta/profile.js', './js/meta/ui.js', './js/meta/main.js'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE).then(function(cache){
      return Promise.allSettled(ASSETS.map(function(url){
        return cache.add(url).catch(function(err){ console.warn('[SW] skip', url, err && err.message); });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function(event){
  event.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE && k.replace(/-[^-]*$/, '') === CACHE.replace(/-[^-]*$/, ''); }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;
  event.respondWith(caches.match(req).then(function(hit){
    if(hit) return hit;
    return fetch(req).then(function(res){
      if(res && res.ok && req.url.indexOf(self.location.origin) === 0){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
      }
      return res;
    });
  }).catch(function(){
    if(req.mode === 'navigate') return caches.match('./index.html');
  }));
});
self.addEventListener('message', function(event){
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
