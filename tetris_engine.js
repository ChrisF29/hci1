// ============================================
// TETRONIX ENGINE v2.0 - Full Featured Tetris
// ============================================

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold');
const holdContext = holdCanvas ? holdCanvas.getContext('2d') : null;

// Scale: 1 block = 20 pixels
const BLOCK_SIZE = 20;
const COLS = 12;
const ROWS = 20;

context.scale(BLOCK_SIZE, BLOCK_SIZE);
nextContext.scale(BLOCK_SIZE, BLOCK_SIZE);
if (holdContext) holdContext.scale(BLOCK_SIZE, BLOCK_SIZE);

// ============================================
// GAME STATE
// ============================================
const gameState = {
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    dropCounter: 0,
    dropInterval: 1000,
    lastTime: 0,
    isPaused: true,
    isGameOver: false,
    canHold: true,
    lockDelay: 500,
    lockCounter: 0,
    isLocking: false,
    totalPiecesPlaced: 0,
    startTime: null,
    gameTime: 0,
};

// ============================================
// TETROMINO DEFINITIONS (SRS Standard)
// ============================================
const PIECES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        color: '#00f5ff', // Cyan
        ghost: 'rgba(0, 245, 255, 0.3)',
    },
    O: {
        shape: [
            [2, 2],
            [2, 2],
        ],
        color: '#facc15', // Yellow
        ghost: 'rgba(250, 204, 21, 0.3)',
    },
    T: {
        shape: [
            [0, 3, 0],
            [3, 3, 3],
            [0, 0, 0],
        ],
        color: '#a855f7', // Purple
        ghost: 'rgba(168, 85, 247, 0.3)',
    },
    S: {
        shape: [
            [0, 4, 4],
            [4, 4, 0],
            [0, 0, 0],
        ],
        color: '#22c55e', // Green
        ghost: 'rgba(34, 197, 94, 0.3)',
    },
    Z: {
        shape: [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ],
        color: '#ef4444', // Red
        ghost: 'rgba(239, 68, 68, 0.3)',
    },
    J: {
        shape: [
            [6, 0, 0],
            [6, 6, 6],
            [0, 0, 0],
        ],
        color: '#3b82f6', // Blue
        ghost: 'rgba(59, 130, 246, 0.3)',
    },
    L: {
        shape: [
            [0, 0, 7],
            [7, 7, 7],
            [0, 0, 0],
        ],
        color: '#ff9f1c', // Orange
        ghost: 'rgba(255, 159, 28, 0.3)',
    },
};

// Color palette for rendering
const COLORS = [
    null,
    '#00f5ff', // I - Cyan
    '#facc15', // O - Yellow  
    '#a855f7', // T - Purple
    '#22c55e', // S - Green
    '#ef4444', // Z - Red
    '#3b82f6', // J - Blue
    '#ff9f1c', // L - Orange
];

const GHOST_COLORS = [
    null,
    'rgba(0, 245, 255, 0.25)',
    'rgba(250, 204, 21, 0.25)',
    'rgba(168, 85, 247, 0.25)',
    'rgba(34, 197, 94, 0.25)',
    'rgba(239, 68, 68, 0.25)',
    'rgba(59, 130, 246, 0.25)',
    'rgba(255, 159, 28, 0.25)',
];

// ============================================
// SRS WALL KICK DATA
// ============================================
const WALL_KICKS = {
    'JLSTZ': {
        '0->R': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        'R->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        'R->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        '2->R': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '2->L': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
        'L->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        'L->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '0->L': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    },
    'I': {
        '0->R': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        'R->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        'R->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
        '2->R': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        '2->L': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        'L->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        'L->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        '0->L': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    },
};

const ROTATION_STATES = ['0', 'R', '2', 'L'];

// ============================================
// ARENA (PLAYFIELD)
// ============================================
const arena = createMatrix(COLS, ROWS);
const particles = [];
const lineClearEffects = [];

// ============================================
// PLAYER OBJECT
// ============================================
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    pieceType: null,
    rotation: 0,
    next: [],
    hold: null,
    ghostY: 0,
};

// 7-bag randomizer
let pieceBag = [];

// ============================================
// AUDIO SYSTEM
// ============================================
const AudioManager = {
    enabled: true,
    volume: 0.3,
    
    sounds: {
        move: null,
        rotate: null,
        drop: null,
        hardDrop: null,
        lineClear: null,
        tetris: null,
        levelUp: null,
        gameOver: null,
        hold: null,
    },
    
    init() {
        // Create audio context for generating sounds
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    },
    
    play(soundName) {
        if (!this.enabled || !this.audioCtx) return;
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.setValueAtTime(this.volume, now);
        
        switch(soundName) {
            case 'move':
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.type = 'square';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.start(now);
                oscillator.stop(now + 0.05);
                break;
                
            case 'rotate':
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.1);
                oscillator.type = 'sine';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
                
            case 'drop':
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.type = 'triangle';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                oscillator.start(now);
                oscillator.stop(now + 0.08);
                break;
                
            case 'hardDrop':
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.15);
                oscillator.type = 'sawtooth';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
                
            case 'lineClear':
                oscillator.frequency.setValueAtTime(523, now); // C5
                oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
                oscillator.frequency.setValueAtTime(784, now + 0.2); // G5
                oscillator.type = 'square';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
                
            case 'tetris':
                // Epic 4-line clear sound
                oscillator.frequency.setValueAtTime(261, now);
                oscillator.frequency.setValueAtTime(329, now + 0.1);
                oscillator.frequency.setValueAtTime(392, now + 0.2);
                oscillator.frequency.setValueAtTime(523, now + 0.3);
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(this.volume * 1.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;
                
            case 'levelUp':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                oscillator.type = 'sine';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
                
            case 'gameOver':
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.5);
                oscillator.type = 'sawtooth';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;
                
            case 'hold':
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.setValueAtTime(500, now + 0.05);
                oscillator.type = 'sine';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
        }
    },
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    AudioManager.init();
    fillBag();
    player.next = [getNextPiece(), getNextPiece(), getNextPiece()];
    playerReset();
    updateUI();
    draw();
}

function fillBag() {
    pieceBag = Object.keys(PIECES).sort(() => Math.random() - 0.5);
}

function getNextPiece() {
    if (pieceBag.length === 0) fillBag();
    return pieceBag.pop();
}

// ============================================
// MATRIX UTILITIES
// ============================================
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function cloneMatrix(matrix) {
    return matrix.map(row => [...row]);
}

// ============================================
// COLLISION DETECTION
// ============================================
function collide(arena, player, offsetX = 0, offsetY = 0) {
    const m = player.matrix;
    const o = player.pos;
    
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0) {
                const newX = x + o.x + offsetX;
                const newY = y + o.y + offsetY;
                
                // Check bounds
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                // Check collision with arena (only if within bounds)
                if (newY >= 0 && arena[newY] && arena[newY][newX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// ============================================
// GHOST PIECE
// ============================================
function calculateGhostPosition() {
    let ghostY = player.pos.y;
    while (!collide(arena, { matrix: player.matrix, pos: { x: player.pos.x, y: ghostY + 1 } })) {
        ghostY++;
    }
    player.ghostY = ghostY;
}

// ============================================
// ROTATION WITH WALL KICKS
// ============================================
function rotateMatrix(matrix, dir) {
    const N = matrix.length;
    const rotated = createMatrix(N, N);
    
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            if (dir > 0) { // Clockwise
                rotated[x][N - 1 - y] = matrix[y][x];
            } else { // Counter-clockwise
                rotated[N - 1 - x][y] = matrix[y][x];
            }
        }
    }
    return rotated;
}

function playerRotate(dir) {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    const originalMatrix = player.matrix;
    const originalRotation = player.rotation;
    
    // Rotate the matrix
    player.matrix = rotateMatrix(player.matrix, dir);
    
    // Calculate new rotation state
    const newRotation = (player.rotation + (dir > 0 ? 1 : 3)) % 4;
    
    // Get wall kick data
    const pieceType = player.pieceType === 'I' ? 'I' : 'JLSTZ';
    const kickKey = `${ROTATION_STATES[originalRotation]}->${ROTATION_STATES[newRotation]}`;
    const kicks = WALL_KICKS[pieceType][kickKey] || [[0, 0]];
    
    // Try each kick
    for (const [kickX, kickY] of kicks) {
        if (!collide(arena, player, kickX, -kickY)) {
            player.pos.x += kickX;
            player.pos.y -= kickY;
            player.rotation = newRotation;
            calculateGhostPosition();
            resetLockDelay();
            AudioManager.play('rotate');
            return;
        }
    }
    
    // If all kicks fail, revert
    player.matrix = originalMatrix;
    player.rotation = originalRotation;
}

// ============================================
// PLAYER MOVEMENT
// ============================================
function playerMove(dir) {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    } else {
        calculateGhostPosition();
        resetLockDelay();
        AudioManager.play('move');
    }
}

function playerDrop() {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        
        // Start lock delay
        if (!gameState.isLocking) {
            gameState.isLocking = true;
            gameState.lockCounter = 0;
        }
    } else {
        gameState.isLocking = false;
        gameState.lockCounter = 0;
    }
    gameState.dropCounter = 0;
}

function playerHardDrop() {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    let dropDistance = 0;
    while (!collide(arena, player)) {
        player.pos.y++;
        dropDistance++;
    }
    player.pos.y--;
    dropDistance--;
    
    // Bonus points for hard drop
    gameState.score += dropDistance * 2;
    
    // Create particles at landing position
    createLandingParticles();
    
    // Lock immediately
    lockPiece();
    AudioManager.play('hardDrop');
}

function resetLockDelay() {
    if (gameState.isLocking) {
        gameState.lockCounter = 0;
    }
}

function lockPiece() {
    merge(arena, player);
    const linesCleared = arenaSweep();
    gameState.totalPiecesPlaced++;
    gameState.canHold = true;
    playerReset();
    updateUI();
}

// ============================================
// HOLD PIECE
// ============================================
function holdPiece() {
    if (gameState.isPaused || gameState.isGameOver || !gameState.canHold) return;
    
    AudioManager.play('hold');
    gameState.canHold = false;
    
    const currentType = player.pieceType;
    
    if (player.hold === null) {
        player.hold = currentType;
        playerReset();
    } else {
        const heldType = player.hold;
        player.hold = currentType;
        spawnPiece(heldType);
    }
    
    drawHold();
}

// ============================================
// PIECE SPAWNING
// ============================================
function playerReset() {
    const type = player.next.shift();
    player.next.push(getNextPiece());
    spawnPiece(type);
    drawNext();
}

function spawnPiece(type) {
    const piece = PIECES[type];
    player.pieceType = type;
    player.matrix = cloneMatrix(piece.shape);
    player.rotation = 0;
    
    // Center piece at top
    player.pos.y = type === 'I' ? -1 : 0;
    player.pos.x = Math.floor((COLS - player.matrix[0].length) / 2);
    
    calculateGhostPosition();
    gameState.isLocking = false;
    gameState.lockCounter = 0;
    
    // Game Over check
    if (collide(arena, player)) {
        gameOver();
    }
}

// ============================================
// MERGING & LINE CLEARING
// ============================================
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const arenaY = y + player.pos.y;
                const arenaX = x + player.pos.x;
                if (arenaY >= 0 && arenaY < ROWS && arenaX >= 0 && arenaX < COLS) {
                    arena[arenaY][arenaX] = value;
                }
            }
        });
    });
}

function arenaSweep() {
    const linesToClear = [];
    
    // Find full lines
    for (let y = arena.length - 1; y >= 0; y--) {
        if (arena[y].every(cell => cell !== 0)) {
            linesToClear.push(y);
        }
    }
    
    if (linesToClear.length === 0) {
        gameState.combo = 0;
        return 0;
    }
    
    // Create line clear effect
    linesToClear.forEach(y => {
        lineClearEffects.push({
            y: y,
            alpha: 1,
            scale: 1,
        });
        
        // Create particles for each block
        for (let x = 0; x < COLS; x++) {
            const colorIndex = arena[y][x];
            createParticles(x, y, COLORS[colorIndex]);
        }
    });
    
    // Remove lines after short delay for visual effect
    setTimeout(() => {
        linesToClear.sort((a, b) => b - a).forEach(y => {
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
        });
    }, 100);
    
    // Calculate score
    const linesCleared = linesToClear.length;
    const baseScores = [0, 100, 300, 500, 800]; // 1, 2, 3, 4 lines
    let points = baseScores[linesCleared] * gameState.level;
    
    // Combo bonus
    if (gameState.combo > 0) {
        points += 50 * gameState.combo * gameState.level;
    }
    gameState.combo++;
    
    // Back-to-back Tetris bonus (placeholder for more complex detection)
    if (linesCleared === 4) {
        points *= 1.5;
        showMessage('TETRIS!', '#facc15');
        AudioManager.play('tetris');
    } else if (linesCleared === 3) {
        showMessage('TRIPLE!', '#a855f7');
        AudioManager.play('lineClear');
    } else if (linesCleared === 2) {
        showMessage('DOUBLE!', '#22c55e');
        AudioManager.play('lineClear');
    } else {
        AudioManager.play('lineClear');
    }
    
    // Show combo message
    if (gameState.combo > 1) {
        setTimeout(() => showMessage(`${gameState.combo}x COMBO!`, '#00f5ff'), 300);
    }
    
    gameState.score += Math.floor(points);
    gameState.lines += linesCleared;
    
    // Level up every 10 lines
    const newLevel = Math.floor(gameState.lines / 10) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        gameState.dropInterval = Math.max(50, 1000 - (gameState.level - 1) * 75);
        showMessage('LEVEL UP!', '#22c55e');
        AudioManager.play('levelUp');
    }
    
    return linesCleared;
}

// ============================================
// PARTICLE SYSTEM
// ============================================
function createParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: (x + 0.5) * BLOCK_SIZE,
            y: (y + 0.5) * BLOCK_SIZE,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 3,
            color: color,
            life: 1,
            size: Math.random() * 5 + 2,
        });
    }
}

function createLandingParticles() {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const px = player.pos.x + x;
                const py = player.pos.y + y;
                for (let i = 0; i < 3; i++) {
                    particles.push({
                        x: (px + 0.5) * BLOCK_SIZE,
                        y: (py + 1) * BLOCK_SIZE,
                        vx: (Math.random() - 0.5) * 6,
                        vy: Math.random() * -3,
                        color: COLORS[value],
                        life: 0.8,
                        size: Math.random() * 3 + 1,
                    });
                }
            }
        });
    });
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // Gravity
        p.life -= deltaTime / 400;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Update line clear effects
    for (let i = lineClearEffects.length - 1; i >= 0; i--) {
        const effect = lineClearEffects[i];
        effect.alpha -= deltaTime / 150;
        effect.scale += deltaTime / 400;
        
        if (effect.alpha <= 0) {
            lineClearEffects.splice(i, 1);
        }
    }
}

function drawParticles() {
    // Reset scale for particle drawing
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    
    particles.forEach(p => {
        context.globalAlpha = p.life;
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();
    });
    
    context.globalAlpha = 1;
    context.restore();
}

// ============================================
// DRAWING FUNCTIONS
// ============================================
function draw() {
    // Clear and draw background
    context.fillStyle = '#0a0a12';
    context.fillRect(0, 0, COLS, ROWS);
    
    // Draw grid lines
    context.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    context.lineWidth = 0.02;
    for (let x = 0; x <= COLS; x++) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, ROWS);
        context.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(COLS, y);
        context.stroke();
    }
    
    // Draw line clear effects
    lineClearEffects.forEach(effect => {
        context.fillStyle = `rgba(255, 255, 255, ${effect.alpha * 0.6})`;
        context.fillRect(0, effect.y, COLS, 1);
    });
    
    // Draw arena (locked pieces)
    drawMatrix(arena, { x: 0, y: 0 }, context, false);
    
    // Draw ghost piece
    if (player.matrix && !gameState.isGameOver) {
        drawMatrix(player.matrix, { x: player.pos.x, y: player.ghostY }, context, true);
    }
    
    // Draw active piece
    if (player.matrix && !gameState.isGameOver) {
        drawMatrix(player.matrix, player.pos, context, false);
    }
    
    // Draw particles
    drawParticles();
}

function drawMatrix(matrix, offset, ctx, isGhost = false) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const px = x + offset.x;
                const py = y + offset.y;
                
                if (py < 0) return; // Don't draw above the arena
                
                if (isGhost) {
                    // Ghost piece - dashed outline
                    ctx.strokeStyle = GHOST_COLORS[value] || 'rgba(255,255,255,0.2)';
                    ctx.lineWidth = 0.08;
                    ctx.setLineDash([0.15, 0.1]);
                    ctx.strokeRect(px + 0.08, py + 0.08, 0.84, 0.84);
                    ctx.setLineDash([]);
                    
                    // Very faint fill
                    ctx.fillStyle = GHOST_COLORS[value] || 'rgba(255,255,255,0.1)';
                    ctx.fillRect(px + 0.1, py + 0.1, 0.8, 0.8);
                } else {
                    // Main block with gradient effect
                    const color = COLORS[value];
                    
                    // Create gradient
                    const gradient = ctx.createLinearGradient(px, py, px + 1, py + 1);
                    gradient.addColorStop(0, lightenColor(color, 40));
                    gradient.addColorStop(0.4, color);
                    gradient.addColorStop(1, darkenColor(color, 40));
                    
                    // Main block
                    ctx.fillStyle = gradient;
                    ctx.fillRect(px + 0.05, py + 0.05, 0.9, 0.9);
                    
                    // Inner highlight (top-left)
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fillRect(px + 0.1, py + 0.1, 0.35, 0.08);
                    ctx.fillRect(px + 0.1, py + 0.1, 0.08, 0.35);
                    
                    // Inner shadow (bottom-right)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(px + 0.55, py + 0.82, 0.35, 0.08);
                    ctx.fillRect(px + 0.82, py + 0.55, 0.08, 0.35);
                    
                    // Border glow
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.lineWidth = 0.04;
                    ctx.strokeRect(px + 0.05, py + 0.05, 0.9, 0.9);
                }
            }
        });
    });
}

function drawNext() {
    // Clear
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--glass-bg').trim() || 'rgba(255,255,255,0.03)';
    nextContext.fillStyle = '#0a0a12';
    nextContext.fillRect(0, 0, 5, 5);
    
    // Draw next piece preview
    const nextPiece = PIECES[player.next[0]];
    if (nextPiece) {
        const matrix = nextPiece.shape;
        const offset = {
            x: (5 - matrix[0].length) / 2,
            y: (5 - matrix.length) / 2,
        };
        drawPreviewMatrix(matrix, offset, nextContext);
    }
}

function drawHold() {
    if (!holdContext) return;
    
    holdContext.fillStyle = '#0a0a12';
    holdContext.fillRect(0, 0, 5, 5);
    
    if (player.hold) {
        const holdPiece = PIECES[player.hold];
        const matrix = holdPiece.shape;
        const offset = {
            x: (5 - matrix[0].length) / 2,
            y: (5 - matrix.length) / 2,
        };
        
        // Dim if can't hold
        if (!gameState.canHold) {
            holdContext.globalAlpha = 0.3;
        }
        drawPreviewMatrix(matrix, offset, holdContext);
        holdContext.globalAlpha = 1;
    }
}

function drawPreviewMatrix(matrix, offset, ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const color = COLORS[value];
                
                // Gradient block
                const px = x + offset.x;
                const py = y + offset.y;
                
                const gradient = ctx.createLinearGradient(px, py, px + 1, py + 1);
                gradient.addColorStop(0, lightenColor(color, 30));
                gradient.addColorStop(1, darkenColor(color, 20));
                
                ctx.fillStyle = gradient;
                ctx.fillRect(px + 0.1, py + 0.1, 0.8, 0.8);
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 0.05;
                ctx.strokeRect(px + 0.1, py + 0.1, 0.8, 0.8);
            }
        });
    });
}

// ============================================
// COLOR UTILITIES
// ============================================
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R}, ${G}, ${B})`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `rgb(${R}, ${G}, ${B})`;
}

// ============================================
// UI UPDATES
// ============================================
function updateUI() {
    document.getElementById('score').innerText = gameState.score.toLocaleString();
    document.getElementById('lines').innerText = gameState.lines;
    document.getElementById('level').innerText = gameState.level;
    
    // Update combo display if exists
    const comboEl = document.getElementById('combo');
    if (comboEl) {
        comboEl.innerText = gameState.combo > 1 ? `x${gameState.combo}` : '-';
        if (gameState.combo > 1) {
            comboEl.style.color = 'var(--cyan)';
            comboEl.style.textShadow = '0 0 10px var(--cyan-glow)';
        } else {
            comboEl.style.color = '';
            comboEl.style.textShadow = '';
        }
    }
    
    // Update time display if exists
    const timeEl = document.getElementById('time');
    if (timeEl && gameState.startTime) {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        timeEl.innerText = `${mins}:${secs}`;
    }
}

function showMessage(text, color = '#fff') {
    const msgEl = document.createElement('div');
    msgEl.className = 'game-message';
    msgEl.textContent = text;
    msgEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        font-family: 'Orbitron', sans-serif;
        font-size: 28px;
        font-weight: bold;
        color: ${color};
        text-shadow: 0 0 20px ${color}, 0 0 40px ${color};
        z-index: 1000;
        pointer-events: none;
        animation: messagePopup 0.8s ease-out forwards;
        letter-spacing: 3px;
    `;
    document.body.appendChild(msgEl);
    
    setTimeout(() => msgEl.remove(), 800);
}

// Add message animation style
const messageStyle = document.createElement('style');
messageStyle.textContent = `
    @keyframes messagePopup {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        20% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
        40% { transform: translate(-50%, -50%) scale(1); }
        100% { transform: translate(-50%, -50%) scale(1) translateY(-20px); opacity: 0; }
    }
`;
document.head.appendChild(messageStyle);

// ============================================
// GAME OVER
// ============================================
function gameOver() {
    gameState.isGameOver = true;
    gameState.isPaused = true;
    
    AudioManager.play('gameOver');
    
    // Calculate game time
    let timeStr = '';
    if (gameState.startTime) {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        timeStr = `<br><span style="font-size: 12px; color: var(--text-alt);">TIME: ${mins}:${secs.toString().padStart(2, '0')} | PIECES: ${gameState.totalPiecesPlaced}</span>`;
    }
    
    // Update overlay
    document.getElementById('overlay-title').innerHTML = `
        GAME OVER
        <br><span style="font-size: 18px; color: var(--orange);">SCORE: ${gameState.score.toLocaleString()}</span>
        <br><span style="font-size: 14px; color: var(--cyan);">LINES: ${gameState.lines} | LEVEL: ${gameState.level}</span>
        ${timeStr}
    `;
    document.getElementById('start-btn').innerText = 'PLAY AGAIN';
    document.getElementById('overlay').style.display = 'flex';
    document.querySelector('.canvas-container').classList.remove('active');
    
    // Save high score
    saveHighScore(gameState.score);
}

// ============================================
// PAUSE FUNCTIONALITY
// ============================================
function togglePause() {
    if (gameState.isGameOver) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        document.getElementById('overlay-title').innerHTML = `
            PAUSED
            <br><span style="font-size: 14px; color: var(--text-alt);">Press P or ESC to resume</span>
        `;
        document.getElementById('start-btn').innerText = 'RESUME';
        document.getElementById('overlay').style.display = 'flex';
        document.querySelector('.canvas-container').classList.remove('active');
    } else {
        document.getElementById('overlay').style.display = 'none';
        document.querySelector('.canvas-container').classList.add('active');
        gameState.lastTime = performance.now();
        update();
    }
}

// ============================================
// GAME LOOP
// ============================================
function update(time = 0) {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    const deltaTime = time - gameState.lastTime;
    gameState.lastTime = time;
    
    // Update particles
    updateParticles(deltaTime);
    
    // Update game time
    updateUI();
    
    // Auto drop
    gameState.dropCounter += deltaTime;
    if (gameState.dropCounter > gameState.dropInterval) {
        playerDrop();
    }
    
    // Lock delay handling
    if (gameState.isLocking) {
        gameState.lockCounter += deltaTime;
        if (gameState.lockCounter >= gameState.lockDelay) {
            lockPiece();
        }
    }
    
    draw();
    requestAnimationFrame(update);
}

// ============================================
// INPUT HANDLING
// ============================================
const keys = {};
let dasDelay = 170; // Delayed Auto Shift delay
let dasInterval = 50; // DAS repeat rate
let dasTimer = 0;
let dasDirection = 0;

document.addEventListener('keydown', event => {
    // Prevent default for game keys
    if ([37, 38, 39, 40, 32, 67, 80, 27, 16, 88, 90].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    if (keys[event.keyCode]) return; // Prevent key repeat
    keys[event.keyCode] = true;
    
    // Pause toggle (P or Escape)
    if (event.keyCode === 80 || event.keyCode === 27) {
        if (!gameState.isGameOver) {
            togglePause();
        }
        return;
    }
    
    if (gameState.isPaused || gameState.isGameOver) return;
    
    switch (event.keyCode) {
        case 37: // Left
            playerMove(-1);
            dasDirection = -1;
            dasTimer = 0;
            break;
        case 39: // Right
            playerMove(1);
            dasDirection = 1;
            dasTimer = 0;
            break;
        case 40: // Down (Soft Drop)
            playerDrop();
            break;
        case 38: // Up (Rotate CW)
            playerRotate(1);
            break;
        case 90: // Z (Rotate CCW)
            playerRotate(-1);
            break;
        case 88: // X (Rotate CW)
            playerRotate(1);
            break;
        case 32: // Space (Hard Drop)
            playerHardDrop();
            break;
        case 67: // C (Hold)
        case 16: // Shift (Hold)
            holdPiece();
            break;
    }
});

document.addEventListener('keyup', event => {
    keys[event.keyCode] = false;
    
    if (event.keyCode === 37 || event.keyCode === 39) {
        dasDirection = 0;
    }
});

// DAS (Delayed Auto Shift) handling
setInterval(() => {
    if (gameState.isPaused || gameState.isGameOver || dasDirection === 0) return;
    
    dasTimer += 16;
    if (dasTimer >= dasDelay) {
        if ((dasTimer - dasDelay) % dasInterval < 16) {
            playerMove(dasDirection);
        }
    }
}, 16);

// ============================================
// TOUCH CONTROLS FOR MOBILE
// ============================================
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let isTouching = false;

const gameArea = document.querySelector('.canvas-container');
if (gameArea) {
    gameArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameArea.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchStart(e) {
    if (gameState.isPaused || gameState.isGameOver) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
    isTouching = true;
}

function handleTouchMove(e) {
    if (!isTouching || gameState.isPaused || gameState.isGameOver) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const threshold = 30;
    
    if (Math.abs(deltaX) > threshold) {
        playerMove(deltaX > 0 ? 1 : -1);
        touchStartX = touch.clientX;
    }
    
    if (deltaY > threshold) {
        playerDrop();
        touchStartY = touch.clientY;
    }
}

function handleTouchEnd(e) {
    if (!isTouching) return;
    e.preventDefault();
    
    const touchDuration = Date.now() - touchStartTime;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Quick tap = rotate
    if (touchDuration < 200 && Math.abs(deltaY) < 30 && Math.abs(deltaX) < 30) {
        playerRotate(1);
    }
    
    // Quick swipe down = hard drop
    if (touchDuration < 300 && deltaY > 80) {
        playerHardDrop();
    }
    
    // Quick swipe up = hold
    if (touchDuration < 300 && deltaY < -80) {
        holdPiece();
    }
    
    isTouching = false;
}

// ============================================
// START BUTTON
// ============================================
document.getElementById('start-btn').addEventListener('click', () => {
    const overlay = document.getElementById('overlay');
    const container = document.querySelector('.canvas-container');
    
    // Reset game state
    arena.forEach(row => row.fill(0));
    particles.length = 0;
    lineClearEffects.length = 0;
    
    gameState.score = 0;
    gameState.lines = 0;
    gameState.level = 1;
    gameState.combo = 0;
    gameState.dropInterval = 1000;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.canHold = true;
    gameState.totalPiecesPlaced = 0;
    gameState.startTime = Date.now();
    
    player.hold = null;
    
    // Refill bag and get new pieces
    fillBag();
    player.next = [getNextPiece(), getNextPiece(), getNextPiece()];
    
    updateUI();
    drawHold();
    
    // UI Updates
    overlay.style.display = 'none';
    container.classList.add('active');
    
    // Start
    playerReset();
    gameState.lastTime = performance.now();
    update();
});

// ============================================
// SAVE HIGH SCORE
// ============================================
function saveHighScore(finalScore) {
    if (finalScore === 0) return;
    
    const formData = new FormData();
    formData.append('score', finalScore);
    
    fetch('save_score.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log('Score saved:', data);
        if (data.includes('NEW HIGH')) {
            showMessage('NEW HIGH SCORE!', '#facc15');
        }
    })
    .catch(error => console.error('Error saving score:', error));
}

// ============================================
// SOUND TOGGLE
// ============================================
function toggleSound() {
    const enabled = AudioManager.toggle();
    const btn = document.getElementById('sound-btn');
    if (btn) {
        btn.innerHTML = enabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
    }
    return enabled;
}

// ============================================
// INITIALIZE
// ============================================
init();
