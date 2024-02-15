// Check if the Beacon API is supported by the browser
if (navigator && navigator.sendBeacon) {
	// Create a data object to send with the beacon request
	var data = {
		userId: 123,
		event: 'click',
		timestamp: Date.now()
	};

	// Convert the data object to a string
	let dataString = JSON.stringify(data);

	// Send the beacon request with the data
	navigator.sendBeacon('http://localhost:3000/analytics', dataString);

	console.log('Beacon request sent successfully!');
} else {
	console.log('Beacon API is not supported by the browser.');
}

// Define variables
// Create a span tag
let localDel = document.createElement('span');
// Grab the zip code
let billingPostCode = document.querySelector('#billing_postcode');
let shippingPostCode = document.querySelector('#shipping_postcode');
// Grab the popup container
let weekContainer = document.querySelector('#weekContainer');
// Store the original content of weekContainer
const originalContent = weekContainer.innerHTML;
// Grab popup close button
const hustlePopupClose = document.querySelector('.hustle-button-close');
// Add attribute to created span tag
localDel.setAttribute('id', 'local_delivery');
// Add span tag to body pf page
document.body.appendChild(localDel);
// Listen for when user leaves the zip code field
billingPostCode.addEventListener('blur', postCodeInfo(billingPostCode.value));
// Function to display local delivery information during checkout
const postCodeInfo = (postCode) => {
	console.log('postCode: ', postCode);
	// Ensure the zip code field has a value
	if (postCode != '') {
		// Populate pop up container with user specific information
		const dayOfWeek = getDayOfWeekByValue(postCode);
		if (dayOfWeek) {
			weekContainer.style.gridTemplateColumns = 'repeat(1, 1fr)';
			const deliveryDate = getNextDeliveryDate(dayOfWeek);
			weekContainer.innerHTML = `<h3>Since you live in the zip code of ${postCode}, you can expect delivery on ${dayOfWeek}, ${deliveryDate}.</h3>`;
		} else {
			weekContainer.innerHTML =
				'We currently only offer local delivery. Please contact us for delivery options.';
		}
		localDel.click();
	}
};

// Function to find the day of the week for the delivery
const getDayOfWeekByValue = (zipValue) => {
	const ulElements = weekContainer.querySelectorAll('ul');
	// Set day of week variable
	let dayOfWeek = null;
	// Loop over lists
	for (let i = 0; i < ulElements.length; i++) {
		// Grab the list items
		const liElements = ulElements[i].getElementsByTagName('li');
		// Loop over the list items
		for (let j = 0; j < liElements.length; j++) {
			// Check is the list item contains the zip code value
			if (liElements[j].textContent.includes(zipValue)) {
				// Grab the h2 value for the list
				const h2Element = ulElements[i].parentNode.querySelector('h2');
				// Set trimmed header value
				dayOfWeek = h2Element.textContent.trim();
				break;
			}
		}
		if (dayOfWeek) {
			break;
		}
	}
	return dayOfWeek; // Value not found
};
// Attach event to closing of popup
hustlePopupClose.addEventListener('click', () => {
	// Reset the weekContainer to the original content
	weekContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
	weekContainer.innerHTML = originalContent;
});
// Function to calculate the next occurrence of a day of the week
const getNextDeliveryDate = (dayOfWeek) => {
	const now = new Date();
	const daysOfWeek = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];
	const currentDay = now.getDay();
	const targetDay = daysOfWeek.indexOf(dayOfWeek);
	let daysUntilNext = targetDay - currentDay;
	if (daysUntilNext <= 0) {
		daysUntilNext += 7;
	}
	const nextDate = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate() + daysUntilNext
	);
	const formattedDate = `${
		nextDate.getMonth() + 1
	}.${nextDate.getDate()}.${nextDate.getFullYear()}`;
	return formattedDate;
};
