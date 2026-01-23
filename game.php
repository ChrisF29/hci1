<?php
session_start();
if (!isset($_SESSION['player_id'])) {
    header("Location: index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Tetronix | Active Session</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        /* Game-specific styles */
        .game-container {
            padding: 30px 20px;
            max-width: 900px;
            margin: auto;
        }
        
        .game-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px 20px;
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--card-border);
        }
        
        .game-header h2 {
            font-size: 16px;
            background: linear-gradient(135deg, var(--green) 0%, var(--cyan) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .game-controls-bar {
            display: flex;
            gap: 10px;
        }
        
        .control-btn {
            background: var(--glass-bg);
            border: 1px solid var(--card-border);
            color: var(--text-main);
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            transition: var(--transition);
            font-size: 14px;
        }
        
        .control-btn:hover {
            background: var(--cyan-glow);
            border-color: var(--cyan);
        }
        
        .game-wrapper {
            display: grid;
            grid-template-columns: 180px auto 180px;
            gap: 20px;
            justify-content: center;
            align-items: start;
        }
        
        .side-panel {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .panel-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 15px;
            backdrop-filter: blur(10px);
        }
        
        .panel-card h4 {
            font-family: 'Orbitron', sans-serif;
            font-size: 11px;
            letter-spacing: 2px;
            color: var(--text-alt);
            margin-bottom: 12px;
            text-align: center;
        }
        
        .preview-canvas {
            display: block;
            margin: 0 auto;
            border-radius: 8px;
            background: #0a0a12;
            border: 1px solid var(--card-border);
        }
        
        .stat-box {
            background: var(--glass-bg);
            padding: 12px;
            border-radius: 8px;
            border-left: 3px solid var(--cyan);
            margin-bottom: 10px;
        }
        
        .stat-box:last-child {
            margin-bottom: 0;
        }
        
        .stat-box.highlight {
            border-left-color: var(--orange);
        }
        
        .stat-box .label {
            display: block;
            font-size: 9px;
            color: var(--text-alt);
            letter-spacing: 2px;
            margin-bottom: 4px;
        }
        
        .stat-box .value {
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            color: var(--text-main);
        }
        
        .canvas-container {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
        }
        
        #tetris {
            display: block;
            background: #0a0a12;
        }
        
        .game-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 30, 0.95) 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10;
            backdrop-filter: blur(5px);
            padding: 20px;
            text-align: center;
        }
        
        .game-overlay h2 {
            background: linear-gradient(135deg, var(--cyan) 0%, var(--purple) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 28px;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .play-btn {
            padding: 16px 50px;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .controls-guide {
            margin-top: 15px;
        }
        
        .controls-guide h5 {
            font-family: 'Orbitron', sans-serif;
            font-size: 10px;
            color: var(--text-alt);
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        
        .control-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 11px;
            color: var(--text-alt);
            border-bottom: 1px solid var(--card-border);
        }
        
        .control-row:last-child {
            border-bottom: none;
        }
        
        .control-row .key {
            background: var(--input-bg);
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'Orbitron', sans-serif;
            font-size: 10px;
            color: var(--cyan);
            border: 1px solid var(--card-border);
        }
        
        .control-row .action {
            color: var(--text-main);
        }
        
        /* Mobile controls */
        .mobile-controls {
            display: none;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 20px;
            padding: 15px;
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--card-border);
        }
        
        .mobile-btn {
            background: var(--glass-bg);
            border: 1px solid var(--card-border);
            color: var(--text-main);
            padding: 20px;
            border-radius: 10px;
            font-size: 24px;
            cursor: pointer;
            transition: var(--transition);
            -webkit-tap-highlight-color: transparent;
        }
        
        .mobile-btn:active {
            background: var(--cyan-glow);
            border-color: var(--cyan);
            transform: scale(0.95);
        }
        
        .mobile-btn.wide {
            grid-column: span 3;
        }
        
        @media (max-width: 768px) {
            .game-wrapper {
                grid-template-columns: 1fr;
                max-width: 280px;
                margin: 0 auto;
            }
            
            .side-panel {
                flex-direction: row;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .side-panel.left-panel {
                order: -1;
            }
            
            .side-panel.right-panel {
                display: none;
            }
            
            .panel-card {
                flex: 1;
                min-width: 80px;
            }
            
            .mobile-controls {
                display: grid;
            }
            
            .game-header {
                flex-direction: column;
                gap: 10px;
            }
            
            .stat-box .value {
                font-size: 16px;
            }
        }
        
        @media (max-width: 480px) {
            .game-container {
                padding: 15px 10px;
            }
            
            #tetris {
                width: 240px;
                height: 400px;
            }
        }
    </style>
</head>
<body>

    <header>
        <h1>TETRONIX</h1>
        <nav>
            <button class="theme-btn" onclick="toggleTheme()" id="themeBtn">
                <i class="fa-solid fa-moon" id="themeIcon"></i>
            </button>
            <span class="user-display"><i class="fa-solid fa-user-astronaut"></i> <?php echo htmlspecialchars($_SESSION['username']); ?></span>
            <a href="dashboard.php" class="exit-link"><i class="fa-solid fa-arrow-left"></i> DASHBOARD</a>
        </nav>
    </header>

    <div class="game-container">
        <div class="game-header">
            <h2><i class="fa-solid fa-gamepad"></i> ACTIVE SESSION</h2>
            <div class="game-controls-bar">
                <button class="control-btn" id="sound-btn" onclick="toggleSound()">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
                <button class="control-btn" onclick="togglePause()">
                    <i class="fa-solid fa-pause"></i> PAUSE
                </button>
            </div>
        </div>

        <div class="game-wrapper">
            <!-- Left Panel: Hold & Stats -->
            <div class="side-panel left-panel">
                <div class="panel-card">
                    <h4><i class="fa-solid fa-hand-holding"></i> HOLD</h4>
                    <canvas id="hold" class="preview-canvas" width="100" height="100"></canvas>
                    <div style="text-align: center; margin-top: 8px; font-size: 10px; color: var(--text-alt);">
                        SHIFT / C
                    </div>
                </div>
                
                <div class="panel-card">
                    <h4><i class="fa-solid fa-chart-simple"></i> STATS</h4>
                    <div class="stat-box highlight">
                        <span class="label">SCORE</span>
                        <div id="score" class="value">0</div>
                    </div>
                    <div class="stat-box">
                        <span class="label">LINES</span>
                        <div id="lines" class="value">0</div>
                    </div>
                    <div class="stat-box">
                        <span class="label">LEVEL</span>
                        <div id="level" class="value">1</div>
                    </div>
                    <div class="stat-box">
                        <span class="label">COMBO</span>
                        <div id="combo" class="value">-</div>
                    </div>
                    <div class="stat-box">
                        <span class="label">TIME</span>
                        <div id="time" class="value">00:00</div>
                    </div>
                </div>
            </div>

            <!-- Game Canvas -->
            <div class="canvas-container">
                <canvas id="tetris" width="240" height="400"></canvas>
                <div id="overlay" class="game-overlay">
                    <h2 id="overlay-title">READY TO PLAY?</h2>
                    <button id="start-btn" class="play-btn">START GAME</button>
                </div>
            </div>

            <!-- Right Panel: Next & Controls -->
            <div class="side-panel right-panel">
                <div class="panel-card">
                    <h4><i class="fa-solid fa-forward"></i> NEXT</h4>
                    <canvas id="next" class="preview-canvas" width="100" height="100"></canvas>
                </div>
                
                <div class="panel-card controls-guide">
                    <h5><i class="fa-solid fa-keyboard"></i> CONTROLS</h5>
                    <div class="control-row">
                        <span class="key">←→</span>
                        <span class="action">Move</span>
                    </div>
                    <div class="control-row">
                        <span class="key">↑</span>
                        <span class="action">Rotate CW</span>
                    </div>
                    <div class="control-row">
                        <span class="key">Z</span>
                        <span class="action">Rotate CCW</span>
                    </div>
                    <div class="control-row">
                        <span class="key">↓</span>
                        <span class="action">Soft Drop</span>
                    </div>
                    <div class="control-row">
                        <span class="key">SPACE</span>
                        <span class="action">Hard Drop</span>
                    </div>
                    <div class="control-row">
                        <span class="key">C</span>
                        <span class="action">Hold</span>
                    </div>
                    <div class="control-row">
                        <span class="key">P</span>
                        <span class="action">Pause</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile Touch Controls -->
        <div class="mobile-controls">
            <button class="mobile-btn" ontouchstart="playerRotate(-1)"><i class="fa-solid fa-rotate-left"></i></button>
            <button class="mobile-btn" ontouchstart="playerMove(0); playerDrop()"><i class="fa-solid fa-arrow-down"></i></button>
            <button class="mobile-btn" ontouchstart="playerRotate(1)"><i class="fa-solid fa-rotate-right"></i></button>
            <button class="mobile-btn" ontouchstart="playerMove(-1)"><i class="fa-solid fa-arrow-left"></i></button>
            <button class="mobile-btn" ontouchstart="playerHardDrop()"><i class="fa-solid fa-angles-down"></i></button>
            <button class="mobile-btn" ontouchstart="playerMove(1)"><i class="fa-solid fa-arrow-right"></i></button>
            <button class="mobile-btn wide" ontouchstart="holdPiece()"><i class="fa-solid fa-hand-holding"></i> HOLD</button>
        </div>
    </div>

    <script src="script.js"></script>
    <script src="tetris_engine.js"></script>
</body>
</html>