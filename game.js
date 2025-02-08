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

function createWord() {
    const viewport = getViewportSize();
    return {
        x: Math.random() * (viewport.width - 100),
        y: Math.random() * (viewport.height - 100),
        velocityX: (Math.random() - 0.5) * 3,
        velocityY: (Math.random() - 0.5) * 3,
        element: document.createElement('div')
    };
}

function initGame() {
    // Clear any existing words
    words.forEach(word => {
        if (word.element.parentNode) {
            word.element.parentNode.removeChild(word.element);
        }
    });
    words = [];

    // Create new words
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
        // Wait for DOM content to load
        if (document.readyState !== 'complete') {
            await new Promise(resolve => window.addEventListener('load', resolve));
        }
        
        // Wait a moment to ensure face-api is loaded
        await new Promise(resolve => setTimeout(resolve, 500));

        // Load models from CDN
        await Promise.all([
            faceapi.nets.tinyFaceDetector.load('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/tiny_face_detector_model-weights_manifest.json'),
            faceapi.nets.faceLandmark68Net.load('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/face_landmark_68_model-weights_manifest.json')
        ]);

        debug.textContent = "Face detection loaded successfully!";
        
        setInterval(async () => {
            if (!isPlaying) return;
            
            const detections = await faceapi.detectAllFaces(video, 
                new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            
            if (detections && detections[0]) {
                const nose = detections[0].landmarks.getNose()[0];
                const viewport = getViewportSize();
                const scaleX = viewport.width / video.videoWidth;
                const scaleY = viewport.height / video.videoHeight;
                checkCollisions(nose._x * scaleX, nose._y * scaleY);
            }
        }, 100);
    } catch (err) {
        debug.textContent = "Error loading face detection: " + err.message;
        console.error(err);
    }
}

function updatePositions() {
    if (!isPlaying) return;

    const viewport = getViewportSize();
    
    words.forEach(word => {
        word.x += word.velocityX;
        word.y += word.velocityY;

        // Bounce off walls
        if (word.x <= 0 || word.x >= viewport.width - 100) {
            word.velocityX *= -1;
            word.x = Math.max(0, Math.min(word.x, viewport.width - 100));
        }
        if (word.y <= 0 || word.y >= viewport.height - 100) {
            word.velocityY *= -1;
            word.y = Math.max(0, Math.min(word.y, viewport.height - 100));
        }

        word.element.style.transform = `translate(${word.x}px, ${word.y}px)`;
    });

    requestAnimationFrame(updatePositions);
}

function checkCollisions(noseX, noseY) {
    words.forEach(word => {
        const dx = word.x - noseX;
        const dy = word.y - noseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 70) { // Increased collision threshold
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(word.velocityX * word.velocityX + word.velocityY * word.velocityY);
            
            word.velocityX = Math.cos(angle) * speed * 1.2;
            word.velocityY = Math.sin(angle) * speed * 1.2;
            
            // Ensure minimum speed
            const minSpeed = 2;
            if (Math.abs(word.velocityX) < minSpeed) word.velocityX *= minSpeed / Math.abs(word.velocityX);
            if (Math.abs(word.velocityY) < minSpeed) word.velocityY *= minSpeed / Math.abs(word.velocityY);
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

requestAnimationFrame(updatePositions);