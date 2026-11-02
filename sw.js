const C='olsenbygg-v3',F=['./','index.html','css/style.css','css/olsen.css','js/data.js','js/main.js','img/logo.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
