// Gizmo Portal Service Worker - Offline Caching & Outside-the-App Notifications

const CACHE_NAME = 'gizmo-portal-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// 1. Install & Cache static core
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Ignore individual asset failures during dev
      });
    })
  );
});

// 2. Activate & Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Handle Fetch (Network-First strategy for live data, fallback to Cache)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  
  // Skip non-http/https
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/');
        });
      })
  );
});

// 4. Handle Notification Click Outside the App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const targetRoute = notificationData.targetRoute || 'admin-dashboard';
  const targetId = notificationData.relatedEntityId || notificationData.targetId || '';
  const subEntityId = notificationData.subEntityId || '';

  // Build target URL parameter
  let targetUrl = `/?route=${encodeURIComponent(targetRoute)}`;
  if (targetId) {
    targetUrl += `&targetId=${encodeURIComponent(targetId)}`;
  }
  if (subEntityId) {
    targetUrl += `&subEntityId=${encodeURIComponent(subEntityId)}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if Gizmo tab is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'GIZMO_NOTIFICATION_CLICK',
            payload: {
              targetRoute,
              targetId,
              subEntityId,
              notificationId: notificationData.id
            }
          });
          return client.focus();
        }
      }

      // If no open tab found, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 5. Handle Web Push Events (if push server configured)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Gizmo Design';
    const options = {
      body: data.message || data.body || 'New notification from Gizmo Portal',
      icon: data.icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [100, 50, 100],
      data: data.data || data,
      tag: data.tag || `gizmo-push-${Date.now()}`,
      renotify: true
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Push notification error:', err);
  }
});
