// Get the canvas element and its 2D rendering context
const canvas = document.querySelector('#myCanvas');
const ctx = canvas.getContext('2d');

// Ball properties
let ball = {
	x: canvas.width / 2, // starting x position (center)
	y: canvas.height - 30, // starting y position (near bottom)
	dx: 4, // x velocity
	dy: -4, // y velocity
	radius: 20
};

const drawBall = () => {
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = '#0095DD'; // A nice blue color
	ctx.fill();
	ctx.closePath();
};

const update = () => {
	// Clear the entire canvas on each frame
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the ball in its current position
	drawBall();

	// --- Collision Detection ---
	// Bounce off the left and right walls
	if (
		ball.x + ball.dx > canvas.width - ball.radius ||
		ball.x + ball.dx < ball.radius
	) {
		ball.dx = -ball.dx;
	}

	// Bounce off the top and bottom walls
	if (
		ball.y + ball.dy > canvas.height - ball.radius ||
		ball.y + ball.dy < ball.radius
	) {
		ball.dy = -ball.dy;
	}

	// Move the ball for the next frame
	ball.x += ball.dx;
	ball.y += ball.dy;

	// Request the next animation frame
	requestAnimationFrame(update);
};

// Start the animation loop
update();
