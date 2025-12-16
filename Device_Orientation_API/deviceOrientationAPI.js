// Demo script for DeviceOrientation events
// This script enables web pages to react to a device's physical orientation (tilt, rotation)
// and visualizes it using a 3D CSS cube.
//
// Key functionalities:
// - Feature-detects browser support for Device Orientation events.
// - Implements the necessary permission flow for iOS Safari (requires user gesture).
// - Smooths raw sensor values using a low-pass filter for a more fluid visual experience.
// - Applies the smoothed orientation values to a 3D CSS cube for real-time visualization.
// - Displays raw and processed sensor data numerically on the page.

// --- DOM Element References ---
// Cache references to HTML elements that will be updated or interacted with.
const alphaEl = document.querySelector('#alpha'); // Span element to display the alpha (compass) value
const betaEl = document.querySelector('#beta'); // Span element to display the beta (front/back tilt) value
const gammaEl = document.querySelector('#gamma'); // Span element to display the gamma (left/right tilt) value
const etypeEl = document.querySelector('#etype'); // Span element to display the type of the last received event
const box = document.querySelector('#box'); // The 3D CSS cube element that will be rotated

// Button elements for controlling the demo and requesting permissions
const startBtn = document.querySelector('#startBtn'); // Button to start listening for orientation events
const stopBtn = document.querySelector('#stopBtn'); // Button to stop listening for orientation events
const requestPermissionBtn = document.querySelector('#requestPermissionBtn'); // Button for iOS permission request

// --- State Variables ---
let running = false; // A boolean flag indicating whether the orientation event listeners are active.
// Stores the last smoothed orientation values. Initialized to 0.
let last = { alpha: 0, beta: 0, gamma: 0 };
// Factor for the simple low-pass filter (smoothing). A value between 0 (no smoothing) and 1 (maximum smoothing).
// 0.2 means 20% of the new value is incorporated with 80% of the old value each update.
let smoothing = 0.2;
let rafId = null; // Stores the ID returned by requestAnimationFrame. Used to cancel the animation loop.
// Holds the most recent DeviceOrientationEvent object. Updated by handleOrientation, processed by updateFromLatest.
let latest = null;

// --- Feature Detection Functions ---

/**
 * Checks if the browser supports the Device Orientation API.
 * This is done by checking for the presence of 'DeviceOrientationEvent' in the window object.
 * @returns {boolean} True if supported, false otherwise.
 */
const supportsDeviceOrientation = () => {
	return 'DeviceOrientationEvent' in window;
};

/**
 * Checks if the browser requires explicit permission for Device Orientation events, typically on iOS Safari (13+).
 * This is detected by checking for the existence of the static method DeviceOrientationEvent.requestPermission.
 * @returns {boolean} True if iOS permission is needed, false otherwise.
 */
const needsIOSPermission = () => {
	return (
		typeof DeviceOrientationEvent !== 'undefined' &&
		typeof DeviceOrientationEvent.requestPermission === 'function'
	);
};

// --- iOS Permission Request Function ---

/**
 * Asynchronously requests permission to access device orientation events on iOS Safari.
 * This function must be called as a direct result of a user gesture (e.g., button click).
 * Upon success, it hides the permission request button and enables the start button.
 * @returns {Promise<boolean>} A promise that resolves to true if permission is granted, false otherwise.
 */
const requestIOSPermission = async () => {
	try {
		// Call the browser's native requestPermission method.
		const resp = await DeviceOrientationEvent.requestPermission();
		if (resp === 'granted') {
			// If permission is granted, hide the permission button and enable the start button.
			requestPermissionBtn.classList.add('hidden');
			startBtn.disabled = false;
			return true;
		} else {
			// If permission is denied, alert the user.
			alert('Permission denied for device orientation.');
			return false;
		}
	} catch (err) {
		// Log and alert any errors during the permission request.
		console.error('Permission error', err);
		alert('Permission API error — see console.');
		return false;
	}
};

// --- Event Handler ---

/**
 * Event handler for the 'deviceorientation' event.
 * This function is intentionally lightweight to avoid blocking the main thread.
 * It primarily stores the latest event data and updates the event type display.
 * The actual UI updates and smoothing are handled by the requestAnimationFrame loop.
 * @param {DeviceOrientationEvent} e The DeviceOrientationEvent object containing orientation data.
 */
const handleOrientation = (e) => {
	// Log the event to the console for debugging purposes, showing its raw data.
	// This helps confirm that events are being received and what their values are.
	console.log('Device orientation event received:', e);
	latest = e; // Store the event object to be processed by the animation loop.
	etypeEl.textContent = e.type || 'deviceorientation'; // Display the event type.
};

// --- UI Update and Smoothing Logic ---

/**
 * Applies a low-pass filter to the raw orientation values and updates the UI.
 * This function is called repeatedly by the requestAnimationFrame loop to ensure smooth animations.
 * It updates both the numeric display and the CSS transform of the 3D box.
 */
const updateFromLatest = () => {
	// If no new event data has been received yet, exit the function.
	if (!latest) return;

	// Extract raw alpha, beta, and gamma values from the latest event.
	// Use nullish coalescing (??) to default to 0 if any value is null/undefined (can happen in emulators).
	let a = latest.alpha ?? 0;
	let b = latest.beta ?? 0;
	let g = latest.gamma ?? 0;

	// Log raw values for debugging, showing what the event actually reported.
	// console.log('Raw event values (a, b, g):', a, b, g);

	// Apply a simple low-pass filter for smoothing:
	// new_value = old_value + (new_raw_value - old_value) * smoothing_factor
	// This makes the transition between values less abrupt, resulting in smoother visual movement.
	last.alpha = last.alpha + (a - last.alpha) * smoothing;
	last.beta = last.beta + (b - last.beta) * smoothing;
	last.gamma = last.gamma + (g - last.gamma) * smoothing;

	// Log smoothed values for debugging, showing the result of the filtering.
	// console.log('Smoothed values (last.alpha, last.beta, last.gamma):', last.alpha, last.beta, last.gamma);

	// Update the numeric readout on the page, rounding the smoothed values for cleaner display.
	alphaEl.textContent = Math.round(last.alpha);
	betaEl.textContent = Math.round(last.beta);
	gammaEl.textContent = Math.round(last.gamma);

	// Construct the CSS `transform` string to rotate the 3D box.
	// The order of rotations (Z, X, Y) is important for correct 3D interpretation.
	// - rotateZ uses inverted gamma (left/right tilt, provides roll effect).
	// - rotateX uses beta (front/back tilt, provides pitch effect).
	// - rotateY uses inverted alpha (compass heading, provides yaw effect). Alpha is inverted
	//   to match the common intuitive understanding of rotating an object based on compass.
	const transform = `rotateZ(${-last.gamma}deg) rotateX(${
		last.beta
	}deg) rotateY(${-last.alpha}deg)`;

	// Apply the computed transform to the 3D box's style.
	box.style.transform = transform;

	// Log the applied transform string for debugging, useful for checking CSS application.
	// console.log('Applied transform:', transform);
};

// --- Animation Loop ---

/**
 * The core animation loop using requestAnimationFrame (rAF).
 * This function continuously calls itself to synchronize UI updates with the browser's repaint cycle,
 * ensuring smooth and efficient animations.
 */
const loop = () => {
	updateFromLatest(); // Process the latest sensor data and update the UI.
	rafId = requestAnimationFrame(loop); // Request the next animation frame.
};

// --- Start/Stop Functions ---

/**
 * Initiates the Device Orientation demo.
 * It first checks for API support, then adds the event listener and starts the animation loop.
 */
const start = () => {
	// If Device Orientation API is not supported, alert the user and exit.
	if (!supportsDeviceOrientation()) {
		alert('DeviceOrientationEvent is not supported on this browser.');
		return;
	}

	// Add the 'deviceorientation' event listener to the window.
	// 'true' as the third argument means it listens during the capture phase, making it less likely
	// to be blocked by other scripts or prevent default actions.
	window.addEventListener('deviceorientation', handleOrientation, true);

	running = true; // Set the running flag.
	startBtn.disabled = true; // Disable the start button.
	stopBtn.disabled = false; // Enable the stop button.

	// Start the requestAnimationFrame loop if it's not already running.
	if (!rafId) loop();
};

/**
 * Stops the Device Orientation demo.
 * It removes the event listener and cancels the animation loop.
 */
const stop = () => {
	running = false; // Clear the running flag.
	startBtn.disabled = false; // Enable the start button.
	stopBtn.disabled = true; // Disable the stop button.
	// Remove the 'deviceorientation' event listener.
	window.removeEventListener('deviceorientation', handleOrientation, true);
	// If the animation loop is running, cancel it using its ID.
	if (rafId) {
		cancelAnimationFrame(rafId);
		rafId = null;
	}
	// Optionally reset the box's orientation to its default state when stopping.
	box.style.transform = 'none';
};

// --- Button Event Listeners ---

// Event listener for the "Start" button click.
startBtn.addEventListener('click', async () => {
	console.log('start button clicked'); // Log that the start button was clicked.
	// If iOS permission is needed, initiate the permission flow.
	if (needsIOSPermission()) {
		// Show the explicit permission button (it's initially hidden).
		requestPermissionBtn.classList.remove('hidden');
		// Call the permission request function. This must be a direct user gesture.
		const allowed = await requestIOSPermission();
		// If permission is not granted, stop here.
		if (!allowed) return;
	}
	// Once permissions are handled (or not needed), start the demo.
	start();
});

// Event listener for the "Stop" button click, simply calls the stop function.
stopBtn.addEventListener('click', stop);

// --- Initial Setup for iOS Permission Button ---

// If iOS permission is detected at page load, configure the permission button.
if (needsIOSPermission()) {
	requestPermissionBtn.classList.remove('hidden'); // Make the permission button visible.
	// Add an event listener to the permission button.
	requestPermissionBtn.addEventListener('click', async () => {
		await requestIOSPermission(); // Request permission when the button is clicked.
	});
	// Initially disable the Start button until permission is potentially granted via the explicit button.
	// This helps guide the user through the iOS permission flow.
	startBtn.disabled = true;
}

// --- Cleanup on Page Unload ---

// Add a 'pagehide' event listener to stop the demo when the page is unloaded or hidden.
// This is good practice to prevent unnecessary resource consumption.
window.addEventListener('pagehide', stop);
