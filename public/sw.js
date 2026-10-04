// Service Worker Dasar Griya Barokah Homestay PWA
const CACHE_NAME = 'griya-barokah-pwa-v1';

// Install event: Mengaktifkan service worker secara cepat
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: Mengambil kontrol halaman secara langsung
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event: Network-first untuk memenuhi kriteria teknis PWA browser
self.addEventListener('fetch', (event) => {
  // Hanya proses request GET yang valid
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
