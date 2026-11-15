const CACHE_NAME = "vivahsutra-shell-v39";
const APP_SHELL = ["./", "./index.html", "./styles.css?v=template-assets-v39", "./app.js?v=template-assets-v35", "./icon.svg", "./manifest.webmanifest", "./privacy.html", "./assets/rajwada-royale.svg", "./assets/garden-of-love.svg", "./assets/modern-heirloom.svg", "./assets/mangal-patrika.svg", "./assets/mughal-garden.svg", "./assets/pastel-bloom.svg", "./assets/floral-side-ornaments.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (!response.ok) return response;
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => event.request.mode === "navigate" ? caches.match("./index.html") : Response.error())));
});