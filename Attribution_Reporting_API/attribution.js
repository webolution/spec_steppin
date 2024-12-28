// Trigger attribution when a conversion occurs (e.g., "Add to Cart" click)
const registerTrigger = () => {
	fetch('https://shop.example/register-trigger', {
		method: 'POST',
		headers: {
			'Attribution-Reporting-Eligible': 'trigger',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			event: 'add_to_cart',
			productId: '12345',
			value: 49.99
		})
	}).then((response) => {
		if (response.ok) {
			console.log('Attribution trigger registered successfully');
		} else {
			console.error('Failed to register attribution trigger');
		}
	});
};

// Simulate conversion trigger
document
	.querySelector('#add-to-cart')
	.addEventListener('click', registerTrigger);

// Server-Side: Responding with Attribution Headers

// On the server, include the appropriate headers in the response to mark attribution sources or triggers.
// HTTP/1.1 200 OK
// Attribution-Reporting-Register-Source: source-event-id=1234, destination=https://shop.example

// For triggers:
// HTTP/1.1 200 OK
// Attribution-Reporting-Register-Trigger: trigger-data=conversion-id-5678
