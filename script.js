// Check for saved theme preference on load
window.onload = () => {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
    }
};

function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}

function togglePass() {
    const passInput = document.getElementById('password');
    const icon = document.querySelector('.toggle-password');
    if (passInput.type === "password") {
        passInput.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passInput.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function checkStrength(password) {
    const container = document.getElementById('strengthContainer');
    const bar = document.getElementById('strengthBar');
    
    container.style.display = password.length > 0 ? 'block' : 'none';

    // Requirements Logic
    const requirements = {
        len: password.length >= 8,
        up: /[A-Z]/.test(password),
        num: /[0-9]/.test(password),
        spec: /[@$!%*?&]/.test(password)
    };

    let strength = 0;

    // Update List UI and calculate strength
    for (const key in requirements) {
        const el = document.getElementById(key);
        const icon = el.querySelector('i');
        
        if (requirements[key]) {
            el.classList.add('valid');
            icon.classList.replace('fa-circle', 'fa-check');
            strength++;
        } else {
            el.classList.remove('valid');
            icon.classList.replace('fa-check', 'fa-circle');
        }
    }

    // Update Strength Bar UI
    const colors = [varColor('--red'), varColor('--red'), varColor('--orange'), varColor('--green')];
    const widths = ['25%', '50%', '75%', '100%'];
    
    if (strength > 0) {
        bar.style.width = widths[strength - 1];
        bar.style.backgroundColor = colors[strength - 1];
    } else {
        bar.style.width = '0%';
    }
}

// Helper to get CSS variables in JS
function varColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function validateForm(e) {
    // 1. Identify which form is being submitted
    const isRegisterPage = document.getElementById('registerForm') !== null;
    const pass = document.getElementById('password').value;

    if (isRegisterPage) {
        // 2. Full security check for Registration
        const isValid = pass.length >= 8 && 
                        /[A-Z]/.test(pass) && 
                        /[0-9]/.test(pass) && 
                        /[@$!%*?&]/.test(pass);

        if (!isValid) {
            e.preventDefault(); // Stop submission only if invalid
            alert("ACCESS DENIED: Password requirements not met.");
            return false;
        }
        
        // If valid, we do NOT call e.preventDefault(). 
        // The form will now proceed to register_handler.php
        alert("ACCOUNT REGISTERED. REDIRECTING TO LOGIN...");
    } else {
        // 3. Simple check for Login (just ensure not empty)
        if (pass.length === 0) {
            e.preventDefault();
            return false;
        }
        // Proceed to login_handler.php
    }
    
    return true; 
}