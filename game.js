const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let video; // will hold the video element
let stream; // will hold the stream from getUserMedia

function init() {
    // Request access to webcam
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(streamSource) {
        video = document.createElement('video');
        video.srcObject = streamSource;
        video.play();
        stream = streamSource;
        requestAnimationFrame(draw);
    })
    .catch(function(err) {
        console.log("An error occurred: " + err);
    });
}

function draw() {
    if (video) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get mouse position
        let mouseY = event.clientY || 0;

        // Calculate pixelation based on mouse position
        let pixelation = Math.floor(20 - (mouseY / canvas.height * 20)); // 20 is max pixelation at the top

        if (pixelation > 1) {
            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imgData.data;
            let newCanvas = document.createElement('canvas');
            newCanvas.width = canvas.width / pixelation;
            newCanvas.height = canvas.height / pixelation;
            let newCtx = newCanvas.getContext('2d');
            
            // Draw the original image onto the smaller canvas
            newCtx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
            
            // Scale back up to original size
            ctx.drawImage(newCanvas, 0, 0, canvas.width, canvas.height);
        }

        requestAnimationFrame(draw);
    }
}

// Event listener for mouse movement
canvas.addEventListener('mousemove', draw);

init();
