document.addEventListener('DOMContentLoaded', () => {
	// Check for Credential Management API support
	if ('credentials' in navigator && window.PasswordCredential) {
		console.log('Credential Management API is supported!');
	} else {
		console.log('Credential Management API is not supported in this browser.');
	}

	// Handle login form submission
	const loginForm = document.querySelector('#login-form');

	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		const form = e.target;
		const username = form.username.value;
		const password = form.password.value;

		if (username && password) {
			try {
				// Create a PasswordCredential object from the form
				const cred = new window.PasswordCredential(form);

				// Store credentials in the browser's credential manager
				await navigator.credentials.store(cred);
				console.log('Credentials stored! Try the "Auto Login" button.');

				// Simulate successful login
				form.reset();
			} catch (err) {
				console.error('Failed to store credentials:', err);
			}
		} else {
			console.log('Please enter both username and password.');
		}
	});

	// Handle auto-login using stored credentials
	const autoLoginBtn = document.querySelector('#auto-login');
	let credentialsRequestPending = false;

	autoLoginBtn.addEventListener('click', async () => {
		try {
			if (credentialsRequestPending) {
				console.log('A credentials request is already pending.');
				return;
			}

			credentialsRequestPending = true;
			autoLoginBtn.disabled = true; // Optional: disables the button for UX

			const cred = await navigator.credentials.get({
				password: true,
				mediation: 'optional'
			});

			if (cred) {
				document.querySelector('input[name="username"]').value = cred.id;
				document.querySelector('input[name="password"]').value = cred.password;
				console.log(`Auto-filled credentials for user: ${cred.id}`);
			} else {
				console.log('No stored credentials found.');
			}
		} catch (err) {
			console.error('Failed to retrieve credentials:', err);
		} finally {
			credentialsRequestPending = false;
			autoLoginBtn.disabled = false;
		}
	});
});
