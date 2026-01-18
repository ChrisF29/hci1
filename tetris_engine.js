const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

// Scale everything up by 20x (1 block = 20 pixels)
context.scale(20, 20);
nextContext.scale(20, 20);

// --- Game State Variables ---
let score = 0;
let lines = 0;
let level = 1;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isPaused = true;
let isGameOver = false;

// --- Colors based on CSS variables ---
const colors = [
    null,
    '#ff0d72', // T
    '#0dc2ff', // O
    '#0dff72', // L
    '#f538ff', // J
    '#ff8e0d', // I
    '#ffe138', // S
    '#3877ff', // Z
];

// --- The Matrix (Arena) ---
const arena = createMatrix(12, 20);

// --- Player Object ---
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    next: null,
    score: 0,
};

// --- Initialization ---
function init() {
    player.next = createPiece(getRandomType());
    playerReset();
    updateScore();
    draw();
}

// --- Core Game Loop ---
function update(time = 0) {
    if (isPaused || isGameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// --- Drawing Functions ---
function draw() {
    // 1. Clear Screen
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Arena (locked pieces)
    drawMatrix(arena, {x: 0, y: 0}, context);

    // 3. Draw Active Player Piece
    drawMatrix(player.matrix, player.pos, context);
}

function drawNext() {
    // Clear Next Canvas
    nextContext.fillStyle = '#111'; // Slightly lighter bg for box
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    // Center the piece in the 5x5 box
    const offset = {
        x: (5 - player.next[0].length) / 2,
        y: (5 - player.next.length) / 2
    };
    drawMatrix(player.next, offset, nextContext);
}

function drawMatrix(matrix, offset, ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Main Block Color
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                
                // Border effect (Cyberpunk style)
                ctx.lineWidth = 0.05;
                ctx.strokeStyle = 'white';
                ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// --- Logic: Arena & Collision ---
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        rowCount++;
    }

    if (rowCount > 0) {
        // Scoring: 10, 30, 60, 100 based on lines
        const lineScores = [0, 100, 300, 500, 800];
        score += lineScores[rowCount] * level;
        lines += rowCount;
        
        // Level up every 10 lines
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level * 50)); // Speed up
        
        updateScore();
    }
}

// --- Logic: Player Actions ---
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerReset() {
    // If next piece exists, use it. Otherwise random.
    if (player.next === null) {
        player.matrix = createPiece(getRandomType());
    } else {
        player.matrix = player.next;
    }
    
    player.next = createPiece(getRandomType());
    drawNext();

    // Center piece
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);

    // Game Over check
    if (collide(arena, player)) {
        isGameOver = true;
        document.getElementById('overlay-title').innerText = "GAME OVER";
        document.getElementById('start-btn').innerText = "RETRY";
        document.getElementById('overlay').style.display = 'flex';
        document.querySelector('.canvas-container').classList.remove('active');
        
        // --- THIS IS THE MISSING LINE ---
        saveHighScore(score); 
    }
}

function getRandomType() {
    const pieces = 'ILJOTSZ';
    return pieces[pieces.length * Math.random() | 0];
}

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function updateScore() {
    document.getElementById('score').innerText = score;
    document.getElementById('lines').innerText = lines;
    document.getElementById('level').innerText = level;
}

// --- Input & Controls ---
document.addEventListener('keydown', event => {
    if (isPaused || isGameOver) return;

    if (event.keyCode === 37) { // Left
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right
        playerMove(1);
    } else if (event.keyCode === 40) { // Down
        playerDrop();
    } else if (event.keyCode === 38) { // Up (Rotate)
        playerRotate(1);
    }
});

// --- Start Button Logic ---
document.getElementById('start-btn').addEventListener('click', () => {
    const overlay = document.getElementById('overlay');
    const container = document.querySelector('.canvas-container');
    
    // Reset Game State
    arena.forEach(row => row.fill(0));
    score = 0;
    lines = 0;
    level = 1;
    updateScore();
    isGameOver = false;
    isPaused = false;
    
    // UI Updates
    overlay.style.display = 'none';
    container.classList.add('active');
    
    // Start Logic
    playerReset();
    update();
});

function saveHighScore(finalScore) {
    console.log("Attempting to save score:", finalScore); // Debug log

    if (finalScore === 0) return; 

    const formData = new FormData();
    formData.append('score', finalScore);

    fetch('save_score.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log("Server Response:", data); // Check your console for this!
    })
    .catch(error => console.error('Error saving score:', error));
}

// Initial Setup
init();