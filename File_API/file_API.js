/**
 * Spec Steppin' Series: File API Overview
 * Source: https://developer.mozilla.org/en-US/docs/Web/API/File_API
 */

const fileInput = document.querySelector('#file-input');
const fileCountSpan = document.querySelector('#file-count');
const dropZone = document.querySelector('#drop-zone');
const output = document.querySelector('#output');
const previewContainer = document.querySelector('#preview-container');

// Helper: Format bytes to human-readable string
const formatFileSize = (bytes) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Core Function: Process the FileList object
const handleFiles = (files) => {
	output.textContent = ''; // Clear previous log
	previewContainer.replaceChildren(); // Clear previews

	fileCountSpan.textContent = `${files.length} file(s) selected`;

	// The File API gives us a FileList, which is array-like but not an array.
	// We can convert it or loop standardly.
	Array.from(files).forEach((file) => {
		logMetadata(file);
		readFileContent(file);
	});
};

// 1. Inspect Metadata (Synchronous)
const logMetadata = (file) => {
	const logEntry = `
--- File Metadata ---
Name: ${file.name}
Type: ${file.type || 'Unknown'}
Size: ${formatFileSize(file.size)}
Last Modified: ${new Date(file.lastModified).toLocaleString()}
---------------------
`;
	output.textContent += logEntry;
};

// 2. Read Content (Asynchronous via FileReader)
const readFileContent = (file) => {
	const reader = new FileReader();

	// Setup Event Listeners BEFORE reading
	reader.onload = (event) => {
		// Success handler
		const result = event.target.result;

		// Logic to display content based on type
		if (file.type.startsWith('image/')) {
			const img = document.createElement('img');
			img.src = result; // The result is a Data URL (base64)
			img.classList.add('preview-thumb');
			previewContainer.appendChild(img);
			output.textContent += `\n[Image Preview Generated]\n`;
		} else if (
			file.type.startsWith('text/') ||
			file.type === 'application/json'
		) {
			// Truncate text for demo purposes if it's huge
			const previewText =
				result.length > 200 ? result.substring(0, 200) + '...' : result;
			output.textContent += `\nContent Preview:\n${previewText}\n`;
		}
	};

	reader.onerror = (error) => {
		console.error('Error reading file:', error);
		output.textContent += `\nError reading file: ${error.message}\n`;
	};

	// Trigger the read operation
	if (file.type.startsWith('image/')) {
		reader.readAsDataURL(file); // Great for previews
	} else {
		reader.readAsText(file); // Great for CSV, JSON, TXT
	}
};

// --- Event Listeners ---

// A. Standard Input Change
fileInput.addEventListener('change', (e) => {
	handleFiles(e.target.files);
});

// B. Drag and Drop "Gotchas"
// You MUST preventDefault on 'dragover' and 'drop' or the browser
// will open the file in the tab instead of letting JS handle it.

dropZone.addEventListener('dragover', (e) => {
	e.preventDefault();
	dropZone.classList.add('hover'); // Visual cue
});

dropZone.addEventListener('dragleave', () => {
	dropZone.classList.remove('hover');
});

dropZone.addEventListener('drop', (e) => {
	e.preventDefault();
	dropZone.classList.remove('hover');

	// Access the files via the dataTransfer object
	const files = e.dataTransfer.files;
	if (files.length > 0) {
		handleFiles(files);
	}
});
