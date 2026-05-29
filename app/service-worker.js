const firebaseConfig = {
  apiKey: '__VITE_FIREBASE_API_KEY__',
  authDomain: '__VITE_FIREBASE_AUTH_DOMAIN__',
  projectId: '__VITE_FIREBASE_PROJECT_ID__',
  storageBucket: '__VITE_FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__VITE_FIREBASE_APP_ID__',
};

const hasValidFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => value && !String(value).startsWith('__VITE_'),
);

if (hasValidFirebaseConfig) {
  try {
    importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js');

    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const title =
        payload.notification?.title || payload.data?.title || 'Arcora reminder';
      const body =
        payload.notification?.body ||
        payload.data?.body ||
        'Open Arcora to review what needs attention.';
      const link = payload.fcmOptions?.link || payload.data?.link || '/reminders';
      const notificationTag =
        payload.data?.notificationId || payload.messageId || `arcora_${Date.now()}`;

      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: notificationTag,
        data: {
          link,
        },
      });
    });
  } catch (error) {
    console.warn('Arcora push messaging could not initialize in the service worker.', error);
  }
}

const PRECACHE_NAME = 'arcora-precache-v2';
const RUNTIME_CACHE_NAME = 'arcora-runtime-v2';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-192x192.png',
  '/icons/maskable-icon-512x512.png',
];

const toOriginPath = (value) => new URL(value, self.location.origin).pathname;

const extractCoreAssetPaths = async () => {
  try {
    const response = await fetch('/index.html', { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const assetPaths = new Set();

    for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
      const rawValue = match[1];
      if (!rawValue || rawValue.startsWith('http') || rawValue.startsWith('data:')) {
        continue;
      }

      const assetPath = toOriginPath(rawValue);
      if (
        assetPath.startsWith('/assets/') ||
        assetPath.startsWith('/icons/') ||
        assetPath === '/manifest.json'
      ) {
        assetPaths.add(assetPath);
      }
    }

    return [...assetPaths];
  } catch (error) {
    console.warn('Arcora service worker could not inspect index.html for precache assets.', error);
    return [];
  }
};

const precacheAppShell = async () => {
  const cache = await caches.open(PRECACHE_NAME);
  const urlsToCache = new Set(APP_SHELL_URLS);
  const assetPaths = await extractCoreAssetPaths();

  assetPaths.forEach((path) => urlsToCache.add(path));

  await Promise.all(
    [...urlsToCache].map(async (url) => {
      try {
        await cache.add(url);
      } catch (error) {
        console.warn(`Arcora service worker could not precache ${url}.`, error);
      }
    }),
  );
};

const getOfflineDocumentResponse = async () => {
  const cachedShell =
    (await caches.match('/index.html')) ||
    (await caches.match('/'));

  if (cachedShell) {
    return cachedShell;
  }

  return new Response(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Arcora Offline</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#050816;color:rgba(255,255,255,.86);font-family:Inter,ui-sans-serif,system-ui,sans-serif;padding:24px;text-align:center}main{max-width:420px}p{color:rgba(255,255,255,.72);line-height:1.6}</style></head><body><main><h1>Arcora is offline</h1><p>Your latest app shell is not cached yet. Reconnect once to load Arcora fully for offline access.</p></main></body></html>',
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  );
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await precacheAppShell();
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((cacheKey) => ![PRECACHE_NAME, RUNTIME_CACHE_NAME].includes(cacheKey))
          .map((cacheKey) => caches.delete(cacheKey)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  // Leave localhost APIs, cross-origin requests, and non-GET calls alone.
  // Those should hit the network directly and should not fail through the PWA worker.
  if (request.method !== 'GET') return;
  if (requestUrl.origin !== self.location.origin) return;

  const isNavigationRequest =
    request.mode === 'navigate' || request.destination === 'document';
  const isStaticAssetRequest =
    requestUrl.pathname.startsWith('/assets/') ||
    requestUrl.pathname.startsWith('/icons/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    requestUrl.pathname === '/manifest.json';

  if (isNavigationRequest) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);

          if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE_NAME);
            await cache.put('/index.html', networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          return getOfflineDocumentResponse();
        }
      })(),
    );
    return;
  }

  if (isStaticAssetRequest) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        const networkFetch = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse.ok) {
              const cache = await caches.open(RUNTIME_CACHE_NAME);
              await cache.put(request, networkResponse.clone());
            }

            return networkResponse;
          });

        if (cachedResponse) {
          event.waitUntil(networkFetch.catch(() => {}));
          return cachedResponse;
        }

        try {
          return await networkFetch;
        } catch (error) {
          return cachedResponse || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch (error) {
        return (await caches.match(request)) || Response.error();
      }
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const destination = event.notification?.data?.link || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(destination);
          }

          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(destination);
      }

      return undefined;
    }),
  );
});
