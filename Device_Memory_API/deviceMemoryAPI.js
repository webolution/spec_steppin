// Utility: pick a tier name from the numeric RAM value (GB)
const memoryToTier = (ramValue) => {
	// Common values are 0.25, 0.5, 1, 2, 4, 8 but the API is coarse and intentionally privacy-preserving.
	if (ramValue === undefined || ramValue === null) return 'unknown';
	// Choose thresholds (tweak to suit your app)
	if (ramValue < 1) return 'low';
	if (ramValue >= 1 && ramValue < 4) return 'medium';
	return 'high';
};

// Set the image src depending on quality tier.
const applyQualityTier = (tier) => {
	const hero = document.querySelector('#hero');
	if (tier === 'low') {
		// smaller image, faster to download
		hero.src = 'https://picsum.photos/600/320?grayscale&random=1';
		hero.alt = 'Low-quality image (grayscale, smaller)';
	} else if (tier === 'medium') {
		hero.src = 'https://picsum.photos/900/480?random=2';
		hero.alt = 'Medium-quality image';
	} else if (tier === 'high') {
		// larger, high-res image
		hero.src = 'https://picsum.photos/1400/700?random=3';
		hero.alt = 'High-quality image';
	} else {
		hero.src = 'https://picsum.photos/900/480?random=99';
		hero.alt = 'Default image';
	}
};

// Helper function to safely update an element with a label and an emphasized value.
const updateElementWithEmphasis = (element, label, value) => {
	// Clear any previous content to prevent duplicating nodes on refresh.
	element.textContent = '';

	// Create the <em> element that will contain the dynamic value.
	const em = document.createElement('em');
	em.textContent = value;

	// Append the static text label and the new <em> element to the parent.
	element.appendChild(document.createTextNode(label));
	element.appendChild(em);
};

// Update UI with memory and tier info, now using secure DOM methods instead of innerHTML.
const updateUI = (memValue) => {
	const memEl = document.querySelector('#device-memory');
	const tierEl = document.querySelector('#tier');
	const compatEl = document.querySelector('#compat-note');

	if (memValue === undefined) {
		updateElementWithEmphasis(memEl, 'Device memory: ', 'not available');
		compatEl.textContent =
			'Device Memory API not supported in this browser. See MDN for compatibility (open in a secure context).';
		updateElementWithEmphasis(tierEl, 'Quality tier: ', 'fallback');
		applyQualityTier('medium'); // app-level fallback
	} else {
		const tier = memoryToTier(memValue);
		updateElementWithEmphasis(
			memEl,
			'Device memory: ',
			`${memValue} GB (approx.)`
		);
		updateElementWithEmphasis(tierEl, 'Quality tier: ', tier);
		compatEl.textContent =
			'Value provided by navigator.deviceMemory (approximate & coarse).';
		applyQualityTier(tier);
	}
};

// Try to start a worker and show WorkerNavigator.deviceMemory usage
const startWorkerAndReport = (memValue) => {
	if (!window.Worker) return;
	try {
		const w = new Worker('worker.js');
		// send main-thread value to worker (worker can also read self.navigator.deviceMemory)
		w.postMessage({ mainMemory: memValue });
		w.onmessage = (ev) => {
			// worker will send back a message with its observation
			console.log('Worker says:', ev.data);
			const compatEl = document.getElementById('compat-note');
			compatEl.textContent += ` Worker reported deviceMemory: ${ev.data.workerMemory}`;
		};
	} catch (e) {
		console.warn('Could not start worker:', e);
	}
};

// Main detection function
const detectAndApply = () => {
	// navigator.deviceMemory is the API (available in secure contexts)
	// It's intentionally coarse to avoid fine-grained fingerprinting.
	const mem = navigator.deviceMemory; // may be undefined
	updateUI(mem);
	startWorkerAndReport(mem);
};

// --- Event Listeners and Initial Run ---

// Wire up UI
document.querySelector('#refresh').addEventListener('click', detectAndApply);

// Initial run (works on https or localhost; otherwise deviceMemory likely undefined)
detectAndApply();

// Extra: show a friendly compatibility tip if not secure context
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
	const compatEl = document.getElementById('compat-note');
	compatEl.textContent =
		'Tip: serve this page over HTTPS or run via http://localhost to allow secure-context-only APIs.';
}
