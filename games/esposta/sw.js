const CACHE_NAME='esposta-v1';
const urls=['./','./index.html','./manifest.webmanifest','./js/story.js','./js/concepts.js','./js/cases.js','./js/minigames.js','./js/agency.js','./js/main.js','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urls)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(!resp||resp.status!==200)return resp;const c=resp.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,c));return resp}).catch(()=>caches.match('./index.html')))});
