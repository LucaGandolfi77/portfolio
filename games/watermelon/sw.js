const CACHE='watermelon-v1';
const ASSETS=['./', './index.html', './styles.css', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable.png', './icons/icon.svg', './js/config.js', './js/game.js', './js/main.js', '../../top_buttons.js', '../_kit/arcade.css', '../_kit/core.js', '../_kit/storage.js', '../_kit/i18n.js', '../_kit/audio.js', '../_kit/fx.js', '../_kit/pwa.js', '../_kit/progression.js', '../_kit/arcade.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match('./index.html')));return}
e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})))});
