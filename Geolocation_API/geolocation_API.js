const statusMessage = document.querySelector('#status-message');
const locationInfo = document.querySelector('#location-info');

const geoFindMe = () => {
	locationInfo.textContent = '';

	if (!navigator.geolocation) {
		statusMessage.textContent = 'Geolocation is not supported by your browser';
		return;
	}

	statusMessage.textContent = 'Locating…';

	const options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};

	navigator.geolocation.getCurrentPosition(success, error, options);
};

const success = (position) => {
	const { latitude, longitude } = position.coords;

	statusMessage.textContent = 'Location found:';

	// Clear previous content securely
	while (locationInfo.firstChild) {
		locationInfo.removeChild(locationInfo.firstChild);
	}

	// Create elements individually
	const latPara = document.createElement('p');
	latPara.textContent = 'Latitude: ';
	const latSpan = document.createElement('span');
	latSpan.className = 'coord';
	latSpan.textContent = `${latitude}°`;
	latPara.appendChild(latSpan);

	const lonPara = document.createElement('p');
	lonPara.textContent = 'Longitude: ';
	const lonSpan = document.createElement('span');
	lonSpan.className = 'coord';
	lonSpan.textContent = `${longitude}°`;
	lonPara.appendChild(lonSpan);

	const mapLink = document.createElement('p');
	const anchor = document.createElement('a');
	anchor.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
	anchor.target = '_blank';
	anchor.textContent = 'View on OpenStreetMap';
	mapLink.appendChild(anchor);

	// Append everything to the container
	locationInfo.append(latPara, lonPara, mapLink);
};

const error = (err) => {
	statusMessage.textContent = `Error (${err.code}): ${err.message}`;
};

document.querySelector('#find-me').addEventListener('click', geoFindMe);
