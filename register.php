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
        <div class="banner" style="border-color: var(--cyan); box-shadow: 0 0 20px rgba(0, 240, 240, 0.3);">
            <div class="banner-text">
                <h2 style="color: var(--cyan);">NEW RECRUIT?</h2>
                <p>ESTABLISH YOUR SECTOR IDENTITY.</p>
            </div>
        </div>

        <div class="login-section">
            <div class="login-card" style="border-color: var(--cyan); box-shadow: 12px 12px 0px rgba(0, 240, 240, 0.15);">
                <h3 style="color: var(--cyan); text-shadow: 0 0 8px var(--cyan);">ENROLLMENT</h3>

                <form id="registerForm" action="register_handler.php" method="POST" onsubmit="return validateForm(event)">
                    
                    <?php if(isset($_GET['error'])): ?>
                        <div class="error-msg" style="color: var(--red); text-align: center; margin-bottom: 15px; font-size: 11px; font-weight: bold;">
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

                    <button type="submit" name="register_btn" style="background-color: var(--cyan);">INITIALIZE ACCOUNT</button>
                </form>
            </div>
        </div>
    </div>

    <footer>
        &copy; 2026 TETRONIX ENGINE // SYSTEM READY
    </footer>

    <script src="script.js"></script>
</body>
</html>