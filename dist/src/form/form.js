// DOM Elements
const fitnessForm = document.getElementById('fitness-form');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');

// Form field elements
const ageInput = document.getElementById('age');
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const injuriesTextarea = document.getElementById('injuries');
const notesTextarea = document.getElementById('notes');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
    loadSavedData();
});

// Initialize form
function initializeForm() {
    checkAuthentication();
    setupProgressIndicator();
}

// Setup event listeners
function setupEventListeners() {
    if (fitnessForm) {
        fitnessForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    // Add real-time validation
    ageInput.addEventListener('blur', validateAge);
    heightInput.addEventListener('blur', validateHeight);
    weightInput.addEventListener('blur', validateWeight);
    
    // Clear errors on input
    [ageInput, heightInput, weightInput].forEach(input => {
        input.addEventListener('input', () => clearError(input));
    });
}

// Check if user is authenticated
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('fitlify_authenticated');
    const userSession = localStorage.getItem('fitlify_user');
    
    if (!isAuthenticated || isAuthenticated !== 'true' || !userSession) {
        window.location.href = '../src/login/login.html';
    }
}

// Setup progress indicator
function setupProgressIndicator() {
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'progress-indicator';
    progressIndicator.innerHTML = '<div class="progress-fill"></div>';
    document.body.appendChild(progressIndicator);
}

// Update progress indicator
function updateProgress(percentage) {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
}

// Load saved form data
function loadSavedData() {
    const userSession = localStorage.getItem('fitlify_user');
    
    if (userSession) {
        try {
            const userData = JSON.parse(userSession);
            
            // Load saved fitness data if exists
            const savedFitnessData = localStorage.getItem('fitlify_fitness_data');
            if (savedFitnessData) {
                const fitnessData = JSON.parse(savedFitnessData);
                
                if (ageInput && fitnessData.age) ageInput.value = fitnessData.age;
                if (heightInput && fitnessData.height) heightInput.value = fitnessData.height;
                if (weightInput && fitnessData.weight) weightInput.value = fitnessData.weight;
                if (injuriesTextarea && fitnessData.injuries) injuriesTextarea.value = fitnessData.injuries;
                if (notesTextarea && fitnessData.notes) notesTextarea.value = fitnessData.notes;
                
                // Restore radio selections
                if (fitnessData.fitness_level) {
                    const fitnessRadio = document.querySelector(`input[name="fitness_level"][value="${fitnessData.fitness_level}"]`);
                    if (fitnessRadio) fitnessRadio.checked = true;
                }
                
                if (fitnessData.goal) {
                    const goalRadio = document.querySelector(`input[name="goal"][value="${fitnessData.goal}"]`);
                    if (goalRadio) goalRadio.checked = true;
                }
                
                if (fitnessData.workout_days) {
                    const workoutDaysSelect = document.getElementById('workout_days');
                    if (workoutDaysSelect) workoutDaysSelect.value = fitnessData.workout_days;
                }
                
                // Restore equipment checkboxes
                if (fitnessData.equipment && Array.isArray(fitnessData.equipment)) {
                    fitnessData.equipment.forEach(equipment => {
                        const checkbox = document.querySelector(`input[name="equipment"][value="${equipment}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Validate age
function validateAge() {
    const age = parseInt(ageInput.value);
    const isValid = age >= 13 && age <= 100;
    
    toggleFieldError(ageInput, !isValid, 'Age must be between 13 and 100');
    return isValid;
}

// Validate height
function validateHeight() {
    const height = parseFloat(heightInput.value);
    const isValid = height >= 100 && height <= 250;
    
    toggleFieldError(heightInput, !isValid, 'Height must be between 100 and 250 cm');
    return isValid;
}

// Validate weight
function validateWeight() {
    const weight = parseFloat(weightInput.value);
    const isValid = weight >= 30 && weight <= 300;
    
    toggleFieldError(weightInput, !isValid, 'Weight must be between 30 and 300 kg');
    return isValid;
}

// Toggle field error
function toggleFieldError(field, show, message) {
    const formGroup = field.closest('.form-group');
    let errorElement = formGroup.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    
    if (show) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
    } else {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        formGroup.classList.remove('error');
        if (field.value) {
            formGroup.classList.add('success');
        }
    }
}

// Clear error
function clearError(input) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    
    if (input.value) {
        formGroup.classList.add('success');
    } else {
        formGroup.classList.remove('success');
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate all required fields
    const isAgeValid = validateAge();
    const isHeightValid = validateHeight();
    const isWeightValid = validateWeight();
    
    if (!isAgeValid || !isHeightValid || !isWeightValid) {
        showNotification('Please fix the errors below', 'error');
        return;
    }
    
    // Get form data
    const formData = getFormData();
    
    // Validate required selections
    if (!formData.fitness_level) {
        showNotification('Please select your fitness level', 'error');
        return;
    }
    
    if (!formData.goal) {
        showNotification('Please select your primary goal', 'error');
        return;
    }
    
    if (!formData.workout_days) {
        showNotification('Please select your workout frequency', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    updateProgress(20);
    
    try {
        // Save fitness data to backend
        const response = await saveFitnessData(formData);
        
        updateProgress(50);
        
        if (response.success) {
            updateProgress(80);
            
            // Save to localStorage for plan generation
            localStorage.setItem('fitlify_fitness_data', JSON.stringify(formData));
            
            // Generate workout plan
            const workoutPlan = await generateWorkoutPlan(formData);
            
            updateProgress(100);
            
            if (workoutPlan.success) {
                // Save the generated plan
                const userSession = localStorage.getItem('fitlify_user');
                if (userSession) {
                    const userData = JSON.parse(userSession);
                    saveWorkoutPlan(userData.id, workoutPlan.plan);
                }
                
                showNotification('Workout plan generated successfully! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '../src/plan/plan.html';
                }, 1500);
            } else {
                showNotification('Failed to generate workout plan. Please try again.', 'error');
            }
        } else {
            showNotification(response.message || 'Failed to save fitness data. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('An error occurred. Please check your connection and try again.', 'error');
    } finally {
        setLoadingState(false);
        setTimeout(() => updateProgress(0), 500);
    }
}

// Get form data
function getFormData() {
    const formData = {
        age: parseInt(ageInput.value),
        height: parseFloat(heightInput.value),
        weight: parseFloat(weightInput.value),
        injuries: injuriesTextarea.value.trim(),
        notes: notesTextarea.value.trim()
    };
    
    // Get selected fitness level
    const fitnessLevelSelected = document.querySelector('input[name="fitness_level"]:checked');
    if (fitnessLevelSelected) {
        formData.fitness_level = fitnessLevelSelected.value;
    }
    
    // Get selected goal
    const goalSelected = document.querySelector('input[name="goal"]:checked');
    if (goalSelected) {
        formData.goal = goalSelected.value;
    }
    
    // Get selected workout days
    const workoutDaysSelect = document.getElementById('workout_days');
    if (workoutDaysSelect) {
        formData.workout_days = parseInt(workoutDaysSelect.value);
    }
    
    // Get selected equipment
    const equipmentCheckboxes = document.querySelectorAll('input[name="equipment"]:checked');
    formData.equipment = Array.from(equipmentCheckboxes).map(cb => cb.value);
    
    return formData;
}

// Set loading state
function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
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
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        
        // Fallback to demo mode if backend is not available
        if (error.message.includes('Failed to fetch')) {
            return simulateSaveFitnessData(fitnessData);
        }
        
        throw error;
    }
}

// Simulate saving fitness data for demo purposes
function simulateSaveFitnessData(fitnessData) {
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Fitness data saved successfully'
            });
        }, 1000);
    });
}

// Generate workout plan
async function generateWorkoutPlan(fitnessData) {
    try {
        const response = await fetch('../src/backend/pydb.py', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'generate_workout_plan',
                data: fitnessData
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Plan generation error:', error);
        
        // Fallback to demo mode if backend is not available
        if (error.message.includes('Failed to fetch')) {
            return simulateWorkoutPlanGeneration(fitnessData);
        }
        
        throw error;
    }
}

// Simulate workout plan generation for demo purposes
function simulateWorkoutPlanGeneration(fitnessData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const plan = generateDemoPlan(fitnessData);
            resolve({
                success: true,
                plan: plan
            });
        }, 1500);
    });
}

// Generate demo workout plan
function generateDemoPlan(fitnessData) {
    const plans = {
        lose_fat: {
            name: 'Fat Loss Plan',
            weekly_split: 'Full Body + Cardio',
            exercises: [
                { name: 'Jumping Jacks', sets: 3, reps: 30, rest: 60 },
                { name: 'Push-ups', sets: 3, reps: 15, rest: 60 },
                { name: 'Bodyweight Squats', sets: 3, reps: 20, rest: 90 },
                { name: 'Mountain Climbers', sets: 3, reps: 20, rest: 60 },
                { name: 'Plank', sets: 3, reps: '60 seconds', rest: 60 },
                { name: 'Jump Rope', sets: 3, reps: '5 minutes', rest: 120 }
            ]
        },
        gain_muscle: {
            name: 'Muscle Building Plan',
            weekly_split: 'Upper/Lower Split',
            exercises: [
                { name: 'Push-ups', sets: 4, reps: 12, rest: 90 },
                { name: 'Pull-ups', sets: 4, reps: 8, rest: 120 },
                { name: 'Bodyweight Squats', sets: 4, reps: 15, rest: 90 },
                { name: 'Lunges', sets: 3, reps: 12, rest: 60 },
                { name: 'Dips', sets: 3, reps: 10, rest: 90 },
                { name: 'Glute Bridges', sets: 3, reps: 15, rest: 60 }
            ]
        },
        maintain: {
            name: 'Maintenance Plan',
            weekly_split: 'Full Body',
            exercises: [
                { name: 'Push-ups', sets: 3, reps: 12, rest: 60 },
                { name: 'Bodyweight Squats', sets: 3, reps: 15, rest: 90 },
                { name: 'Lunges', sets: 3, reps: 10, rest: 60 },
                { name: 'Plank', sets: 3, reps: '45 seconds', rest: 60 },
                { name: 'Jumping Jacks', sets: 3, reps: 25, rest: 60 }
            ]
        },
        endurance: {
            name: 'Endurance Plan',
            weekly_split: 'Cardio Focus',
            exercises: [
                { name: 'Jump Rope', sets: 5, reps: '3 minutes', rest: 60 },
                { name: 'High Knees', sets: 3, reps: 30, rest: 60 },
                { name: 'Burpees', sets: 3, reps: 10, rest: 90 },
                { name: 'Mountain Climbers', sets: 3, reps: 20, rest: 60 },
                { name: 'Jumping Jacks', sets: 3, reps: 30, rest: 60 }
            ]
        }
    };
    
    const basePlan = plans[fitnessData.goal] || plans.maintain;
    
    return {
        ...basePlan,
        fitness_level: fitnessData.fitness_level,
        workout_days: fitnessData.workout_days,
        equipment: fitnessData.equipment,
        personal_data: fitnessData,
        created_at: new Date().toISOString()
    };
}

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset all form data?')) {
        fitnessForm.reset();
        
        // Clear all error states
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
        });
        
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
        
        showNotification('Form has been reset', 'info');
    }
}

// Save workout plan to backend
async function saveWorkoutPlan(userId, plan) {
    try {
        const response = await fetch('../src/backend/pydb.py', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save_workout_plan',
                user_id: userId,
                data: plan
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error saving workout plan:', error);
        return { success: false };
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

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON' && document.activeElement.tagName !== 'TEXTAREA') {
        fitnessForm.dispatchEvent(new Event('submit'));
    }
});

// Auto-save form data periodically
setInterval(() => {
    const formData = getFormData();
    localStorage.setItem('fitlify_fitness_data_draft', JSON.stringify(formData));
}, 30000); // Auto-save every 30 seconds
