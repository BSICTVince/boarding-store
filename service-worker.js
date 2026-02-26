self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open("sari-store-cache").then(cache=>{
      return cache.addAll([
        "/index.html",
        "/cart.html",
        "/checkout.html",
        "/admin.html"
      ]);
    })
  );
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});