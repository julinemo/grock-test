let words = [];
let isPlaying = false;
const startButton = document.getElementById('startButton');

function getViewportSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

function createWord(x, y) {
    const word = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        element: document.createElement('div')
    };

    word.element.className = 'word';
    word.element.textContent = 'polinochka';
    word.element.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    word.element.style.fontSize = `${20 + Math.random() * 30}px`;
    
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

        // Apply some friction
        word.vx *= 0.99;
        word.vy *= 0.99;

        // Ensure minimum speed
        const minSpeed = 0.5;
        const speed = Math.sqrt(word.vx * word.vx + word.vy * word.vy);
        if (speed < minSpeed) {
            word.vx *= minSpeed / speed;
            word.vy *= minSpeed / speed;
        }

        word.element.style.transform = `translate(${word.x}px, ${word.y}px)`;
    });

    requestAnimationFrame(moveWords);
}

function handleTouch(event) {
    event.preventDefault();
    
    Array.from(event.touches).forEach(touch => {
        const touchX = touch.clientX;
        const touchY = touch.clientY;

        words.forEach(word => {
            const dx = word.x - touchX;
            const dy = word.y - touchY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const angle = Math.atan2(dy, dx);
                const force = 15;
                const impactFactor = 1 - (distance / 150);
                
                word.vx = Math.cos(angle) * force * impactFactor;
                word.vy = Math.sin(angle) * force * impactFactor;
            }
        });
    });
}

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    isPlaying = true;
    initGame();
    requestAnimationFrame(moveWords);
});

document.addEventListener('touchstart', handleTouch);
document.addEventListener('touchmove', handleTouch);