<?php
session_start();
require 'db_config.php'; // You need this to talk to the database

// Security Check
if (!isset($_SESSION['player_id'])) {
    header("Location: index.php");
    exit();
}

$player_id = $_SESSION['player_id'];
$username = $_SESSION['username'];

// --- NEW DATA FETCHING LOGIC ---
// Fetch the latest stats for this specific player
$query = $conn->prepare("SELECT high_score FROM players WHERE id = ?");
$query->bind_param("i", $player_id);
$query->execute();
$result = $query->get_result();
$player_data = $result->fetch_assoc();

$high_score = $player_data['high_score'] ?? 0;

// Simple Rank Logic based on score
$rank = "RECRUIT";
if ($high_score > 1000) $rank = "PILOT";
if ($high_score > 5000) $rank = "ELITE";
if ($high_score > 10000) $rank = "LEGEND";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tetronix | Command Center</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="dashboard-body">

    <header>
        <h1>TETRONIX</h1>
        <nav>
            <button class="theme-btn" onclick="toggleTheme()" id="themeBtn">
                <i class="fa-solid fa-moon" id="themeIcon"></i>
            </button>
            <span class="user-display"><i class="fa-solid fa-user-astronaut"></i> <?php echo htmlspecialchars($username); ?></span>
            <a href="logout.php" class="logout-link"><i class="fa-solid fa-power-off"></i> LOGOUT</a>
        </nav>
    </header>

    <div class="container">
        <div class="banner dash-banner">
            <div class="banner-text">
                <h2>WELCOME BACK, PILOT.</h2>
                <p>SYSTEMS ARE ONLINE. READY TO STACK?</p>
            </div>
        </div>

        <div class="grid-layout">
            <div class="login-card dash-card">
                <h3>CORE ENGINE</h3>
                <div class="game-preview">
                    <i class="fa-solid fa-cubes-stacked"></i>
                </div>
                <button onclick="location.href='game.php'" class="play-btn">INITIALIZE GAME</button>
            </div>

            <div class="login-card dash-card">
                <h3>SECTOR STATS</h3>
                <div class="stats-list">
                    <div class="stat-item">
                        <span>HIGH SCORE:</span>
                        <span class="stat-value"><?php echo number_format($high_score); ?></span>
                    </div>
                    <div class="stat-item">
                        <span>RANK:</span>
                        <span class="stat-value"><?php echo $rank; ?></span>
                    </div>
                    <div class="stat-item">
                        <span>STATUS:</span>
                        <span class="stat-value status-online">ONLINE</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <footer>
        &copy; 2026 TETRONIX ENGINE // SESSION ACTIVE: <?php echo htmlspecialchars($username); ?>
    </footer>

    <script src="script.js"></script>
</body>
</html>