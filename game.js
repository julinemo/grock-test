const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let video;
let stream;
let words = [];
const pastelColors = ['#b3e5fc', '#81d4fa', '#ffccbc', '#c8e6c9'];

// Добавим простой детектор лица (упрощенный вариант)
function detectFace() {
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let faceY = canvas.height / 2; // Простое предположение, что лицо примерно в центре

    // Простой алгоритм определения цвета кожи для нахождения лица
    for (let y = 0; y < frame.height; y += 5) {
        for (let x = 0; x < frame.width; x += 5) {
            let index = (x + y * frame.width) * 4;
            let r = frame.data[index];
            let g = frame.data[index + 1];
            let b = frame.data[index + 2];
            if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
                faceY = y;
                break;
            }
        }
        if (faceY !== canvas.height / 2) break;
    }
    return { x: canvas.width / 2, y: faceY }; // Возвращаем примерное положение лица
}

function init() {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(streamSource) {
        video = document.createElement('video');
        video.srcObject = streamSource;
        video.play();
        stream = streamSource;
        setupWords();
        requestAnimationFrame(update);
    })
    .catch(function(err) {
        console.log("Ошибка доступа к камере: " + err);
    });

    // Устанавливаем размер canvas по размеру экрана
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupWords() {
    for (let i = 0; i < 3; i++) {
        words.push({
            text: "палинчка",
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            size: Math.random() * 40 + 20,
            color: pastelColors[Math.floor(Math.random() * pastelColors.length)]
        });
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (video) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Обновляем слова
        words.forEach(word => {
            word.x += word.dx;
            word.y += word.dy;

            // Отскок от границ
            if (word.x < 0 || word.x > canvas.width) word.dx = -word.dx;
            if (word.y < 0 || word.y > canvas.height) word.dy = -word.dy;

            // Взаимодействие с лицом
            let face = detectFace();
            let dx = word.x - face.x;
            let dy = word.y - face.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) { // Примерное расстояние взаимодействия
                let angle = Math.atan2(dy, dx);
                word.dx = Math.cos(angle) * 5;
                word.dy = Math.sin(angle) * 5;
            }

            ctx.font = `${word.size}px Arial`;
            ctx.fillStyle = word.color;
            ctx.fillText(word.text, word.x, word.y);
        });
    }

    requestAnimationFrame(update);
}

init();