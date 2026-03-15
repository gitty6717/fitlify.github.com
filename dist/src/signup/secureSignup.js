// Secure Signup JavaScript with JWT authentication
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
        return 'https://gitty6717.github.io/fitlify.github.com/dist/src';
    } else {
        return '../src';
    }
};

// DOM Elements
const signupForm = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const phoneInput = document.getElementById('phone');
const togglePasswordBtn = document.getElementById('toggle-password');
const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
const eyeIcon = document.getElementById('eye-icon');
const eyeIconConfirm = document.getElementById('eye-icon-confirm');
const signupBtn = document.getElementById('signup-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkExistingSession();
});

// Initialize event listeners
function initializeEventListeners() {
    signupForm.addEventListener('submit', handleSignup);
    togglePasswordBtn.addEventListener('click', () => togglePasswordVisibility('password'));
    toggleConfirmPasswordBtn.addEventListener('click', () => togglePasswordVisibility('confirm-password'));
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', ThemeManager.toggle);
    }
    
    // Real-time validation
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    phoneInput.addEventListener('input', validatePhone);
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

// Real-time validation functions
function validateName() {
    const name = nameInput.value.trim();
    const nameError = document.getElementById('name-error');
    
    if (name.length < 2) {
        nameError.textContent = 'Name must be at least 2 characters';
        nameError.style.display = 'block';
        return false;
    } else if (name.length > 50) {
        nameError.textContent = 'Name must be less than 50 characters';
        nameError.style.display = 'block';
        return false;
    } else {
        nameError.style.display = 'none';
        return true;
    }
}

function validateEmail() {
    const email = emailInput.value.trim();
    const emailError = document.getElementById('email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        emailError.textContent = 'Please enter a valid email address';
        emailError.style.display = 'block';
        return false;
    } else {
        emailError.style.display = 'none';
        return true;
    }
}

function validatePassword() {
    const password = passwordInput.value;
    const passwordError = document.getElementById('password-error');
    
    if (password.length < 8) {
        passwordError.textContent = 'Password must be at least 8 characters';
        passwordError.style.display = 'block';
        return false;
    } else if (!/(?=.*[a-z])/.test(password)) {
        passwordError.textContent = 'Password must contain at least 1 lowercase letter';
        passwordError.style.display = 'block';
        return false;
    } else if (!/(?=.*[A-Z])/.test(password)) {
        passwordError.textContent = 'Password must contain at least 1 uppercase letter';
        passwordError.style.display = 'block';
        return false;
    } else if (!/(?=.*\d)/.test(password)) {
        passwordError.textContent = 'Password must contain at least 1 number';
        passwordError.style.display = 'block';
        return false;
    } else {
        passwordError.textContent = 'Strong password';
        passwordError.style.display = 'block';
        passwordError.style.color = '#4caf50';
        return true;
    }
}

function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const confirmError = document.getElementById('confirm-error');
    
    if (password !== confirmPassword) {
        confirmError.textContent = 'Passwords do not match';
        confirmError.style.display = 'block';
        return false;
    } else {
        confirmError.style.display = 'none';
        return true;
    }
}

function validatePhone() {
    const phone = phoneInput.value.replace(/\D/g, '');
    const phoneError = document.getElementById('phone-error');
    
    if (phone.length > 0 && phone.length !== 10) {
        phoneError.textContent = 'Phone number must be 10 digits';
        phoneError.style.display = 'block';
        return false;
    } else {
        phoneError.style.display = 'none';
        return true;
    }
}

// Handle signup with secure authentication
async function handleSignup(e) {
    e.preventDefault();
    
    // Get form values
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const phone = phoneInput.value.replace(/\D/g, '');
    
    // Validate all fields
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isPasswordMatchValid = validatePasswordMatch();
    const isPhoneValid = validatePhone();
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isPasswordMatchValid || !isPhoneValid) {
        showError('Please fix all validation errors');
        return;
    }
    
    // Show loading state
    setLoading(true);
    
    try {
        // Send signup request to secure API
        const response = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, phone })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store JWT token
            localStorage.setItem('fitlify_token', data.token);
            
            // Store user data
            localStorage.setItem('fitlify_user', JSON.stringify(data.user));
            
            showSuccess('Account created successfully! Redirecting...');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = `${getBaseUrl()}/home/index.html`;
            }, 1500);
        } else {
            showError(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('Network error. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Toggle password visibility
function togglePasswordVisibility(field) {
    const input = field === 'password' ? passwordInput : confirmPasswordInput;
    const icon = field === 'password' ? eyeIcon : eyeIconConfirm;
    
    const type = input.getAttribute('type');
    const newType = type === 'password' ? 'text' : 'password';
    
    input.setAttribute('type', newType);
    
    // Update icon
    if (newType === 'text') {
        icon.innerHTML = '👁️‍🗨️';
    } else {
        icon.innerHTML = '👁️';
    }
}

// Show loading state
function setLoading(loading) {
    if (loading) {
        signupBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        signupBtn.disabled = false;
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
    signupForm.parentNode.insertBefore(alert, signupForm);
    
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
    signupForm.parentNode.insertBefore(alert, signupForm);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}

// Add CSS for alerts and validation
const styles = document.createElement('style');
styles.textContent = `
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
    
    .error-message {
        color: #ff6b6b;
        font-size: 12px;
        margin-top: 5px;
        display: none;
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
document.head.appendChild(styles);
