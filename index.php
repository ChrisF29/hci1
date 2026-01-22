<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tetronix | Player Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <header>
        <h1>TETRONIX</h1>
        <nav>
            <a href="#">LEADERBOARD</a>
            <a href="register.php" style="margin-left: 20px; color: var(--orange);">REGISTER</a>
            <button class="theme-btn" onclick="toggleTheme()" id="themeBtn">
                <i class="fa-solid fa-moon" id="themeIcon"></i>
            </button>
        </nav>
    </header>

    <div class="container">
        <div class="banner">
            <div class="banner-text">
                <h2>BATTLE READY?</h2>
                <p>THINK FAST. STACK FASTER.</p>
            </div>
        </div>

        <div class="login-section">
            <div class="login-card">
                <h3>ACCESS PORTAL</h3>

                <form id="loginForm" action="login_handler.php" method="POST">
                    
                    <?php if(isset($_GET['error'])): ?>
                        <div class="error-msg" style="color: var(--red); text-align: center; margin-bottom: 15px; font-size: 12px; font-weight: bold; animation: contentSlideUp 0.3s ease;">
                             <i class="fa-solid fa-triangle-exclamation"></i> INVALID CREDENTIALS OR SYSTEM TIMEOUT
                        </div>
                    <?php endif; ?>

                    <?php if(isset($_GET['success'])): ?>
                        <div class="success-msg" style="color: var(--green); text-align: center; margin-bottom: 15px; font-size: 12px; font-weight: bold;">
                             REGISTRATION COMPLETE. LOGIN NOW.
                        </div>
                    <?php endif; ?>

                    <div class="input-group">
                        <i class="fa-solid fa-user-astronaut"></i>
                        <input type="email" name="email" id="email" placeholder="PLAYER EMAIL" required>
                    </div>

                    <div class="input-group">
                        <i class="fa-solid fa-key"></i>
                        <input type="password" name="password" id="password" placeholder="PASSWORD" required>
                        <i class="fa-solid fa-eye toggle-password" onclick="togglePass()"></i>
                    </div>

                    <button type="submit" name="login_btn">LOGIN START</button>
                    
                    <p style="text-align: center; font-size: 11px; margin-top: 20px; color: var(--text-alt);">
                        NO ACCOUNT YET? <a href="register.php" style="color: var(--cyan); text-decoration: none;">REGISTER HERE</a>
                    </p>
                </form>
            </div>
        </div>
    </div>

    <footer>
        &copy; 2026 TETRONIX ENGINE // CHRIS FERRER
    </footer>

    <script src="script.js"></script>
</body>
</html>