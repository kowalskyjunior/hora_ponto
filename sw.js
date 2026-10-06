const CACHE_NAME = "hourkwo-v0.5.1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/core/timeCalculator.js",
  "./src/services/pontomaisService.js",
  "./src/ui/dom.js",
  "./src/ui/styles.css",
  "./src/main.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});