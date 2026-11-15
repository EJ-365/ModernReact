const VERSION = '__VERSION__';
const PRECACHE = self.__PRECACHE || [];
const CACHE = 'penwright-' + VERSION;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('penwright-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const store = (res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  };
  if (req.mode === 'navigate') {
    // Pages: network first so updates show up, cached copy when offline.
    e.respondWith(fetch(req).then(store).catch(() =>
      caches.match(req, { ignoreSearch: true }).then((m) => m || caches.match('./studio.html'))));
    return;
  }
  // Hashed assets and fonts never change: cache first.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((m) => m || fetch(req).then(store)));
});
