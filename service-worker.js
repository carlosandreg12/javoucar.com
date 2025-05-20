const CACHE_NAME = 'javoucar-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/script.js',
  '/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/notification.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Modificar para lidar melhor com dados dinâmicos
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrou no cache e não é uma requisição de API, retorna do cache
        if (response && !event.request.url.includes('/api/')) {
          return response;
        }
        
        // Se não encontrou no cache ou é uma requisição de API, faz o fetch
        return fetch(event.request).then(response => {
          // Não fazer cache de requisições de API
          if (!event.request.url.includes('/api/')) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          }
          return response;
        });
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