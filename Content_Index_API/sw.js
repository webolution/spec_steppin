// Standard cache setup
self.addEventListener('install', (event) => {
	// In a real app, you MUST cache the URL you intend to index.
	// The browser may refuse to index content if it detects it isn't cached.
	const urlsToCache = [
		'./',
		'./index.html',
		'./contentIndex_API.js',
		'./article.html',
		'./icon.svg'
	];

	event.waitUntil(
		caches.open('demo-cache-v1').then((cache) => {
			return cache.addAll(urlsToCache);
		})
	);
	self.skipWaiting();
});

// 6. HANDLING SYSTEM DELETION
// This event fires if the USER deletes the content from the
// Browser/System UI (not from your web app's UI).
self.addEventListener('contentdelete', (event) => {
	console.log(`Content deleted by user: ${event.id}`);

	// Use this opportunity to clean up related cache data
	event.waitUntil(
		caches.open('demo-cache-v1').then((cache) => {
			// Example: If the user deletes the index entry,
			// we might want to remove the actual file from cache.
			// return cache.delete('/article.html');
		})
	);
});
