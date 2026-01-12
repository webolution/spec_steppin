// --- DOM Element References ---
const videoElement = document.querySelector('#myVideo');
const statusDiv = document.querySelector('#status');
const logArea = document.querySelector('#log');
const startButton = document.querySelector('#startButton');
const clearLogButton = document.querySelector('#clearLogButton');

// --- Configuration for Clear Key EME ---
// The 'org.w3.clearkey' key system is for testing and unencrypted content.
// For real DRM, this would be 'com.widevine.alpha', 'com.microsoft.playready', etc.
const KEY_SYSTEM = 'org.w3.clearkey';

// A placeholder for the encrypted video URL.
// In a real scenario, this would be an actual DASH/HLS stream with PSSH boxes.
// For this demo, we'll use a regular video and simulate the 'encrypted' event.
const VIDEO_URL =
	'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4'; // Example public video for playback

// Simulated video initialization data (often contains PSSH box for real DRM)
// For Clear Key, this is a simple JSON structure with key IDs and keys.
const simulatedInitData = JSON.stringify({
	keys: [
		{
			kty: 'oct',
			kid: 'Wk11iX_U02jA-J-8d4gT2w', // Base64url encoded key ID
			k: 'zE3SjoQh_C9P7aC81W9V2A' // Base64url encoded key
		}
	]
});

// Convert the simulatedInitData to an ArrayBuffer, as required by EME API
const textEncoder = new TextEncoder();
const initDataArrayBuffer = textEncoder.encode(simulatedInitData).buffer;

// --- Helper Functions ---
const updateStatus = (message, type = '') => {
	statusDiv.textContent = message;
	statusDiv.className = `status-message ${type}`;
	logMessage(`STATUS: ${message}`);
};

const logMessage = (message) => {
	const timestamp = new Date().toLocaleTimeString();
	logArea.textContent += `[${timestamp}] ${message}\n`;
	logArea.scrollTop = logArea.scrollHeight; // Auto-scroll to bottom
};

const base64urlToArrayBuffer = (base64url) => {
	const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
	const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = window.atob(base64);
	const outputArray = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; ++i) {
		outputArray[i] = raw.charCodeAt(i);
	}
	return outputArray.buffer;
};

// --- EME Workflow Functions ---

const startEmeProcess = async () => {
	startButton.disabled = true;
	updateStatus('Starting EME process...', '');

	if (!('requestMediaKeySystemAccess' in navigator)) {
		updateStatus(
			'Error: Encrypted Media Extensions (EME) not supported by your browser.',
			'error'
		);
		return;
	}

	try {
		// 1. Request MediaKeySystemAccess
		// This checks if the browser supports the specified key system and its capabilities.
		const config = [
			{
				initDataTypes: ['cenc'], // Common Encryption (CENC) scheme
				videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
				audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }]
			}
		];
		logMessage(
			`Attempting to request MediaKeySystemAccess for "${KEY_SYSTEM}"...`
		);
		const keySystemAccess = await navigator.requestMediaKeySystemAccess(
			KEY_SYSTEM,
			config
		);
		updateStatus(
			`Successfully obtained MediaKeySystemAccess for "${KEY_SYSTEM}".`,
			'success'
		);
		logMessage('MediaKeySystemAccess obtained. Creating MediaKeys...');

		// 2. Create MediaKeys
		// MediaKeys represents a set of decryption keys.
		const mediaKeys = await keySystemAccess.createMediaKeys();
		updateStatus('MediaKeys object created.', 'success');
		logMessage('MediaKeys created. Setting MediaKeys on video element...');

		// 3. Set MediaKeys on the video element
		// This links the decryption keys to the HTMLMediaElement.
		await videoElement.setMediaKeys(mediaKeys);
		updateStatus(
			'MediaKeys set on video element. Ready for encrypted events.',
			'success'
		);
		logMessage(
			'MediaKeys linked to video. Attaching "encrypted" event listener...'
		);

		// 4. Listen for 'encrypted' event from the video element
		// This event fires when the media element encounters encrypted data.
		videoElement.addEventListener('encrypted', async (event) => {
			logMessage(
				`"encrypted" event fired! InitDataType: ${event.initDataType}`
			);
			updateStatus(
				`Encrypted content detected. Initializing decryption...`,
				''
			);

			// Use the simulatedInitData for this demo, as the actual video might not trigger it.
			const initData = event.initData || initDataArrayBuffer;
			const initDataType = event.initDataType || 'cenc'; // Assume 'cenc' for simulated data

			// 5. Create MediaKeySession
			// A session manages the exchange of messages (license requests/responses) with the CDM.
			const session = mediaKeys.createSession();
			logMessage(`MediaKeySession created. Session ID: ${session.sessionId}`);

			// 6. Listen for 'message' events from the MediaKeySession
			// This is where the CDM requests a license from the license server.
			session.addEventListener('message', async (messageEvent) => {
				logMessage(
					`MediaKeySession "message" event. Message type: ${messageEvent.messageType}`
				);
				updateStatus(
					'License request received from CDM. Simulating license server response...',
					''
				);

				// In a real application, messageEvent.message would be sent to a license server.
				// The server would return a license, which is then passed to session.update().

				// --- SIMULATED LICENSE SERVER RESPONSE (for Clear Key) ---
				// For Clear Key, the 'message' event usually contains a JSON object
				// that directly includes the key IDs for which keys are needed.
				// The license server would respond with the actual keys.
				logMessage('Simulating license server...');
				const licenseRequest = JSON.parse(
					new TextDecoder().decode(messageEvent.message)
				);
				logMessage(
					`License request content: ${JSON.stringify(licenseRequest)}`
				);

				// Our simulatedInitData already contains the keys needed by Clear Key,
				// so we "respond" with that. For real DRM, you'd fetch from a server.
				const licenseResponse = textEncoder.encode(simulatedInitData).buffer;

				// 7. Update the MediaKeySession with the license response
				await session.update(licenseResponse);
				updateStatus(
					'MediaKeySession updated with simulated license.',
					'success'
				);
				logMessage(
					'Simulated license applied to session. Keys should now be available.'
				);
			});

			// Listen for 'keystatuseschange' events
			session.addEventListener('keystatuseschange', (event) => {
				logMessage(
					`MediaKeySession "keystatuseschange" event. Current statuses:`
				);
				event.target.keyStatuses.forEach((status, keyId) => {
					const keyIdStr = new TextDecoder().decode(keyId);
					logMessage(`  Key ID: ${keyIdStr}, Status: ${status}`);
					if (status === 'usable') {
						updateStatus(
							'Decryption keys are usable. Video should now play!',
							'success'
						);
						videoElement.play(); // Attempt to play if keys are usable
					} else if (status === 'expired' || status === 'internal-error') {
						updateStatus(
							`Key status error: ${status}. Cannot play content.`,
							'error'
						);
					}
				});
			});

			// 8. Generate a license request for the session
			await session.generateRequest(initDataType, initData);
			logMessage('License request generated by session.');
		});

		// 9. Set the video source and load it
		// This will ideally trigger the 'encrypted' event if the media is truly encrypted.
		videoElement.src = VIDEO_URL;
		videoElement.load();
		updateStatus(`Video source set to ${VIDEO_URL}. Attempting to load...`, '');
		logMessage(
			'Video element source set and loading. Waiting for "encrypted" event...'
		);

		// If the video isn't actually encrypted or doesn't trigger 'encrypted',
		// we might manually generate it for the demo flow.
		// For a simple public video, the 'encrypted' event won't naturally fire.
		// To demonstrate the flow, we'll manually trigger it after a short delay.
		setTimeout(() => {
			if (videoElement.readyState < 3) {
				// If video hasn't started playing or received metadata
				logMessage(
					'Simulating "encrypted" event manually for demo purposes...'
				);
				// You cannot dispatch a custom 'encrypted' event to trigger EME directly,
				// but the listeners are set up. The actual EME initialization
				// needs to be triggered by the browser encountering actual encrypted data.
				// For a true demo, VIDEO_URL would point to an encrypted stream.
				// Here, we just ensure listeners are ready and the status is updated.
				updateStatus(
					'Waiting for real encrypted content... (or manually trigger in a real scenario)',
					''
				);
			}
		}, 3000);
	} catch (error) {
		console.error('EME Process Error:', error);
		updateStatus(`EME process failed: ${error.message}`, 'error');
		logMessage(`ERROR: ${error.message}`);
	}
};

// --- Event Listeners for Buttons ---
startButton.addEventListener('click', startEmeProcess);
clearLogButton.addEventListener('click', () => {
	logArea.textContent = '';
	updateStatus('Log cleared.', '');
});

// Initial check and setup hint
document.addEventListener('DOMContentLoaded', () => {
	logMessage(
		'Document loaded. Click "Start EME Process & Load Video" to begin.'
	);
	// EME requires HTTPS! Check and warn if not secure.
	if (window.location.protocol !== 'https:') {
		updateStatus(
			'Warning: EME typically requires a secure context (HTTPS). This demo might not work on HTTP.',
			'error'
		);
	}
});
