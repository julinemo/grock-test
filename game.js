let words = [];
let trails = [];
let isPlaying = false;
let touchedWord = null;
const startButton = document.getElementById('startButton');
const clearButton = document.getElementById('clearButton');

function getViewportSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

function createWord(x, y, isTrail = false, color = null, size = null) {
    const word = {
        x: x,
        y: y,
        vx: isTrail ? 0 : (Math.random() - 0.5) * 2,
        vy: isTrail ? 0 : (Math.random() - 0.5) * 2,
        element: document.createElement('div'),
        color: color || `hsl(${Math.random() * 360}, 100%, 50%)`,
        size: size || `${20 + Math.random() * 30}px`
    };

    word.element.className = 'word' + (isTrail ? ' trail' : '');
    word.element.textContent = 'polinochka';
    word.element.style.color = word.color;
    word.element.style.fontSize = word.size;
    
    document.body.appendChild(word.element);
    return word;
}

function initGame() {
    const viewport = getViewportSize();
    
    // Create 6 words in different positions
    for (let i = 0; i < 6; i++) {
        const x = Math.random() * (viewport.width - 100);
        const y = Math.random() * (viewport.height - 100);
        const word = createWord(x, y);
        words.push(word);
    }

    clearButton.style.display = 'block';
}

function moveWords() {
    if (!isPlaying) return;

    const viewport = getViewportSize();
    
    words.forEach(word => {
        word.x += word.vx;
        word.y += word.vy;

        // Bounce off walls
        if (word.x <= 0 || word.x >= viewport.width - 100) {
            word.vx *= -1;
            word.x = Math.max(0, Math.min(word.x, viewport.width - 100));
        }
        if (word.y <= 0 || word.y >= viewport.height - 100) {
            word.vy *= -1;
            word.y = Math.max(0, Math.min(word.y, viewport.height - 100));
        }

        word.vx *= 0.99;
        word.vy *= 0.99;

        const minSpeed = 0.5;
        const speed = Math.sqrt(word.vx * word.vx + word.vy * word.vy);
        if (speed < minSpeed) {
            word.vx *= minSpeed / speed;
            word.vy *= minSpeed / speed;
        }

        word.element.style.transform = `translate(${word.x}px, ${word.y}px)`;
    });

    // Fade out and remove old trails
    trails = trails.filter(trail => {
        trail.opacity = (trail.opacity || 1) - 0.005;
        if (trail.opacity <= 0) {
            trail.element.remove();
            return false;
        }
        trail.element.style.opacity = trail.opacity;
        return true;
    });

    requestAnimationFrame(moveWords);
}

function findTouchedWord(x, y) {
    return words.find(word => {
        const dx = word.x - x;
        const dy = word.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 50;
    });
}

function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    touchedWord = findTouchedWord(touch.clientX, touch.clientY);
}

function handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    
    if (touchedWord) {
        // Create trail at touch position
        const trail = createWord(
            touch.clientX, 
            touch.clientY, 
            true, 
            touchedWord.color, 
            touchedWord.size
        );
        trails.push(trail);

        // Limit trail length
        if (trails.length > 50) {
            const oldTrail = trails.shift();
            oldTrail.element.remove();
        }
    }
}

function handleTouchEnd() {
    touchedWord = null;
}

function clearTrails() {
    trails.forEach(trail => trail.element.remove());
    trails = [];
}

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    isPlaying = true;
    initGame();
    requestAnimationFrame(moveWords);
});

clearButton.addEventListener('click', clearTrails);

document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleTouchEnd);