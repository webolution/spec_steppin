// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
	// Get references to the DOM elements we'll be working with
	const box = document.querySelector('.box');
	const changeBtn = document.getElementById('changeBtn');

	// --- DEMO 1: Reading CSS Properties with Typed OM ---

	// Get the "computed style map" for the element. This is the entry point to the Typed OM.
	// It's like window.getComputedStyle(), but returns typed objects instead of strings.
	const styleMap = box.computedStyleMap();

	// Let's get the 'width' property
	const width = styleMap.get('width');

	// Log the result to the console.
	// Notice it's a CSSUnitValue object, not a string like "150px".
	// This allows for easier and faster manipulation.
	console.log('--- Reading Initial Styles ---');
	console.log("The 'width' property is an object:", width);
	console.log(`Value: ${width.value}, Unit: ${width.unit}`);

	// Let's also get the opacity
	const opacity = styleMap.get('opacity');
	console.log("The 'opacity' property is an object:", opacity);
	console.log(`Value: ${opacity.value}, Unit: ${opacity.unit}`); // CSSMathSum has a different structure

	// --- DEMO 2: Manipulating and Writing CSS Properties ---

	// Add a click event listener to the button to trigger changes
	changeBtn.addEventListener('click', () => {
		console.log('\n--- Button Clicked: Updating Styles ---');

		// Get the current style map again inside the handler
		const currentStyles = box.computedStyleMap();

		// ** Manipulate Width **
		// We can perform math directly on the .value property
		const currentWidth = currentStyles.get('width');
		const newWidthValue = currentWidth.value + 50;

		// ** Manipulate Opacity **
		const currentOpacity = currentStyles.get('opacity');
		const newOpacityValue = currentOpacity.value * 1.5; // Make it more opaque

		// To set styles, we use the 'attributeStyleMap'. This corresponds to the element's 'style' attribute.
		// We use factory functions like CSS.px() and CSS.number() to create the correct typed objects.
		box.attributeStyleMap.set('width', CSS.px(newWidthValue));
		box.attributeStyleMap.set('opacity', CSS.number(newOpacityValue));

		// You can also set properties that weren't there before, like 'transform'
		box.attributeStyleMap.set(
			'transform',
			new CSSTransformValue([
				new CSSTranslate(CSS.px(20), CSS.px(20)),
				new CSSRotate(CSS.deg(45))
			])
		);

		console.log(`Set width to: ${newWidthValue}px`);
		console.log(`Set opacity to: ${newOpacityValue}`);
		console.log('Set a new transform property.');
	});
});
