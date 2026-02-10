// DOM References
const pipContent = document.querySelector('#pip-content');
const playerWrapper = document.querySelector('#player-wrapper');
const toggleBtn = document.querySelector('#toggle-pip-btn');
const timerDisplay = document.querySelector('#timer');

// State tracking
let pipWindow = null;
let seconds = 0;

// Simple Timer Logic (To prove interactivity works in PiP)
setInterval(() => {
	seconds++;
	const mins = Math.floor(seconds / 60)
		.toString()
		.padStart(2, '0');
	const secs = (seconds % 60).toString().padStart(2, '0');
	timerDisplay.textContent = `${mins}:${secs}`;
}, 1000);

// --- CORE API LOGIC ---

const togglePictureInPicture = async () => {
	// 1. Feature Detection
	if (!('documentPictureInPicture' in window)) {
		alert('Document Picture-in-Picture API is not supported in this browser.');
		return;
	}

	// 2. If PiP is already open, close it (Toggle behavior)
	if (pipWindow) {
		pipWindow.close();
		return;
	}

	try {
		// 3. Request the PiP Window
		// Note: This creates a blank window. We must populate it.
		pipWindow = await documentPictureInPicture.requestWindow({
			width: 340,
			height: 300
		});

		// 4. Style Handling (CRITICAL STEP)
		// PiP windows start with no CSS. We must copy styles from the main window.
		// We copy all CSSRules from standard stylesheets to the new window.
		[...document.styleSheets].forEach((styleSheet) => {
			try {
				const cssRules = [...styleSheet.cssRules]
					.map((rule) => rule.cssText)
					.join('');
				const style = document.createElement('style');
				style.textContent = cssRules;
				pipWindow.document.head.appendChild(style);
			} catch (e) {
				// Catch CORS errors for external stylesheets if necessary
				console.warn('Could not copy stylesheet:', e);
			}
		});

		// 5. Move the Content
		// We append the existing DOM element to the PiP body.
		// This preserves event listeners (like the Reset button).
		pipWindow.document.body.append(pipContent);

		// Update UI state in main window
		toggleBtn.textContent = 'Close PiP';

		// Show a placeholder in the main window so layout doesn't collapse
		const placeholder = document.createElement('div');
		placeholder.id = 'pip-placeholder';
		placeholder.className = 'pip-active-placeholder';
		placeholder.textContent = 'Timer active in Picture-in-Picture';
		playerWrapper.append(placeholder);

		// 6. Handle Closing (Restoration)
		// When user clicks 'X' on the PiP window, we must reclaim the DOM element.
		pipWindow.addEventListener('pagehide', (event) => {
			// Remove placeholder
			const ph = document.querySelector('#pip-placeholder');
			if (ph) ph.remove();

			// Move content back to main window
			playerWrapper.append(pipContent);

			// Reset State
			toggleBtn.textContent = 'Toggle PiP';
			pipWindow = null;
		});
	} catch (err) {
		console.error('Failed to open PiP window:', err);
	}
};

// Event Listener
toggleBtn.addEventListener('click', togglePictureInPicture);

// Reset Logic (proves JS execution context persists)
document.querySelector('#reset-btn').addEventListener('click', () => {
	seconds = 0;
	timerDisplay.textContent = '00:00';
});
