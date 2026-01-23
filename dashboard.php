<?php
session_start();
require 'db_config.php';

// Security Check
if (!isset($_SESSION['player_id'])) {
    header("Location: index.php");
    exit();
}

$player_id = $_SESSION['player_id'];
$username = $_SESSION['username'];

// Fetch player stats
$query = $conn->prepare("SELECT high_score, created_at FROM players WHERE id = ?");
$query->bind_param("i", $player_id);
$query->execute();
$result = $query->get_result();
$player_data = $result->fetch_assoc();

$high_score = $player_data['high_score'] ?? 0;
$member_since = isset($player_data['created_at']) ? date('M Y', strtotime($player_data['created_at'])) : 'N/A';

// Rank system with icons
$ranks = [
    ['min' => 0, 'name' => 'RECRUIT', 'icon' => 'fa-user', 'color' => '#94a3b8'],
    ['min' => 1000, 'name' => 'PILOT', 'icon' => 'fa-jet-fighter', 'color' => '#22c55e'],
    ['min' => 5000, 'name' => 'CAPTAIN', 'icon' => 'fa-star', 'color' => '#3b82f6'],
    ['min' => 10000, 'name' => 'ELITE', 'icon' => 'fa-crown', 'color' => '#a855f7'],
    ['min' => 25000, 'name' => 'COMMANDER', 'icon' => 'fa-shield-halved', 'color' => '#f59e0b'],
    ['min' => 50000, 'name' => 'LEGEND', 'icon' => 'fa-gem', 'color' => '#ef4444'],
    ['min' => 100000, 'name' => 'MASTER', 'icon' => 'fa-fire', 'color' => '#ec4899'],
];

$current_rank = $ranks[0];
$next_rank = isset($ranks[1]) ? $ranks[1] : null;

foreach ($ranks as $i => $r) {
    if ($high_score >= $r['min']) {
        $current_rank = $r;
        $next_rank = isset($ranks[$i + 1]) ? $ranks[$i + 1] : null;
    }
}

// Calculate progress to next rank
$progress = 100;
if ($next_rank) {
    $range = $next_rank['min'] - $current_rank['min'];
    $current_progress = $high_score - $current_rank['min'];
    $progress = min(100, ($current_progress / $range) * 100);
}

// Get top 5 leaderboard
$leaderboard = [];
$lb_query = $conn->query("SELECT username, high_score FROM players ORDER BY high_score DESC LIMIT 5");
if ($lb_query) {
    while ($row = $lb_query->fetch_assoc()) {
        $leaderboard[] = $row;
    }
}
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
    <style>
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            width: 100%;
        }
        
        .dash-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 24px;
            backdrop-filter: blur(10px);
            transition: var(--transition);
        }
        
        .dash-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px var(--shadow-color);
        }
        
        .dash-card h3 {
            font-size: 14px;
            letter-spacing: 3px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .dash-card h3 i {
            color: var(--cyan);
        }
        
        .play-card {
            grid-column: span 2;
            text-align: center;
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(0, 245, 255, 0.1) 100%);
            border-color: var(--purple);
        }
        
        .play-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--purple), var(--cyan), var(--purple));
            border-radius: 16px 16px 0 0;
        }
        
        .game-icon {
            font-size: 80px;
            margin: 30px 0;
            background: linear-gradient(135deg, var(--cyan) 0%, var(--purple) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: float 3s ease-in-out infinite;
        }
        
        .play-btn-large {
            padding: 20px 60px;
            font-size: 16px;
            letter-spacing: 3px;
        }
        
        .rank-display {
            text-align: center;
            padding: 20px;
            background: var(--glass-bg);
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .rank-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        .rank-name {
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            letter-spacing: 3px;
            margin-bottom: 5px;
        }
        
        .rank-progress {
            margin-top: 15px;
        }
        
        .progress-bar {
            height: 8px;
            background: var(--input-bg);
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }
        
        .progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 1s ease;
        }
        
        .progress-label {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: var(--text-alt);
            margin-top: 5px;
        }
        
        .stat-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .stat-box {
            background: var(--glass-bg);
            padding: 16px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--card-border);
        }
        
        .stat-box .label {
            font-size: 9px;
            color: var(--text-alt);
            letter-spacing: 2px;
            margin-bottom: 8px;
            display: block;
        }
        
        .stat-box .value {
            font-family: 'Orbitron', sans-serif;
            font-size: 22px;
            color: var(--cyan);
        }
        
        .leaderboard-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .leaderboard-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: var(--glass-bg);
            border-radius: 8px;
            margin-bottom: 8px;
            transition: var(--transition);
        }
        
        .leaderboard-item:hover {
            background: var(--cyan-glow);
            transform: translateX(5px);
        }
        
        .leaderboard-item.current-user {
            border: 1px solid var(--cyan);
            background: var(--cyan-glow);
        }
        
        .lb-rank {
            font-family: 'Orbitron', sans-serif;
            font-size: 14px;
            width: 30px;
            text-align: center;
        }
        
        .lb-rank.gold { color: #facc15; }
        .lb-rank.silver { color: #94a3b8; }
        .lb-rank.bronze { color: #cd7f32; }
        
        .lb-name {
            flex: 1;
            margin-left: 15px;
            font-weight: 600;
        }
        
        .lb-score {
            font-family: 'Orbitron', sans-serif;
            color: var(--orange);
        }
        
        .quick-tips {
            font-size: 12px;
            color: var(--text-alt);
            line-height: 1.8;
        }
        
        .quick-tips li {
            margin-bottom: 8px;
            padding-left: 10px;
            position: relative;
        }
        
        .quick-tips li::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: var(--cyan);
        }
        
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            .play-card {
                grid-column: span 1;
            }
            .stat-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
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
                <h2>WELCOME BACK, <?php echo strtoupper(htmlspecialchars($username)); ?>!</h2>
                <p>SYSTEMS ONLINE • READY TO DOMINATE THE LEADERBOARD?</p>
            </div>
        </div>

        <div class="dashboard-grid">
            <!-- Play Game Card -->
            <div class="dash-card play-card" style="position: relative;">
                <h3><i class="fa-solid fa-gamepad"></i> CORE ENGINE</h3>
                <div class="game-icon">
                    <i class="fa-solid fa-cubes-stacked"></i>
                </div>
                <p style="color: var(--text-alt); margin-bottom: 20px;">Stack blocks, clear lines, climb the ranks!</p>
                <button onclick="location.href='game.php'" class="play-btn play-btn-large">
                    <i class="fa-solid fa-play"></i> PLAY NOW
                </button>
            </div>

            <!-- Rank & Progress -->
            <div class="dash-card">
                <h3><i class="fa-solid fa-ranking-star"></i> YOUR RANK</h3>
                <div class="rank-display">
                    <div class="rank-icon" style="color: <?php echo $current_rank['color']; ?>">
                        <i class="fa-solid <?php echo $current_rank['icon']; ?>"></i>
                    </div>
                    <div class="rank-name" style="color: <?php echo $current_rank['color']; ?>">
                        <?php echo $current_rank['name']; ?>
                    </div>
                    <?php if ($next_rank): ?>
                    <div class="rank-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: <?php echo $progress; ?>%; background: linear-gradient(90deg, <?php echo $current_rank['color']; ?>, <?php echo $next_rank['color']; ?>);"></div>
                        </div>
                        <div class="progress-label">
                            <span><?php echo number_format($high_score); ?> pts</span>
                            <span><?php echo $next_rank['name']; ?> @ <?php echo number_format($next_rank['min']); ?></span>
                        </div>
                    </div>
                    <?php else: ?>
                    <p style="font-size: 12px; color: var(--green); margin-top: 10px;">MAX RANK ACHIEVED!</p>
                    <?php endif; ?>
                </div>
                
                <div class="stat-grid">
                    <div class="stat-box">
                        <span class="label">HIGH SCORE</span>
                        <div class="value"><?php echo number_format($high_score); ?></div>
                    </div>
                    <div class="stat-box">
                        <span class="label">MEMBER SINCE</span>
                        <div class="value" style="font-size: 14px; color: var(--text-main);"><?php echo $member_since; ?></div>
                    </div>
                </div>
            </div>

            <!-- Leaderboard -->
            <div class="dash-card">
                <h3><i class="fa-solid fa-trophy"></i> TOP PLAYERS</h3>
                <ul class="leaderboard-list">
                    <?php foreach ($leaderboard as $i => $player): ?>
                    <li class="leaderboard-item <?php echo ($player['username'] === $username) ? 'current-user' : ''; ?>">
                        <span class="lb-rank <?php echo $i === 0 ? 'gold' : ($i === 1 ? 'silver' : ($i === 2 ? 'bronze' : '')); ?>">
                            <?php echo $i === 0 ? '👑' : '#' . ($i + 1); ?>
                        </span>
                        <span class="lb-name"><?php echo htmlspecialchars($player['username']); ?></span>
                        <span class="lb-score"><?php echo number_format($player['high_score']); ?></span>
                    </li>
                    <?php endforeach; ?>
                    <?php if (empty($leaderboard)): ?>
                    <li class="leaderboard-item">
                        <span style="color: var(--text-alt);">No scores yet. Be the first!</span>
                    </li>
                    <?php endif; ?>
                </ul>
            </div>

            <!-- Quick Tips -->
            <div class="dash-card">
                <h3><i class="fa-solid fa-lightbulb"></i> QUICK TIPS</h3>
                <ul class="quick-tips">
                    <li>Use <strong>SPACE</strong> for instant hard drops - earn bonus points!</li>
                    <li>Press <strong>C</strong> or <strong>SHIFT</strong> to hold a piece for later</li>
                    <li>Clear 4 lines at once for a <strong>TETRIS</strong> bonus (1.5x points)</li>
                    <li>Build up <strong>combos</strong> by clearing lines consecutively</li>
                    <li>Watch the <strong>ghost piece</strong> to plan your drops</li>
                    <li>Speed increases every <strong>10 lines</strong> - stay sharp!</li>
                </ul>
            </div>
        </div>
    </div>

    <footer>
        &copy; 2026 TETRONIX ENGINE // PILOT: <?php echo htmlspecialchars($username); ?> // RANK: <?php echo $current_rank['name']; ?>
    </footer>

    <script src="script.js"></script>
</body>
</html>