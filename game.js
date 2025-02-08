// game.js

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Words setup
const words = [];
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

// Create words
for (let i = 0; i < 10; i++) {
    words.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2, // Velocity x
        vy: (Math.random() - 0.5) * 2, // Velocity y
        color: colors[Math.floor(Math.random() * colors.length)]
    });
}

let drawingWord = null;
let lastX, lastY;

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
        
        // Drawing logic
        if (word === drawingWord) {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(word.x, word.y);
            ctx.strokeStyle = word.color;
            ctx.lineWidth = 5;
            ctx.stroke();
            lastX = word.x;
            lastY = word.y;
        }
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
            lastX = word.x;
            lastY = word.y;
        }
    });
}

function handleTouchMove(e) {
    e.preventDefault();
    if (drawingWord) {
        let touch = e.touches[0];
        drawingWord.x = touch.clientX;
        drawingWord.y = touch.clientY;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    drawingWord = null;
}

// Start the animation
animate();