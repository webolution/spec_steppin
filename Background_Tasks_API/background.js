// Get references to the start button and log div from the DOM
const startButton = document.querySelector('#startButton');
const logDiv = document.querySelector('#log');

// Initialize a flag to track if the idle callback is canceled
let isIdleCallbackCanceled = false;

// Define a function to simulate a time-consuming task
const performTask = () => {
	// Append a text node and a line break to the log div to indicate the start of the task
	logDiv.appendChild(document.createTextNode('Performing background task...'));
	logDiv.appendChild(document.createElement('br'));

	// Simulate a delay of 3 seconds
	const endTime = Date.now() + 3000;
	while (Date.now() < endTime) {}

	// Append a text node and a line break to the log div to indicate the end of the task
	logDiv.appendChild(document.createTextNode('Background task completed!'));
	logDiv.appendChild(document.createElement('br'));
};

// Define a function to handle the idle callback
const handleIdleCallback = (deadline) => {
	// While there is time remaining in the idle period, the start button is disabled, and the idle callback has not been canceled
	while (
		deadline.timeRemaining() > 0 &&
		startButton.disabled &&
		!isIdleCallbackCanceled
	) {
		// Perform the background task
		performTask();
	}

	// If the start button is not disabled and the idle callback has not been canceled
	if (!startButton.disabled && !isIdleCallbackCanceled) {
		// Append a text node and a line break to the log div to indicate that the idle callback has been canceled
		logDiv.appendChild(document.createTextNode('Idle callback canceled.'));
		logDiv.appendChild(document.createElement('br'));
	}
};

// Add an event listener to the start button for the click event
startButton.addEventListener('click', () => {
	// Disable the start button
	startButton.disabled = true;
	// Append a text node and a line break to the log div to indicate that the background task has started
	logDiv.appendChild(document.createTextNode('Background task started.'));
	logDiv.appendChild(document.createElement('br'));

	// Request an idle callback and store the handle in idleCallbackHandle
	const idleCallbackHandle = window.requestIdleCallback(handleIdleCallback);

	// After 5 seconds
	setTimeout(() => {
		// Enable the start button
		startButton.disabled = false;
		// Set the flag to cancel the idle callback
		isIdleCallbackCanceled = true;
		// Cancel the idle callback
		window.cancelIdleCallback(idleCallbackHandle);
		// If the start button is not disabled and the idle callback has been canceled
		if (!startButton.disabled && isIdleCallbackCanceled) {
			// Append a text node and a line break to the log div to indicate that the idle callback has been canceled
			logDiv.appendChild(document.createTextNode('Idle callback canceled.'));
			logDiv.appendChild(document.createElement('br'));
		}
	}, 5000);
});
