// game.js

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Words setup
const words = [];
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
const heartEmoji = '❤️'; // Unicode for heart emoji

// Create words
for (let i = 0; i < 10; i++) {
    words.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2, // Velocity x
        vy: (Math.random() - 0.5) * 2, // Velocity y
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: [] // Array to hold the trail of heart emojis
    });
}

let drawingWord = null;

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Move and wrap words
    words.forEach(word => {
        word.x += word.vx;
        word.y += word.vy;
        
        if (word.x < 0 || word.x > canvas.width) word.vx = -word.vx;
        if (word.y < 0 || word.y > canvas.height) word.vy = -word.vy;
        
        // Draw the word
        ctx.fillStyle = word.color;
        ctx.font = "30px Arial";
        ctx.fillText("polinochka", word.x, word.y);

        // Draw heart trail
        word.trail.forEach(([x, y]) => {
            ctx.fillText(heartEmoji, x, y);
        });
    });

    requestAnimationFrame(animate);
}

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(e) {
    e.preventDefault();
    let touch = e.touches[0];
    let touchX = touch.clientX;
    let touchY = touch.clientY;
    words.forEach(word => {
        if (Math.abs(touchX - word.x) < 50 && Math.abs(touchY - word.y) < 30) { // Simple hit detection
            drawingWord = word;
            word.trail.push([word.x, word.y]); // Start the trail
        }
    });
}

function handleTouchMove(e) {
    e.preventDefault();
    if (drawingWord) {
        let touch = e.touches[0];
        let newX = touch.clientX;
        let newY = touch.clientY;
        
        // Only add a new heart if it's far enough from the last one
        let lastHeart = drawingWord.trail[drawingWord.trail.length - 1];
        if (!lastHeart || Math.hypot(newX - lastHeart[0], newY - lastHeart[1]) >= 30) { // Approximate size of one heart emoji
            drawingWord.trail.push([newX, newY]);
        }
        drawingWord.x = newX;
        drawingWord.y = newY;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    drawingWord = null;
}

// Clear button functionality
document.getElementById('clearButton').addEventListener('click', () => {
    words.forEach(word => {
        word.trail = []; // Clear the trail of each word
    });
});

// Start the animation
animate();