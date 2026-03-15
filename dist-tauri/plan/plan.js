// DOM Elements
const planTitle = document.getElementById('plan-title');
const planSubtitle = document.getElementById('plan-subtitle');
const splitGrid = document.getElementById('split-grid');
const exercisesContainer = document.getElementById('exercises-container');
const regenerateBtn = document.getElementById('regenerate-btn');
const downloadBtn = document.getElementById('download-btn');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializePlan();
    setupEventListeners();
});

// Initialize plan
function initializePlan() {
    checkAuthentication();
    loadWorkoutPlan();
}

// Setup event listeners
function setupEventListeners() {
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', regeneratePlan);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPlan);
    }
}

// Check if user is authenticated
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('fitlify_authenticated');
    const userSession = localStorage.getItem('fitlify_user');
    
    if (!isAuthenticated || isAuthenticated !== 'true' || !userSession) {
        window.location.href = '../src/login/login.html';
    }
}

// Load workout plan
function loadWorkoutPlan() {
    const userSession = localStorage.getItem('fitlify_user');
    
    if (userSession) {
        try {
            const userData = JSON.parse(userSession);
            
            // Check if there's a selected plan
            const selectedPlanId = localStorage.getItem('fitlify_selected_plan');
            if (selectedPlanId) {
                // Load specific plan
                loadSpecificPlan(userData.id, selectedPlanId);
            } else {
                // Load latest plan
                loadLatestPlan(userData.id);
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
            showNotification('Error loading workout plan', 'error');
            window.location.href = '../src/form/form.html';
        }
    }
}

// Load specific plan
function loadSpecificPlan(userId, planId) {
    const plans = getWorkoutPlans(userId);
    const plan = plans.find(p => p.id == planId);
    
    if (plan) {
        displayWorkoutPlan(plan);
    } else {
        // Fall back to latest plan
        loadLatestPlan(userId);
    }
}

// Load latest plan
function loadLatestPlan(userId) {
    const plans = getWorkoutPlans(userId);
    
    if (plans.length > 0) {
        const latestPlan = plans[0]; // Plans are stored with newest first
        displayWorkoutPlan(latestPlan);
    } else {
        // No plans found, redirect to form
        showNotification('No workout plan found. Please create one first.', 'info');
        setTimeout(() => {
            window.location.href = '../src/form/form.html';
        }, 2000);
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

// Display workout plan
function displayWorkoutPlan(plan) {
    // Update header
    if (planTitle) {
        planTitle.textContent = plan.name || 'Custom Workout Plan';
    }
    
    if (planSubtitle) {
        const goalText = plan.goal ? plan.goal.replace('_', ' ').toUpperCase() : 'GENERAL FITNESS';
        planSubtitle.textContent = `${goalText} • ${plan.fitness_level ? plan.fitness_level.toUpperCase() : 'BEGINNER'} • ${plan.workout_days || 3} DAYS/WEEK`;
    }
    
    // Display weekly split
    displayWeeklySplit(plan);
    
    // Display exercises
    displayExercises(plan);
    
    // Clear selected plan ID
    localStorage.removeItem('fitlify_selected_plan');
}

// Display weekly split
function displayWeeklySplit(plan) {
    if (!splitGrid) return;
    
    const splitData = generateWeeklySplit(plan);
    
    splitGrid.innerHTML = splitData.map(day => `
        <div class="day-card">
            <h4 class="day-title">${day.name}</h4>
            <p class="day-focus">${day.focus}</p>
            <ul class="exercise-list">
                ${day.exercises.map(exercise => `
                    <li class="exercise-item">${exercise}</li>
                `).join('')}
            </ul>
        </div>
    `).join('');
}

// Generate weekly split data
function generateWeeklySplit(plan) {
    const workoutDays = plan.workout_days || 3;
    const goal = plan.goal || 'maintain';
    const fitnessLevel = plan.fitness_level || 'beginner';
    
    let splitName = '';
    let days = [];
    
    if (workoutDays >= 5) {
        splitName = '5-Day Split';
        days = [
            { name: 'Day 1', focus: 'Upper Body', exercises: ['Chest', 'Shoulders', 'Triceps'] },
            { name: 'Day 2', focus: 'Lower Body', exercises: ['Quads', 'Hamstrings', 'Glutes'] },
            { name: 'Day 3', focus: 'Upper Body', exercises: ['Back', 'Biceps', 'Abs'] },
            { name: 'Day 4', focus: 'Lower Body', exercises: ['Calves', 'Core', 'Balance'] },
            { name: 'Day 5', focus: 'Full Body', exercises: ['Compound Movements', 'Cardio'] }
        ];
    } else if (workoutDays === 4) {
        splitName = 'Upper/Lower Split';
        days = [
            { name: 'Day 1', focus: 'Upper Body A', exercises: ['Chest', 'Shoulders', 'Triceps'] },
            { name: 'Day 2', focus: 'Lower Body A', exercises: ['Quads', 'Hamstrings', 'Glutes'] },
            { name: 'Day 3', focus: 'Upper Body B', exercises: ['Back', 'Biceps', 'Abs'] },
            { name: 'Day 4', focus: 'Lower Body B', exercises: ['Calves', 'Core', 'Cardio'] }
        ];
    } else if (workoutDays === 3) {
        splitName = 'Full Body Split';
        days = [
            { name: 'Day 1', focus: 'Full Body A', exercises: ['Compound Movements', 'Upper Body'] },
            { name: 'Day 2', focus: 'Full Body B', exercises: ['Compound Movements', 'Lower Body'] },
            { name: 'Day 3', focus: 'Full Body C', exercises: ['Core', 'Cardio', 'Flexibility'] }
        ];
    } else if (workoutDays === 2) {
        splitName = 'Upper/Lower Split';
        days = [
            { name: 'Day 1', focus: 'Upper Body', exercises: ['Push', 'Pull', 'Core'] },
            { name: 'Day 2', focus: 'Lower Body', exercises: ['Squat', 'Hinge', 'Cardio'] }
        ];
    } else {
        splitName = 'Full Body';
        days = [
            { name: 'Day 1', focus: 'Full Body', exercises: ['All Major Muscle Groups', 'Cardio'] }
        ];
    }
    
    return days;
}

// Display exercises
function displayExercises(plan) {
    if (!exercisesContainer) return;
    
    if (plan.exercises && plan.exercises.length > 0) {
        exercisesContainer.innerHTML = plan.exercises.map(exercise => `
            <div class="exercise-detail">
                <h4 class="exercise-name">${exercise.name}</h4>
                <div class="exercise-specs">
                    <div class="spec-item">
                        <div class="spec-label">Sets</div>
                        <div class="spec-value">${exercise.sets}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Reps</div>
                        <div class="spec-value">${exercise.reps}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Rest</div>
                        <div class="spec-value">${exercise.rest}s</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Intensity</div>
                        <div class="spec-value">${getIntensityLevel(plan.fitness_level)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        // Generate default exercises if none exist
        const defaultExercises = generateDefaultExercises(plan);
        exercisesContainer.innerHTML = defaultExercises.map(exercise => `
            <div class="exercise-detail">
                <h4 class="exercise-name">${exercise.name}</h4>
                <div class="exercise-specs">
                    <div class="spec-item">
                        <div class="spec-label">Sets</div>
                        <div class="spec-value">${exercise.sets}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Reps</div>
                        <div class="spec-value">${exercise.reps}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Rest</div>
                        <div class="spec-value">${exercise.rest}s</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Intensity</div>
                        <div class="spec-value">${getIntensityLevel(plan.fitness_level)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Generate default exercises
function generateDefaultExercises(plan) {
    const goal = plan.goal || 'maintain';
    const fitnessLevel = plan.fitness_level || 'beginner';
    const equipment = plan.equipment || [];
    
    const exerciseSets = {
        lose_fat: [
            { name: 'Jumping Jacks', sets: 3, reps: 30, rest: 60 },
            { name: 'Push-ups', sets: 3, reps: 15, rest: 60 },
            { name: 'Bodyweight Squats', sets: 3, reps: 20, rest: 90 },
            { name: 'Mountain Climbers', sets: 3, reps: 20, rest: 60 },
            { name: 'Plank', sets: 3, reps: '60 seconds', rest: 60 }
        ],
        gain_muscle: [
            { name: 'Push-ups', sets: 4, reps: 12, rest: 90 },
            { name: 'Pull-ups', sets: 4, reps: 8, rest: 120 },
            { name: 'Bodyweight Squats', sets: 4, reps: 15, rest: 90 },
            { name: 'Lunges', sets: 3, reps: 12, rest: 60 },
            { name: 'Dips', sets: 3, reps: 10, rest: 90 }
        ],
        maintain: [
            { name: 'Push-ups', sets: 3, reps: 12, rest: 60 },
            { name: 'Bodyweight Squats', sets: 3, reps: 15, rest: 90 },
            { name: 'Lunges', sets: 3, reps: 10, rest: 60 },
            { name: 'Plank', sets: 3, reps: '45 seconds', rest: 60 }
        ],
        endurance: [
            { name: 'Jump Rope', sets: 5, reps: '3 minutes', rest: 60 },
            { name: 'High Knees', sets: 3, reps: 30, rest: 60 },
            { name: 'Burpees', sets: 3, reps: 10, rest: 90 },
            { name: 'Mountain Climbers', sets: 3, reps: 20, rest: 60 }
        ]
    };
    
    return exerciseSets[goal] || exerciseSets.maintain;
}

// Get intensity level text
function getIntensityLevel(fitnessLevel) {
    const levels = {
        beginner: 'Low',
        intermediate: 'Medium',
        advanced: 'High'
    };
    return levels[fitnessLevel] || 'Medium';
}

// Regenerate plan
function regeneratePlan() {
    if (confirm('This will create a new workout plan. Continue?')) {
        // Redirect to form to create new plan
        window.location.href = '../src/form/form.html';
    }
}

// Download plan as PDF
function downloadPlan() {
    showNotification('PDF download feature coming soon!', 'info');
    
    // For now, create a text download
    const planText = generatePlanText();
    downloadTextFile(planText, 'workout-plan.txt');
}

// Generate plan text
function generatePlanText() {
    const title = planTitle ? planTitle.textContent : 'Workout Plan';
    const subtitle = planSubtitle ? planSubtitle.textContent : '';
    
    let text = `${title}\n${'='.repeat(title.length)}\n`;
    text += `${subtitle}\n\n`;
    
    // Add exercises
    const exercises = document.querySelectorAll('.exercise-detail');
    exercises.forEach((exercise, index) => {
        const name = exercise.querySelector('.exercise-name').textContent;
        const specs = exercise.querySelectorAll('.spec-value');
        const sets = specs[0].textContent;
        const reps = specs[1].textContent;
        const rest = specs[2].textContent;
        
        text += `${index + 1}. ${name}\n`;
        text += `   Sets: ${sets}\n`;
        text += `   Reps: ${reps}\n`;
        text += `   Rest: ${rest}\n\n`;
    });
    
    // Add tips
    text += 'Tips:\n';
    text += '- Stay hydrated\n';
    text += '- Focus on proper form\n';
    text += '- Take adequate rest\n';
    text += '- Progress gradually\n';
    
    return text;
}

// Download text file
function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Workout plan downloaded successfully!', 'success');
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

// Initialize progress tracking
function initializeProgress() {
    const progressItems = document.querySelectorAll('.progress-item');
    
    progressItems.forEach((item, index) => {
        const progressFill = item.querySelector('.progress-fill');
        const progressStatus = item.querySelector('.progress-status');
        
        // Simulate progress (in real app, this would come from backend)
        const progress = getWeekProgress(index + 1);
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressStatus) {
            if (progress === 0) {
                progressStatus.textContent = 'Not Started';
            } else if (progress < 100) {
                progressStatus.textContent = 'In Progress';
            } else {
                progressStatus.textContent = 'Completed';
            }
        }
    });
}

// Get week progress (simulated)
function getWeekProgress(week) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (week - 1) * 7);
    
    // Simulate progress based on past weeks
    if (weekStart > today) {
        return 0; // Future week
    } else if (week === 1) {
        return 75; // Current week, partially complete
    } else {
        return 100; // Past weeks, complete
    }
}

// Initialize progress after a delay
setTimeout(initializeProgress, 1000);
