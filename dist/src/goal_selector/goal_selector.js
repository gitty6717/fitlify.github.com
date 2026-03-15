// FITLIFY Goal Selector JavaScript
class GoalSelector {
    constructor() {
        this.goals = [];
        this.selectedGoals = new Set();
        this.filteredGoals = [];
        this.currentCategory = 'all';
        this.currentDifficulty = 'all';
        this.searchTerm = '';
        this.displayedCount = 0;
        this.pageSize = 12;
        
        this.init();
    }
    
    init() {
        this.loadGoals();
        this.setupEventListeners();
        this.updateUI();
    }
    
    async loadGoals() {
        try {
            // Load goals from backend API
            const response = await fetch('../src/backend/api/goals.php');
            const data = await response.json();
            
            if (data.success) {
                this.goals = data.goals;
                this.filteredGoals = [...this.goals];
                this.renderGoals();
                this.updateStats();
            } else {
                // Fallback to sample data if API fails
                this.loadSampleGoals();
            }
        } catch (error) {
            console.error('Error loading goals:', error);
            this.loadSampleGoals();
        }
    }
    
    loadSampleGoals() {
        // Sample goal data for demonstration
        this.goals = [
            {
                goal_id: 'goal001',
                goal_name: 'Build Upper Body Strength',
                goal_category: 'Strength',
                difficulty_level: 'intermediate',
                age_group: 'all',
                description: 'Increase overall upper body muscle strength and size',
                tags: ['strength', 'muscle', 'upper_body']
            },
            {
                goal_id: 'goal002',
                goal_name: 'Increase Bench Press',
                goal_category: 'Strength',
                difficulty_level: 'advanced',
                age_group: '14_plus',
                description: 'Improve bench press performance and weight',
                tags: ['strength', 'power', 'chest']
            },
            {
                goal_id: 'goal011',
                goal_name: 'Build Muscle Mass',
                goal_category: 'Muscle Growth',
                difficulty_level: 'intermediate',
                age_group: '14_plus',
                description: 'Increase overall muscle size and definition',
                tags: ['muscle', 'growth', 'hypertrophy']
            },
            {
                goal_id: 'goal021',
                goal_name: 'Lose Body Fat',
                goal_category: 'Fat Loss',
                difficulty_level: 'beginner',
                age_group: 'all',
                description: 'Reduce overall body fat percentage',
                tags: ['fat_loss', 'weight_loss', 'health']
            },
            {
                goal_id: 'goal031',
                goal_name: 'Improve Cardiovascular Endurance',
                goal_category: 'Endurance',
                difficulty_level: 'beginner',
                age_group: 'all',
                description: 'Increase heart and lung efficiency',
                tags: ['endurance', 'cardio', 'health']
            },
            {
                goal_id: 'goal041',
                goal_name: 'Improve Overall Flexibility',
                goal_category: 'Mobility',
                difficulty_level: 'beginner',
                age_group: 'all',
                description: 'Increase range of motion throughout body',
                tags: ['mobility', 'flexibility', 'health']
            },
            {
                goal_id: 'goal061',
                goal_name: 'Increase Vertical Jump',
                goal_category: 'Athletic Performance',
                difficulty_level: 'intermediate',
                age_group: '14_plus',
                description: 'Improve jumping ability for sports',
                tags: ['athletic', 'jumping', 'power']
            },
            {
                goal_id: 'goal071',
                goal_name: 'Excel at Basketball',
                goal_category: 'Sports Training',
                difficulty_level: 'intermediate',
                age_group: 'all',
                description: 'Improve basketball-specific fitness',
                tags: ['sports', 'basketball', 'training']
            },
            {
                goal_id: 'goal081',
                goal_name: 'Recover from Injury',
                goal_category: 'Rehabilitation',
                difficulty_level: 'beginner',
                age_group: 'all',
                description: 'Safely recover and rebuild strength after injury',
                tags: ['rehabilitation', 'recovery', 'health']
            },
            {
                goal_id: 'goal091',
                goal_name: 'Improve Overall Health',
                goal_category: 'General Health',
                difficulty_level: 'beginner',
                age_group: 'all',
                description: 'Enhance general physical and mental health',
                tags: ['health', 'wellness', 'general']
            }
        ];
        
        this.filteredGoals = [...this.goals];
        this.renderGoals();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('goal-search');
        const clearSearchBtn = document.getElementById('clear-search');
        
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterGoals();
            this.updateClearButton();
        });
        
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.searchTerm = '';
            this.filterGoals();
            this.updateClearButton();
        });
        
        // Category filters
        const categoryBtns = document.querySelectorAll('.category-filters .filter-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.filterGoals();
            });
        });
        
        // Difficulty filters
        const difficultyBtns = document.querySelectorAll('.difficulty-filters .filter-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDifficulty = btn.dataset.difficulty;
                this.filterGoals();
            });
        });
        
        // Action buttons
        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAllSelections();
        });
        
        document.getElementById('recommend-goals').addEventListener('click', () => {
            this.showAIRecommendations();
        });
        
        document.getElementById('save-selection').addEventListener('click', () => {
            this.saveSelection();
        });
        
        document.getElementById('back-to-exercises').addEventListener('click', () => {
            window.location.href = '../src/exercise_selector/exercise_selector.html';
        });
        
        // Load more button
        document.getElementById('load-more').addEventListener('click', () => {
            this.loadMoreGoals();
        });
        
        // Modal functionality
        this.setupModal();
    }
    
    setupModal() {
        const goalModal = document.getElementById('goal-modal');
        const recommendationsModal = document.getElementById('recommendations-modal');
        
        // Goal modal close buttons
        const goalCloseBtns = goalModal.querySelectorAll('.modal-close');
        goalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                goalModal.classList.remove('active');
            });
        });
        
        // Recommendations modal close buttons
        const recCloseBtns = recommendationsModal.querySelectorAll('.modal-close');
        recCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                recommendationsModal.classList.remove('active');
            });
        });
        
        // Modal backdrop clicks
        [goalModal, recommendationsModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Modal action buttons
        document.getElementById('modal-select').addEventListener('click', () => {
            const goalId = goalModal.dataset.goalId;
            this.toggleGoalSelection(goalId);
            goalModal.classList.remove('active');
        });
        
        document.getElementById('apply-recommendations').addEventListener('click', () => {
            this.applyRecommendations();
            recommendationsModal.classList.remove('active');
        });
    }
    
    filterGoals() {
        let filtered = [...this.goals];
        
        // Apply category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(goal => goal.goal_category === this.currentCategory);
        }
        
        // Apply difficulty filter
        if (this.currentDifficulty !== 'all') {
            filtered = filtered.filter(goal => goal.difficulty_level === this.currentDifficulty);
        }
        
        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(goal => 
                goal.goal_name.toLowerCase().includes(this.searchTerm) ||
                goal.goal_category.toLowerCase().includes(this.searchTerm) ||
                goal.description.toLowerCase().includes(this.searchTerm) ||
                goal.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
            );
        }
        
        this.filteredGoals = filtered;
        this.displayedCount = 0;
        this.renderGoals();
        this.updateStats();
    }
    
    renderGoals() {
        const container = document.getElementById('goals-grid');
        
        if (this.filteredGoals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No goals found matching your criteria.</p>
                </div>
            `;
            document.getElementById('load-more').style.display = 'none';
            return;
        }
        
        // Render goals in batches
        const goalsToRender = this.filteredGoals.slice(0, this.displayedCount + this.pageSize);
        const html = goalsToRender.map(goal => this.renderGoal(goal)).join('');
        
        if (this.displayedCount === 0) {
            container.innerHTML = html;
        } else {
            container.insertAdjacentHTML('beforeend', html);
        }
        
        this.displayedCount = goalsToRender.length;
        
        // Update load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (this.displayedCount < this.filteredGoals.length) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `Load More (${this.filteredGoals.length - this.displayedCount} remaining)`;
        } else {
            loadMoreBtn.style.display = 'none';
        }
        
        this.attachGoalEventListeners();
    }
    
    loadMoreGoals() {
        this.renderGoals();
    }
    
    renderGoal(goal) {
        const isSelected = this.selectedGoals.has(goal.goal_id);
        const categoryClass = goal.goal_category.toLowerCase().replace(' ', '_');
        
        return `
            <div class="goal-card ${categoryClass} ${isSelected ? 'selected' : ''}" data-goal-id="${goal.goal_id}">
                <div class="goal-header">
                    <div class="goal-content">
                        <h3 class="goal-title">${goal.goal_name}</h3>
                        <div class="goal-meta">
                            <span class="category-badge ${categoryClass}">${goal.goal_category}</span>
                            <span class="difficulty-badge ${goal.difficulty_level}">${goal.difficulty_level}</span>
                        </div>
                    </div>
                    <div class="goal-checkbox"></div>
                </div>
                <p class="goal-description">${goal.description}</p>
                <div class="goal-tags">
                    ${goal.tags.map(tag => `<span class="goal-tag">${tag}</span>`).join('')}
                </div>
                <div class="goal-actions">
                    <span class="goal-difficulty">Difficulty: ${goal.difficulty_level}</span>
                    <button class="info-btn" data-goal-id="${goal.goal_id}" title="Goal Info">ℹ️</button>
                </div>
            </div>
        `;
    }
    
    attachGoalEventListeners() {
        // Goal selection
        const goalCards = document.querySelectorAll('.goal-card');
        goalCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('info-btn')) {
                    const goalId = card.dataset.goalId;
                    this.toggleGoalSelection(goalId);
                }
            });
        });
        
        // Info buttons
        const infoBtns = document.querySelectorAll('.info-btn');
        infoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const goalId = btn.dataset.goalId;
                this.showGoalInfo(goalId);
            });
        });
    }
    
    toggleGoalSelection(goalId) {
        if (this.selectedGoals.has(goalId)) {
            this.selectedGoals.delete(goalId);
        } else {
            this.selectedGoals.add(goalId);
        }
        
        this.updateUI();
    }
    
    showGoalInfo(goalId) {
        const goal = this.goals.find(g => g.goal_id === goalId);
        if (!goal) return;
        
        const modal = document.getElementById('goal-modal');
        
        // Populate modal content
        document.getElementById('modal-goal-name').textContent = goal.goal_name;
        document.getElementById('modal-category').textContent = goal.goal_category;
        document.getElementById('modal-category').className = `value category-badge ${goal.goal_category.toLowerCase().replace(' ', '_')}`;
        document.getElementById('modal-difficulty').textContent = goal.difficulty_level;
        document.getElementById('modal-difficulty').className = `difficulty-badge ${goal.difficulty_level}`;
        document.getElementById('modal-age-group').textContent = this.formatAgeGroup(goal.age_group);
        
        // Tags
        const tagsContainer = document.getElementById('modal-tags');
        tagsContainer.innerHTML = goal.tags
            .map(tag => `<span class="tag">${tag}</span>`)
            .join('');
        
        document.getElementById('modal-description').textContent = goal.description;
        
        // Recommendations (simulated)
        document.getElementById('modal-recommendations').textContent = 
            this.generateRecommendations(goal);
        
        // Related goals
        const relatedGoals = this.findRelatedGoals(goal);
        const relatedList = document.getElementById('related-goals-list');
        relatedList.innerHTML = relatedGoals
            .map(relatedGoal => `
                <div class="related-goal" data-goal-id="${relatedGoal.goal_id}">
                    <div class="related-goal-title">${relatedGoal.goal_name}</div>
                    <div class="related-goal-category">${relatedGoal.goal_category}</div>
                </div>
            `)
            .join('');
        
        // Attach click listeners to related goals
        relatedList.querySelectorAll('.related-goal').forEach(item => {
            item.addEventListener('click', () => {
                const relatedGoalId = item.dataset.goalId;
                modal.classList.remove('active');
                setTimeout(() => this.showGoalInfo(relatedGoalId), 300);
            });
        });
        
        // Update modal select button
        const selectBtn = document.getElementById('modal-select');
        const isSelected = this.selectedGoals.has(goalId);
        selectBtn.textContent = isSelected ? 'Remove Goal' : 'Select Goal';
        selectBtn.style.background = isSelected ? 'var(--error)' : 'var(--gradient-primary)';
        
        // Store goal ID for selection
        modal.dataset.goalId = goalId;
        
        // Show modal
        modal.classList.add('active');
    }
    
    formatAgeGroup(ageGroup) {
        const groupMap = {
            'all': 'All Ages',
            '6_9': '6-9 years',
            '10_13': '10-13 years',
            '14_17': '14-17 years',
            '18_plus': '18+ years'
        };
        return groupMap[ageGroup] || ageGroup;
    }
    
    generateRecommendations(goal) {
        const recommendations = {
            'Strength': 'Perfect for building muscle mass and increasing power. Recommended for users with some fitness experience.',
            'Muscle Growth': 'Ideal for bodybuilding and physique development. Requires consistent training and proper nutrition.',
            'Fat Loss': 'Great for weight management and improving body composition. Combine with cardio for best results.',
            'Endurance': 'Excellent for cardiovascular health and stamina. Suitable for all fitness levels.',
            'Mobility': 'Perfect for improving flexibility and preventing injuries. Great for all ages and fitness levels.',
            'Flexibility': 'Essential for overall health and performance. Helps prevent injuries and improve movement quality.',
            'Athletic Performance': 'Designed for competitive athletes and serious fitness enthusiasts. Requires dedication.',
            'Sports Training': 'Sport-specific training for improved performance. Tailored to your chosen sport.',
            'Rehabilitation': 'Safe and effective recovery exercises. Consult with healthcare provider if needed.',
            'General Health': 'Perfect for overall wellness and disease prevention. Suitable for everyone.'
        };
        
        return recommendations[goal.goal_category] || 'A great goal for improving your fitness and overall health.';
    }
    
    findRelatedGoals(goal) {
        return this.goals
            .filter(g => g.goal_id !== goal.goal_id && g.goal_category === goal.goal_category)
            .slice(0, 3);
    }
    
    async showAIRecommendations() {
        const modal = document.getElementById('recommendations-modal');
        const container = document.getElementById('ai-recommendations');
        
        // Show loading state
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Analyzing your profile...</p>
            </div>
        `;
        
        modal.classList.add('active');
        
        try {
            // Get user profile and exercise data
            const userId = localStorage.getItem('fitlify_user_id') || 'demo_user';
            
            // Simulate AI analysis delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate AI recommendations based on user data
            const recommendations = await this.generateAIRecommendations(userId);
            
            container.innerHTML = recommendations
                .map(rec => this.renderRecommendation(rec))
                .join('');
            
            // Attach event listeners
            container.querySelectorAll('.recommendation-item').forEach(item => {
                item.addEventListener('click', () => {
                    const goalId = item.dataset.goalId;
                    if (this.selectedGoals.has(goalId)) {
                        this.selectedGoals.delete(goalId);
                        item.classList.remove('selected');
                    } else {
                        this.selectedGoals.add(goalId);
                        item.classList.add('selected');
                    }
                });
            });
            
        } catch (error) {
            console.error('Error generating recommendations:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <p>Unable to generate recommendations at this time. Please try again later.</p>
                </div>
            `;
        }
    }
    
    async generateAIRecommendations(userId) {
        // Simulate AI recommendation logic
        // In a real implementation, this would call the AI service
        
        const allRecommendations = [
            {
                goal_id: 'goal021',
                goal_name: 'Lose Body Fat',
                goal_category: 'Fat Loss',
                reason: 'Based on your profile, fat loss will help improve overall health and fitness'
            },
            {
                goal_id: 'goal031',
                goal_name: 'Improve Cardiovascular Endurance',
                goal_category: 'Endurance',
                reason: 'Cardiovascular health is essential for long-term fitness and well-being'
            },
            {
                goal_id: 'goal041',
                goal_name: 'Improve Overall Flexibility',
                goal_category: 'Mobility',
                reason: 'Flexibility work prevents injuries and improves exercise performance'
            },
            {
                goal_id: 'goal091',
                goal_name: 'Improve Overall Health',
                goal_category: 'General Health',
                reason: 'General health goals provide a solid foundation for fitness development'
            }
        ];
        
        // Return 3-4 recommendations
        return allRecommendations.slice(0, 3);
    }
    
    renderRecommendation(recommendation) {
        const isSelected = this.selectedGoals.has(recommendation.goal_id);
        const categoryClass = recommendation.goal_category.toLowerCase().replace(' ', '_');
        
        return `
            <div class="recommendation-item ${isSelected ? 'selected' : ''}" data-goal-id="${recommendation.goal_id}">
                <div class="recommendation-header">
                    <div class="recommendation-title">${recommendation.goal_name}</div>
                    <span class="category-badge ${categoryClass}">${recommendation.goal_category}</span>
                </div>
                <div class="recommendation-reason">${recommendation.reason}</div>
            </div>
        `;
    }
    
    applyRecommendations() {
        // Select all recommended goals
        const recommendationItems = document.querySelectorAll('.recommendation-item');
        recommendationItems.forEach(item => {
            const goalId = item.dataset.goalId;
            this.selectedGoals.add(goalId);
        });
        
        this.updateUI();
        this.showNotification('AI recommendations applied successfully!');
    }
    
    clearAllSelections() {
        this.selectedGoals.clear();
        this.updateUI();
    }
    
    updateUI() {
        this.updateSelectedPanel();
        this.updateGoalCards();
        this.updateActionButtons();
    }
    
    updateSelectedPanel() {
        const container = document.getElementById('selected-goals');
        const count = document.getElementById('selected-count');
        const saveCount = document.getElementById('save-count');
        
        count.textContent = this.selectedGoals.size;
        saveCount.textContent = this.selectedGoals.size;
        
        if (this.selectedGoals.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No goals selected yet. Start selecting from the goals below.</p>
                </div>
            `;
            return;
        }
        
        const selectedGoalsList = Array.from(this.selectedGoals).map(goalId => {
            const goal = this.goals.find(g => g.goal_id === goalId);
            if (!goal) return '';
            
            const categoryClass = goal.goal_category.toLowerCase().replace(' ', '_');
            
            return `
                <div class="selected-goal-item" data-goal-id="${goalId}">
                    <div class="selected-goal-info">
                        <div class="selected-goal-name">${goal.goal_name}</div>
                        <div class="selected-goal-meta">
                            <span class="category-badge ${categoryClass}">${goal.goal_category}</span>
                            <span class="difficulty-badge ${goal.difficulty_level}">${goal.difficulty_level}</span>
                        </div>
                    </div>
                    <button class="remove-goal" data-goal-id="${goalId}">✕</button>
                </div>
            `;
        }).join('');
        
        container.innerHTML = selectedGoalsList;
        
        // Attach remove button listeners
        container.querySelectorAll('.remove-goal').forEach(btn => {
            btn.addEventListener('click', () => {
                const goalId = btn.dataset.goalId;
                this.selectedGoals.delete(goalId);
                this.updateUI();
            });
        });
    }
    
    updateGoalCards() {
        const goalCards = document.querySelectorAll('.goal-card');
        goalCards.forEach(card => {
            const goalId = card.dataset.goalId;
            if (this.selectedGoals.has(goalId)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }
    
    updateActionButtons() {
        const saveBtn = document.getElementById('save-selection');
        saveBtn.disabled = this.selectedGoals.size === 0;
    }
    
    updateStats() {
        const totalGoals = document.getElementById('total-goals');
        totalGoals.textContent = this.filteredGoals.length;
    }
    
    updateClearButton() {
        const clearBtn = document.getElementById('clear-search');
        clearBtn.style.display = this.searchTerm ? 'block' : 'none';
    }
    
    async saveSelection() {
        if (this.selectedGoals.size === 0) return;
        
        try {
            // Get user ID from session/localStorage
            const userId = localStorage.getItem('fitlify_user_id') || 'demo_user';
            
            // Save to backend
            const response = await fetch('../src/backend/api/save_user_goals.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    goal_ids: Array.from(this.selectedGoals)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Goals saved successfully!');
                
                // Redirect to workout plan generation
                setTimeout(() => {
                    window.location.href = '../src/workout_generator/workout_generator.html';
                }, 2000);
            } else {
                this.showNotification('Error saving goals. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error saving goals:', error);
            this.showNotification('Error saving goals. Please try again.', 'error');
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

// Initialize the goal selector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GoalSelector();
});
