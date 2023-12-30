// Check if the Badging API is supported by the browser
if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
	// Get a reference to the button from the DOM
	const setBadgeButton = document.querySelector('#setBadge');
	const clearBadgeButton = document.querySelector('#clearBadge');

	// Add an event listener to the setBadgeButton for the click event
	setBadgeButton.addEventListener('click', () => {
		// Check if the Badging API is supported by the browser
		if ('setAppBadge' in navigator) {
			// Update the badge count to 5
			navigator
				.setAppBadge(5)
				.then(() => {
					console.log('Badge count updated successfully.');
				})
				.catch((error) => {
					console.error('Error updating badge count:', error);
				});
		} else {
			console.warn('Badging API is not supported in this browser.');
		}
	});

	// Add an event listener to the clearBadgeButton for the click event
	clearBadgeButton.addEventListener('click', () => {
		// Clear the badge count
		navigator
			.clearAppBadge()
			.then(() => {
				console.log('Badge count cleared successfully.');
			})
			.catch((error) => {
				console.error('Error clearing badge count:', error);
			});
	});
} else {
	console.warn('Badging API is not supported in this browser.');
}
