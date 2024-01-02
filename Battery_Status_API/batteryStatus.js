navigator.getBattery().then((battery) => {
	// Define the function to update the charging info
	const updateChargeInfo = () => {
		// Log whether the battery is charging or not
		console.log('Battery charging? ' + (battery.charging ? 'Yes' : 'No'));
	};

	// Add an event listener for when the charging status changes
	battery.addEventListener('chargingchange', () => {
		// Call the function to update the charging info
		updateChargeInfo();
	});

	// Define the function to update the level info
	const updateLevelInfo = () => {
		// Log the current battery level
		console.log('Battery level: ' + battery.level * 100 + '%');
	};

	// Add an event listener for when the battery level changes
	battery.addEventListener('levelchange', () => {
		// Call the function to update the level info
		updateLevelInfo();
	});

	// Define the function to update the charging time info
	const updateChargingTimeInfo = () => {
		// Log the current charging time
		console.log('Battery charging time: ' + battery.chargingTime + ' seconds');
	};

	// Add an event listener for when the charging time changes
	battery.addEventListener('chargingtimechange', () => {
		// Call the function to update the charging time info
		updateChargingTimeInfo();
	});

	// Define the function to update the discharging time info
	const updateDischargingTimeInfo = () => {
		// Log the current discharging time
		console.log(
			'Battery discharging time: ' + battery.dischargingTime + ' seconds'
		);
	};

	// Add an event listener for when the discharging time changes
	battery.addEventListener('dischargingtimechange', () => {
		// Call the function to update the discharging time info
		updateDischargingTimeInfo();
	});

	const updateAllBatteryInfo = () => {
		updateChargeInfo();
		updateLevelInfo();
		updateChargingTimeInfo();
		updateDischargingTimeInfo();
	};
	// Call the function to update all battery information
	updateAllBatteryInfo();
});
