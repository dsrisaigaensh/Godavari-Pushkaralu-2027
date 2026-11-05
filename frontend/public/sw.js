// CivicProof Platform - Field PWA Service Worker (v2)
// Enables offline-first resilience for riverfront field verification at Godavari Pushkaralu 2027

const CACHE_NAME = 'civicproof-shell-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
  '/manifest.webmanifest'
];

// Install: Pre-cache core application shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: Purge older cache versions and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Pass-through for APIs, resilient fallback for navigation and static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Never intercept API requests - let the frontend ApiClient handle them with its mock fallback
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Navigation Requests: Network first, cache fallback, guaranteed Response
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cached = (await cache.match('/index.html')) || (await cache.match('/'));
          if (cached) return cached;
        } catch {
          // ignore cache error
        }
        return new Response('<!doctype html><html><head><meta http-equiv="refresh" content="2"></head><body>Loading CivicProof...</body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  // 3. Static Assets: Cache first with network refresh, guaranteed Response
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const toCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, toCache));
        }
        return networkResponse;
      } catch {
        return new Response('', { status: 404, statusText: 'Not Found' });
      }
    })
  );
});
