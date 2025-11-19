// =========================================
// FilmChiinn — Auto-Version Cache System
// هیچ نسخه‌ای را لازم نیست دستی تغییر دهید
// =========================================

const CORE_ASSETS = [
  '/',                // root
  '/index.html',
  '/style.css',
  '/script.js',
  '/images/icons8-menu-64.png',
  '/images/icons8-user-96.png',
  '/images/icons8-back-to-64.png',
  '/images/icons8-next-page-64.png',
  '/IRANSansWeb(FaNum)_Light.woff',
  '/Product Sans Bold.ttf',
  '/Product Sans Regular.ttf',
];

// نسخه از روی زمان ساخته می‌شود — همیشه جدید
const CACHE_VERSION = `fc-cache-${Date.now()}`;


// ======================
// INSTALL → کش اولیه
// ======================
self.addEventListener('install', (event) => {
  self.skipWaiting(); // فوراً فعال شو

  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});


// ======================
// ACTIVATE → حذف کش‌های قدیمی
// ======================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim(); // بدون ریفرش فعال شو
});


// ======================
// FETCH STRATEGY
// شبکه → کش (Network First)
// ======================
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // فقط GET و فایل‌های سایت
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then(networkRes => {
        // موفق شد → ذخیره در کش
        caches.open(CACHE_VERSION).then(cache => {
          cache.put(req, networkRes.clone());
        });
        return networkRes;
      })
      .catch(() =>
        // اگر شبکه قطع شد → از کش بخوان
        caches.match(req).then(res => res || caches.match('/index.html'))
      )
  );
});
