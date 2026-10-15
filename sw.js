// Offline support: keeps the app shell cached, always tries the network first so updates arrive.
// Also shows the reminder notifications that the GitHub workflow sends.
const CACHE = 'foodtracker-v16';
const KEEP = [CACHE, 'ft-meta'];   // ft-meta holds the notification texts in the app's language
const ASSETS = ['./', './index.html', './lang.js', './manifest.json', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => !KEEP.includes(k)).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

const DEFAULT_TEXTS = {
  burn: { title: '🏃 Calories burned today?', body: 'Tap to log the calories you burned today.' },
  weight: { title: '⚖️ Weekly weigh-in', body: 'Time to log your current weight.' }
};

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch {}
  const kind = data.open === 'weight' ? 'weight' : 'burn';
  e.waitUntil((async () => {
    let texts = DEFAULT_TEXTS;
    try { const r = await (await caches.open('ft-meta')).match('./reminder-texts'); if (r) texts = await r.json(); } catch {}
    const t = texts[kind] || DEFAULT_TEXTS[kind];
    await self.registration.showNotification(t.title, { body: t.body, icon: 'icon-180.png', badge: 'icon-180.png', tag: kind, data: { open: kind } });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const open = (e.notification.data && e.notification.data.open) || 'burn';
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) { await w.focus(); w.postMessage({ open }); return; }
    await self.clients.openWindow('./?open=' + open);
  })());
});
