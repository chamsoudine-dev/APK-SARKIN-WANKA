// Service worker — Sarkin Wanka (mode hors-ligne). Changez la version pour forcer la mise à jour.
const V='sarkin-wanka-v4';
const FILES=['./','index.html','manifest.json','assets/img/icon-192.png','assets/img/icon-512.png','assets/img/logo-128.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  // réseau d'abord (toujours la dernière version), cache en secours hors-ligne
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
});
