let video = document.getElementById('video');
let words = [];
let isPlaying = false;
const startButton = document.getElementById('startButton');
const debug = document.getElementById('debug');

function getViewportSize() {
    return {
        width: Math.min(window.innerWidth, document.documentElement.clientWidth),
        height: Math.min(window.innerHeight, document.documentElement.clientHeight)
    };
}

function createWord(x, y) {
    const word = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 3, // Initial velocity
        vy: (Math.random() - 0.5) * 3,
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
    // Clear existing words
    words.forEach(word => {
        if (word.element.parentNode) {
            word.element.parentNode.removeChild(word.element);
        }
    });
    words = [];

    const viewport = getViewportSize();
    
    // Create words at different positions
    const wordPositions = [
        { x: viewport.width * 0.2, y: viewport.height * 0.2 },
        { x: viewport.width * 0.8, y: viewport.height * 0.2 },
        { x: viewport.width * 0.2, y: viewport.height * 0.8 },
        { x: viewport.width * 0.8, y: viewport.height * 0.8 },
        { x: viewport.width * 0.5, y: viewport.height * 0.3 },
        { x: viewport.width * 0.5, y: viewport.height * 0.7 }
    ];

    wordPositions.forEach(pos => {
        const word = createWord(pos.x, pos.y);
        words.push(word);
    });

    // Start the animation
    requestAnimationFrame(moveWords);
}

function moveWords(timestamp) {
    if (!isPlaying) return;

    const viewport = getViewportSize();
    
    words.forEach(word => {
        // Update position based on velocity
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

        // Apply the new position
        word.element.style.transform = `translate(${word.x}px, ${word.y}px)`;
    });

    requestAnimationFrame(moveWords);
}

startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: window.innerWidth },
                height: { ideal: window.innerHeight }
            } 
        });
        video.srcObject = stream;
        startButton.style.display = 'none';
        isPlaying = true;
        initGame();
        startFaceDetection();
    } catch (err) {
        debug.textContent = "Error accessing camera: " + err.message;
    }
});

async function startFaceDetection() {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.load('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/tiny_face_detector_model-weights_manifest.json'),
            faceapi.nets.faceLandmark68Net.load('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/face_landmark_68_model-weights_manifest.json')
        ]);

        const nosePoint = document.getElementById('nosePoint');
        debug.textContent = "Face detection loaded successfully!";
        
        setInterval(async () => {
            if (!isPlaying) return;
            
            const detections = await faceapi.detectAllFaces(video, 
                new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            
            if (detections && detections[0]) {
                const nose = detections[0].landmarks.getNose()[0];
                // Update nose point position
                nosePoint.style.display = 'block';
                nosePoint.style.left = `${nose._x}px`;
                nosePoint.style.top = `${nose._y}px`;
                
                checkCollisions(nose._x, nose._y);
            } else {
                nosePoint.style.display = 'none';
            }
        }, 100);
    } catch (err) {
        debug.textContent = "Error loading face detection: " + err.message;
        console.error(err);
    }
}

function checkCollisions(noseX, noseY) {
    words.forEach(word => {
        const dx = word.x - noseX;
        const dy = word.y - noseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) { // Collision radius
            // Bounce away from nose
            const angle = Math.atan2(dy, dx);
            const force = 8;
            const impactFactor = 1 - (distance / 150); // Closer hits have more effect
            
            word.vx = (Math.cos(angle) * force * impactFactor) + word.vx * 0.5;
            word.vy = (Math.sin(angle) * force * impactFactor) + word.vy * 0.5;

            // Limit maximum speed
            const maxSpeed = 15;
            const currentSpeed = Math.sqrt(word.vx * word.vx + word.vy * word.vy);
            if (currentSpeed > maxSpeed) {
                word.vx = (word.vx / currentSpeed) * maxSpeed;
                word.vy = (word.vy / currentSpeed) * maxSpeed;
            }
        }
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    const viewport = getViewportSize();
    words.forEach(word => {
        word.x = Math.min(word.x, viewport.width - 100);
        word.y = Math.min(word.y, viewport.height - 100);
    });
});