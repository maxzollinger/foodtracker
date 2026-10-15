// Offline support: keeps the app shell cached, always tries the network first so updates arrive.
// Also shows the reminder notifications that the GitHub workflow sends.
const CACHE = 'foodtracker-v25';
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
  burn: { title: 'Calories burned today?', line: '{a} / {b} kcal eaten · {p} / {q} g protein', tail: 'Tap to log the calories you burned today.' },
  weight: { title: 'Weekly weigh-in', line: 'Last {w} kg · Goal {g} kg', lineNoGoal: 'Last {w} kg', tail: 'Time to log your current weight.' }
};
const iso = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
// Same builder as reminderContent() in index.html: one line with today's numbers, one short action line
function content(R, kind) {
  const s = R.snap, n = x => Number(x).toLocaleString(R.loc || 'en'), fill = (str, o) => str.replace(/\{(\w+)\}/g, (m, k) => o[k] ?? m);
  const r = R[kind] && R[kind].tail ? R[kind] : DEFAULT_TEXTS[kind]; let line = '';
  try {
    if (s && kind === 'burn') { const today = s.date === iso(); line = fill(r.line, { a: n(today ? s.kcal : 0), b: n(today ? s.goal : s.baseGoal), p: n(today ? s.protein : 0), q: n(s.pgoal) }); }
    if (s && kind === 'weight' && s.weight) line = s.target ? fill(r.line, { w: n(s.weight), g: n(s.target) }) : fill(r.lineNoGoal, { w: n(s.weight) });
  } catch { line = ''; }
  return { title: r.title, body: line ? line + '\n' + r.tail : r.tail };
}

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch {}
  const kind = data.open === 'weight' ? 'weight' : 'burn';
  e.waitUntil((async () => {
    let R = DEFAULT_TEXTS;
    try { const r = await (await caches.open('ft-meta')).match('./reminder-texts'); if (r) R = await r.json(); } catch {}
    const t = content(R, kind);
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
