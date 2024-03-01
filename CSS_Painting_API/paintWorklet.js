// Define a class for our checkerboard worklet
class CheckerboardPainter {
	static get inputProperties() {
		return ['--checkerboard-spacing'];
	}

	paint(ctx, size, properties) {
		// Get the custom property '--checkerboard-spacing' or use a default value
		const spacing = properties.get('--checkerboard-spacing').value || 32;
		for (let y = 0; y < size.height; y += spacing) {
			for (let x = 0; x < size.width; x += spacing) {
				ctx.fillStyle = (x / spacing + y / spacing) % 2 ? 'black' : 'white';
				ctx.fillRect(x, y, spacing, spacing);
			}
		}
	}
}

// Register our class under the 'checkerboard' name
registerPaint('checkerboard', CheckerboardPainter);
