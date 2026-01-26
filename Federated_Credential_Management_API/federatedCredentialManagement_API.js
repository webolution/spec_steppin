const signInButton = document.querySelector('#signInButton');
const statusDiv = document.querySelector('#status');
const resultPre = document.querySelector('#result');

// Function to update the status and result displays
const updateDisplay = (type, message, data = null) => {
	statusDiv.className = type;
	statusDiv.textContent = message;
	if (data) {
		resultPre.textContent = JSON.stringify(data, null, 2);
	} else {
		resultPre.textContent = '';
	}
};

// Basic check for FedCM availability on page load
if ('credentials' in navigator && 'get' in navigator.credentials) {
	updateDisplay(
		'info',
		'FedCM API appears to be available. Click the button to test. ' +
			'Remember to replace placeholder `configURL` and `clientId`.'
	);
} else {
	updateDisplay(
		'error',
		'FedCM API is not natively supported in this browser environment.'
	);
}

// Add event listener to the sign-in button
signInButton.addEventListener('click', async () => {
	updateDisplay('info', 'Attempting to sign in with FedCM...');
	resultPre.textContent = 'Waiting for FedCM API response...';

	// Check if FedCM API is available in the browser
	if (!('credentials' in navigator) || !('get' in navigator.credentials)) {
		updateDisplay(
			'error',
			'FedCM API not available in this browser. Please use a compatible browser ' +
				'(e.g., Chrome or Edge with experimental flags enabled, or Firefox Nightly).'
		);
		return;
	}

	try {
		// The core of the FedCM API: navigator.credentials.get()
		// This call triggers the browser's FedCM UI to show available accounts
		// from registered Identity Providers (IdPs).
		const credential = await navigator.credentials.get({
			identity: {
				// 'providers' is an array of Identity Provider configurations.
				// In a real application, these would be provided by the IdP.
				providers: [
					{
						// configURL: The URL to the IdP's well-known configuration file
						// (e.g., `https://idp.example/.well-known/web-identity/v1`).
						// This JSON file describes the IdP's endpoints and capabilities.
						// REPLACE WITH A REAL IDP'S CONFIG URL.
						configURL: 'https://idp.example/fedcm.json', // Placeholder URL

						// clientId: Your Relying Party's unique client ID,
						// registered with the Identity Provider.
						// REPLACE WITH YOUR ACTUAL CLIENT ID FROM THE IDP.
						clientId: 'YOUR_RP_CLIENT_ID_GOES_HERE', // Placeholder Client ID

						// nonce: A cryptographically strong, randomly generated string.
						// It's used to prevent replay attacks and is typically sent
						// to the IdP and included in the returned ID token.
						// Recommended for enhanced security.
						nonce: crypto.randomUUID(), // Generates a unique nonce

						// Optional: The 'context' can be 'signin', 'signup', 'use', or 'reload'.
						// This provides a hint to the IdP about the user's intent.
						context: 'signin'
					}
				]
			}
		});

		// Check the type of credential received.
		// For FedCM, it should be an 'IdentityCredential'.
		if (credential.type === 'identity') {
			// An IdentityCredential object contains the ID token.
			const identityCredential = credential;

			updateDisplay(
				'success',
				'Successfully received IdentityCredential from FedCM!',
				{
					id: identityCredential.id,
					protocol: identityCredential.protocol,
					token: identityCredential.token // This is the JWT from the IdP
					// In a real app, you would send this 'token' to your backend
					// for verification and user session creation.
				}
			);
			console.log('Identity Credential:', identityCredential);
			alert(
				'Sign-in successful via FedCM! Check console for details and the received token.'
			);

			// In a real application, you would now send `identityCredential.token`
			// to your backend server for verification and user session establishment.
			// Example (conceptual, requires backend endpoint):
			/*
                    const response = await fetch('/api/verify-fedcm-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: identityCredential.token }),
                    });
                    const backendResult = await response.json();
                    console.log('Backend verification result:', backendResult);
                    */
		} else {
			updateDisplay(
				'warning',
				'Received an unexpected credential type: ' + credential.type,
				credential
			);
			console.warn('Unexpected credential type:', credential);
		}
	} catch (error) {
		// Handle various types of errors that can occur during the FedCM flow.
		// These include user cancellation, IdP errors, browser errors, etc.
		updateDisplay(
			'error',
			'FedCM API error: ' + error.name + ' - ' + error.message,
			{
				name: error.name,
				message: error.message
				// If it's an IdentityCredentialError, it might have more details
				// idpError: error.idpError // (Not always present, depends on IdP implementation)
			}
		);
		console.error('FedCM API call failed:', error);
		alert('FedCM sign-in failed. Check the console for error details.');
	}
});
