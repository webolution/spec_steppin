document.addEventListener('DOMContentLoaded', () => {
	const iframe = document.getElementById('my-iframe');
	const messageInput = document.getElementById('message-input');
	const sendMessageBtn = document.getElementById('send-message-btn');
	const messageDisplay = document.getElementById('message-display');

	// 1. Create a new MessageChannel. This gives us two connected ports.
	const channel = new MessageChannel();
	const port1 = channel.port1;

	// 2. Wait for the iframe to load before we try to communicate with it.
	iframe.addEventListener('load', () => {
		console.log('Main: Iframe loaded. Transferring port2.');
		// 3. Transfer port2 to the iframe. This is the crucial step.
		//    The first argument is the message, the second is the target origin ('*' for any),
		//    and the third is an array of objects to transfer.
		iframe.contentWindow.postMessage('init', '*', [channel.port2]);
	});

	// 4. Listen for messages coming back from the iframe on our port (port1).
	port1.onmessage = (event) => {
		console.log('Main: Message received from iframe:', event.data);
		messageDisplay.textContent = `From Iframe: ${event.data}`;
	};

	// 5. Add a click listener to send messages to the iframe via port1.
	sendMessageBtn.addEventListener('click', () => {
		const message = messageInput.value;
		if (message) {
			console.log('Main: Sending message to iframe:', message);
			port1.postMessage(message);
			messageInput.value = '';
		}
	});
});
