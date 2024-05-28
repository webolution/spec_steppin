// Create a new BroadcastChannel object
// This allows communication between different documents (tabs, windows, iframes, etc) of the same origin
const channel = new BroadcastChannel('channel');

// Set up an event listener for messages received on the channel
channel.onmessage = (event) => {
	// Get the div where we will display the messages
	const messageDiv = document.querySelector('#messageDiv');
	// Append the received message to the div, followed by a line break
	let textNode = document.createTextNode(event.data);
	let breakNode = document.createElement('br');

	messageDiv.appendChild(textNode);
	messageDiv.appendChild(breakNode);
};

// Get the 'send' button and set up a click event listener
document.querySelector('#send').addEventListener('click', () => {
	// Get the input textarea where the user types their message
	const input = document.querySelector('#input');
	// Get the message from the textarea
	const message = input.value;
	// Send the message on the channel
	channel.postMessage(message);
	// Clear the textarea ready for the next message
	input.value = '';
});
