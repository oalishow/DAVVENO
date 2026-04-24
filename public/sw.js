const CACHE_NAME = 'verify-id-v4'; // Bumped version to refresh cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Add Push Listener for PWA Notifications and App Badging
self.addEventListener('push', (event) => {
  let data = { title: "DAVVERO-ID", message: "Nova notificação recebida.", unreadCount: 1 };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message,
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: data,
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title, options),
      'setAppBadge' in navigator 
        ? navigator.setAppBadge(data.unreadCount) 
        : Promise.resolve()
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If window open, focus it
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      } else {
        // Otherwise open it
        return clients.openWindow('/');
      }
    })
  );
});
