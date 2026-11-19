// Métrix 3.13 — fonctionnement hors connexion de la version web (iPhone / iPad).
// La page est toujours demandée au réseau d'abord : la nouvelle version arrive dès qu'internet est là ;
// sans réseau, on sert la copie gardée. pdf.js et les icônes sont servis depuis la copie gardée.
const CACHE = 'metrix-3.13';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'lib/pdf.min.js', 'lib/pdf.worker.min.js',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (isPage) {
    e.respondWith(fetch(req, { cache: 'no-store' })
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});
