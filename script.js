// Check for saved theme preference on load
window.onload = () => {
    // Theme initialization
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
    
    // Add stagger animation to elements
    const staggerElements = document.querySelectorAll('.stat-item, .stat-box, .requirements-list li');
    staggerElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 + (index * 80));
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button, .play-btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Add input focus animations
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
};

// Ripple effect for buttons
function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation to document
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    .input-group.focused i:not(.toggle-password) {
        transform: translateY(-50%) scale(1.1);
        filter: drop-shadow(0 0 8px var(--cyan));
    }
`;
document.head.appendChild(rippleStyle);

function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    
    // Add transition class for smooth color changes
    body.style.transition = 'background 0.5s ease, color 0.3s ease';
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
        // Add a subtle flash effect
        showThemeToast('Light Mode Activated', '☀️');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
        showThemeToast('Dark Mode Activated', '🌙');
    }
}

// Toast notification for theme change
function showThemeToast(message, emoji) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.theme-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'theme-toast';
    toast.innerHTML = `${emoji} ${message}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
        z-index: 10000;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 40px var(--shadow-color);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 400);
    }, 2000);
}

function togglePass() {
    const passInput = document.getElementById('password');
    const icon = document.querySelector('.toggle-password');
    
    if (passInput.type === "password") {
        passInput.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
        icon.style.color = 'var(--cyan)';
    } else {
        passInput.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
        icon.style.color = 'var(--text-alt)';
    }
    
    // Add a subtle animation
    icon.style.transform = 'translateY(-50%) scale(1.2)';
    setTimeout(() => {
        icon.style.transform = 'translateY(-50%) scale(1)';
    }, 150);
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
            // Add a subtle bounce animation
            el.style.transform = 'scale(1.02)';
            setTimeout(() => el.style.transform = 'scale(1)', 150);
        } else {
            el.classList.remove('valid');
            icon.classList.replace('fa-check', 'fa-circle');
        }
    }

    // Update Strength Bar UI with enhanced colors
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']; // red, orange, yellow, green
    const widths = ['25%', '50%', '75%', '100%'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    
    if (strength > 0) {
        bar.style.width = widths[strength - 1];
        bar.style.backgroundColor = colors[strength - 1];
        bar.style.boxShadow = `0 0 10px ${colors[strength - 1]}40`;
    } else {
        bar.style.width = '0%';
        bar.style.boxShadow = 'none';
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
            showNotification("ACCESS DENIED: Password requirements not met.", "error");
            return false;
        }
        
        // If valid, we do NOT call e.preventDefault(). 
        // The form will now proceed to register_handler.php
        showNotification("ACCOUNT REGISTERED. REDIRECTING TO LOGIN...", "success");
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

// Enhanced notification system
function showNotification(message, type = 'info') {
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();
    
    const colors = {
        success: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', icon: 'fa-circle-check' },
        error: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', icon: 'fa-triangle-exclamation' },
        info: { bg: 'rgba(0, 245, 255, 0.15)', border: '#00f5ff', icon: 'fa-circle-info' }
    };
    
    const config = colors[type] || colors.info;
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<i class="fa-solid ${config.icon}"></i> ${message}`;
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${config.bg};
        border: 1px solid ${config.border};
        padding: 16px 28px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        color: ${config.border};
        z-index: 10000;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    document.body.appendChild(notif);
    
    // Animate in
    setTimeout(() => {
        notif.style.opacity = '1';
        notif.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => notif.remove(), 400);
    }, 4000);
}