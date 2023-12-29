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

// Listen for the sync event
self.addEventListener('sync', (event) => {
	if (event.tag === 'mySyncTag') {
		event.waitUntil(doBackgroundSync());
	}
});

// Perform background sync
const doBackgroundSync = async () => {
	// Open the IndexedDB database
	const db = await idb.openDB('podcasts-store', 1, {
		upgrade(db) {
			db.createObjectStore('newPodcasts', {
				autoIncrement: true,
				keyPath: 'id'
			});
			db.createObjectStore('completedPodcasts', {
				autoIncrement: true,
				keyPath: 'id'
			});
		}
	});

	// Get all the completed podcasts
	const completedPodcasts = await db.getAll('completedPodcasts');

	// For each completed podcast...
	for (const podcast of completedPodcasts) {
		// Try to delete the podcast from the server
		const response = await fetch(`/api/podcasts/${podcast.id}`, {
			method: 'DELETE'
		});

		// If the podcast was deleted successfully...
		if (response.ok) {
			// Delete the podcast from the completedPodcasts store
			await db.delete('completedPodcasts', podcast.id);
		} else {
			// If the podcast wasn't deleted successfully, throw an error to trigger a retry
			throw new Error('Failed to delete podcast');
		}
	}

	// Try to get new podcasts from the server
	const response = await fetch('/api/podcasts/new', {
		method: 'GET'
	});

	// If the request was successful...
	if (response.ok) {
		// Get the new podcasts
		const newPodcasts = await response.json();

		// For each new podcast...
		for (const podcast of newPodcasts) {
			// Add the podcast to the newPodcasts store
			await db.add('newPodcasts', podcast);
		}
	} else {
		// If the request wasn't successful, throw an error to trigger a retry
		throw new Error('Failed to get new podcasts');
	}
};
