// Check if the service worker API is available
if ('serviceWorker' in navigator) {
	// Register the service worker
	navigator.serviceWorker.register('sw.js').then(
		function (registration) {
			console.log(
				'ServiceWorker registration successful with scope: ',
				registration.scope
			);

			// Check if the BackgroundFetchManager is available in the global scope
			if (!('BackgroundFetchManager' in self)) {
				// If it's not available, log a message to the console
				console.log('The Background Fetch API is not available');
			} else {
				// If it is available, log a message to the console
				console.log('The Background Fetch API IS available');
				// Wait for the service worker to be ready
				navigator.serviceWorker.ready.then(async (swReg) => {
					// Start a background fetch with the id 'my-fetch'
					// This fetch will attempt to download the files at the URLs below'
					const bgFetch = await swReg.backgroundFetch.fetch(
						'my-fetch',
						['groovin.wav', 'podcast_mic.jpg'],
						{
							// Provide some metadata for the fetch
							title: 'Episode 501: Code Stuff.',
							icons: [
								{
									sizes: '300x300',
									src: 'podcast_mic.jpg',
									type: 'image/jpg'
								}
							],
							// The total download size in bytes (22MB in this case)
							// This is used to provide a progress indicator for the fetch
							downloadTotal: 23048115
						}
					);

					// Function to update the progress bar
					const updateProgressBar = () => {
						if (bgFetch.downloaded && bgFetch.downloadTotal) {
							const progress = bgFetch.downloaded / bgFetch.downloadTotal;
							document.getElementById('progress-bar').style.width = `${
								progress * 100
							}%`;
						}
					};
					// Update the progress bar in response to a user action
					document
						.getElementById('check-progress-button')
						.addEventListener('click', updateProgressBar);
				});
			}
		},
		function (err) {
			// registration failed :(
			console.log('ServiceWorker registration failed: ', err);
		}
	);
} else {
	console.log('Service workers are not supported by this browser');
}
