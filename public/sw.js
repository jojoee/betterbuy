const CACHE = 'betterbuy-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/betterbuy-overlap-a.svg'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request))));
