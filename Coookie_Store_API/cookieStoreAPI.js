// 1. Set a cookie asynchronously
const setCookie = async () => {
	await cookieStore.set({
		name: 'demoCookie',
		value: 'cookieStoreRocks',
		expires: Date.now() + 60 * 60 * 1000, // 1 hour from now
		path: '/',
		sameSite: 'lax'
	});
	console.log('Cookie set!');
};

// 2. Get a cookie by name
const getCookie = async () => {
	const cookie = await cookieStore.get('demoCookie');
	if (cookie) {
		console.log('Cookie value:', cookie.value);
	} else {
		console.log('Cookie not found.');
	}
};

// 3. List all cookies
const listCookies = async () => {
	const cookies = await cookieStore.getAll();
	console.log('All cookies:', cookies);
};

// 4. Delete a cookie
const deleteCookie = async () => {
	await cookieStore.delete('demoCookie');
	console.log('Cookie deleted!');
};

// 5. Listen for cookie changes (works in supported browsers)
cookieStore.addEventListener('change', (event) => {
	for (const changed of event.changed) {
		console.log('Cookie changed:', changed);
	}
	for (const deleted of event.deleted) {
		console.log('Cookie deleted:', deleted);
	}
});

// --- Demo sequence ---
(async () => {
	await setCookie();
	await getCookie();
	await listCookies();
	await deleteCookie();
	await listCookies();
})();
