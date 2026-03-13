const CACHE_NAME = 'italiantoapp-v1';
const STATIC_ASSETS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for API calls, cache-first for static assets
  if (event.request.url.includes('/functions/v1/') || event.request.url.includes('supabase.co')) {
    return; // Don't cache API calls
  }
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((r) => r || fetch(event.request))
    )
  );
});
