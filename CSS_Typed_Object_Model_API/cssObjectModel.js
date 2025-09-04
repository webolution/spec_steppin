// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
	// Get references to the button and the output element from the DOM
	const changeButton = document.querySelector('#style-changer-btn');
	const outputLog = document.querySelector('#output');

	// --- Helper function to log messages to our output area ---
	const log = (message) => {
		console.log(message);
		outputLog.textContent += message + '\n';
	};

	// --- Accessing the Stylesheet and Rule ---

	// `document.styleSheets` is a live list of all stylesheets on the page.
	// It's the entry point to the CSSOM.
	const styleSheet = document.styleSheets[0];
	log(`Accessed stylesheet: ${styleSheet.href}`);

	// Find the specific CSS rule for our '.box' class.
	// We iterate through all the rules in the stylesheet.
	let boxRule;
	for (let rule of styleSheet.cssRules) {
		// Check if the selectorText matches the class we're looking for.
		if (rule.selectorText === '.box') {
			boxRule = rule;
			break; // Stop looking once we've found it
		}
	}

	if (boxRule) {
		// --- Reading a Style from the CSSOM ---
		const initialColor = boxRule.style.backgroundColor;
		log(`Found rule for '.box'. Initial background color is: ${initialColor}`);
		log('---');

		// --- Modifying a Style using the CSSOM ---

		// Add a click event listener to the button
		changeButton.addEventListener('click', () => {
			log('Button clicked! Modifying CSS rule...');

			// Get the current color to toggle it
			const currentColor = boxRule.style.backgroundColor;

			// Use a simple conditional to toggle between two colors and widths
			if (currentColor === 'steelblue') {
				// Modify the properties on the 'style' object of the rule
				boxRule.style.backgroundColor = 'orangered';
				boxRule.style.width = '300px';
				log("Changed background color to 'orangered' and width to '300px'");
			} else {
				boxRule.style.backgroundColor = 'steelblue';
				boxRule.style.width = '200px';
				log(
					"Changed background color back to 'steelblue' and width to '200px'"
				);
			}
			log('---');
		});
	} else {
		log("Could not find the '.box' CSS rule.");
	}
});
