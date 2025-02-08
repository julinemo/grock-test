// game.js

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game objects
const bearEmoji = '🐻'; // Bear emoji
const heartEmoji = '❤️'; // Heart emoji
const exitEmoji = '🏁'; // Exit flag emoji
const rainbowEmojis = ['🌈', '🌈', '🌈', '🌈']; // Rainbow emojis for the win effect

// Labyrinth design (simplified, adjust as needed)
const maze = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,0,1],
    [1,0,0,0,1,1,0,1],
    [1,0,1,1,0,0,0,1],
    [1,0,1,0,0,1,1,1],
    [1,0,0,0,0,0,0,0], // Exit here
    [1,1,1,1,1,1,1,1]
];
const cellSize = 50; // Size of each cell in the maze

// Bear's position
let bear = {x: 1, y: 1, collectedHearts: 0};

// Hearts placement (example)
let hearts = [{x: 3, y: 1}, {x: 6, y: 3}];

// Exit position
const exit = {x: 6, y: 6};

// Game state
let gameWon = false;

// Color for walls
const wallColor = '#444';

// Animation loop
function animate() {
    if (!gameWon) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw maze
        drawMaze();

        // Draw bear
        drawEmoji(bearEmoji, bear.x, bear.y);
        
        // Draw hearts
        hearts.forEach(heart => drawEmoji(heartEmoji, heart.x, heart.y));

        // Draw exit
        drawEmoji(exitEmoji, exit.x, exit.y);

        // Check win condition
        if (bear.x === exit.x && bear.y === exit.y) {
            gameWon = true;
            showWin();
        }
    }
    requestAnimationFrame(animate);
}

function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 1) { // Wall
                ctx.fillStyle = wallColor;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function drawEmoji(emoji, x, y) {
    ctx.font = `${cellSize * 0.8}px Arial`;
    ctx.fillText(emoji, x * cellSize + cellSize / 4, y * cellSize + cellSize * 0.8);
}

function showWin() {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    let colorIndex = 0;
    let rainbowCount = 0;

    // Clear the canvas and start the flashing effect
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Flashing "POLINOCHKA"
    let flashingInterval = setInterval(() => {
        ctx.fillStyle = colors[colorIndex];
        // Adjusting the font size to be proportional to the smaller dimension of the screen
        ctx.font = `${Math.min(canvas.width, canvas.height) / 4}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("POLINOCHKA", canvas.width / 2, canvas.height / 2);
        colorIndex = (colorIndex + 1) % colors.length;
    }, 100);

    // Rainbow effect when touching the screen after winning
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameWon) {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    let x = Math.random() * canvas.width;
                    let y = Math.random() * canvas.height;
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.fillText(rainbowEmojis[Math.floor(Math.random() * rainbowEmojis.length)], x, y);
                }, i * 50);
            }
        }
    });

    // Stop the flashing after some time if you want (optional)
    setTimeout(() => {
        clearInterval(flashingInterval);
    }, 10000); // Stops after 10 seconds, adjust as needed
}

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(e) {
    e.preventDefault();
    let touch = e.touches[0];
    let touchX = touch.clientX / cellSize | 0; // Integer division
    let touchY = touch.clientY / cellSize | 0;
    if (maze[touchY][touchX] === 0) {
        bear.x = touchX;
        bear.y = touchY;
        checkHeartCollection();
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    let touch = e.touches[0];
    let touchX = touch.clientX / cellSize | 0;
    let touchY = touch.clientY / cellSize | 0;
    if (maze[touchY][touchX] === 0) {
        bear.x = touchX;
        bear.y = touchY;
        checkHeartCollection();
    }
}

function checkHeartCollection() {
    for (let i = hearts.length - 1; i >= 0; i--) {
        if (hearts[i].x === bear.x && hearts[i].y === bear.y) {
            hearts.splice(i, 1); // Remove heart
            bear.collectedHearts++;
        }
    }
}

// Start the game loop
animate();