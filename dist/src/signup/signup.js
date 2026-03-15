// FITLIFY Signup JavaScript - Fixed with proper storage and redirect

// Theme Management
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('fitlify_theme') || 'dark';
        this.applyTheme(savedTheme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('fitlify_theme', theme);
    }
};

// Initialize theme on load
ThemeManager.init();

// DOM Elements
const signupForm = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const termsCheckbox = document.getElementById('terms');
const signupBtn = document.getElementById('signup-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const togglePasswordBtn = document.getElementById('toggle-password');
const toggleConfirmBtn = document.getElementById('toggle-confirm-password');

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    setupPasswordStrength();
    checkExistingSession();
});

function initializeEventListeners() {
    // Form submission
    signupForm.addEventListener('submit', handleSignup);
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => togglePasswordVisibility(passwordInput, 'eye-icon'));
    toggleConfirmBtn.addEventListener('click', () => togglePasswordVisibility(confirmPasswordInput, 'confirm-eye-icon'));
    
    // Real-time validation
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('input', updatePasswordStrength);
    passwordInput.addEventListener('blur', validatePassword);
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
    
    // Clear errors on input
    nameInput.addEventListener('input', () => clearError('name'));
    emailInput.addEventListener('input', () => clearError('email'));
    passwordInput.addEventListener('input', () => clearError('password'));
    confirmPasswordInput.addEventListener('input', () => clearError('confirm-password'));
}

function togglePasswordVisibility(input, iconId) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    const icon = document.getElementById(iconId);
    if (icon) icon.textContent = type === 'password' ? '👁️' : '🙈';
}

// Password strength indicator
function setupPasswordStrength() {
    // Already in HTML, just get references
    window.strengthFill = document.getElementById('strength-fill');
    window.strengthText = document.getElementById('strength-text');
}

function updatePasswordStrength() {
    const password = passwordInput.value;
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    
    strength = Math.min(strength, 100);
    
    let status = 'Weak';
    let color = '#ef4444';
    
    if (strength >= 80) {
        status = 'Strong';
        color = '#10b981';
    } else if (strength >= 50) {
        status = 'Good';
        color = '#3b82f6';
    } else if (strength >= 30) {
        status = 'Medium';
        color = '#f59e0b';
    }
    
    window.strengthFill.style.width = strength + '%';
    window.strengthFill.style.background = color;
    window.strengthText.textContent = `Password Strength: ${status}`;
    window.strengthText.style.color = color;
}

// Validation functions
function validateName() {
    const name = nameInput.value.trim();
    const isValid = name.length >= 2;
    toggleFieldError('name', !isValid, 'Name must be at least 2 characters');
    return isValid;
}

function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    toggleFieldError('email', !isValid, 'Please enter a valid email address');
    return isValid;
}

function validatePassword() {
    const password = passwordInput.value;
    const isValid = password.length >= 6;
    toggleFieldError('password', !isValid, 'Password must be at least 6 characters');
    return isValid;
}

function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const isValid = password === confirmPassword && confirmPassword.length > 0;
    toggleFieldError('confirm-password', !isValid, 'Passwords do not match');
    return isValid;
}

function validateTerms() {
    const isValid = termsCheckbox.checked;
    if (!isValid) {
        showNotification('Please agree to the Terms of Service', 'error');
    }
    return isValid;
}

function toggleFieldError(fieldName, show, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName === 'confirm-password' ? 'confirm-password' : fieldName);
    const formGroup = inputElement.closest('.form-group');
    
    if (show) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        formGroup.classList.add('error');
    } else {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        formGroup.classList.remove('error');
    }
}

function clearError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName === 'confirm-password' ? 'confirm-password' : fieldName);
    
    if (errorElement && inputElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        const formGroup = inputElement.closest('.form-group');
        if (formGroup) formGroup.classList.remove('error');
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    // Validate all fields
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirmPassword();
    const isTermsValid = validateTerms();
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid || !isTermsValid) {
        showNotification('Please fix the errors below', 'error');
        return;
    }
    
    // Show loading
    setLoadingState(true);
    
    try {
        const signupData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            username: nameInput.value.trim().toLowerCase().replace(/\s+/g, '_'),
            created_at: new Date().toISOString()
        };
        
        // Send signup request to Electron API or fallback
        let result;
        
        try {
            if (window.electronAPI) {
                result = await window.electronAPI.signup(signupData.name, signupData.email, signupData.password, signupData.phone);
            } else if (window.fetchAPI) {
                result = await window.fetchAPI.post('http://localhost:3001/api/signup', signupData);
            } else {
                // Fallback to localStorage for development
                const users = JSON.parse(localStorage.getItem('fitlify_users') || '[]');
                const existingUser = users.find(u => u.email === signupData.email);
                
                if (existingUser) {
                    showNotification('Email already registered. Please login.', 'error');
                    setLoadingState(false);
                    return;
                }
                
                const newUser = {
                    ...signupData,
                    id: Date.now().toString()
                };
                
                users.push(newUser);
                localStorage.setItem('fitlify_users', JSON.stringify(users));
                
                result = {
                    success: true,
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        username: newUser.username,
                        created_at: newUser.created_at
                    }
                };
            }

            if (result.success) {
                // Save user session
                saveUserData(result.user, true);
                
                showNotification('Account created successfully! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '../src/dashboard/dashboard.html';
                }, 1500);
            } else {
                showNotification(result.message || 'Signup failed', 'error');
            }
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Signup failed. Please try again.', 'error');
        setLoadingState(false);
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

function setLoadingState(loading) {
    if (loading) {
        signupBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    } else {
        signupBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Check existing session - only redirect if fully authenticated
function checkExistingSession() {
    const userSession = localStorage.getItem('fitlify_user');
    const isAuthenticated = localStorage.getItem('fitlify_authenticated');
    const signedIn = localStorage.getItem('SignedIn');
    
    // Must have userSession AND (isAuthenticated OR SignedIn) to redirect
    if (userSession && (isAuthenticated === 'true' || signedIn === 'true')) {
        // Check if session is expired
        const session = JSON.parse(userSession);
        if (session.expires && new Date(session.expires) < new Date()) {
            // Session expired, clear it
            localStorage.removeItem('fitlify_user');
            localStorage.removeItem('fitlify_authenticated');
            localStorage.removeItem('SignedIn');
            return; // Stay on signup page
        }
        
        // Valid session - redirect to dashboard
        window.location.href = '../src/dashboard/dashboard.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // ... (rest of the code remains the same)
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
    
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Export for use in other scripts
window.ThemeManager = ThemeManager;
