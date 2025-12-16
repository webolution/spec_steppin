// --- DOM Element References ---
// Get references to the HTML elements where we will display information.
const apiSupportEl = document.querySelector('#api-support');
const currentPostureEl = document.querySelector('#current-posture');
const postureLogEl = document.querySelector('#posture-log');

// --- Helper Functions ---

/**
 * Adds a new entry to the posture change log.
 * @param {string} message - The message to log.
 */
function logPostureChange(message) {
	const listItem = document.createElement('li');
	// Prepend a timestamp to each log entry for clarity.
	listItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
	// Add new log entries to the top of the list.
	if (postureLogEl.firstChild) {
		postureLogEl.insertBefore(listItem, postureLogEl.firstChild);
	} else {
		postureLogEl.appendChild(listItem);
	}
}

/**
 * Updates the UI with the current device posture.
 * @param {string} postureType - The current posture type ('continuous' or 'folded').
 */
function updateUI(postureType) {
	currentPostureEl.textContent = postureType;

	// Update the body class to apply posture-specific styles if defined in CSS.
	document.body.classList.remove('posture-continuous', 'posture-folded');
	document.body.classList.add(`posture-${postureType}`);

	logPostureChange(`Posture changed to: ${postureType}`);
}

// --- Main Logic ---

// Check if the Device Posture API is supported by the browser.
// The API is exposed via `navigator.devicePosture`.
if ('devicePosture' in navigator) {
	apiSupportEl.textContent = 'Supported';
	apiSupportEl.style.color = 'green'; // Visual indicator for support

	const devicePosture = navigator.devicePosture;

	// Get the initial posture and update the UI.
	updateUI(devicePosture.type);

	// Add an event listener to react to posture changes.
	// The 'change' event fires whenever the device's physical posture changes.
	devicePosture.addEventListener('change', () => {
		updateUI(devicePosture.type);
	});

	logPostureChange('Device Posture API initialized and listening for changes.');
	logPostureChange(`Initial posture: ${devicePosture.type}`);
} else {
	// If the API is not supported, inform the user.
	apiSupportEl.textContent = 'Not Supported';
	apiSupportEl.style.color = 'red'; // Visual indicator for lack of support
	currentPostureEl.textContent = 'N/A (API not supported)';
	logPostureChange(
		'Device Posture API is not supported in this browser/environment.'
	);
}
