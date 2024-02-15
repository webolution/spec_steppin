// Delay the font loading by 3 seconds
setTimeout(() => {
	// Create a new FontFace object
	let customFont = new FontFace(
		'Custom Font',
		'url(ProtestRiot-Regular.woff2)'
	);

	// Add the new font to the document's font set
	document.fonts.add(customFont);
	// Load the font
	customFont
		.load()
		.then(() => {
			// The font is now loaded and can be used
			document.querySelector('.custom-font').style.fontFamily = 'Custom Font';
		})
		.catch(() => {
			console.log('Font failed to load');
		});
}, 3000);
