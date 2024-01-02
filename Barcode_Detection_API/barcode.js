// Check if the Barcode Detection API is supported
if ('BarcodeDetector' in window) {
	const barcodeDetector = new BarcodeDetector();

	// Create an Image object
	var image = new Image();
	image.src = 'image.png'; // Set the src to the path of your image file

	image.onload = function () {
		barcodeDetector
			.detect(image)
			.then((barcodes) => {
				barcodes.forEach((barcode) => {
					console.log('Bounding box:', barcode.boundingBox);
					console.log('Raw value:', barcode.rawValue);
					console.log('Barcode type:', barcode.format);
				});
			})
			.catch((error) => {
				console.error('Error detecting barcodes:', error);
			});
	};
} else {
	console.error('Barcode Detection API is not supported by this browser');
}
