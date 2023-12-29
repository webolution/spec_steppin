console.log('ServiceWorker already activated');

if ('SyncManager' in window) {
	console.log('Background Sync API is available');
} else {
	console.log('Background Sync API is not available');
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('sw.js')
		.then((registration) => {
			console.log(
				'ServiceWorker registration successful with scope: ',
				registration
			);

			// Wait for the service worker to be installed
			if (registration.installing) {
				registration.installing.onstatechange = function () {
					if (this.state === 'activated') {
						console.log('ServiceWorker activated');
						// Check if the browser supports the Background Sync API
						if ('sync' in registration) {
							// Register a sync event with a specific tag
							registration.sync
								.register('mySyncTag')
								.then(() => {
									console.log('Sync event registered');
								})
								.catch((error) => {
									console.error('Sync event registration failed:', error);
								});
						} else {
							console.log('Background Sync API is not supported');
						}
					}
				};
			} else if (registration.active) {
				console.log('ServiceWorker already activated');
				// You can register your sync event here as well
			}
		})
		.catch((error) => {
			console.error('ServiceWorker registration failed: ', error);
		});
} else {
	console.log('Service workers are not supported.');
}
