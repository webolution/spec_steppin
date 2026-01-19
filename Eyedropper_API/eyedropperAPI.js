// Get references to DOM elements
const pickColorBtn = document.querySelector('#pickColorBtn');
const colorSwatch = document.querySelector('#colorSwatch');
const hexValueSpan = document.querySelector('#hexValue');

// Add an event listener to the button
pickColorBtn.addEventListener('click', async () => {
	// 1. Feature Detection: Check if the EyeDropper API is supported by the browser
	if (!window.EyeDropper) {
		alert(
			'Your browser does not support the EyeDropper API. Try Chrome, Edge, or Opera over HTTPS.'
		);
		return; // Exit if not supported
	}

	// 2. Instantiate EyeDropper: Create a new instance of the EyeDropper object
	const eyeDropper = new EyeDropper();

	try {
		// 3. Open the EyeDropper: Call the open() method to activate the eyedropper tool.
		// This method returns a Promise that resolves with the selected color's sRGBHex value.
		const { sRGBHex } = await eyeDropper.open();

		// 4. Update UI: If a color is successfully picked, update the color swatch and display its hex value.
		colorSwatch.style.backgroundColor = sRGBHex;
		hexValueSpan.textContent = sRGBHex;

		console.log(`Color picked: ${sRGBHex}`); // Log the selected color to the console
	} catch (error) {
		// 5. Error Handling: If the user cancels the eyedropper (e.g., by pressing Escape),
		// or if there's any other error, the Promise will reject.
		console.error('EyeDropper operation cancelled or failed:', error);
		hexValueSpan.textContent = 'N/A'; // Reset display
		colorSwatch.style.backgroundColor = 'transparent'; // Reset swatch
		alert('Color picking cancelled or an error occurred.');
	}
});

// Initial state for the color swatch (transparent)
colorSwatch.style.backgroundColor = 'transparent';
