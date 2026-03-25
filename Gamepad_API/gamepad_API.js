/**
 * Gamepad API Demo (Spec Steppin')
 *
 * Key concepts for the recording:
 * - window.addEventListener("gamepadconnected") detects new controllers
 * - window.addEventListener("gamepaddisconnected") detects removals
 * - navigator.getGamepads() grabs the current state of all controllers
 * - Gamepads are NOT event-driven for button presses; you must poll them
 *   (usually via requestAnimationFrame)
 */

const logEl = document.querySelector('#log');
const statusVal = document.querySelector('#statusVal');
const btnSimulateConnect = document.querySelector('#btnSimulateConnect');
const btnSimulateDisconnect = document.querySelector('#btnSimulateDisconnect');
const btnSimulatePress = document.querySelector('#btnSimulatePress');

let pollingInterval = null;
let buttonPressTimeout = null;

// Logging utility to display messages in the UI with timestamps and optional styling
const log = (message, { type = 'info' } = {}) => {
	const prefix = `[${new Date().toLocaleTimeString()}] `;
	const div = document.createElement('div');
	div.textContent = prefix + message;

	if (type === 'error') div.style.color = 'var(--danger)';
	if (type === 'success') div.style.color = 'var(--accent)';

	logEl.appendChild(div);
	logEl.scrollTop = logEl.scrollHeight;
};

// ==========================================
// 1. NATIVE GAMEPAD API IMPLEMENTATION
// ==========================================

// Listen for connections
window.addEventListener('gamepadconnected', (e) => {
	log(`gamepadconnected → Index ${e.gamepad.index}: ${e.gamepad.id}`);
	statusVal.textContent = 'Connected';
	statusVal.style.color = 'var(--accent)';
	btnSimulatePress.disabled = false; // Enable our mock press button

	// Start polling the gamepad state every frame
	pollGamepads();
});

// Listen for disconnections
window.addEventListener('gamepaddisconnected', (e) => {
	log(`gamepaddisconnected → Removed controller at index ${e.gamepad.index}`, {
		type: 'error'
	});
	statusVal.textContent = 'Disconnected';
	statusVal.style.color = 'var(--text)';
	btnSimulatePress.disabled = true; // Disable our mock press button

	// Stop polling to save resources
	if (pollingInterval) {
		cancelAnimationFrame(pollingInterval);
	}
});

// A flag to prevent spamming the log on every animation frame
let isButtonAPressed = false;

// The Polling Loop: This is how we actually read button presses
const pollGamepads = () => {
	const gamepads = navigator.getGamepads();
	const pad = gamepads[0];

	if (pad && pad.connected) {
		// Checking if Button 0 (usually "A" or "Cross") is pressed
		if (pad.buttons[0]?.pressed) {
			if (!isButtonAPressed) {
				log('🔘 Button 0 ("A") was PRESSED!', { type: 'success' });
				isButtonAPressed = true;
			}
		} else {
			if (isButtonAPressed) {
				log('🔘 Button 0 ("A") was RELEASED.');
				isButtonAPressed = false;
			}
		}
	}

	// Loop again on the next animation frame
	pollingInterval = requestAnimationFrame(pollGamepads);
};

// ==========================================
// 2. MOCKING LOGIC FOR THE DEMO
// ==========================================

// Create a realistic mock gamepad object based on the standard layout
const mockGamepad = {
	id: "Spec Steppin' Virtual Controller",
	index: 0,
	connected: true,
	timestamp: performance.now(),
	mapping: 'standard',
	axes: [0, 0, 0, 0],
	buttons: Array.from({ length: 17 }, () => ({
		pressed: false,
		touched: false,
		value: 0
	}))
};

// Plug In
btnSimulateConnect.addEventListener('click', () => {
	navigator.getGamepads = () => [mockGamepad, null, null, null];
	const event = new Event('gamepadconnected');
	event.gamepad = mockGamepad;
	window.dispatchEvent(event);
});

// Unplug
btnSimulateDisconnect.addEventListener('click', () => {
	navigator.getGamepads = () => [null, null, null, null];
	const event = new Event('gamepaddisconnected');
	const disconnectedMock = { ...mockGamepad, connected: false };
	event.gamepad = disconnectedMock;
	window.dispatchEvent(event);
});

// Simulate pressing the "A" button
btnSimulatePress.addEventListener('click', () => {
	if (!mockGamepad.connected) return;

	// Simulate holding the button down
	mockGamepad.buttons[0].pressed = true;
	mockGamepad.buttons[0].value = 1.0;
	mockGamepad.timestamp = performance.now(); // Optional: Update the timestamp

	// Automatically release it after 1 second
	clearTimeout(buttonPressTimeout);
	buttonPressTimeout = setTimeout(() => {
		mockGamepad.buttons[0].pressed = false;
		mockGamepad.buttons[0].value = 0;
		mockGamepad.timestamp = performance.now();
	}, 1000);
});
