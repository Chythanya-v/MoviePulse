const CACHE_NAME = 'moviepulse-cache-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    OFFLINE_URL,
    '/icons/icon-192.svg',
    '/icons/icon-512.svg',
    '/favicon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;

    // For navigation requests, try network first, fallback to offline page
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    return response;
                })
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // For other requests, try cache first, then network
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request)
                .then(resp => {
                    // Cache successful GET responses
                    if (request.method === 'GET' && resp && resp.status === 200) {
                        const respClone = resp.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, respClone));
                    }
                    return resp;
                })
                .catch(() => {
                    // If request is for an image, return a placeholder (optional)
                    if (request.destination === 'image') {
                        return caches.match('/icons/icon-192.svg');
                    }
                });
        })
    );
});
