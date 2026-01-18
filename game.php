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
</head>
<body class="game-body">
    <header>
        <h1>TETRONIX</h1>
        <nav>
            <span class="user-display">PILOT: <?php echo $_SESSION['username']; ?></span>
            <a href="dashboard.php">DASHBOARD</a>
        </nav>
    </header>

    <div class="game-container">
        <div class="side-panel">
            <div class="stat-card">
                <h4>SCORE</h4>
                <div id="score">000000</div>
            </div>
            <div class="stat-card">
                <h4>LINES</h4>
                <div id="lines">0</div>
            </div>
            <button id="start-btn">START ENGINE</button>
        </div>

        <canvas id="tetris" width="240" height="400"></canvas>

        <div class="side-panel">
            <div class="stat-card">
                <h4>NEXT</h4>
                <canvas id="next" width="80" height="80"></canvas>
            </div>
            <div class="controls-hint">
                <p><i class="fa-solid fa-arrow-left"></i> <i class="fa-solid fa-arrow-right"></i> MOVE</p>
                <p><i class="fa-solid fa-arrow-up"></i> ROTATE</p>
                <p><i class="fa-solid fa-arrow-down"></i> SOFT DROP</p>
            </div>
        </div>
    </div>

    <script src="tetris_engine.js"></script>
</body>
</html>