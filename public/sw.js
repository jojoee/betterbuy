const CACHE = "betterbuy-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/betterbuy-overlap.svg",
  "./icons/favicon.ico",
  "./icons/apple-touch-icon-180x180.png",
  "./icons/pwa-64x64.png",
  "./icons/pwa-192x192.png",
  "./icons/pwa-512x512.png",
  "./icons/maskable-icon-512x512.png",
];
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("fetch", (event) =>
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  ),
);
