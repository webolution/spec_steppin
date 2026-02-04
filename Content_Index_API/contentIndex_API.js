// HELPER: Simple logger for the demo
const log = (msg) => {
	const logEl = document.getElementById('logs');
	logEl.textContent += `> ${msg}\n`;
	console.log(msg);
};

// 1. REGISTER SERVICE WORKER
const init = async () => {
	if (!('serviceWorker' in navigator)) {
		document.getElementById('status').textContent =
			'Service Worker not supported.';
		return;
	}

	try {
		const registration = await navigator.serviceWorker.register('sw.js');
		await navigator.serviceWorker.ready;

		// 2. FEATURE DETECTION
		if (!('index' in registration)) {
			document.getElementById('status').textContent =
				'Content Index API NOT supported in this browser.';
			return;
		}

		document.getElementById('status').textContent = 'Ready. API Supported.';
		document.getElementById('controls').style.display = 'block';

		document.getElementById('btn-add').onclick = () => addToIndex(registration);
		document.getElementById('btn-check').onclick = () =>
			checkIndex(registration);
		document.getElementById('btn-remove').onclick = () =>
			removeFromIndex(registration);
	} catch (error) {
		console.error('SW Registration failed', error);
	}
};

// 3. ADDING CONTENT TO THE INDEX
const addToIndex = async (registration) => {
	try {
		await registration.index.add({
			// Unique ID for this item
			id: 'article-123',

			// The URL to launch. Must match the cached file.
			url: './article.html',

			// Display metadata
			title: 'Offline Article Demo',
			description:
				'A sample article demonstrating offline content indexing capabilities.',
			category: 'article',

			icons: [
				{
					src: './icon.svg', // Points to local file
					sizes: '128x128',
					type: 'image/svg+xml' // Correct MIME type for SVG
				}
			]
		});
		log('Success: "article-123" added to Content Index.');
	} catch (e) {
		log(`Error adding to index: ${e.message}`);
	}
};

// 4. RETRIEVING INDEXED CONTENT
const checkIndex = async (registration) => {
	const entries = await registration.index.getAll();
	log(`Current Index Count: ${entries.length}`);

	for (const entry of entries) {
		log(` - Found: ${entry.title} (ID: ${entry.id})`);
	}
};

// 5. REMOVING CONTENT
const removeFromIndex = async (registration) => {
	await registration.index.delete('article-123');
	log('Success: "article-123" removed from Content Index.');
};

init();
