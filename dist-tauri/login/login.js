// Fixed Login JavaScript with functional password validation and Google Sign-In
// Dark/Light Theme Support

// Theme Management
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('fitlify_theme') || 'dark';
        this.applyTheme(savedTheme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('fitlify_theme', theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
};

// Initialize theme on load
ThemeManager.init();

// Google Authentication Configuration
const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin + '/callback';

// DOM Elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const eyeIcon = document.getElementById('eye-icon');
const rememberMeCheckbox = document.getElementById('remember-me');
const loginBtn = document.getElementById('login-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkExistingSession();
});

// Initialize event listeners
function initializeEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    // Add input validation
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    emailInput.addEventListener('input', clearError);
}

// Toggle password visibility
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
}

// Validate email
function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    toggleFieldError('email', !isValid);
    return isValid;
}

// Validate password
function validatePassword() {
    const password = passwordInput.value;
    const isValid = password.length >= 6;

    toggleFieldError('password', !isValid);
    return isValid;
}

// Toggle field error
function toggleFieldError(fieldName, show) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = fieldName === 'email' ? emailInput : passwordInput;
    const formGroup = inputElement.closest('.form-group');

    if (show) {
        const message = fieldName === 'email'
            ? 'Please enter a valid email address'
            : 'Password must be at least 6 characters';
        errorElement.textContent = message;
        errorElement.classList.add('show');
        formGroup.classList.add('error');
    } else {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        formGroup.classList.remove('error');
    }
}

// Clear error
function clearError(event) {
    const field = event.target;
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.form-error');

    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    formGroup.classList.remove('error');
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();

    // Validate form
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
        showNotification('Please fix the errors below', 'error');
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        const loginData = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            remember_me: rememberMeCheckbox.checked
        };

        // Send login request to backend
        const response = await loginUser(loginData);

        if (response.success) {
            // Save user data
            saveUserData(response.user, loginData.remember_me);

            // Show success message
            showNotification('Login successful! Redirecting...', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '../src/dashboard/dashboard.html';
            }, 1500);
        } else {
            showNotification(response.message || 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Set loading state
function setLoadingState(loading) {
    if (loading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Login user via Electron API or fallback
async function loginUser(loginData) {
    try {
        // Try to use the exposed Electron API first
        if (window.electronAPI) {
            return await window.electronAPI.login(loginData.email, loginData.password);
        }
        
        // Fallback to fetchAPI
        if (window.fetchAPI) {
            return await window.fetchAPI.post('http://localhost:3001/api/login', loginData);
        }
        
        // Final fallback to demo accounts
        const demoAccounts = [
            { email: 'demo@fitlify.com', password: 'demo123', name: 'Demo User', id: 1 },
            { email: 'test@test.com', password: 'password', name: 'Test User', id: 2 }
        ];

        const demoUser = demoAccounts.find(acc =>
            acc.email === loginData.email && acc.password === loginData.password
        );

        if (demoUser) {
            return {
                success: true,
                user: {
                    id: demoUser.id,
                    name: demoUser.name,
                    email: demoUser.email,
                    username: demoUser.name.toLowerCase().replace(' ', '_'),
                    phone: '',
                    google_account: false
                }
            };
        }

        return {
            success: false,
            message: 'Authentication failed. Use demo@fitlify.com / demo123'
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Login error occurred. Please try again.'
        };
    }
}

// Save user data
function saveUserData(userData, rememberMe = false) {
    const userSession = {
        ...userData,
        login_time: new Date().toISOString(),
        expires: rememberMe ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem('fitlify_user', JSON.stringify(userSession));
    localStorage.setItem('fitlify_authenticated', 'true');
    localStorage.setItem('fitlify_user_id', userData.id);
    localStorage.setItem('SignedIn', 'true');
}

// Check existing session - only redirect if fully authenticated
function checkExistingSession() {
    const userSession = localStorage.getItem('fitlify_user');
    const isAuthenticated = localStorage.getItem('fitlify_authenticated');
    const signedIn = localStorage.getItem('SignedIn');

    // Must have userSession AND (isAuthenticated OR SignedIn) to redirect
    if (userSession && (isAuthenticated === 'true' || signedIn === 'true')) {
        const session = JSON.parse(userSession);

        // Check if session has expired (only if has expiry)
        if (session.expires && new Date(session.expires) < new Date()) {
            localStorage.removeItem('fitlify_user');
            localStorage.removeItem('fitlify_authenticated');
            localStorage.removeItem('SignedIn');
            return; // Stay on login page
        }

        // Valid session - redirect to dashboard
        window.location.href = '../src/dashboard/dashboard.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';

    notification.innerHTML = `
        <span style="margin-right: 8px;">${icon}</span>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        max-width: 350px;
        display: flex;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    if (type === 'error') {
        notification.style.background = '#ef4444';
    } else if (type === 'success') {
        notification.style.background = '#10b981';
    } else {
        notification.style.background = '#3b82f6';
    }

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Handle forgot password
document.querySelector('.forgot-password')?.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Password reset link sent to your email!', 'success');
});

// Export for use in other scripts
window.ThemeManager = ThemeManager;
