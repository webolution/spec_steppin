// Wait for the DOM to be fully loaded before running our script
document.addEventListener('DOMContentLoaded', () => {
	// Select all the elements we'll need to interact with
	const copyBtn = document.querySelector('#copy-btn');
	const textToCopy = document.querySelector('#text-to-copy');
	const pasteBtn = document.querySelector('#paste-btn');
	const pasteArea = document.querySelector('#paste-area');
	const statusMessage = document.querySelector('#status-message');

	// --- WRITE TO CLIPBOARD ---

	copyBtn.addEventListener('click', async () => {
		// First, check if the Clipboard API is available in the browser
		if (!navigator.clipboard) {
			statusMessage.textContent =
				'Clipboard API not supported by your browser.';
			return;
		}

		try {
			// Get the text from our paragraph element
			const text = textToCopy.innerText;

			// Use the writeText() method to copy the text.
			// This is an asynchronous operation, so we use await.
			await navigator.clipboard.writeText(text);

			// Update the status message to give the user feedback
			statusMessage.textContent = 'Text copied to clipboard!';
			console.log('Text successfully copied.');
		} catch (err) {
			// If there's an error, log it to the console and update the status
			statusMessage.textContent = 'Failed to copy text.';
			console.error('Failed to copy text: ', err);
		}
	});

	// --- READ FROM CLIPBOARD ---

	pasteBtn.addEventListener('click', async () => {
		if (!navigator.clipboard) {
			statusMessage.textContent =
				'Clipboard API not supported by your browser.';
			return;
		}

		try {
			// Use the readText() method to get content from the clipboard.
			// This is also asynchronous.
			// The browser will likely ask the user for permission here for security.
			const text = await navigator.clipboard.readText();

			// Set the value of the textarea to the text we just read
			pasteArea.value = text;

			// Provide user feedback
			statusMessage.textContent = 'Text pasted from clipboard!';
			console.log('Text successfully pasted.');
		} catch (err) {
			// Handle any errors, such as the user denying permission
			statusMessage.textContent = 'Failed to paste text.';
			console.error('Failed to read from clipboard: ', err);
		}
	});
});
