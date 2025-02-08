const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let video;
let stream;
let words = [];
const pastelColors = ['#b3e5fc', '#81d4fa', '#ffccbc', '#c8e6c9']; // Голубой, синий, оранжевый, зеленый

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

        // Обновляем позиции слов
        words.forEach(word => {
            word.x += word.dx;
            word.y += word.dy;

            // Отскакивание от границ экрана
            if (word.x < 0 || word.x > canvas.width) word.dx = -word.dx;
            if (word.y < 0 || word.y > canvas.height) word.dy = -word.dy;

            ctx.font = `${word.size}px Arial`;
            ctx.fillStyle = word.color;
            ctx.fillText(word.text, word.x, word.y);
        });
    }

    requestAnimationFrame(update);
}

init();

// Детектирование лица для взаимодействия (упрощенно)
document.addEventListener('mousemove', function(event) {
    let x = event.clientX;
    let y = event.clientY;
    
    words.forEach(word => {
        let dx = word.x - x;
        let dy = word.y - y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) { // Примерное расстояние для взаимодействия
            let angle = Math.atan2(dy, dx);
            word.dx = Math.cos(angle) * 5;
            word.dy = Math.sin(angle) * 5;
        }
    });
});