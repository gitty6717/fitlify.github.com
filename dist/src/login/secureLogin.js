// Secure Login JavaScript with JWT authentication
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

// API Configuration
const API_BASE = 'http://localhost:3002/api';

// Base URL for navigation
const getBaseUrl = () => {
    if (window.location.protocol === 'file:') {
        return '../src'; // Local installed files
    } else {
        return '../src'; // Development mode
    }
};

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
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', ThemeManager.toggle);
    }
}

// Check for existing JWT session
function checkExistingSession() {
    const token = localStorage.getItem('fitlify_token');
    if (token) {
        // Verify token with server
        fetch(`${API_BASE}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Valid token, redirect to home
                showSuccess('Already logged in, redirecting...');
                setTimeout(() => {
                    window.location.href = `${getBaseUrl()}/home/index.html`;
                }, 1000);
            } else {
                // Invalid token, remove it
                localStorage.removeItem('fitlify_token');
            }
        })
        .catch(error => {
            console.error('Token verification error:', error);
            localStorage.removeItem('fitlify_token');
        });
    }
}

// Handle login with secure authentication
async function handleLogin(e) {
    e.preventDefault();
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Basic validation
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    setLoading(true);
    
    try {
        // Send login request to secure API
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store JWT token
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('fitlify_token', data.token);
            } else {
                sessionStorage.setItem('fitlify_token', data.token);
            }
            
            // Store user data
            localStorage.setItem('fitlify_user', JSON.stringify(data.user));
            
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = `${getBaseUrl()}/home/index.html`;
            }, 1500);
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type');
    const newType = type === 'password' ? 'text' : 'password';
    
    passwordInput.setAttribute('type', newType);
    
    // Update icon
    if (newType === 'text') {
        eyeIcon.innerHTML = '👁️‍🗨️';
    } else {
        eyeIcon.innerHTML = '👁️';
    }
}

// Show loading state
function setLoading(loading) {
    if (loading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    // Remove existing messages
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create error alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `
        <span class="alert-icon">⚠️</span>
        <span class="alert-message">${message}</span>
        <span class="alert-close" onclick="this.parentElement.remove()">×</span>
    `;
    
    // Insert before form
    loginForm.parentNode.insertBefore(alert, loginForm);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Remove existing messages
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create success alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `
        <span class="alert-icon">✅</span>
        <span class="alert-message">${message}</span>
        <span class="alert-close" onclick="this.parentElement.remove()">×</span>
    `;
    
    // Insert before form
    loginForm.parentNode.insertBefore(alert, loginForm);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}

// Forgot password handler
function handleForgotPassword() {
    const email = prompt('Enter your email address for password reset:');
    if (email && emailRegex.test(email)) {
        // In a real app, this would send a reset email
        showSuccess('Password reset link sent to your email');
    } else if (email) {
        showError('Please enter a valid email address');
    }
}

// Add forgot password link
document.addEventListener('DOMContentLoaded', () => {
    const forgotLink = document.createElement('a');
    forgotLink.href = '#';
    forgotLink.textContent = 'Forgot Password?';
    forgotLink.style.cssText = `
        display: block;
        text-align: center;
        margin-top: 20px;
        color: var(--accent-color);
        text-decoration: none;
        font-size: 14px;
    `;
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        handleForgotPassword();
    });
    
    loginForm.parentNode.appendChild(forgotLink);
});

// Add CSS for alerts
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    .alert {
        display: flex;
        align-items: center;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 8px;
        animation: slideIn 0.3s ease-out;
    }
    
    .alert-error {
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        color: white;
    }
    
    .alert-success {
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
    }
    
    .alert-icon {
        margin-right: 10px;
        font-size: 18px;
    }
    
    .alert-message {
        flex: 1;
        font-weight: 500;
    }
    
    .alert-close {
        margin-left: 10px;
        cursor: pointer;
        font-size: 20px;
        opacity: 0.8;
    }
    
    .alert-close:hover {
        opacity: 1;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(alertStyles);
