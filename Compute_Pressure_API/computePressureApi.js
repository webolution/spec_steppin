/*
  Compute Pressure API Demo
  -------------------------
  - Observes system resource pressure (e.g., CPU) and reports high-level states.
  - Experimental: requires HTTPS and limited browser support.
  - Reference: https://developer.mozilla.org/en-US/docs/Web/API/Compute_Pressure_API

  This script:
  1) Detects API support and secure context.
  2) Queries supported sources (commonly ['cpu']) and populates a selector.
  3) Starts/stops a PressureObserver and updates UI with the latest PressureRecord.
  4) Includes an optional CPU stress tool (Web Worker via Blob URL) to help provoke state changes.
*/

/* --------------- DOM elements --------------- */
const secureStatusEl = document.querySelector('#secureStatus');
const poStatusEl = document.querySelector('#poStatus');
const sourcesEl = document.querySelector('#sources');
const obsStatusEl = document.querySelector('#obsStatus');
const supportNoteEl = document.querySelector('#supportNote');

const sourceSel = document.querySelector('#sourceSel');
const btnStart = document.querySelector('#btnStart');
const btnStop = document.querySelector('#btnStop');

const stateDot = document.querySelector('#stateDot');
const stateText = document.querySelector('#stateText');
const stateMeta = document.querySelector('#stateMeta');

const intensityRange = document.querySelector('#intensity');
const intensityVal = document.querySelector('#intensityVal');
const btnStressStart = document.querySelector('#btnStressStart');
const btnStressStop = document.querySelector('#btnStressStop');

const logEl = document.querySelector('#log');

/* --------------- Utilities --------------- */

/**
 * Append a line to the log.
 * @param {string} msg
 * @param {string} [state] - one of nominal|fair|serious|critical to colorize
 */
const log = (msg, state) => {
	const p = document.createElement('div');
	p.className = 'line';
	if (state) {
		const tag = document.createElement('span');
		tag.className = `tag ${state}`;
		tag.textContent = state.toUpperCase();
		p.appendChild(tag);
	}
	p.append(document.createTextNode(msg));
	logEl.appendChild(p);
	logEl.scrollTop = logEl.scrollHeight;
};

/** Format DOMHighResTimeStamp to wall clock */
const formatTimeStamp = (ts) => {
	// record.time is DOMHighResTimeStamp relative to timeOrigin (if provided by the UA)
	const wall = performance.timeOrigin
		? new Date(performance.timeOrigin + ts)
		: new Date();
	return wall.toLocaleTimeString();
};

/** Update the state indicator dot + labels */
const updateStateUI = (state, time) => {
	stateDot.classList.remove(
		'state-nominal',
		'state-fair',
		'state-serious',
		'state-critical'
	);
	if (state) {
		const safe = ['nominal', 'fair', 'serious', 'critical'].includes(state)
			? state
			: 'nominal';
		stateDot.classList.add(`state-${safe}`);
		stateText.textContent = safe;
		stateMeta.textContent = time ? `time: ${formatTimeStamp(time)}` : 'time: —';
		stateDot.title = `Latest state: ${safe}`;
	} else {
		stateText.textContent = '—';
		stateMeta.textContent = 'time: —';
		stateDot.title = 'No data';
	}
};

/* --------------- CPU Stress Worker (optional) --------------- */
/*
  We create a Web Worker from a Blob URL so this demo remains a single JS file.
  The worker busy-waits in short slices, controlled by an "intensity" percentage (0–100).
  - At 0% it sleeps (no significant CPU).
  - At 100% it busy-waits nearly constantly.
  This can help provoke pressure state changes on supported browsers/devices.
*/
let stressWorker = null;

const createStressWorker = () => {
	const workerCode = `
    let running = false;
    let intensity = 50; // 0..100 (% of each 50ms slice spent busy-waiting)

    function busyWait(ms) {
      const end = performance.now() + ms;
      while (performance.now() < end) {
        // Do some meaningless math to keep CPU busy
        let x = 0;
        for (let i = 0; i < 1000; i++) x += Math.sqrt(i) % 3;
      }
    }

    function loop() {
      if (!running) return;
      const slice = 50; // ms per slice
      const busy  = (intensity / 100) * slice;
      if (busy > 1) busyWait(busy);
      // Sleep the remainder of the slice
      setTimeout(loop, Math.max(0, slice - busy));
    }

    self.onmessage = (e) => {
      const { cmd, value } = e.data || {};
      if (cmd === 'start') {
        running = true;
        loop();
      } else if (cmd === 'stop') {
        running = false;
      } else if (cmd === 'intensity') {
        // clamp 0..100
        intensity = Math.max(0, Math.min(100, Number(value) || 0));
      }
    };
  `;
	const blob = new Blob([workerCode], { type: 'application/javascript' });
	return new Worker(URL.createObjectURL(blob));
};

const startStress = () => {
	if (!stressWorker) stressWorker = createStressWorker();
	stressWorker.postMessage({ cmd: 'intensity', value: intensityRange.value });
	stressWorker.postMessage({ cmd: 'start' });
	btnStressStart.disabled = true;
	btnStressStop.disabled = false;
	log('CPU stress worker: started');
};

const stopStress = () => {
	if (stressWorker) stressWorker.postMessage({ cmd: 'stop' });
	btnStressStart.disabled = false;
	btnStressStop.disabled = true;
	log('CPU stress worker: stopped');
};

/* --------------- Pressure Observer --------------- */

let observer = null;
let observingSource = null;

/**
 * Initialize a PressureObserver with a callback to handle PressureRecord arrays.
 * Note: Options (like sampleRate) may vary by implementation; we omit them for broadest compatibility.
 */
const createObserver = () => {
	// The callback receives an array of PressureRecord(s). Each has:
	// - record.source (e.g., 'cpu')
	// - record.state  ('nominal'|'fair'|'serious'|'critical')
	// - record.time   (DOMHighResTimeStamp)
	observer = new PressureObserver((records) => {
		for (const rec of records) {
			const msg = `[${rec.source}] state=${rec.state} at ${formatTimeStamp(
				rec.time
			)}`;
			log(msg, rec.state);
			// Update the UI to reflect the latest record for the currently observed source
			if (rec.source === observingSource) {
				updateStateUI(rec.state, rec.time);
			}
		}
	});
};

/** Start observing the selected source */
const startObserving = async () => {
	if (!('PressureObserver' in window)) return;
	if (!observer) createObserver();

	const source = sourceSel.value || 'cpu';
	try {
		// Observe the given source (e.g., 'cpu').
		await observer.observe(source);
		observingSource = source;
		obsStatusEl.textContent = `observing '${source}'`;
		btnStart.disabled = true;
		btnStop.disabled = false;
		log(`Observer: now observing '${source}'`);
	} catch (err) {
		log(`Observer error: ${err?.message || err}`, 'serious');
	}
};

/** Stop observing the current source */
const stopObserving = async () => {
	if (!observer || !observingSource) return;
	try {
		await observer.unobserve(observingSource);
	} catch (e) {
		// Some implementations may not throw; ignore failures here.
	}
	log(`Observer: stopped observing '${observingSource}'`);
	observingSource = null;
	obsStatusEl.textContent = 'stopped';
	btnStart.disabled = false;
	btnStop.disabled = true;
	updateStateUI(null, null);
};

/* --------------- Setup & Feature Detection --------------- */

(init = async () => {
	// Secure context check
	secureStatusEl.textContent = window.isSecureContext ? 'yes' : 'no';
	if (!window.isSecureContext) {
		supportNoteEl.textContent = 'This API requires a secure context (HTTPS).';
	}

	// API feature detection
	const supported = 'PressureObserver' in window;
	poStatusEl.textContent = supported ? 'yes' : 'no';
	if (!supported) {
		supportNoteEl.textContent =
			'PressureObserver is not available in this browser. Try a recent Chromium-based browser, enable flags, or check MDN for updates.';
	}

	// Populate supported sources (commonly ['cpu']). Fallback to 'cpu' if not available.
	let sources = ['cpu'];
	if (supported && typeof PressureObserver.supportedSources === 'function') {
		try {
			const s = await PressureObserver.supportedSources();
			if (Array.isArray(s) && s.length) sources = s;
		} catch {
			// Ignore errors, keep default
		}
	}
	sourcesEl.textContent = sources.join(', ');
	sourceSel.innerHTML = sources
		.map((s) => `<option value="${s}">${s}</option>`)
		.join('');

	// Hook up UI events
	btnStart.addEventListener('click', startObserving);
	btnStop.addEventListener('click', stopObserving);

	intensityRange.addEventListener('input', () => {
		intensityVal.textContent = `${intensityRange.value}%`;
		if (stressWorker)
			stressWorker.postMessage({
				cmd: 'intensity',
				value: intensityRange.value
			});
	});
	btnStressStart.addEventListener('click', startStress);
	btnStressStop.addEventListener('click', stopStress);

	// If supported, prepare the observer
	if (supported) {
		createObserver();
		log('Observer ready. Click "Start observing" to begin.');
	} else {
		log(
			'Compute Pressure API not supported. UI will not receive real updates.',
			'fair'
		);
	}
})();
