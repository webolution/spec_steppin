/**
 * @file EncodingAPIDemo.js
 * @brief This script demonstrates the basic usage of the Web Encoding API,
 *        specifically TextEncoder and TextDecoder, for converting between
 *        JavaScript strings and byte arrays (Uint8Array).
 *
 * The Encoding API allows web applications to handle character encodings beyond
 * what JavaScript natively supports for string manipulation, primarily focusing
 * on UTF-8 for encoding and a wider range of encodings for decoding.
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API
 */

// --- 1. TextEncoder: Encoding a JavaScript string into UTF-8 bytes ---
console.log('--- TextEncoder Demo ---');

// Create a new TextEncoder instance.
// By default, it encodes to 'utf-8'. You can specify other encodings,
// but TextEncoder currently only supports 'utf-8'.
const encoder = new TextEncoder();

// Define a sample string, including some non-ASCII characters to demonstrate UTF-8 handling.
const textToEncode =
	'Hello, world! 👋 This is a test with a special character: é.';
console.log(`Original String: "${textToEncode}"`);

// Encode the string into a Uint8Array (an array of 8-bit unsigned integers, i.e., bytes).
const encodedBytes = encoder.encode(textToEncode);

console.log('Encoded Bytes (Uint8Array):', encodedBytes);
console.log('Encoded Bytes Length:', encodedBytes.length);
// Note: The length of the encoded bytes might be different from the string length
// due to multi-byte characters in UTF-8 (e.g., '👋' uses 4 bytes, 'é' uses 2 bytes).

// To view the hexadecimal representation (useful for debugging byte streams).
const hexString = Array.from(encodedBytes)
	.map((byte) => byte.toString(16).padStart(2, '0'))
	.join(' ');
console.log('Encoded Bytes (Hex):', hexString);

// --- 2. TextDecoder: Decoding a byte array back into a JavaScript string ---
console.log('\n--- TextDecoder Demo ---');

// Create a new TextDecoder instance.
// We need to specify the encoding of the bytes we are decoding.
// In this case, we know `encodedBytes` is 'utf-8'.
const decoder = new TextDecoder('utf-8');

// Decode the `Uint8Array` back into a JavaScript string.
const decodedText = decoder.decode(encodedBytes);
console.log(`Decoded String (UTF-8): "${decodedText}"`);

// Verify that the decoded string matches the original.
console.log(
	'Does decoded string match original?',
	decodedText === textToEncode
);

// --- 3. TextDecoder with a different (legacy) encoding ---
// This demonstrates TextDecoder's ability to handle various encodings,
// though TextEncoder only produces UTF-8.
console.log('\n--- TextDecoder with Legacy Encoding Demo ---');

// Imagine you received a byte array encoded in 'windows-1252' (a common legacy encoding).
// For demonstration, let's manually create some bytes that represent
// "Hello, world! ©" in windows-1252. The copyright symbol '©' is byte `0xA9` in windows-1252.
// In UTF-8, '©' is `0xC2 0xA9`.
const windows1252Bytes = new Uint8Array([
	72,
	101,
	108,
	108,
	111,
	44,
	32,
	119,
	111,
	114,
	108,
	100,
	33,
	32,
	169 // 169 is 0xA9 in hex
]);
console.log('Windows-1252 Encoded Bytes:', windows1252Bytes);

// Create a decoder for 'windows-1252'.
const windows1252Decoder = new TextDecoder('windows-1252');

// Decode the bytes.
const windows1252DecodedText = windows1252Decoder.decode(windows1252Bytes);
console.log(`Decoded String (windows-1252): "${windows1252DecodedText}"`);

// What happens if we try to decode windows-1252 bytes with a UTF-8 decoder?
// It will likely result in a "replacement character" () for bytes that are not valid UTF-8 sequences.
const incorrectUtf8Decode = new TextDecoder('utf-8').decode(windows1252Bytes);
console.log(
	`Incorrectly Decoded String (UTF-8 for windows-1252 bytes): "${incorrectUtf8Decode}"`
);
// You'll see the '©' replaced by '' because 0xA9 is not a valid start of a UTF-8 sequence.

// --- 4. Handling encoding errors (optional for demo, but good to know) ---
console.log('\n--- Error Handling Demo ---');

// The TextDecoder constructor accepts an options object.
// The 'fatal' option determines if decoding errors throw an exception.
// By default, 'fatal' is false, and errors result in replacement characters ().
const fatalDecoder = new TextDecoder('utf-8', { fatal: true });
const nonFatalDecoder = new TextDecoder('utf-8', { fatal: false }); // default behavior

const invalidUtf8Bytes = new Uint8Array([0xc0, 0x80]); // An invalid UTF-8 sequence

try {
	fatalDecoder.decode(invalidUtf8Bytes);
} catch (error) {
	console.log('Decoding with fatal: true caught an error:', error.message);
}

console.log(
	'Decoding with fatal: false:',
	nonFatalDecoder.decode(invalidUtf8Bytes)
);
// Output will likely include a replacement character ''

// --- 5. Stream-based encoding/decoding (brief mention for context) ---
console.log('\n--- Stream-based API (Conceptual) ---');
console.log(
	'The Encoding API also provides TextEncoderStream and TextDecoderStream'
);
console.log(
	'for handling large amounts of data or data arriving in chunks (e.g., network streams).'
);
console.log(
	'These are typically used with Web Streams API (ReadableStream, WritableStream).'
);
console.log(
	'Example use case: Piping a network response through a TextDecoderStream.'
);

// No executable code for streams here, as it requires more setup (ReadableStream, WritableStream).
