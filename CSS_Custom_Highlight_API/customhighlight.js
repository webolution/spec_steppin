const query = document.getElementById('query');
const article = document.querySelector('article');

// Find all text nodes in the article. We'll search within
// these text nodes.
const treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
const allTextNodes = [];
let currentNode = treeWalker.nextNode();
while (currentNode) {
	allTextNodes.push(currentNode);
	currentNode = treeWalker.nextNode();
}

// Listen to the input event to run the search.
query.addEventListener('input', () => {
	// If the CSS Custom Highlight API is not supported,
	// display a message and bail-out.
	if (!CSS.highlights) {
		article.textContent = 'CSS Custom Highlight API not supported.';
		return;
	}

	// Clear the HighlightRegistry to remove the
	// previous search results.
	CSS.highlights.clear();

	// Clean-up the search query and bail-out if
	// if it's empty.
	const str = query.value.trim().toLowerCase();
	if (!str) {
		return;
	}

	// Iterate over all text nodes and find matches.
	const ranges = allTextNodes
		.map((el) => {
			return { el, text: el.textContent.toLowerCase() };
		})
		.map(({ text, el }) => {
			const indices = [];
			let startPos = 0;
			while (startPos < text.length) {
				const index = text.indexOf(str, startPos);
				if (index === -1) break;
				indices.push(index);
				startPos = index + str.length;
			}

			// Create a range object for each instance of
			// str we found in the text node.
			return indices.map((index) => {
				const range = new Range();
				range.setStart(el, index);
				range.setEnd(el, index + str.length);
				return range;
			});
		});
	// Create a Highlight object for the ranges.
	const searchResultsHighlight = new Highlight(...ranges.flat());

	// Register the Highlight object in the registry.
	CSS.highlights.set('search-results', searchResultsHighlight);
});
