const CACHE_NAME = "meimih-catalogue-v9";
const APP_SHELL = ["/app/", "/app", "/offline.html", "/manifest.webmanifest", "/app-icon-192.png", "/app-icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/app/") || caches.match("/app") || caches.match("/offline.html")))
    );
    return;
  }

  const path = new URL(event.request.url).pathname;
  const isCatalogueAsset = path === "/_next/image" || path.startsWith("/_next/static/") || path.startsWith("/images/") || /\.(png|jpe?g|webp|ico)$/i.test(path);
  if (!isCatalogueAsset) return;

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
    )
  );
});
