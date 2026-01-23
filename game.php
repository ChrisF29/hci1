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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tetronix | Active Session</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body>

    <header>
        <h1>TETRONIX</h1>
        <nav>
            <button class="theme-btn" onclick="toggleTheme()" id="themeBtn">
                <i class="fa-solid fa-moon" id="themeIcon"></i>
            </button>
            <span class="user-display"><i class="fa-solid fa-user-astronaut"></i> PILOT: <?php echo htmlspecialchars($_SESSION['username']); ?></span>
            <a href="dashboard.php" class="exit-link"><i class="fa-solid fa-arrow-left"></i> EXIT TO DASHBOARD</a>
        </nav>
    </header>

    <div class="container">
        <div class="banner dash-banner game-banner">
            <div class="banner-text">
                <h2>SYSTEM ACTIVE</h2>
            </div>
        </div>

        <div class="game-wrapper">
            <div class="login-card game-card side-panel data-panel">
                <h3>DATA</h3>
                
                <div class="stat-box">
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
            </div>

            <div class="canvas-container">
                <canvas id="tetris" width="240" height="400"></canvas>
                <div id="overlay" class="game-overlay">
                    <h2 id="overlay-title">READY?</h2>
                    <button id="start-btn" class="play-btn">INITIATE</button>
                </div>
            </div>

            <div class="login-card game-card side-panel next-panel">
                <h3>NEXT</h3>
                <canvas id="next" width="100" height="100"></canvas>
                
                <div class="controls-hint">
                    <div class="control-row"><i class="fa-solid fa-arrow-left"></i><span>MOVE</span><i class="fa-solid fa-arrow-right"></i></div>
                    <div class="control-row"><i class="fa-solid fa-arrow-up"></i><span>ROTATE</span></div>
                    <div class="control-row"><i class="fa-solid fa-arrow-down"></i><span>DROP</span></div>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
    <script src="tetris_engine.js"></script>
</body>
</html>