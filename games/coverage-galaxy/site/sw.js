const CACHE_NAME='coverage-galaxy-v1';
const urls=['./','./index.html','./manifest.webmanifest','./assets/index-qzHJ3DfX.js','./assets/index-C7h5P-zq.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urls)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(!resp||resp.status!==200)return resp;const c=resp.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,c));return resp}).catch(()=>caches.match('./index.html')))});
