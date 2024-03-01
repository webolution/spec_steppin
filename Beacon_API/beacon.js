// Check if the Beacon API is supported by the browser
if (navigator && navigator.sendBeacon) {
	// Create a data object to send with the beacon request
	let data = {
		userId: 123,
		event: 'click',
		timestamp: Date.now()
	};

	// Convert the data object to a string
	let dataString = JSON.stringify(data);

	// Send the beacon request with the data
	navigator.sendBeacon('http://localhost:3000/analytics', dataString);

	console.log('Beacon request sent successfully!');
} else {
	console.log('Beacon API is not supported by the browser.');
}
