const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score-value');
const bestEl = document.getElementById('best-value');
const overlay = document.getElementById('overlay');
const gameOverOverlay = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const state = {
    running: false,
    gameOver: false,
    score: 0,
    best: Number(localStorage.getItem('flappy-best') || 0)
};

const bird = {
    x: 0,
    y: 0,
    radius: 14,
    velocity: 0,
    rotation: 0,
    targetRotation: 0
};

const physics = {
    gravity: 0.16,
    lift: -5.5
};

const pipes = [];
const pipeConfig = {
    width: 80,
    gap: 250,
    speed: 1.5,
    spawnFrames: 150
};

const fruits = [];
const bullets = [];
const fruitTypes = {
    shield: { color: '#ec4899', emoji: '🛡️', duration: 600 },
    bullets: { color: '#f59e0b', emoji: '💥', duration: 600 }
};

const powerups = {
    shield: { active: false, endFrame: 0 },
    bullets: { active: false, endFrame: 0 }
};

let frameCount = 0;
let groundOffset = 0;

const groundImage = new Image();
groundImage.src = 'images/ground.png';

function resizeCanvas() {
    const { width, height } = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    bird.x = width * 0.28;
    bird.y = height * 0.5;
}

function resetGame() {
    state.running = true;
    state.gameOver = false;
    state.score = 0;
    frameCount = 0;
    groundOffset = 0;
    pipes.length = 0;
    fruits.length = 0;
    bullets.length = 0;
    powerups.shield.active = false;
    powerups.bullets.active = false;

    bird.velocity = 0;
    bird.y = canvas.getBoundingClientRect().height * 0.5;

    scoreEl.textContent = state.score;
    overlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
}

function endGame() {
    state.running = false;
    state.gameOver = true;

    finalScoreEl.textContent = state.score;
    gameOverOverlay.classList.remove('hidden');

    if (state.score > state.best) {
        state.best = state.score;
        localStorage.setItem('flappy-best', String(state.best));
        bestEl.textContent = state.best;
    }
}

function spawnPipe() {
    const { height } = canvas.getBoundingClientRect();
    const minGapTop = 80;
    const maxGapTop = height - pipeConfig.gap - 120;
    const gapTop = minGapTop + Math.random() * (maxGapTop - minGapTop);

    pipes.push({
        x: canvas.getBoundingClientRect().width + pipeConfig.width,
        gapTop,
        passed: false
    });
}

function spawnFruit() {
    const { width, height } = canvas.getBoundingClientRect();
    const types = Object.keys(fruitTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    
    fruits.push({
        x: width + 50,
        y: 80 + Math.random() * (height - 180),
        radius: 10,
        type,
        collected: false
    });
}

function update() {
    if (!state.running) {
        draw();
        return;
    }

    frameCount += 1;
    if (frameCount % pipeConfig.spawnFrames === 0) {
        spawnPipe();
    }

    bird.velocity += physics.gravity;
    bird.y += bird.velocity;

    const bounds = canvas.getBoundingClientRect();

    if (bird.y + bird.radius >= bounds.height || bird.y - bird.radius <= 0) {
        endGame();
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeConfig.speed;

        const topPipeBottom = pipe.gapTop;
        const bottomPipeTop = pipe.gapTop + pipeConfig.gap;

        const hitsPipe = bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipeConfig.width &&
            (bird.y - bird.radius < topPipeBottom || bird.y + bird.radius > bottomPipeTop);

        if (hitsPipe && !powerups.shield.active) {
            endGame();
        }

        if (!pipe.passed && pipe.x + pipeConfig.width < bird.x) {
            pipe.passed = true;
            state.score += 1;
            scoreEl.textContent = state.score;
        }
    });

    // Update power-up timers
    if (powerups.shield.active && frameCount >= powerups.shield.endFrame) {
        powerups.shield.active = false;
    }
    if (powerups.bullets.active && frameCount >= powerups.bullets.endFrame) {
        powerups.bullets.active = false;
    }

    // Spawn fruits randomly
    if (frameCount % 300 === 0 && Math.random() > 0.3) {
        spawnFruit();
    }

    // Update fruits
    fruits.forEach(fruit => {
        fruit.x -= pipeConfig.speed;

        const distance = Math.hypot(bird.x - fruit.x, bird.y - fruit.y);
        if (distance < bird.radius + fruit.radius && !fruit.collected) {
            fruit.collected = true;
            activatePowerup(fruit.type);
        }
    });

    // Remove off-screen fruits
    for (let i = fruits.length - 1; i >= 0; i--) {
        if (fruits[i].x < -50 || fruits[i].collected) {
            fruits.splice(i, 1);
        }
    }

    // Update bullets
    bullets.forEach(bullet => {
        bullet.x += bullet.speed;
    });

    // Check bullet-pipe collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        let hit = false;

        for (let j = pipes.length - 1; j >= 0; j--) {
            const pipe = pipes[j];
            const hitsPipe = bullet.x > pipe.x && 
                bullet.x < pipe.x + pipeConfig.width &&
                (bullet.y < pipe.gapTop || bullet.y > pipe.gapTop + pipeConfig.gap);

            if (hitsPipe) {
                // Create explosion effect
                createPipeExplosion(bullet.x, bullet.y);
                bullets.splice(i, 1);
                pipes.splice(j, 1);
                hit = true;
                break;
            }
        }
    }

    // Remove off-screen bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].x > canvas.getBoundingClientRect().width) {
            bullets.splice(i, 1);
        }
    }

    // Update bird rotation based on velocity
    bird.targetRotation = Math.max(-0.4, Math.min(0.4, bird.velocity * 0.04));
    bird.rotation += (bird.targetRotation - bird.rotation) * 0.1;

    // Update ground scrolling
    groundOffset -= pipeConfig.speed;
    if (groundOffset <= -336) {
        groundOffset = 0;
    }

    while (pipes.length && pipes[0].x + pipeConfig.width < -50) {
        pipes.shift();
    }

    draw();
}

function draw() {
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    // Create sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw ground image with scrolling
    const groundHeight = 120;
    const groundWidth = 336;
    const numTiles = Math.ceil(width / groundWidth) + 2;
    
    for (let i = 0; i < numTiles; i++) {
        ctx.drawImage(groundImage, groundOffset + i * groundWidth, height - groundHeight, groundWidth, groundHeight);
    }

    pipes.forEach(pipe => {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(pipe.x, 0, pipeConfig.width, pipe.gapTop);
        ctx.fillRect(pipe.x, pipe.gapTop + pipeConfig.gap, pipeConfig.width, height);

        ctx.fillStyle = '#15803d';
        ctx.fillRect(pipe.x - 6, pipe.gapTop - 16, pipeConfig.width + 12, 16);
        ctx.fillRect(pipe.x - 6, pipe.gapTop + pipeConfig.gap, pipeConfig.width + 12, 16);
    });

    // Draw fruits
    fruits.forEach(fruit => {
        if (!fruit.collected) {
            ctx.fillStyle = fruitTypes[fruit.type].color;
            ctx.beginPath();
            ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fruitTypes[fruit.type].emoji, fruit.x, fruit.y);
        }
    });

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius + 2, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Draw explosion particles
    explosionParticles.forEach((particle, i) => {
        ctx.fillStyle = `rgba(255, 159, 64, ${particle.life / 30})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 1;
    });
    explosionParticles.length = explosionParticles.filter(p => p.life > 0).length;
    if (explosionParticles.length === 0) explosionParticles.length = 0;
    // Recreate array without mutation
    const activeParticles = explosionParticles.filter(p => p.life > 0);
    explosionParticles.length = 0;
    activeParticles.forEach(p => explosionParticles.push(p));

    // Draw bird with rotation
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(4, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Draw shield indicator
    if (powerups.shield.active) {
        const remaining = powerups.shield.endFrame - frameCount;
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.ceil(remaining / 60)}s`, bird.x, bird.y - 30);
    }

    // Draw bullets active indicator
    if (powerups.bullets.active) {
        const remaining = powerups.bullets.endFrame - frameCount;
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🔫 ${Math.ceil(remaining / 60)}s`, bird.x, bird.y + 30);
    }
}

function activatePowerup(type) {
    if (type === 'shield') {
        powerups.shield.active = true;
        powerups.shield.endFrame = frameCount + fruitTypes.shield.duration;
    } else if (type === 'bullets') {
        powerups.bullets.active = true;
        powerups.bullets.endFrame = frameCount + fruitTypes.bullets.duration;
    }
}

function shootBullet() {
    bullets.push({
        x: bird.x + bird.radius,
        y: bird.y,
        speed: 6,
        radius: 5
    });
}

const explosionParticles = [];

function createPipeExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        explosionParticles.push({
            x,
            y,
            vx: Math.cos(angle) * 4,
            vy: Math.sin(angle) * 4,
            life: 30
        });
    }
}

function flap() {
    if (!state.running) {
        resetGame();
    }
    if (!state.gameOver) {
        bird.velocity = physics.lift;
        if (powerups.bullets.active) {
            shootBullet();
        }
    }
}

window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
});

window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        event.preventDefault();
        flap();
    }
});

canvas.addEventListener('pointerdown', () => {
    flap();
});

startBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

bestEl.textContent = state.best;
resizeCanvas();

function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

gameLoop();
