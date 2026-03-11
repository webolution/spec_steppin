const dropZone = document.querySelector('#drop-zone');
const output = document.querySelector('#output');

// 1. DEFINE FUNCTIONS FIRST (to avoid ReferenceError)
const preventDefaults = (e) => {
	e.preventDefault();
	e.stopPropagation();
};

const log = (text) => {
	output.textContent += text + '\n';
};

/**
 * RECURSIVE FUNCTION
 * This creates a tree structure by checking if an item is a File or Directory.
 */
const traverseFileTree = (item, path = '') => {
	// The path parameter helps us keep track of the current directory structure as we traverse.
	path = path || '';

	if (item.isFile) {
		// CASE 1: It is a specific File
		item.file((file) => {
			log(`📄 FILE: ${path}${item.name} (${file.size} bytes)`);
		});
	} else if (item.isDirectory) {
		// CASE 2: It is a Directory
		log(`📁 FOLDER: ${path}${item.name}`);

		// Create a DirectoryReader to read entries inside this folder
		const dirReader = item.createReader();

		// readEntries returns an array of entries
		dirReader.readEntries((entries) => {
			for (let i = 0; i < entries.length; i++) {
				// RECURSION: Call this function again for the child entry
				traverseFileTree(entries[i], path + item.name + '/');
			}
		});
	}
};

const handleDrop = (e) => {
	// Processing visual cue
	output.textContent = 'Processing...\n';

	// Access the DataTransferItemList interface
	const items = e.dataTransfer.items;

	for (let i = 0; i < items.length; i++) {
		// KEY API METHOD: webkitGetAsEntry()
		const entry = items[i].webkitGetAsEntry();

		if (entry) {
			traverseFileTree(entry);
		}
	}
};

// 2. ATTACH EVENT LISTENERS (After functions are defined)

// Prevent default behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
	dropZone.addEventListener(eventName, preventDefaults, false);
});

// Visual cues (Hover effects)
['dragenter', 'dragover'].forEach(() => dropZone.classList.add('hover'));
['dragleave', 'drop'].forEach(() => dropZone.classList.remove('hover'));

// Handle the actual file drop (This was missing in your snippet)
dropZone.addEventListener('drop', handleDrop, false);
