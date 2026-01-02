// --- Feature Detection ---
// Always good practice to check if an experimental API is supported.
if (!('EditContext' in window)) {
	alert(
		'Your browser does not support the EditContext API. This demo will not function as expected.\n\nPlease try a browser that supports this experimental API (e.g., Chrome with "Experimental Web Platform features" enabled via chrome://flags).'
	);
	document.body.innerHTML = `
		<h1>EditContext API is not supported in your browser.</h1>
		<p>Please try a browser that supports this experimental API (e.g., Chrome with experimental web platform features enabled).</p>
		<p>You can find more information about its current status on the <a href="https://developer.mozilla.org/en-US/docs/Web/API/EditContext_API" target="_blank" rel="noopener noreferrer">MDN Web Docs</a>.</p>
	`;
	throw new Error('EditContext API not supported.');
}

// --- DOM Element References ---
const editableArea = document.querySelector('#editable-area');
const currentTextSpan = document.querySelector('#current-text');
const selectionStartSpan = document.querySelector('#selection-start');
const selectionEndSpan = document.querySelector('#selection-end');

// --- Step 1: Create a new EditContext instance ---
// The EditContext object acts as the "model" for your editable region.
// It manages the text content, selection, and formatting information.
const editContext = new EditContext();

// --- Step 2: Attach the EditContext to the desired DOM element ---
// This is the core step. By assigning an EditContext instance to an
// element's .editContext property, you inform the browser that this
// element should receive text input via EditContext.
// The browser will then route keyboard input and IME composition
// events to this EditContext instance, rather than directly to the DOM element's
// content if it were, for example, `contenteditable="true"`.
editableArea.editContext = editContext;

// --- Internal State Management ---
// These variables represent our editor's "model" derived from EditContext events.
// In a real editor, this might be a more complex data structure.
let currentContent = 'Start typing here...';
let currentSelectionStart = currentContent.length;
let currentSelectionEnd = currentContent.length;
// ADDITION: Add a flag to track if the initial placeholder content is still present.
let isInitialPlaceholder = true;

// --- Function to Update the Visuals ---
// This function is responsible for rendering the `currentContent` and
// `currentSelection` to the `editableArea` and updating the debug output.
// With EditContext, *you* are responsible for the rendering!
const updateDisplay = () => {
	// Update the debug output section
	// SUGGESTION: Changed JSON.stringify(currentContent) to currentContent for cleaner debug output.
	currentTextSpan.textContent = currentContent;
	selectionStartSpan.textContent = currentSelectionStart;
	selectionEndSpan.textContent = currentSelectionEnd;

	// Update the visual content of the editable div.
	// This will update the DOM and might remove textNode if content is empty
	editableArea.textContent = currentContent;

	const selection = window.getSelection();
	selection.removeAllRanges(); // Always clear existing selections first

	try {
		// ADDITION: Explicitly handle the case when content is empty to ensure caret placement
		if (currentContent.length === 0) {
			// If the content is empty, editableArea.textContent = '' will remove all child nodes.
			// We need to re-add an empty text node to allow for caret placement at index 0.
			const emptyTextNode = document.createTextNode('');
			editableArea.appendChild(emptyTextNode);
			const range = document.createRange();
			range.setStart(emptyTextNode, 0);
			range.setEnd(emptyTextNode, 0);
			selection.addRange(range);
		} else {
			// For non-empty content, proceed as usual
			// After editableArea.textContent = currentContent, firstChild will be the new TextNode
			const textNode = editableArea.firstChild;
			if (textNode && textNode.nodeType === Node.TEXT_NODE) {
				const range = document.createRange();
				// Ensure selection indices don't exceed the actual text node length
				const actualStart = Math.min(currentSelectionStart, textNode.length);
				const actualEnd = Math.min(currentSelectionEnd, textNode.length);

				range.setStart(textNode, actualStart);
				range.setEnd(textNode, actualEnd);
				selection.addRange(range);
			} else {
				console.warn(
					'Editable area has content but no valid textNode. Could not set selection properly.'
				);
				// Fallback: place cursor at the very beginning of the editableArea if no textNode is found
				const range = document.createRange();
				range.setStart(editableArea, 0);
				range.setEnd(editableArea, 0);
				selection.addRange(range);
			}
		}
	} catch (e) {
		console.error('Error setting DOM selection:', e);
		// If an error occurs, selection was already removed at the start of the function.
		// The browser might default caret placement.
	}
};

// --- EditContext Event Listeners ---
// These events are fired by the EditContext instance, informing our
// custom editor about user input and selection changes.

// --- EditContext Event Listeners ---
// These events are fired by the EditContext instance, informing our
// custom editor about user input and selection changes.

// Event: 'textupdate'
// Fired when the text content managed by the EditContext needs to be updated.
// This is where you receive the actual text typed by the user or composed by an IME.
editContext.addEventListener('textupdate', (event) => {
	console.log('EditContext: textupdate event received', event);

	let effectiveUpdateStart = event.updateRangeStart;
	let effectiveUpdateEnd = event.updateRangeEnd;
	const newText = event.text;

	// ADDITION: Re-incorporate the placeholder clearing logic
	if (isInitialPlaceholder) {
		currentContent = ''; // Clear the placeholder content
		// Adjust the effective update range to apply to the now empty string.
		// This ensures the new text is inserted correctly at the beginning,
		// effectively replacing the placeholder entirely.
		effectiveUpdateStart = 0;
		effectiveUpdateEnd = 0;
		isInitialPlaceholder = false; // The placeholder is no longer active
	}

	// Apply the text update to our internal `currentContent` model.
	// This logic correctly handles both insertions and deletions based on the effective range.
	currentContent =
		currentContent.substring(0, effectiveUpdateStart) +
		newText +
		currentContent.substring(effectiveUpdateEnd);

	// Adopt the suggested new selection position after the text update.
	// Use event.selectionStart and event.selectionEnd
	currentSelectionStart = event.selectionStart; // Corrected property name
	currentSelectionEnd = event.selectionEnd; // Corrected property name

	// --- Diagnostic Log ---
	console.log(
		`EditContext: TextUpdate - newSelectionStart: ${currentSelectionStart}, newSelectionEnd: ${currentSelectionEnd}`
	);

	// Re-render the editor's display to reflect the changes.
	updateDisplay();
});

// Event: 'selectionchange'
// Fired when the text selection within the editable content changes.
// This happens when the user clicks, drags, or uses arrow keys to move the cursor.
editContext.addEventListener('selectionchange', (event) => {
	console.log('EditContext: selectionchange event received', event);

	// `start` and `end`: The new start and end indices of the selection.
	currentSelectionStart = event.start;
	currentSelectionEnd = event.end;

	// --- Diagnostic Log ---
	console.log(
		`EditContext: SelectionChange - start: ${currentSelectionStart}, end: ${currentSelectionEnd}`
	);

	// Re-render the display to show the updated selection.
	updateDisplay();
});

// Event: 'characterboundsupdate'
// Fired when the browser needs to know the precise pixel bounds of characters
// within a given range of text. This is critical for positioning things like
// IME composition windows, spell-check underlines, or selection handles,
// especially when rendering text on a <canvas> or with complex CSS.
editContext.addEventListener('characterboundsupdate', (event) => {
	console.log('EditContext: characterboundsupdate event received', event);

	// `range`: The range of characters for which bounds are requested.
	// In a canvas-based editor, you would compute and return actual
	// DOMRect objects for each character's position.
	// For this <div> example, we'll log it, but the browser usually
	// handles basic character bounds for native DOM elements.
	const requestedStart = event.range.start;
	const requestedEnd = event.range.end;

	const charBounds = [];
	const textNode = editableArea.firstChild;
	if (textNode && textNode.nodeType === Node.TEXT_NODE) {
		for (let i = requestedStart; i < requestedEnd; i++) {
			// Create a temporary range for each character to get its bounding box.
			// This is a simplified approach; a robust solution would pre-calculate
			// these or use a text layout engine.
			const tempRange = document.createRange();
			tempRange.setStart(textNode, i);
			tempRange.setEnd(textNode, i + 1);
			const rect = tempRange.getBoundingClientRect();

			// Push a DOMRect-like object.
			charBounds.push({
				x: rect.x,
				y: rect.y,
				width: rect.width,
				height: rect.height,
				left: rect.left,
				top: rect.top,
				right: rect.right,
				bottom: rect.bottom
			});
		}
	}

	// If you were explicitly providing bounds (e.g., for canvas), you would call:
	// event.updateCharacterBounds(requestedStart, charBounds);
	// Since we're using a div, we let the browser handle the actual rendering implicitly,
	// but logging shows the event is active.
	console.log(
		`  Requested bounds for characters ${requestedStart} to ${requestedEnd}:`,
		charBounds
	);
});

// --- IME Composition Events (Informational) ---
// These events provide more granular control during IME composition,
// allowing you to render the interim composition string (e.g., underlined text).
// Fully implementing composition rendering is complex but these events are key.
editContext.addEventListener('compositionstart', (event) => {
	console.log('EditContext: compositionstart event received', event);
	// You might change the editor's visual state to indicate composition.
});

editContext.addEventListener('compositionupdate', (event) => {
	console.log('EditContext: compositionupdate event received', event);
	// `event.text` will contain the current composition string.
	// `event.textFormatUpdates` describes how to style parts of the composition.
	// This is where you would typically render the composition text.
});

editContext.addEventListener('compositionend', (event) => {
	console.log('EditContext: compositionend event received', event);
	// Composition has finished. A 'textupdate' event will follow with the final text.
});

// Event: 'textformatupdate'
// Fired when text formatting information changes, usually related to IME composition
// (e.g., applying underlines to candidate characters).
editContext.addEventListener('textformatupdate', (event) => {
	console.log('EditContext: textformatupdate event received', event);
	// `event.formatRange` indicates the range of text whose format changed.
	// `event.textFormatUpdates` is an array of `TextFormat` objects to apply.
	// Implementing this visually requires complex text rendering logic.
});

// --- Initial Setup ---
// Perform the initial display update to show the starting content.
updateDisplay();

// Focus the editable area when the page loads, for convenience in the demo.
editableArea.focus();
