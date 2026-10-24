// Offline support: keeps the app shell cached, always tries the network first so updates arrive.
// Also shows the reminder notifications that the GitHub workflow sends.
const CACHE = 'foodtracker-v221';
const KEEP = [CACHE, 'ft-meta'];   // ft-meta holds the notification texts in the app's language
const ASSETS = ['./', './index.html', './lang.js', './manifest.json', './icon-180.png', './icon-512.png', './scan-tips.jpg',
  './emoji/activity.webp', './emoji/alert.webp', './emoji/apple.webp', './emoji/avocado.webp', './emoji/baby.webp', './emoji/bell.webp', './emoji/bike.webp', './emoji/body.webp', './emoji/book.webp', './emoji/bulb.webp', './emoji/burger.webp', './emoji/cake.webp', './emoji/calendar.webp', './emoji/camera.webp', './emoji/candy.webp', './emoji/cart.webp', './emoji/chair.webp', './emoji/chart.webp', './emoji/check.webp', './emoji/chef.webp', './emoji/clock.webp', './emoji/cloud.webp', './emoji/coffee.webp', './emoji/compass.webp', './emoji/crown.webp', './emoji/cup.webp', './emoji/drop.webp', './emoji/dumbbell.webp', './emoji/egg.webp', './emoji/file.webp', './emoji/flag.webp', './emoji/flame.webp', './emoji/gem.webp', './emoji/gift.webp', './emoji/globe.webp', './emoji/heart.webp', './emoji/helmet.webp', './emoji/hourglass.webp', './emoji/image.webp', './emoji/key.webp', './emoji/leaf.webp', './emoji/link.webp', './emoji/lock.webp', './emoji/mail.webp', './emoji/medal.webp', './emoji/message.webp', './emoji/moon.webp', './emoji/nofork.webp', './emoji/party.webp', './emoji/phone.webp', './emoji/pin.webp', './emoji/protein.webp', './emoji/ring.webp', './emoji/ruler.webp', './emoji/run.webp', './emoji/salad.webp', './emoji/salt.webp', './emoji/scale.webp', './emoji/shield.webp', './emoji/sparkles.webp', './emoji/sprout.webp', './emoji/star.webp', './emoji/steps.webp', './emoji/store.webp', './emoji/sun.webp', './emoji/tag.webp', './emoji/target.webp', './emoji/timer.webp', './emoji/tree.webp', './emoji/trend.webp', './emoji/trenddown.webp', './emoji/trophy.webp', './emoji/user.webp', './emoji/users.webp', './emoji/utensils.webp', './emoji/walk.webp', './emoji/wallet.webp', './emoji/watch.webp', './emoji/waves.webp', './emoji/wheat.webp', './emoji/zap.webp'];

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

// Minimal look: just the short message in bold; iPhone adds "from <app name>" below it by itself
const DEFAULT_TEXTS = { burn: 'Calories burned today?', weight: 'Weekly weigh-in', checkin: 'Your weekly check-in is ready 📊',
  fastOpen: 'Your eating window is open now ⏱️', fastClose: 'Your eating window closes in 30 min ⏱️', habit: 'Remember your habit plan 🎯',
  water1: 'Time for a glass of water 💧', water2: 'Halfway through the day: a glass of water? 💧', water3: 'A few more glasses to reach your water goal 💧' };
function content(R, kind) {
  const v = R && R[kind];
  return { body: '', title: typeof v === 'string' ? v : v && v.title ? v.title.replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '') : DEFAULT_TEXTS[kind] };
}

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch {}
  const kind = DEFAULT_TEXTS[data.open] ? data.open : 'burn';
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
