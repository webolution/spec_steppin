// Register the paint worklet
if ('paintWorklet' in CSS) {
	CSS.paintWorklet
		.addModule('paintWorklet.js')
		.then(() => {
			console.log('Paint worklet registered successfully!');
		})
		.catch((error) => {
			console.error('Failed to register paint worklet:', error);
		});
} else {
	console.error('CSS Paint API is not supported in this browser.');
}
