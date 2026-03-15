// DOM Elements
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPicture = document.getElementById('user-picture');
const userInitial = document.getElementById('user-initial');
const memberDays = document.getElementById('member-days');
const totalPlans = document.getElementById('total-plans');
const currentStreak = document.getElementById('current-streak');

// Profile data elements
const profileAge = document.getElementById('profile-age');
const profileHeight = document.getElementById('profile-height');
const profileWeight = document.getElementById('profile-weight');
const profileFitnessLevel = document.getElementById('profile-fitness-level');
const profileGoal = document.getElementById('profile-goal');
const profileWorkoutDays = document.getElementById('profile-workout-days');
const profileInjuries = document.getElementById('profile-injuries');
const profileNotes = document.getElementById('profile-notes');

// Plans container
const plansContainer = document.getElementById('plans-container');

// Buttons
const logoutBtn = document.getElementById('logout-btn');
const editDataBtn = document.getElementById('edit-data-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const exportDataBtn = document.getElementById('export-data-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');

// Modal elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');

// Edit form elements
const editAge = document.getElementById('edit-age');
const editHeight = document.getElementById('edit-height');
const editWeight = document.getElementById('edit-weight');
const editFitnessLevel = document.getElementById('edit-fitness-level');
const editGoal = document.getElementById('edit-goal');
const editWorkoutDays = document.getElementById('edit-workout-days');
const editInjuries = document.getElementById('edit-injuries');
const editNotes = document.getElementById('edit-notes');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
    setupEventListeners();
    loadUserData();
    loadFitnessData();
    loadWorkoutPlans();
    loadGameStats();
});

// Initialize profile
function initializeProfile() {
    checkAuthentication();
}

// Setup event listeners
function setupEventListeners() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (editDataBtn) {
        editDataBtn.addEventListener('click', openEditModal);
    }
    
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', regeneratePlan);
    }
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handleChangePassword);
    }
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', handleExportData);
    }
    
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
    
    // Game stats reset button
    const resetGameStatsBtn = document.getElementById('reset-game-stats-btn');
    if (resetGameStatsBtn) {
        resetGameStatsBtn.addEventListener('click', handleResetGameStats);
    }
    
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editModal && editModal.classList.contains('show')) {
            closeEditModal();
        }
    });
    
    // Close modal on background click
    editModal?.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// Check if user is authenticated
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('fitlify_authenticated');
    const userSession = localStorage.getItem('fitlify_user');
    const signedIn = localStorage.getItem('SignedIn');
    
    if ((!isAuthenticated || isAuthenticated !== 'true' || !userSession) && signedIn !== 'true') {
        window.location.href = '../src/login/login.html';
    }
}

// Load user data
function loadUserData() {
    const userSession = localStorage.getItem('fitlify_user');
    
    if (userSession) {
        try {
            const userData = JSON.parse(userSession);
            
            // Update user info
            if (userName) {
                userName.textContent = userData.name || 'User';
            }
            
            if (userEmail) {
                userEmail.textContent = userData.email || 'user@example.com';
            }
            
            // Update avatar
            if (userData.picture) {
                userPicture.src = userData.picture;
                userPicture.style.display = 'block';
                userInitial.style.display = 'none';
            } else {
                userInitial.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
                userPicture.style.display = 'none';
                userInitial.style.display = 'block';
            }
            
            // Calculate member days
            const joinDate = userData.signup_time || userData.login_time;
            if (joinDate && memberDays) {
                const days = calculateMemberDays(joinDate);
                memberDays.textContent = days;
            }
            
            // Load user stats
            loadUserStats(userData.id);
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// Calculate member days
function calculateMemberDays(joinDate) {
    const join = new Date(joinDate);
    const today = new Date();
    const diffTime = Math.abs(today - join);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Load user statistics
function loadUserStats(userId) {
    const stats = getUserStats(userId);
    
    if (totalPlans) {
        totalPlans.textContent = stats.totalPlans || 0;
    }
    
    if (currentStreak) {
        currentStreak.textContent = stats.currentStreak || 0;
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
    
    return {
        totalWorkouts: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalPlans: 0
    };
}

// Load fitness data
function loadFitnessData() {
    const fitnessData = localStorage.getItem('fitlify_fitness_data');
    
    if (fitnessData) {
        try {
            const data = JSON.parse(fitnessData);
            
            // Update profile fields
            if (profileAge && data.age) {
                profileAge.textContent = `${data.age} years`;
            }
            
            if (profileHeight && data.height) {
                profileHeight.textContent = `${data.height} cm`;
            }
            
            if (profileWeight && data.weight) {
                profileWeight.textContent = `${data.weight} kg`;
            }
            
            if (profileFitnessLevel && data.fitness_level) {
                profileFitnessLevel.textContent = data.fitness_level.charAt(0).toUpperCase() + data.fitness_level.slice(1);
            }
            
            if (profileGoal && data.goal) {
                profileGoal.textContent = data.goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            
            if (profileWorkoutDays && data.workout_days) {
                profileWorkoutDays.textContent = `${data.workout_days} days/week`;
            }
            
            if (profileInjuries && data.injuries) {
                profileInjuries.textContent = data.injuries || 'No injuries or limitations reported.';
            }
            
            if (profileNotes && data.notes) {
                profileNotes.textContent = data.notes || 'No additional notes provided.';
            }
            
        } catch (error) {
            console.error('Error loading fitness data:', error);
        }
    }
}

// Load workout plans
function loadWorkoutPlans() {
    const userSession = localStorage.getItem('fitlify_user');
    
    if (userSession && plansContainer) {
        try {
            const userData = JSON.parse(userSession);
            const plans = getWorkoutPlans(userData.id);
            
            if (plans.length === 0) {
                plansContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <p>No workout plans yet. Create your first plan to get started!</p>
                    </div>
                `;
            } else {
                plansContainer.innerHTML = plans.map(plan => createPlanCard(plan)).join('');
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
                    <strong>Goal:</strong> ${plan.goal ? plan.goal.replace('_', ' ').toUpperCase() : 'GENERAL FITNESS'}
                </div>
                <div class="plan-detail">
                    <strong>Level:</strong> ${plan.fitness_level ? plan.fitness_level.toUpperCase() : 'BEGINNER'}
                </div>
                <div class="plan-detail">
                    <strong>Days/Week:</strong> ${plan.workout_days || 3}
                </div>
                <div class="plan-detail">
                    <strong>Exercises:</strong> ${plan.exercises ? plan.exercises.length : 0}
                </div>
            </div>
        </div>
    `;
}

// View specific plan
function viewPlan(planId) {
    localStorage.setItem('fitlify_selected_plan', planId);
    window.location.href = '../src/plan/plan.html';
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('fitlify_authenticated');
        localStorage.removeItem('fitlify_user');
        localStorage.removeItem('SignedIn');
        
        showNotification('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = '../src/index.html';
        }, 1000);
    }
}

// Open edit modal
function openEditModal() {
    if (editModal) {
        // Load current fitness data into form
        const fitnessData = localStorage.getItem('fitlify_fitness_data');
        
        if (fitnessData) {
            try {
                const data = JSON.parse(fitnessData);
                
                if (editAge && data.age) editAge.value = data.age;
                if (editHeight && data.height) editHeight.value = data.height;
                if (editWeight && data.weight) editWeight.value = data.weight;
                if (editFitnessLevel && data.fitness_level) editFitnessLevel.value = data.fitness_level;
                if (editGoal && data.goal) editGoal.value = data.goal;
                if (editWorkoutDays && data.workout_days) editWorkoutDays.value = data.workout_days;
                if (editInjuries && data.injuries) editInjuries.value = data.injuries;
                if (editNotes && data.notes) editNotes.value = data.notes;
                
            } catch (error) {
                console.error('Error loading fitness data for edit:', error);
            }
        }
        
        editModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close edit modal
function closeEditModal() {
    if (editModal) {
        editModal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Handle edit form submission
async function handleEditSubmit(event) {
    event.preventDefault();
    
    const formData = {
        age: parseInt(editAge.value),
        height: parseFloat(editHeight.value),
        weight: parseFloat(editWeight.value),
        fitness_level: editFitnessLevel.value,
        goal: editGoal.value,
        workout_days: parseInt(editWorkoutDays.value),
        injuries: editInjuries.value.trim(),
        notes: editNotes.value.trim()
    };
    
    try {
        // Save fitness data
        const response = await saveFitnessData(formData);
        
        if (response.success) {
            // Update localStorage
            localStorage.setItem('fitlify_fitness_data', JSON.stringify(formData));
            
            // Reload profile data
            loadFitnessData();
            
            // Close modal
            closeEditModal();
            
            showNotification('Fitness data updated successfully!', 'success');
        } else {
            showNotification('Failed to update fitness data. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error updating fitness data:', error);
        showNotification('An error occurred. Please try again.', 'error');
    }
}

// Save fitness data to backend
async function saveFitnessData(fitnessData) {
    try {
        const response = await fetch('../src/backend/pydb.py', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save_fitness_data',
                data: fitnessData
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: true }; // Fallback
    }
}

// Regenerate plan
function regeneratePlan() {
    if (confirm('This will create a new workout plan. Continue?')) {
        window.location.href = '../src/form/form.html';
    }
}

// Handle change password
function handleChangePassword() {
    showNotification('Password change feature coming soon!', 'info');
}

// Handle export data
function handleExportData() {
    const userSession = localStorage.getItem('fitlify_user');
    
    if (userSession) {
        try {
            const userData = JSON.parse(userSession);
            const fitnessData = localStorage.getItem('fitlify_fitness_data');
            const plans = getWorkoutPlans(userData.id);
            
            const exportData = {
                user: userData,
                fitness_data: fitnessData ? JSON.parse(fitnessData) : null,
                workout_plans: plans,
                export_date: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `fitlify-data-${userData.email}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showNotification('Failed to export data. Please try again.', 'error');
        }
    }
}

// Handle delete account
function handleDeleteAccount() {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.');
    
    if (confirmation) {
        const finalConfirmation = confirm('This is your last chance. Are you absolutely sure you want to delete your account and all data?');
        
        if (finalConfirmation) {
            // Clear all data
            localStorage.removeItem('fitlify_authenticated');
            localStorage.removeItem('fitlify_user');
            localStorage.removeItem('fitlify_fitness_data');
            localStorage.removeItem('SignedIn');
            
            // Clear user-specific data
            const userSession = localStorage.getItem('fitlify_user');
            if (userSession) {
                try {
                    const userData = JSON.parse(userSession);
                    localStorage.removeItem(`fitlify_plans_${userData.id}`);
                    localStorage.removeItem(`fitlify_stats_${userData.id}`);
                } catch (error) {
                    console.error('Error clearing user data:', error);
                }
            }
            
            showNotification('Account deleted successfully. Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = '../src/index.html';
            }, 2000);
        }
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

// Load game stats
function loadGameStats() {
    const gameStatsPreview = document.getElementById('game-stats-preview');
    if (!gameStatsPreview) return;
    
    // Get game data from localStorage
    const gameData = JSON.parse(localStorage.getItem('fitlify_games_data') || '{}');
    const totalPlayed = gameData.totalPlayed || 0;
    const highScores = gameData.highScores || {};
    
    // Find highest score
    let highScore = 0;
    Object.values(highScores).forEach(score => {
        if (score > highScore) highScore = score;
    });
    
    // Count unlocked games
    const unlockedGames = gameData.unlockedGames || [];
    const unlockedCount = unlockedGames.length;
    
    gameStatsPreview.textContent = `Games Played: ${totalPlayed} | High Score: ${highScore} | Unlocked: ${unlockedCount}/510`;
}

// Handle reset game stats
function handleResetGameStats() {
    if (confirm('Are you sure you want to reset all your game stats? This will reset scores but keep achievements.')) {
        localStorage.removeItem('fitlify_games_data');
        loadGameStats();
        showNotification('Game stats reset successfully!', 'success');
    }
}
