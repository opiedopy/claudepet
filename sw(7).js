// ─────────────────────────────────────────────
//  Pet Shop Service Worker
//  Bump CACHE_VERSION on every deploy to trigger the update banner.
// ─────────────────────────────────────────────

const CACHE_VERSION = 'v5';
const CACHE_NAME    = `petshop-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './images/dog.png',
  './images/cat.png',
  './images/curler-hamster-icon.png'
];

// ── Install ───────────────────────────────────
self.addEventListener('install', event => {
  console.log(`[SW ${CACHE_VERSION}] install`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => console.log(`[SW ${CACHE_VERSION}] precache done`))
    // Do NOT call skipWaiting here — let the banner/user trigger it
  );
});

// ── Activate ──────────────────────────────────
self.addEventListener('activate', event => {
  console.log(`[SW ${CACHE_VERSION}] activate`);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('petshop-') && k !== CACHE_NAME)
          .map(k => { console.log('[SW] deleting old cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first, network fallback ──────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'error') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

// ── Message: SKIP_WAITING from banner ─────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`[SW ${CACHE_VERSION}] skipWaiting`);
    self.skipWaiting();
  }
});
