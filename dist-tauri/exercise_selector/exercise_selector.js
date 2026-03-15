// FITLIFY Exercise Selector JavaScript
class ExerciseSelector {
    constructor() {
        this.exercises = [];
        this.selectedExercises = new Set();
        this.filteredExercises = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        this.init();
    }
    
    init() {
        this.loadExercises();
        this.setupEventListeners();
        this.updateUI();
    }
    
    async loadExercises() {
        try {
            // Load exercises from backend API
            const response = await fetch('../src/backend/api/exercises.php');
            const data = await response.json();
            
            if (data.success) {
                this.exercises = data.exercises;
                this.filteredExercises = [...this.exercises];
                this.renderExercises();
                this.updateStats();
            } else {
                // Fallback to sample data if API fails
                this.loadSampleExercises();
            }
        } catch (error) {
            console.error('Error loading exercises:', error);
            this.loadSampleExercises();
        }
    }
    
    loadSampleExercises() {
        // Sample exercise data for demonstration
        this.exercises = [
            {
                exercise_id: 'ex001',
                exercise_name: 'Push-ups',
                exercise_category: 'Upper Body',
                difficulty: 'beginner',
                description: 'A bodyweight exercise targeting the chest, shoulders, and triceps.',
                equipment_needed: [],
                muscle_groups: ['chest', 'shoulders', 'triceps'],
                safety_notes: 'Keep back straight, lower chest to ground',
                instructions: ['Start in plank position', 'Lower body until chest nearly touches ground', 'Push back up to starting position']
            },
            {
                exercise_id: 'ex016',
                exercise_name: 'Bodyweight Squats',
                exercise_category: 'Lower Body',
                difficulty: 'beginner',
                description: 'Fundamental lower body exercise for legs and glutes.',
                equipment_needed: [],
                muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
                safety_notes: 'Keep back straight, knees behind toes',
                instructions: ['Stand with feet shoulder-width apart', 'Lower hips as if sitting in chair', 'Return to standing']
            },
            {
                exercise_id: 'ex031',
                exercise_name: 'Plank',
                exercise_category: 'Core',
                difficulty: 'beginner',
                description: 'Isometric core strengthening exercise.',
                equipment_needed: [],
                muscle_groups: ['core', 'shoulders'],
                safety_notes: 'Keep body in straight line',
                instructions: ['Hold push-up position', 'Maintain straight body', 'Hold for time']
            },
            {
                exercise_id: 'ex051',
                exercise_name: 'Jumping Jacks',
                exercise_category: 'Cardio',
                difficulty: 'beginner',
                description: 'Classic cardio warm-up exercise.',
                equipment_needed: [],
                muscle_groups: ['full_body'],
                safety_notes: 'Land softly on balls of feet',
                instructions: ['Stand with feet together', 'Jump while spreading legs and arms', 'Return to start']
            },
            {
                exercise_id: 'ex004',
                exercise_name: 'Pull-ups',
                exercise_category: 'Upper Body',
                difficulty: 'intermediate',
                description: 'Compound exercise for back and biceps.',
                equipment_needed: ['pull_up_bar'],
                muscle_groups: ['back', 'biceps', 'shoulders'],
                safety_notes: 'Use full range of motion, control descent',
                instructions: ['Hang from bar', 'Pull body up until chin over bar', 'Lower slowly']
            },
            {
                exercise_id: 'ex054',
                exercise_name: 'Burpees',
                exercise_category: 'Cardio',
                difficulty: 'advanced',
                description: 'Full-body conditioning exercise.',
                equipment_needed: [],
                muscle_groups: ['full_body'],
                safety_notes: 'Maintain good form throughout',
                instructions: ['Start standing', 'Drop to plank', 'Jump feet to hands', 'Jump up with arms overhead']
            }
        ];
        
        this.filteredExercises = [...this.exercises];
        this.renderExercises();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('exercise-search');
        const clearSearchBtn = document.getElementById('clear-search');
        
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterExercises();
            this.updateClearButton();
        });
        
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.searchTerm = '';
            this.filterExercises();
            this.updateClearButton();
        });
        
        // Difficulty filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.difficulty;
                this.filterExercises();
            });
        });
        
        // Action buttons
        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAllSelections();
        });
        
        document.getElementById('save-selection').addEventListener('click', () => {
            this.saveSelection();
        });
        
        document.getElementById('continue-later').addEventListener('click', () => {
            window.location.href = '../src/dashboard/dashboard.html';
        });
        
        // Modal functionality
        this.setupModal();
    }
    
    setupModal() {
        const modal = document.getElementById('exercise-modal');
        const closeBtns = document.querySelectorAll('.modal-close');
        
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        document.getElementById('modal-select').addEventListener('click', () => {
            const exerciseId = modal.dataset.exerciseId;
            this.toggleExerciseSelection(exerciseId);
            modal.classList.remove('active');
        });
    }
    
    filterExercises() {
        let filtered = [...this.exercises];
        
        // Apply difficulty filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(ex => ex.difficulty === this.currentFilter);
        }
        
        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(ex => 
                ex.exercise_name.toLowerCase().includes(this.searchTerm) ||
                ex.exercise_category.toLowerCase().includes(this.searchTerm) ||
                ex.muscle_groups.some(mg => mg.toLowerCase().includes(this.searchTerm))
            );
        }
        
        this.filteredExercises = filtered;
        this.renderExercises();
        this.updateStats();
    }
    
    renderExercises() {
        const container = document.getElementById('exercise-list');
        
        if (this.filteredExercises.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No exercises found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        // Group exercises by category
        const exercisesByCategory = this.groupExercisesByCategory(this.filteredExercises);
        
        let html = '';
        for (const [category, exercises] of Object.entries(exercisesByCategory)) {
            html += this.renderCategory(category, exercises);
        }
        
        container.innerHTML = html;
        this.attachExerciseEventListeners();
    }
    
    groupExercisesByCategory(exercises) {
        const grouped = {};
        
        exercises.forEach(exercise => {
            if (!grouped[exercise.exercise_category]) {
                grouped[exercise.exercise_category] = [];
            }
            grouped[exercise.exercise_category].push(exercise);
        });
        
        return grouped;
    }
    
    renderCategory(category, exercises) {
        return `
            <div class="exercise-category">
                <div class="category-header">
                    <h3 class="category-title">${category}</h3>
                    <span class="category-count">${exercises.length} exercises</span>
                </div>
                <div class="exercise-items">
                    ${exercises.map(exercise => this.renderExercise(exercise)).join('')}
                </div>
            </div>
        `;
    }
    
    renderExercise(exercise) {
        const isSelected = this.selectedExercises.has(exercise.exercise_id);
        
        return `
            <div class="exercise-item ${isSelected ? 'selected' : ''}" data-exercise-id="${exercise.exercise_id}">
                <div class="exercise-info">
                    <div class="exercise-checkbox"></div>
                    <div class="exercise-details">
                        <div class="exercise-name">${exercise.exercise_name}</div>
                        <div class="exercise-meta">
                            <span class="difficulty-badge ${exercise.difficulty}">${exercise.difficulty}</span>
                            ${exercise.equipment_needed && exercise.equipment_needed.length > 0 ? 
                                `<span class="equipment-tag">🏗️ ${exercise.equipment_needed.join(', ')}</span>` : 
                                '<span class="equipment-tag">✨ No equipment</span>'
                            }
                        </div>
                    </div>
                </div>
                <div class="exercise-actions">
                    <button class="info-btn" data-exercise-id="${exercise.exercise_id}" title="Exercise Info">ℹ️</button>
                </div>
            </div>
        `;
    }
    
    attachExerciseEventListeners() {
        // Exercise selection
        const exerciseItems = document.querySelectorAll('.exercise-item');
        exerciseItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('info-btn')) {
                    const exerciseId = item.dataset.exerciseId;
                    this.toggleExerciseSelection(exerciseId);
                }
            });
        });
        
        // Info buttons
        const infoBtns = document.querySelectorAll('.info-btn');
        infoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const exerciseId = btn.dataset.exerciseId;
                this.showExerciseInfo(exerciseId);
            });
        });
    }
    
    toggleExerciseSelection(exerciseId) {
        if (this.selectedExercises.has(exerciseId)) {
            this.selectedExercises.delete(exerciseId);
        } else {
            this.selectedExercises.add(exerciseId);
        }
        
        this.updateUI();
    }
    
    showExerciseInfo(exerciseId) {
        const exercise = this.exercises.find(ex => ex.exercise_id === exerciseId);
        if (!exercise) return;
        
        const modal = document.getElementById('exercise-modal');
        
        // Populate modal content
        document.getElementById('modal-exercise-name').textContent = exercise.exercise_name;
        document.getElementById('modal-category').textContent = exercise.exercise_category;
        document.getElementById('modal-difficulty').textContent = exercise.difficulty;
        document.getElementById('modal-difficulty').className = `difficulty-badge ${exercise.difficulty}`;
        document.getElementById('modal-equipment').textContent = 
            exercise.equipment_needed && exercise.equipment_needed.length > 0 
                ? exercise.equipment_needed.join(', ') 
                : 'No equipment needed';
        document.getElementById('modal-muscles').textContent = exercise.muscle_groups.join(', ');
        document.getElementById('modal-description').textContent = exercise.description;
        document.getElementById('modal-safety').textContent = exercise.safety_notes;
        
        // Instructions
        const instructionsList = document.getElementById('modal-instructions');
        instructionsList.innerHTML = exercise.instructions
            .map(instruction => `<li>${instruction}</li>`)
            .join('');
        
        // Update modal select button
        const selectBtn = document.getElementById('modal-select');
        const isSelected = this.selectedExercises.has(exerciseId);
        selectBtn.textContent = isSelected ? 'Remove Exercise' : 'Select Exercise';
        selectBtn.style.background = isSelected ? 'var(--error)' : 'var(--gradient-primary)';
        
        // Store exercise ID for selection
        modal.dataset.exerciseId = exerciseId;
        
        // Show modal
        modal.classList.add('active');
    }
    
    clearAllSelections() {
        this.selectedExercises.clear();
        this.updateUI();
    }
    
    updateUI() {
        this.updateSelectedPanel();
        this.updateExerciseItems();
        this.updateActionButtons();
    }
    
    updateSelectedPanel() {
        const container = document.getElementById('selected-exercises');
        const count = document.getElementById('selected-count');
        const saveCount = document.getElementById('save-count');
        
        count.textContent = this.selectedExercises.size;
        saveCount.textContent = this.selectedExercises.size;
        
        if (this.selectedExercises.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No exercises selected yet. Start selecting from the categories below.</p>
                </div>
            `;
            return;
        }
        
        const selectedExercisesList = Array.from(this.selectedExercises).map(exerciseId => {
            const exercise = this.exercises.find(ex => ex.exercise_id === exerciseId);
            if (!exercise) return '';
            
            return `
                <div class="selected-exercise-item" data-exercise-id="${exerciseId}">
                    <div class="selected-exercise-info">
                        <span class="selected-exercise-name">${exercise.exercise_name}</span>
                        <span class="selected-exercise-category">${exercise.exercise_category}</span>
                    </div>
                    <button class="remove-exercise" data-exercise-id="${exerciseId}">✕</button>
                </div>
            `;
        }).join('');
        
        container.innerHTML = selectedExercisesList;
        
        // Attach remove button listeners
        container.querySelectorAll('.remove-exercise').forEach(btn => {
            btn.addEventListener('click', () => {
                const exerciseId = btn.dataset.exerciseId;
                this.selectedExercises.delete(exerciseId);
                this.updateUI();
            });
        });
    }
    
    updateExerciseItems() {
        const exerciseItems = document.querySelectorAll('.exercise-item');
        exerciseItems.forEach(item => {
            const exerciseId = item.dataset.exerciseId;
            if (this.selectedExercises.has(exerciseId)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    updateActionButtons() {
        const saveBtn = document.getElementById('save-selection');
        saveBtn.disabled = this.selectedExercises.size === 0;
    }
    
    updateStats() {
        const totalExercises = document.getElementById('total-exercises');
        totalExercises.textContent = this.filteredExercises.length;
    }
    
    updateClearButton() {
        const clearBtn = document.getElementById('clear-search');
        clearBtn.style.display = this.searchTerm ? 'block' : 'none';
    }
    
    async saveSelection() {
        if (this.selectedExercises.size === 0) return;
        
        try {
            // Get user ID from session/localStorage
            const userId = localStorage.getItem('fitlify_user_id') || 'demo_user';
            
            // Save to backend
            const response = await fetch('../src/backend/api/save_user_exercises.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    exercise_ids: Array.from(this.selectedExercises)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Exercise selection saved successfully!');
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'goal_selector.html';
                }, 2000);
            } else {
                this.showNotification('Error saving selection. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error saving selection:', error);
            this.showNotification('Error saving selection. Please try again.', 'error');
        }
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = notification.querySelector('.notification-message');
        
        messageElement.textContent = message;
        notification.style.background = type === 'success' ? 'var(--success)' : 'var(--error)';
        
        notification.classList.add('active');
        
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
}

// Initialize the exercise selector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ExerciseSelector();
});
