// Check if the CSS Custom Highlight API is supported
if (window.CSS && CSS.supports('selection-background-color', 'yellow')) {
	// Add a class to the body to indicate support for the API
	document.body.classList.add('custom-highlight-supported');
}
