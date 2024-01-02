document.querySelector('#connectButton').addEventListener('click', function () {
	if ('bluetooth' in navigator) {
		console.log('Bluetooth API is supported');

		navigator.bluetooth
			.requestDevice({ acceptAllDevices: true })
			.then((device) => {
				console.log('Device found: ' + device.name);
				// Connect to the device
				return device.gatt.connect();
			})
			.then((server) => {
				console.log('Connected to: ' + server.device.name);
				// You can interact with the Bluetooth device here
			})
			.catch((error) => {
				console.log('Bluetooth error: ' + error);
			});
	} else {
		console.log('Bluetooth API is not supported');
	}
});
