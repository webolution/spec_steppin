// Create a new BroadcastChannel object
// This allows communication between different documents (tabs, windows, iframes, etc) of the same origin
const channel = new BroadcastChannel('channel');

// Set up an event listener for messages received on the channel
channel.onmessage = (event) => {
	// Get the div where we will display the messages
	const messageDiv = document.getElementById('messageDiv');
	// Append the received message to the div, followed by a line break
	messageDiv.innerHTML += event.data + '<br>';
};

// Get the 'send' button and set up a click event listener
document.getElementById('send').addEventListener('click', () => {
	// Get the input textarea where the user types their message
	const input = document.getElementById('input');
	// Get the message from the textarea
	const message = input.value;
	// Send the message on the channel
	channel.postMessage(message);
	// Clear the textarea ready for the next message
	input.value = '';
});
