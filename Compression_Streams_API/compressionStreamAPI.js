// Feature detection: CompressionStream and DecompressionStream
function supportsCompressionStreams() {
	return (
		typeof CompressionStream !== 'undefined' &&
		typeof DecompressionStream !== 'undefined'
	);
}

const supportEl = document.getElementById('support');
if (supportsCompressionStreams()) {
	supportEl.textContent =
		'✅ Compression Streams API supported in this browser (works in workers too).';
} else {
	supportEl.textContent =
		'⚠️ Compression Streams API not supported. Consider a fallback (e.g., pako).';
}

// Helpers: text <-> bytes
const enc = new TextEncoder();
const dec = new TextDecoder();

// Convert a ReadableStream to a Uint8Array
async function streamToUint8Array(readable) {
	const ab = await new Response(readable).arrayBuffer();
	return new Uint8Array(ab);
}

// Convert a ReadableStream to a Blob
function streamToBlob(readable) {
	return new Response(readable).blob();
}

// Core: compress/decompress Uint8Array via streams
async function compressUint8(data, algorithm = 'gzip') {
	// Turn Uint8Array into a ReadableStream via Blob, pipe through CompressionStream
	const compressedReadable = new Blob([data])
		.stream()
		.pipeThrough(new CompressionStream(algorithm));
	return await streamToUint8Array(compressedReadable);
}

async function decompressUint8(data, algorithm = 'gzip') {
	const decompressedReadable = new Blob([data])
		.stream()
		.pipeThrough(new DecompressionStream(algorithm));
	return await streamToUint8Array(decompressedReadable);
}

// Convenience: text compress/decompress
async function compressText(text, algorithm = 'gzip') {
	const bytes = enc.encode(text);
	return await compressUint8(bytes, algorithm);
}

async function decompressToText(bytes, algorithm = 'gzip') {
	const out = await decompressUint8(bytes, algorithm);
	return dec.decode(out);
}

// Blob versions for files
async function compressBlobToBlob(blob, algorithm = 'gzip') {
	const compressedReadable = blob
		.stream()
		.pipeThrough(new CompressionStream(algorithm));
	return await streamToBlob(compressedReadable);
}

async function decompressBlobToBlob(blob, algorithm = 'gzip') {
	const decompressedReadable = blob
		.stream()
		.pipeThrough(new DecompressionStream(algorithm));
	return await streamToBlob(decompressedReadable);
}

// Utility: pretty size
function prettyBytes(n) {
	if (!Number.isFinite(n)) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB'];
	let i = 0;
	while (n >= 1024 && i < units.length - 1) {
		n /= 1024;
		i++;
	}
	return `${n.toFixed(1)} ${units[i]}`;
}

/* --------------------------
   1) Text demo handlers
--------------------------- */
const algoSel = document.getElementById('algo');
const textInput = document.getElementById('textInput');
const textResult = document.getElementById('textResult');
const btnCompressText = document.getElementById('btnCompressText');
const btnDecompressText = document.getElementById('btnDecompressText');

let lastCompressedBytes = null;
let lastAlgorithm = 'gzip';

btnCompressText.addEventListener('click', async () => {
	const algorithm = algoSel.value;
	lastAlgorithm = algorithm;

	const text = textInput.value;
	if (!text) {
		textResult.textContent = 'Please enter some text.';
		return;
	}

	try {
		const originalBytes = enc.encode(text);
		const compressed = await compressUint8(originalBytes, algorithm);
		lastCompressedBytes = compressed;

		textResult.textContent =
			`Compressed (${algorithm})\n` +
			`Original size: ${prettyBytes(originalBytes.length)}\n` +
			`Compressed size: ${prettyBytes(compressed.length)}\n` +
			`Ratio: ${(compressed.length / originalBytes.length).toFixed(2)}\n\n` +
			`First 64 bytes (hex): ${Array.from(compressed.slice(0, 64))
				.map((b) => b.toString(16).padStart(2, '0'))
				.join(' ')}`;

		btnDecompressText.disabled = false;
	} catch (err) {
		console.error(err);
		textResult.textContent = `Error compressing text: ${err.message}`;
		btnDecompressText.disabled = true;
	}
});

btnDecompressText.addEventListener('click', async () => {
	if (!lastCompressedBytes) return;
	try {
		const decompressedText = await decompressToText(
			lastCompressedBytes,
			lastAlgorithm
		);
		textResult.textContent = `Decompressed back to:\n\n${decompressedText}`;
	} catch (err) {
		console.error(err);
		textResult.textContent = `Error decompressing text: ${err.message}`;
	}
});

/* -----------------------------------
   2) File compress/decompress demo
------------------------------------ */
const fileToCompress = document.getElementById('fileToCompress');
const fileToDecompress = document.getElementById('fileToDecompress');
const btnCompressFile = document.getElementById('btnCompressFile');
const btnDecompressFile = document.getElementById('btnDecompressFile');
const fileCompressResult = document.getElementById('fileCompressResult');
const fileDecompressResult = document.getElementById('fileDecompressResult');

fileToCompress.addEventListener('change', () => {
	btnCompressFile.disabled = !fileToCompress.files?.length;
});
fileToDecompress.addEventListener('change', () => {
	btnDecompressFile.disabled = !fileToDecompress.files?.length;
});

btnCompressFile.addEventListener('click', async () => {
	const file = fileToCompress.files?.[0];
	if (!file) return;

	const algorithm = algoSel.value; // 'gzip' or 'deflate'
	fileCompressResult.textContent = 'Compressing...';

	try {
		const compressedBlob = await compressBlobToBlob(file, algorithm);

		// Provide a download link; extension is illustrative
		const ext = algorithm === 'gzip' ? '.gz' : '.deflate';
		const url = URL.createObjectURL(compressedBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${file.name}${ext}`;
		a.textContent = `Download ${a.download}`;

		fileCompressResult.innerHTML =
			`Original: ${file.name} (${prettyBytes(
				file.size
			)}) → Compressed: ${prettyBytes(compressedBlob.size)} ` +
			`(ratio ${(compressedBlob.size / file.size).toFixed(2)}) `;
		fileCompressResult.appendChild(a);
	} catch (err) {
		console.error(err);
		fileCompressResult.textContent = `Error: ${err.message}`;
	}
});

btnDecompressFile.addEventListener('click', async () => {
	const file = fileToDecompress.files?.[0];
	if (!file) return;

	// You need to know which algorithm was used. We'll attempt gzip first, then deflate.
	fileDecompressResult.textContent = 'Decompressing...';

	try {
		let decompressedBlob;
		try {
			decompressedBlob = await decompressBlobToBlob(file, 'gzip');
		} catch {
			decompressedBlob = await decompressBlobToBlob(file, 'deflate');
		}

		const url = URL.createObjectURL(decompressedBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download =
			file.name.replace(/\.(gz|deflate)$/i, '') || 'decompressed.bin';
		a.textContent = `Download ${a.download}`;

		// If it looks like text, show a preview
		const head = await decompressedBlob
			.slice(0, 512)
			.text()
			.catch(() => '');
		const looksText = /^[\x09\x0A\x0D\x20-\x7E]/.test(head);
		const preview = document.createElement('pre');
		preview.style.whiteSpace = 'pre-wrap';
		preview.style.background = '#f6f8fa';
		preview.style.padding = '.5rem';
		preview.style.borderRadius = '6px';
		preview.textContent = looksText
			? await decompressedBlob.text()
			: '(binary data)';

		fileDecompressResult.innerHTML = `Decompressed size: ${prettyBytes(
			decompressedBlob.size
		)} `;
		fileDecompressResult.appendChild(a);
		fileDecompressResult.appendChild(
			document.createElement('div')
		).textContent = 'Preview:';
		fileDecompressResult.appendChild(preview);
	} catch (err) {
		console.error(err);
		fileDecompressResult.textContent = `Error: ${err.message}`;
	}
});

/* ----------------------------------------
   3) Streaming decompression via fetch()
----------------------------------------- */
const fetchUrl = document.getElementById('fetchUrl');
const fetchResult = document.getElementById('fetchResult');
const btnFetchDecompress = document.getElementById('btnFetchDecompress');

btnFetchDecompress.addEventListener('click', async () => {
	const url = fetchUrl.value.trim();
	if (!url) {
		fetchResult.textContent =
			'Please enter a URL to a gzip-compressed resource (e.g., *.txt.gz).';
		return;
	}
	fetchResult.textContent = 'Fetching...';

	try {
		const res = await fetch(url);
		if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

		// If the server didn’t set Content-Encoding but the payload is gzip-compressed (e.g., .gz file),
		// you can manually decompress the response body stream:
		const decompressedStream = res.body.pipeThrough(
			new DecompressionStream('gzip')
		);
		const text = await new Response(decompressedStream).text();

		fetchResult.textContent =
			text.slice(0, 5000) + (text.length > 5000 ? '\n…(truncated)…' : '');
	} catch (err) {
		console.error(err);
		fetchResult.textContent = `Fetch/decompress error: ${err.message}`;
	}
});

/* ---------------------------------------------------
   Optional: Offload compression to a Web Worker
   (keeps UI responsive for big payloads)
---------------------------------------------------- */
function createCompressionWorker() {
	const workerCode = `
    const enc = new TextEncoder();
    const dec = new TextDecoder();

    async function compressUint8(data, algorithm) {
      const compressedReadable = new Blob([data]).stream()
        .pipeThrough(new CompressionStream(algorithm));
      const ab = await new Response(compressedReadable).arrayBuffer();
      return new Uint8Array(ab);
    }

    async function decompressUint8(data, algorithm) {
      const decompressedReadable = new Blob([data]).stream()
        .pipeThrough(new DecompressionStream(algorithm));
      const ab = await new Response(decompressedReadable).arrayBuffer();
      return new Uint8Array(ab);
    }

    self.onmessage = async (e) => {
      const { op, algorithm, payload } = e.data;
      try {
        let out;
        if (op === 'compressText') {
          out = await compressUint8(enc.encode(payload), algorithm);
          self.postMessage({ ok: true, out }, [out.buffer]); // transfer the buffer
        } else if (op === 'decompressToText') {
          const bytes = new Uint8Array(payload);
          const outBytes = await decompressUint8(bytes, algorithm);
          self.postMessage({ ok: true, out: dec.decode(outBytes) });
        }
      } catch (err) {
        self.postMessage({ ok: false, error: err.message });
      }
    };
  `;
	const blob = new Blob([workerCode], { type: 'application/javascript' });
	return new Worker(URL.createObjectURL(blob), { type: 'module' });
}

// Example usage:
// const w = createCompressionWorker();
// w.postMessage({ op: 'compressText', algorithm: 'gzip', payload: 'Hello worker!' });
// w.onmessage = (e) => console.log('Worker result:', e.data);
