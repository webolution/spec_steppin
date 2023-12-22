const version = '1.0.0';
const staticCache = `static-${version}`;
const dynamicCache = `dynamic-${version}`;

addEventListener('install', (event) => {
	skipWaiting();

	event.waitUntil(
		(async function () {
			const cache = await caches.open(staticCache);
			await cache.addAll([
				'index.html',
				'background.js',
				'style.css',
				'podcast_mic.jpg'
			]);
		})()
	);
});

addEventListener('activate', (event) => {
	event.waitUntil(
		(async function () {
			// Remove old caches
			for (const cacheName of await caches.keys()) {
				if (
					!cacheName.startsWith('podcast-') &&
					cacheName !== staticCache &&
					cacheName !== dynamicCache
				) {
					await caches.delete(cacheName);
				}
			}
		})()
	);
});

addEventListener('fetch', (event) => {
	event.respondWith(
		(async function () {
			try {
				// Try to get the response from the network
				const networkResponse = await fetch(event.request);
				// If we got a response, put a copy in the dynamic cache and return the response
				const cache = await caches.open(dynamicCache);
				cache.put(event.request, networkResponse.clone());
				return networkResponse;
			} catch {
				// If the network fails, try to get the response from the cache
				const cachedResponse = await caches.match(event.request);
				// If that fails, return the offline page
				return cachedResponse;
			}
		})()
	);
});
