document.addEventListener('DOMContentLoaded', () => {
	const messageInput = document.getElementById('message-input');
	const sendMessageBtn = document.getElementById('send-message-btn');
	const messageDisplay = document.getElementById('message-display');
	let port2; // This will hold the port transferred from the main page.

	// 1. Listen for the initial message from the main window.
	window.addEventListener('message', (event) => {
		// We only want to handle the 'init' message once to get the port.
		if (event.data === 'init' && event.ports[0]) {
			console.log('Iframe: Port received from main page.');

			// 2. Grab the port from the event.
			port2 = event.ports[0];

			// 3. Set up a listener on this port to receive subsequent messages.
			port2.onmessage = (portEvent) => {
				console.log('Iframe: Message received from main page:', portEvent.data);
				messageDisplay.textContent = `From Main: ${portEvent.data}`;
			};

			// Optional: Send a confirmation message back to the main page.
			port2.postMessage('Hello from the iframe! We are connected.');
		}
	});

	// 4. Add a click listener to send messages back to the main page via port2.
	sendMessageBtn.addEventListener('click', () => {
		const message = messageInput.value;
		if (message && port2) {
			console.log('Iframe: Sending message to main page:', message);
			port2.postMessage(message);
			messageInput.value = '';
		}
	});
});
