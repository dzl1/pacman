const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreEl = document.getElementById('score-value');
const linesEl = document.getElementById('lines-value');
const levelEl = document.getElementById('level-value');
const bestEl = document.getElementById('best-value');
const overlay = document.getElementById('overlay');
const gameOverOverlay = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
nextCanvas.width = 120;
nextCanvas.height = 120;

const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    L: [[1, 0], [1, 0], [1, 1]],
    J: [[0, 1], [0, 1], [1, 1]]
};

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    L: '#f0a000',
    J: '#0000f0'
};

const state = {
    running: false,
    gameOver: false,
    score: 0,
    lines: 0,
    level: 1,
    best: Number(localStorage.getItem('tetris-best') || 0)
};

let board = [];
let currentPiece = null;
let nextPiece = null;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function createPiece() {
    const shapes = Object.keys(SHAPES);
    const type = shapes[Math.floor(Math.random() * shapes.length)];
    return {
        shape: SHAPES[type],
        color: COLORS[type],
        type,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };
}

function drawBlock(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Inner shadow effect
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE / 3);
}

function drawBoard() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }
}

function drawPiece(piece, context = ctx, offsetX = 0, offsetY = 0) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(context, piece.x + x + offsetX, piece.y + y + offsetY, piece.color);
            }
        });
    });
}

function drawNextPiece() {
    nextCtx.fillStyle = '#1a1a2e';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const offsetX = (4 - nextPiece.shape[0].length) / 2;
        const offsetY = (4 - nextPiece.shape.length) / 2;
        
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const drawX = (offsetX + x) * BLOCK_SIZE;
                    const drawY = (offsetY + y) * BLOCK_SIZE;
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
                    nextCtx.strokeStyle = '#000';
                    nextCtx.lineWidth = 2;
                    nextCtx.strokeRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
                    
                    nextCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    nextCtx.fillRect(drawX + 2, drawY + 2, BLOCK_SIZE - 4, BLOCK_SIZE / 3);
                }
            });
        });
    }
}

function collide(piece, offsetX = 0, offsetY = 0) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // Check this row again
        }
    }
    
    if (linesCleared > 0) {
        state.lines += linesCleared;
        const points = [0, 100, 300, 500, 800][linesCleared];
        state.score += points * state.level;
        
        state.level = Math.floor(state.lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (state.level - 1) * 100);
        
        scoreEl.textContent = state.score;
        linesEl.textContent = state.lines;
        levelEl.textContent = state.level;
    }
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    // Wall kick
    let offset = 0;
    while (collide(currentPiece, offset)) {
        offset = offset > 0 ? -(offset + 1) : -offset + 1;
        if (Math.abs(offset) > currentPiece.shape[0].length) {
            currentPiece.shape = previousShape;
            return;
        }
    }
    
    currentPiece.x += offset;
}

function move(direction) {
    currentPiece.x += direction;
    if (collide(currentPiece)) {
        currentPiece.x -= direction;
    }
}

function drop() {
    currentPiece.y++;
    if (collide(currentPiece)) {
        currentPiece.y--;
        merge();
        clearLines();
        
        currentPiece = nextPiece;
        nextPiece = createPiece();
        drawNextPiece();
        
        if (collide(currentPiece)) {
            endGame();
        }
    }
    dropCounter = 0;
}

function hardDrop() {
    while (!collide(currentPiece, 0, 1)) {
        currentPiece.y++;
    }
    drop();
}

function resetGame() {
    board = createBoard();
    state.running = true;
    state.gameOver = false;
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    dropInterval = 1000;
    dropCounter = 0;
    
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    scoreEl.textContent = state.score;
    linesEl.textContent = state.lines;
    levelEl.textContent = state.level;
    overlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    
    drawNextPiece();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    state.running = false;
    state.gameOver = true;
    
    finalScoreEl.textContent = state.score;
    gameOverOverlay.classList.remove('hidden');
    
    if (state.score > state.best) {
        state.best = state.score;
        localStorage.setItem('tetris-best', String(state.best));
        bestEl.textContent = state.best;
    }
}

function draw() {
    drawBoard();
    if (currentPiece) {
        drawPiece(currentPiece);
    }
}

function gameLoop(time = 0) {
    if (!state.running) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        drop();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Event Listeners
window.addEventListener('keydown', event => {
    if (!state.running) return;
    
    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            move(-1);
            break;
        case 'ArrowRight':
            event.preventDefault();
            move(1);
            break;
        case 'ArrowDown':
            event.preventDefault();
            drop();
            break;
        case 'ArrowUp':
            event.preventDefault();
            rotate();
            break;
        case ' ':
            event.preventDefault();
            hardDrop();
            break;
    }
});

startBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

bestEl.textContent = state.best;
draw();
