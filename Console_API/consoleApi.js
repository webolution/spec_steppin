// Console API Demo
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Console_API

// 1. Basic Logging
console.log('Hello from console.log!'); // Standard log message

// 2. Info, Warning, and Error
console.info('This is an informational message.'); // Info message (styled in some browsers)
console.warn('This is a warning!'); // Warning message (often yellow)
console.error('This is an error!'); // Error message (often red)

// 3. Logging Variables and Objects
const user = { name: 'Alice', age: 30, admin: true };
console.log('User object:', user); // Logs the object inline

// 4. Inspecting Objects
console.dir(user); // Displays an interactive list of the object's properties

// 5. Grouping Messages
console.group('User Details');
console.log('Name:', user.name);
console.log('Age:', user.age);
console.log('Admin:', user.admin);
console.groupEnd();

// 6. Counting Occurrences
for (let i = 0; i < 3; i++) {
	console.count('Loop count');
}

// 7. Timing Code Execution
console.time('Timer Example');
for (let i = 0; i < 1000000; i++) {
	// Simulate some work
}
console.timeEnd('Timer Example');

// 8. Stack Trace Example
const a = () => {
	b();
};
const b = () => {
	c();
};
const c = () => {
	console.trace('Trace from function c');
};
a();

// 9. Table Output
const users = [
	{ name: 'Alice', age: 30 },
	{ name: 'Bob', age: 25 }
];
console.table(users); // Nicely formatted table

// 10. Custom Styling (Chrome/Firefox)
console.log('%cStyled log message', 'color: green; font-weight: bold;');
