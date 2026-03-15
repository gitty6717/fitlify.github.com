// DOM Elements
const welcomeMessage = document.getElementById('welcome-message');
const welcomeSubtitle = document.getElementById('welcome-subtitle');
const userAvatar = document.getElementById('user-avatar');
const userPicture = document.getElementById('user-picture');
const userInitial = document.getElementById('user-initial');
const totalWorkouts = document.getElementById('total-workouts');
const currentStreak = document.getElementById('current-streak');
const totalPlans = document.getElementById('total-plans');
const recentPlans = document.getElementById('recent-plans');
const logoutBtn = document.getElementById('logout-btn');

// Modal Elements
const progressModal = document.getElementById('progress-modal');
const modalTotalWorkouts = document.getElementById('modal-total-workouts');
const modalCurrentStreak = document.getElementById('modal-current-streak');
const modalBestStreak = document.getElementById('modal-best-streak');
const modalMemberSince = document.getElementById('modal-member-since');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    loadUserData();
});

// Initialize dashboard
function initializeDashboard() {
    checkAuthentication();
    loadUserStats();
    loadRecentPlans();
}

// Setup event listeners
function setupEventListeners() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Check if user is authenticated
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('fitlify_authenticated');
    const userSession = localStorage.getItem('fitlify_user');
    const signedIn = localStorage.getItem('SignedIn');
    
    // Must have both auth flag AND user session
    const hasAuthFlag = isAuthenticated === 'true' || signedIn === 'true';
    const hasUserData = userSession && userSession !== 'null' && userSession !== 'undefined';
    const hasValidSession = hasAuthFlag && hasUserData;
    
    if (!hasValidSession) {
        // Clear any partial session data
        localStorage.removeItem('fitlify_authenticated');
        localStorage.removeItem('SignedIn');
        window.location.href = '../src/login/login.html';
    }
}

// Load user data
function loadUserData() {
    const userSession = localStorage.getItem('fitlify_user');
    
    if (userSession) {
        try {
            const userData = JSON.parse(userSession);
            
            // Update welcome message
            if (welcomeMessage) {
                const firstName = userData.name ? userData.name.split(' ')[0] : 'User';
                welcomeMessage.textContent = `Welcome back, ${firstName}!`;
            }
            
            if (welcomeSubtitle) {
                welcomeSubtitle.textContent = 'Ready to continue your fitness journey?';
            }
            
            // Update user avatar
            if (userData.picture) {
                userPicture.src = userData.picture;
                userPicture.style.display = 'block';
                userInitial.style.display = 'none';
            } else {
                userInitial.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
                userPicture.style.display = 'none';
                userInitial.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Error parsing user data:', error);
            handleLogout();
        }
    }
}

// Load user statistics
function loadUserStats() {
    const userSession = localStorage.getItem('fitlify_user');
    
    if (userSession) {
        try {
            const userData = JSON.parse(userSession);
            
            // Load or initialize user stats
            const stats = getUserStats(userData.id);
            
            // Update dashboard stats
            if (totalWorkouts) {
                totalWorkouts.textContent = stats.totalWorkouts || 0;
            }
            
            if (currentStreak) {
                currentStreak.textContent = stats.currentStreak || 0;
            }
            
            if (totalPlans) {
                totalPlans.textContent = stats.totalPlans || 0;
            }
            
            // Update modal stats
            if (modalTotalWorkouts) {
                modalTotalWorkouts.textContent = stats.totalWorkouts || 0;
            }
            
            if (modalCurrentStreak) {
                modalCurrentStreak.textContent = stats.currentStreak || 0;
            }
            
            if (modalBestStreak) {
                modalBestStreak.textContent = stats.bestStreak || 0;
            }
            
            if (modalMemberSince) {
                const joinDate = userData.signup_time || userData.login_time;
                if (joinDate) {
                    const date = new Date(joinDate);
                    modalMemberSince.textContent = date.toLocaleDateString();
                }
            }
            
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }
}

// Get user stats from localStorage
function getUserStats(userId) {
    const statsKey = `fitlify_stats_${userId}`;
    const statsData = localStorage.getItem(statsKey);
    
    if (statsData) {
        try {
            return JSON.parse(statsData);
        } catch (error) {
            console.error('Error parsing stats data:', error);
        }
    }
    
    // Return default stats if none exist
    return {
        totalWorkouts: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastWorkoutDate: null,
        totalPlans: 0
    };
}

// Save user stats
function saveUserStats(userId, stats) {
    const statsKey = `fitlify_stats_${userId}`;
    localStorage.setItem(statsKey, JSON.stringify(stats));
}

// Load recent workout plans
function loadRecentPlans() {
    const userSession = localStorage.getItem('fitlify_user');
    
    if (userSession && recentPlans) {
        try {
            const userData = JSON.parse(userSession);
            const plans = getWorkoutPlans(userData.id);
            
            if (plans.length === 0) {
                // Show empty state
                recentPlans.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <p>No workout plans yet. Create your first plan to get started!</p>
                    </div>
                `;
            } else {
                // Show recent plans
                recentPlans.innerHTML = plans.map(plan => createPlanCard(plan)).join('');
            }
            
            // Update total plans count
            const stats = getUserStats(userData.id);
            stats.totalPlans = plans.length;
            saveUserStats(userData.id, stats);
            
            if (totalPlans) {
                totalPlans.textContent = plans.length;
            }
            
        } catch (error) {
            console.error('Error loading workout plans:', error);
        }
    }
}

// Get workout plans from localStorage
function getWorkoutPlans(userId) {
    const plansKey = `fitlify_plans_${userId}`;
    const plansData = localStorage.getItem(plansKey);
    
    if (plansData) {
        try {
            return JSON.parse(plansData);
        } catch (error) {
            console.error('Error parsing plans data:', error);
        }
    }
    
    return [];
}

// Save workout plan
function saveWorkoutPlan(userId, plan) {
    const plansKey = `fitlify_plans_${userId}`;
    const existingPlans = getWorkoutPlans(userId);
    
    // Add timestamp and ID
    const newPlan = {
        ...plan,
        id: Date.now(),
        created_at: new Date().toISOString(),
        status: 'active'
    };
    
    existingPlans.unshift(newPlan);
    
    // Keep only last 10 plans
    if (existingPlans.length > 10) {
        existingPlans.splice(10);
    }
    
    localStorage.setItem(plansKey, JSON.stringify(existingPlans));
    return newPlan;
}

// Create plan card HTML
function createPlanCard(plan) {
    const createdDate = new Date(plan.created_at);
    const formattedDate = createdDate.toLocaleDateString();
    
    return `
        <div class="plan-item" onclick="viewPlan('${plan.id}')">
            <div class="plan-header">
                <div class="plan-title">${plan.name || 'Custom Workout Plan'}</div>
                <div class="plan-date">${formattedDate}</div>
            </div>
            <div class="plan-details">
                <div class="plan-detail">
                    <strong>Goal:</strong> ${plan.goal || 'General Fitness'}
                </div>
                <div class="plan-detail">
                    <strong>Level:</strong> ${plan.fitness_level || 'Beginner'}
                </div>
                <div class="plan-detail">
                    <strong>Days/Week:</strong> ${plan.workout_days || 3}
                </div>
                <div class="plan-detail">
                    <strong>Exercises:</strong> ${plan.exercise_count || 0}
                </div>
            </div>
        </div>
    `;
}

// View specific plan
function viewPlan(planId) {
    // Store the selected plan ID for the plan page to retrieve
    localStorage.setItem('fitlify_selected_plan', planId);
    window.location.href = '../src/plan/plan.html';
}

// Handle logout
function handleLogout() {
    // Clear authentication
    localStorage.removeItem('fitlify_authenticated');
    
    // Show confirmation
    if (confirm('Are you sure you want to logout?')) {
        // Clear user session
        localStorage.removeItem('fitlify_user');
        
        // Show notification
        showNotification('Logged out successfully', 'success');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = '../src/index.html';
        }, 1000);
    }
}

// Show progress modal
function showProgressModal() {
    if (progressModal) {
        progressModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close progress modal
function closeProgressModal() {
    if (progressModal) {
        progressModal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'error') {
        notification.style.background = '#dc3545';
    } else if (type === 'success') {
        notification.style.background = '#28a745';
    } else {
        notification.style.background = '#17a2b8';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.classList.add('show');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && progressModal && progressModal.classList.contains('show')) {
        closeProgressModal();
    }
});

// Close modal on background click
progressModal?.addEventListener('click', (e) => {
    if (e.target === progressModal) {
        closeProgressModal();
    }
});

// Animate elements on page load
window.addEventListener('load', () => {
    // Animate stats
    const statsElements = document.querySelectorAll('.stat-number');
    statsElements.forEach((stat, index) => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            stat.style.transition = 'all 0.6s ease';
            stat.style.opacity = '1';
            stat.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate cards
    const cards = document.querySelectorAll('.action-card, .tip-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 500);
    });
});

// Update stats periodically
function updateStatsPeriodically() {
    const userSession = localStorage.getItem('fitlify_user');
    if (userSession) {
        const userData = JSON.parse(userSession);
        const stats = getUserStats(userData.id);
        
        // Update streak
        updateStreak(stats);
        
        // Save updated stats
        saveUserStats(userData.id, stats);
    }
}

// Update workout streak
function updateStreak(stats) {
    const today = new Date().toDateString();
    const lastWorkoutDate = stats.lastWorkoutDate ? new Date(stats.lastWorkoutDate).toDateString() : null;
    
    if (lastWorkoutDate !== today) {
        // Check if yesterday was a workout day
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastWorkoutDate !== yesterday.toDateString()) {
            // Streak broken
            stats.currentStreak = 0;
        }
    }
    
    // Update last workout date to today
    stats.lastWorkoutDate = new Date().toISOString();
}

// Call update function every minute
setInterval(updateStatsPeriodically, 60000); // Update every minute
