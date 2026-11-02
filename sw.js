const C='olsenbygg-v5',F=['./','index.html','scifi-lab.html','materialer.html','personvern.html','tilgjengelighet.html','css/style.css','css/olsen.css','js/data.js','js/main.js','js/ai-config.js','js/visualiser.js','js/materialer.js','img/logo.svg','img/etter-hus.webp','img/etter-hus-640.webp','img/for-tomt.webp','img/for-tomt-640.webp','favicon.ico','manifest.webmanifest'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(F)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
