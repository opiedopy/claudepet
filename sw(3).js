// ─────────────────────────────────────────────
//  Pet Shop Service Worker
//  Bump CACHE_VERSION whenever you deploy changes
//  — this triggers the update banner automatically.
// ─────────────────────────────────────────────

const CACHE_VERSION = 'v2';
const CACHE_NAME    = `petshop-${CACHE_VERSION}`;

// Files to precache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './images/dog.png',
  './images/cat.png',
  './images/curler-hamster-icon.png'
];

// ── Install: precache all assets ──────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => {
        // Don't self.skipWaiting() here — let the banner decide.
        console.log(`[SW ${CACHE_VERSION}] Installed and cached.`);
      })
  );
});

// ── Activate: remove old caches ───────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('petshop-') && key !== CACHE_NAME)
          .map(key => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-first, network fallback ──────
self.addEventListener('fetch', event => {
  // Only handle GET requests for our own origin
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ── Message: handle SKIP_WAITING from banner ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping wait — activating new version now.');
    self.skipWaiting();
  }
});
