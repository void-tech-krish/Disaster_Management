const CACHE_NAME = 'DISASTERGUARD_CACHE_V1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo.png', // Fallback, assuming it might exist
  '/offline',
  '/preparedness'
];

// Install Event - Precache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add silently to avoid breaking install if some assets don't exist
      return Promise.allSettled(
        STATIC_ASSETS.map((url) => {
          return fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(err => console.log('Failed to cache:', url, err));
        })
      );
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first for APIs, Cache first for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Exclude non-GET requests and external domains (except specific APIs if we wanted to)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API Requests (Network First, fallback to Cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If offline and no cache, return a crafted offline payload for critical endpoints
            if (url.pathname.includes('/api/status')) {
               return new Response(JSON.stringify({ status: 'offline', data: { sources: [] } }), {
                 headers: { 'Content-Type': 'application/json' }
               });
            }
            return new Response(JSON.stringify({ status: 'error', message: 'Offline Mode' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Navigation & Static Requests (Network first to ensure fresh app shell, then cache fallback)
  // For standard static assets, we could do Cache First, but Vite generates hashed filenames,
  // so Network First for index.html ensures the latest hashed assets are fetched.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clonedResponse);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML request fails and not in cache, fallback to offline shell
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline') || caches.match('/');
          }
        });
      })
  );
});
