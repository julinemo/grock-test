let video = document.getElementById('video');
let words = [];
let isPlaying = false;
const startButton = document.getElementById('startButton');

// Create bouncing words
function createWord() {
    return {
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
        velocityX: (Math.random() - 0.5) * 5,
        velocityY: (Math.random() - 0.5) * 5,
        element: document.createElement('div')
    };
}

// Initialize game
function initGame() {
    // Create 6 words
    for (let i = 0; i < 6; i++) {
        const word = createWord();
        word.element.className = 'word';
        word.element.textContent = 'polinochka';
        word.element.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        word.element.style.fontSize = `${Math.random() * 20 + 20}px`;
        document.body.appendChild(word.element);
        words.push(word);
    }
}

// Start camera
startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        startButton.style.display = 'none';
        isPlaying = true;
        initGame();
        startFaceDetection();
    } catch (err) {
        console.error("Error accessing camera:", err);
    }
});

// Face detection setup
async function startFaceDetection() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
    
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, 
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        
        if (detections && detections[0]) {
            const nose = detections[0].landmarks.getNose()[0];
            checkCollisions(nose._x, nose._y);
        }
    }, 100);
}

// Update word positions and check collisions
function updatePositions() {
    if (!isPlaying) return;

    words.forEach(word => {
        // Update position
        word.x += word.velocityX;
        word.y += word.velocityY;

        // Bounce off walls
        if (word.x <= 0 || word.x >= window.innerWidth - 100) {
            word.velocityX *= -1;
        }
        if (word.y <= 0 || word.y >= window.innerHeight - 100) {
            word.velocityY *= -1;
        }

        // Update DOM element position
        word.element.style.transform = `translate(${word.x}px, ${word.y}px)`;
    });

    requestAnimationFrame(updatePositions);
}

// Check collisions with nose
function checkCollisions(noseX, noseY) {
    words.forEach(word => {
        const dx = word.x - noseX;
        const dy = word.y - noseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50) { // Collision threshold
            // Calculate bounce angle
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(word.velocityX * word.velocityX + 
                                 word.velocityY * word.velocityY);
            
            word.velocityX = Math.cos(angle) * speed * 1.2;
            word.velocityY = Math.sin(angle) * speed * 1.2;
        }
    });
}

// Start animation loop
requestAnimationFrame(updatePositions);