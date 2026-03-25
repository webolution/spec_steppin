/**
 * Fullscreen API quick demo
 *
 * - Element.requestFullscreen() to enter fullscreen (user gesture required in most browsers)
 * - Document.exitFullscreen() to leave fullscreen
 * - document.fullscreenElement tells you *which* element is fullscreen right now
 * - fullscreenchange fires on document when entering/exiting succeeds
 * - fullscreenerror fires when it fails (permissions, platform limitations, etc.)
 */

const stage = document.querySelector('#stage');
const toggleBtn = document.querySelector('#toggleBtn');
const exitBtn = document.querySelector('#exitBtn');
const clearLogBtn = document.querySelector('#clearLogBtn');
const enabledVal = document.querySelector('#enabledVal');
const elementVal = document.querySelector('#elementVal');
const eventVal = document.querySelector('#eventVal');
const logEl = document.querySelector('#log');
const supportPill = document.querySelector('#supportPill');

const timeStamp = () => {
	return new Date().toLocaleTimeString();
};

const log = (message, { type = 'info' } = {}) => {
	const prefix = `[${timeStamp()}] `;
	const line = prefix + message;

	const div = document.createElement('div');
	div.textContent = line;

	if (type === 'error') div.className = 'error';

	logEl.appendChild(div);
	logEl.scrollTop = logEl.scrollHeight;
};

const updateUI = (lastEvent = '—') => {
	enabledVal.textContent = String(document.fullscreenEnabled);
	elementVal.textContent = document.fullscreenElement
		? `#${document.fullscreenElement.id || document.fullscreenElement.tagName.toLowerCase()}`
		: 'null';
	eventVal.textContent = lastEvent;

	const isFullscreen = Boolean(document.fullscreenElement);

	toggleBtn.textContent = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';

	// If the browser indicates fullscreen is not enabled, disable the controls.
	// (Note: Some browsers may still allow fullscreen in certain contexts even if this is false,
	// but generally it’s a good signal.)
	const supported =
		typeof stage.requestFullscreen === 'function' &&
		typeof document.exitFullscreen === 'function';

	toggleBtn.disabled = !supported;
	exitBtn.disabled = !supported || !isFullscreen;
};

const detectSupport = () => {
	const supported =
		typeof stage.requestFullscreen === 'function' &&
		typeof document.exitFullscreen === 'function';

	if (!supported) {
		supportPill.textContent = 'Fullscreen API not supported here';
		supportPill.style.borderColor = 'rgba(255,90,103,0.55)';
		log('Fullscreen API not supported in this browser/context.', {
			type: 'error'
		});
	} else {
		supportPill.textContent = 'Fullscreen API supported';
		supportPill.style.borderColor = 'rgba(62,140,96,0.55)';
		log('Fullscreen API supported. Try clicking the button or pressing Enter.');
	}
};

// Toggle function that handles both enter and exit paths.
const toggleFullscreen = async () => {
	try {
		// If something is already fullscreen, exit.
		if (document.fullscreenElement) {
			await document.exitFullscreen();
			// UI will also update via fullscreenchange, but we can log intent here.
			log('Requested exitFullscreen()');
			return;
		}

		// Otherwise, request fullscreen on our stage element.
		// navigationUI is optional; supported in some browsers.
		// Remove the options object if you want maximum compatibility.
		await stage.requestFullscreen({ navigationUI: 'hide' });
		log('Requested stage.requestFullscreen()');
	} catch (err) {
		// Common reasons:
		// - Not initiated by a user gesture (click/keypress)
		// - Platform limitation (e.g., iOS Safari)
		// - Browser policy / permissions
		log(`Fullscreen request failed: ${err.name}: ${err.message}`, {
			type: 'error'
		});
		updateUI('error');
	}
};

// --- Event listeners ---

document.addEventListener('fullscreenchange', () => {
	log(
		`fullscreenchange → fullscreenElement is now ${document.fullscreenElement ? 'SET' : 'null'}`
	);
	updateUI('fullscreenchange');
});

document.addEventListener('fullscreenerror', () => {
	// Some browsers provide little/no extra info; still useful to surface.
	log('fullscreenerror → The browser reported a fullscreen error event.', {
		type: 'error'
	});
	updateUI('fullscreenerror');
});

// Click controls
toggleBtn.addEventListener('click', toggleFullscreen);
exitBtn.addEventListener('click', async () => {
	try {
		if (document.fullscreenElement) {
			await document.exitFullscreen();
			log('Requested exitFullscreen() via Exit button');
		}
	} catch (err) {
		log(`Exit failed: ${err.name}: ${err.message}`, { type: 'error' });
	}
});

clearLogBtn.addEventListener('click', () => {
	logEl.textContent = '';
	log('Log cleared.');
	updateUI('cleared');
});

// Keyboard demo: press Enter to toggle fullscreen
window.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		// Prevent accidental form submission if you embed this in a bigger page
		e.preventDefault();
		toggleFullscreen();
	}

	// Optional: let Escape exit fullscreen (most browsers already do this by default)
	if (e.key === 'Escape' && document.fullscreenElement) {
		// Let the browser handle it; we just log user intent.
		log('Escape pressed (browser typically exits fullscreen automatically).');
	}
});

// Initialize
detectSupport();
updateUI('init');

// Give focus to stage for natural keyboard interactions
stage.focus();
