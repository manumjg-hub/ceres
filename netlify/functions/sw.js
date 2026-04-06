const CACHE_NAME = 'nutriplanner-v1';
const urlsToCache = ['/', '/favicon.svg'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache).catch(console.error))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Only cache GET traffic
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(response => {
      // Network First strategy for the app logic
      return fetch(event.request).catch(() => response || fetch(event.request));
    })
  );
});
