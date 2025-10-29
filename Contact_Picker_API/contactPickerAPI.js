// Get references to the button and output area
const pickContactBtn = document.querySelector('#pickContactBtn');
const output = document.querySelector('#output');

// Function to handle contact picking
const pickContact = async () => {
	// Check if the Contact Picker API is available in this browser
	if ('contacts' in navigator && 'ContactsManager' in window) {
		try {
			// Define which fields you want to request from the contact
			const props = ['name', 'email', 'tel', 'address', 'icon'];
			// Options: allow picking only one contact (multiple: false)
			const opts = { multiple: false };

			// Open the contact picker and wait for the user's selection
			const contacts = await navigator.contacts.select(props, opts);

			// Display the selected contact(s) in the output area
			if (contacts.length > 0) {
				output.textContent = JSON.stringify(contacts[0], null, 2);
			} else {
				output.textContent = '(No contact selected)';
			}
		} catch (err) {
			// Handle errors (e.g., user cancels, permission denied)
			output.textContent = 'Error: ' + err.message;
		}
	} else {
		// API not supported in this browser
		output.textContent =
			'Contact Picker API not supported on this browser/device.';
	}
};

// Attach the function to the button's click event
pickContactBtn.addEventListener('click', pickContact);
