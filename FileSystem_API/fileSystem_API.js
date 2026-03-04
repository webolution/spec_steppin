let fileHandle; // Variable to store the handle so we can save back to the same file later

const textEditor = document.querySelector('#textEditor');
const btnOpen = document.querySelector('#btnOpen');
const btnSave = document.querySelector('#btnSave');
const btnSaveAs = document.querySelector('#btnSaveAs');
const statusMsg = document.querySelector('#statusMsg');

/**
 * 1. OPEN FILE
 * Uses window.showOpenFilePicker() to prompt the user to select a file.
 */
btnOpen.addEventListener('click', async () => {
	// 1. Feature Detection Check
	if (!window.showOpenFilePicker) {
		alert(
			'Your browser does not support the File System Access API. Try Chrome, Edge, or Opera.'
		);
		return;
	}
	try {
		// Options: limit selection to text files
		const options = {
			types: [
				{
					description: 'Text Files',
					accept: {
						'text/plain': ['.txt', '.js', '.html', '.css', '.md'],
						'application/json': ['.json']
					}
				}
			]
		};

		// Open the file picker (returns an array of handles)
		[fileHandle] = await window.showOpenFilePicker(options);

		// Get the actual File object (metadata + content) from the handle
		const file = await fileHandle.getFile();
		const contents = await file.text();

		// Load content into UI
		textEditor.value = contents;
		btnSave.disabled = false; // Enable save button now that we have a handle
		statusMsg.textContent = `Editing: ${file.name}`;
	} catch (err) {
		// Handle user cancelling the dialog
		console.error('File open cancelled or failed:', err);
	}
});

/**
 * 2. SAVE FILE (Direct)
 * Uses the existing fileHandle to write changes back to the original file.
 */
btnSave.addEventListener('click', async () => {
	try {
		if (!fileHandle) return; // Safety check

		// Create a writable stream to the file
		const writable = await fileHandle.createWritable();

		// Write the contents of the textarea
		await writable.write(textEditor.value);

		// Close the file (saves changes)
		await writable.close();

		statusMsg.textContent = 'File saved successfully!';
		setTimeout(
			() => (statusMsg.textContent = `Editing: ${fileHandle.name}`),
			2000
		);
	} catch (err) {
		console.error('Save failed:', err);
		statusMsg.textContent = 'Error saving file.';
	}
});

/**
 * 3. SAVE AS (New File)
 * Uses showSaveFilePicker() to create a NEW file handle.
 */
btnSaveAs.addEventListener('click', async () => {
	try {
		const options = {
			types: [
				{
					description: 'Text Files',
					accept: { 'text/plain': ['.txt'] }
				}
			]
		};

		// Open "Save As" dialog and get a NEW handle
		const newHandle = await window.showSaveFilePicker(options);

		// Create writable stream
		const writable = await newHandle.createWritable();
		await writable.write(textEditor.value);
		await writable.close();

		// Update our current handle to work with the new file
		fileHandle = newHandle;
		btnSave.disabled = false;
		statusMsg.textContent = `Saved as: ${newHandle.name}`;
	} catch (err) {
		console.error('Save As cancelled:', err);
	}
});
