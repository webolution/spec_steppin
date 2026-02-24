/**
 * Spec Steppin' Series: Fetch API Overview
 * Source: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */

const output = document.querySelector('#output');
const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Helper to print JSON to the screen
const logToScreen = (data) => {
	output.textContent = JSON.stringify(data, null, 2);
};

// 1. Basic GET Request
const fetchUser = async (userId) => {
	console.log(`\n--- Fetching User ID: ${userId} ---`);

	try {
		const response = await fetch(`${BASE_URL}/users/${userId}`);

		// CRITICAL: Check if request was successful (fetch doesn't reject on 404)
		if (!response.ok) {
			throw new Error(`HTTP Error! Status: ${response.status}`);
		}

		const userData = await response.json();
		console.log('User Data Retrieved:', userData);

		// Return data so we can log it to the screen
		return userData;
	} catch (error) {
		console.error('Fetch operation failed:', error.message);
		return { error: error.message };
	}
};

// 2. POST Request
const createPost = async (title, body) => {
	console.log(`\n--- Creating New Post ---`);

	const url = `${BASE_URL}/posts`;

	const config = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		},
		body: JSON.stringify({
			title,
			body,
			userId: 1
		})
	};

	try {
		const response = await fetch(url, config);

		if (!response.ok) {
			throw new Error(`Failed to create post. Status: ${response.status}`);
		}

		const result = await response.json();
		console.log('Post Created Successfully:', result);
		return result;
	} catch (error) {
		console.error('Error creating post:', error.message);
		return { error: error.message };
	}
};

// --- UI Event Listeners ---

const btnSuccess = document.querySelector('#btn-success');
if (btnSuccess) {
	btnSuccess.addEventListener('click', async () => {
		output.textContent = 'Fetching User ID 1...';
		const data = await fetchUser(1);
		logToScreen(data);
	});
}

const btnError = document.querySelector('#btn-error');
if (btnError) {
	btnError.addEventListener('click', async () => {
		output.textContent = 'Fetching User ID 9999 (Expect 404)...';
		const data = await fetchUser(9999);
		logToScreen(data);
	});
}

const btnPost = document.querySelector('#btn-post');
if (btnPost) {
	btnPost.addEventListener('click', async () => {
		output.textContent = 'Creating Post...';
		const data = await createPost('Spec Steppin', 'Fetch API Demo Content');
		logToScreen(data);
	});
}
