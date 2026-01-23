<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tetronix | Player Registry</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <header>
        <h1>TETRONIX</h1>
        <nav>
            <a href="index.php">LOGIN</a>
            <button class="theme-btn" onclick="toggleTheme()" id="themeBtn">
                <i class="fa-solid fa-moon" id="themeIcon"></i>
            </button>
        </nav>
    </header>

    <div class="container">
        <div class="banner register-banner">
            <div class="banner-text">
                <h2>NEW PLAYER?</h2>
                <p>JOIN THE SECTOR NOW.</p>
            </div>
        </div>

        <div class="login-section">
            <div class="login-card register-card">
                <h3>REGISTRATION</h3>

                <form id="registerForm" action="register_handler.php" method="POST" onsubmit="return validateForm(event)">
                    
                    <?php if(isset($_GET['error'])): ?>
                        <div class="error-msg">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <?php 
                                if($_GET['error'] == 'exists') echo "TAG OR EMAIL ALREADY REGISTERED";
                                else if($_GET['error'] == 'stmt') echo "SYSTEM FAILURE: TRY AGAIN";
                            ?>
                        </div>
                    <?php endif; ?>

                    <div class="input-group">
                        <i class="fa-solid fa-id-badge"></i>
                        <input type="text" name="username" id="username" placeholder="PLAYER TAG (USERNAME)" required>
                    </div>

                    <div class="input-group">
                        <i class="fa-solid fa-envelope"></i>
                        <input type="email" name="email" id="email" placeholder="CONTACT EMAIL" required>
                    </div>

                    <div class="input-group">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" name="password" id="password" placeholder="SECURE PASSWORD" oninput="checkStrength(this.value)" required>
                    </div>

                    <ul class="requirements-list" id="reqList">
                        <li id="len"><i class="fa-solid fa-circle"></i> 8+ Characters</li>
                        <li id="up"><i class="fa-solid fa-circle"></i> Uppercase Letter</li>
                        <li id="num"><i class="fa-solid fa-circle"></i> Contains Number</li>
                        <li id="spec"><i class="fa-solid fa-circle"></i> Special Symbol</li>
                    </ul>

                    <div class="strength-container" id="strengthContainer">
                        <div class="strength-bar" id="strengthBar"></div>
                    </div>

                    <button type="submit" name="register_btn" class="register-btn">INITIALIZE ACCOUNT</button>
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