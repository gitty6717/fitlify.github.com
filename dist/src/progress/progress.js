// FITLIFY Progress Analytics JavaScript
class ProgressAnalytics {
    constructor() {
        this.currentPeriod = 'week';
        this.progressData = null;
        this.charts = {};
        
        this.init();
    }
    
    init() {
        this.loadProgressData();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateUI();
    }
    
    async loadProgressData() {
        try {
            // Load progress data from backend API
            const userId = localStorage.getItem('fitlify_user_id') || 'demo_user';
            const response = await fetch(`../src/backend/api/progress/get/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.progressData = data.progress;
                this.updateCharts();
                this.populateTables();
            } else {
                // Load sample data for demonstration
                this.loadSampleData();
            }
        } catch (error) {
            console.error('Error loading progress data:', error);
            this.loadSampleData();
        }
    }
    
    loadSampleData() {
        // Sample progress data for demonstration
        this.progressData = {
            weight_logs: [
                { date: '2024-01-01', weight: 75.5, body_fat: 22.5, muscle_mass: 58.5 },
                { date: '2024-01-08', weight: 75.2, body_fat: 22.3, muscle_mass: 58.6 },
                { date: '2024-01-15', weight: 74.8, body_fat: 22.0, muscle_mass: 58.7 },
                { date: '2024-01-22', weight: 74.5, body_fat: 21.8, muscle_mass: 58.8 },
                { date: '2024-01-29', weight: 74.2, body_fat: 21.6, muscle_mass: 58.9 },
                { date: '2024-02-05', weight: 73.9, body_fat: 21.4, muscle_mass: 59.0 },
                { date: '2024-02-12', weight: 73.6, body_fat: 21.2, muscle_mass: 59.1 }
            ],
            workout_logs: [
                { date: '2024-01-01', completed: true, plan_id: 'plan_001', plan_name: 'Upper Body Strength' },
                { date: '2024-01-03', completed: true, plan_id: 'plan_002', plan_name: 'Lower Body Power' },
                { date: '2024-01-05', completed: false, plan_id: 'plan_003', plan_name: 'Core & Cardio' },
                { date: '2024-01-08', completed: true, plan_id: 'plan_001', plan_name: 'Upper Body Strength' },
                { date: '2024-01-10', completed: true, plan_id: 'plan_002', plan_name: 'Lower Body Power' },
                { date: '2024-01-12', completed: true, plan_id: 'plan_003', plan_name: 'Core & Cardio' },
                { date: '2024-01-15', completed: true, plan_id: 'plan_001', plan_name: 'Upper Body Strength' },
                { date: '2024-01-17', completed: true, plan_id: 'plan_002', plan_name: 'Lower Body Power' },
                { date: '2024-01-19', completed: false, plan_id: 'plan_003', plan_name: 'Core & Cardio' },
                { date: '2024-01-22', completed: true, plan_id: 'plan_001', plan_name: 'Upper Body Strength' }
            ]
        };
        
        this.updateCharts();
        this.populateTables();
    }
    
    setupEventListeners() {
        // Period selector
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                periodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.updatePeriodDisplay();
                this.updateCharts();
                this.updateMetrics();
            });
        });
        
        // Tab navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Measurement modal
        const addMetricBtn = document.querySelector('.add-metric-btn');
        const measurementModal = document.getElementById('measurement-modal');
        const modalCloseBtns = measurementModal.querySelectorAll('.modal-close');
        
        addMetricBtn.addEventListener('click', () => {
            measurementModal.classList.add('active');
            // Set today's date as default
            document.getElementById('measurement-date').value = new Date().toISOString().split('T')[0];
        });
        
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                measurementModal.classList.remove('active');
            });
        });
        
        measurementModal.addEventListener('click', (e) => {
            if (e.target === measurementModal) {
                measurementModal.classList.remove('active');
            }
        });
        
        // Measurement form submission
        const measurementForm = document.getElementById('measurement-form');
        measurementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMeasurement();
        });
        
        // Export buttons
        const exportBtns = document.querySelectorAll('.export-btn');
        exportBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                this.exportData(format);
            });
        });
        
        // Chart type buttons
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const chartType = btn.textContent.toLowerCase();
                this.switchChartType(btn.id.replace('-chart-type', ''), chartType);
            });
        });
        
        // Workout filter
        const workoutFilter = document.getElementById('workout-filter');
        if (workoutFilter) {
            workoutFilter.addEventListener('change', () => {
                this.filterWorkoutHistory(workoutFilter.value);
            });
        }
    }
    
    switchTab(tabId) {
        // Update tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
        
        // Update tab content
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });
        
        const activePane = document.getElementById(tabId);
        if (activePane) {
            activePane.classList.add('active');
        }
    }
    
    updatePeriodDisplay() {
        const display = document.getElementById('date-range-display');
        const periodTexts = {
            'week': 'Last 7 days',
            'month': 'Last 30 days',
            'quarter': 'Last 3 months',
            'year': 'Last 12 months',
            'all': 'All time'
        };
        
        display.textContent = periodTexts[this.currentPeriod] || 'Last 7 days';
    }
    
    initializeCharts() {
        // Initialize weight chart
        const weightCtx = document.getElementById('weight-chart').getContext('2d');
        this.charts.weight = new Chart(weightCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
        
        // Initialize workout chart
        const workoutCtx = document.getElementById('workout-chart').getContext('2d');
        this.charts.workout = new Chart(workoutCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Completed Workouts',
                    data: [],
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            color: '#94a3b8'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    updateCharts() {
        if (!this.progressData) return;
        
        // Update weight chart
        this.updateWeightChart();
        
        // Update workout chart
        this.updateWorkoutChart();
    }
    
    updateWeightChart() {
        const weightData = this.progressData.weight_logs || [];
        const filteredData = this.filterDataByPeriod(weightData, 'date');
        
        const labels = filteredData.map(log => this.formatDate(log.date));
        const weights = filteredData.map(log => log.weight);
        
        this.charts.weight.data.labels = labels;
        this.charts.weight.data.datasets[0].data = weights;
        this.charts.weight.update();
    }
    
    updateWorkoutChart() {
        const workoutData = this.progressData.workout_logs || [];
        const filteredData = this.filterDataByPeriod(workoutData, 'date');
        
        // Group workouts by week
        const weeklyData = this.groupWorkoutsByWeek(filteredData);
        
        const labels = weeklyData.map(week => `Week ${week.week}`);
        const completed = weeklyData.map(week => week.completed);
        
        this.charts.workout.data.labels = labels;
        this.charts.workout.data.datasets[0].data = completed;
        this.charts.workout.update();
    }
    
    filterDataByPeriod(data, dateField) {
        if (!data || data.length === 0) return [];
        
        const now = new Date();
        const periodDays = {
            'week': 7,
            'month': 30,
            'quarter': 90,
            'year': 365,
            'all': 365 * 10 // Large number for "all time"
        };
        
        const days = periodDays[this.currentPeriod] || 7;
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        
        return data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= cutoffDate;
        });
    }
    
    groupWorkoutsByWeek(workouts) {
        const weeklyData = {};
        
        workouts.forEach(workout => {
            const date = new Date(workout.date);
            const weekNumber = this.getWeekNumber(date);
            const year = date.getFullYear();
            const weekKey = `${year}-${weekNumber}`;
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = {
                    week: weekNumber,
                    year: year,
                    completed: 0,
                    total: 0
                };
            }
            
            weeklyData[weekKey].total++;
            if (workout.completed) {
                weeklyData[weekKey].completed++;
            }
        });
        
        return Object.values(weeklyData).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.week - b.week;
        });
    }
    
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    populateTables() {
        if (!this.progressData) return;
        
        this.populateBodyMetricsTable();
        this.populateWorkoutHistory();
    }
    
    populateBodyMetricsTable() {
        const tbody = document.getElementById('body-metrics-tbody');
        if (!tbody) return;
        
        const weightData = this.progressData.weight_logs || [];
        const filteredData = this.filterDataByPeriod(weightData, 'date');
        
        if (filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted);">
                        No measurements recorded for this period
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filteredData.map(log => `
            <tr>
                <td>${this.formatDate(log.date)}</td>
                <td>${log.weight} kg</td>
                <td>${log.body_fat || '-'}%</td>
                <td>${log.muscle_mass || '-'} kg</td>
                <td>-</td>
            </tr>
        `).join('');
    }
    
    populateWorkoutHistory() {
        const historyList = document.getElementById('workout-history-list');
        if (!historyList) return;
        
        const workoutData = this.progressData.workout_logs || [];
        const filteredData = this.filterDataByPeriod(workoutData, 'date');
        
        if (filteredData.length === 0) {
            historyList.innerHTML = `
                <div class="workout-item">
                    <div class="workout-date">No workouts recorded for this period</div>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = filteredData.map(workout => `
            <div class="workout-item">
                <div class="workout-date">${this.formatDate(workout.date)}</div>
                <div class="workout-name">${workout.plan_name || 'Workout'}</div>
                <div class="workout-status ${workout.completed ? 'completed' : 'missed'}">
                    ${workout.completed ? '✅ Completed' : '❌ Missed'}
                </div>
            </div>
        `).join('');
    }
    
    filterWorkoutHistory(filter) {
        const historyList = document.getElementById('workout-history-list');
        if (!historyList) return;
        
        const workoutData = this.progressData.workout_logs || [];
        const filteredData = this.filterDataByPeriod(workoutData, 'date');
        
        let filtered = filteredData;
        if (filter === 'completed') {
            filtered = filteredData.filter(w => w.completed);
        } else if (filter === 'missed') {
            filtered = filteredData.filter(w => !w.completed);
        }
        
        if (filtered.length === 0) {
            historyList.innerHTML = `
                <div class="workout-item">
                    <div class="workout-date">No ${filter} workouts for this period</div>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = filtered.map(workout => `
            <div class="workout-item">
                <div class="workout-date">${this.formatDate(workout.date)}</div>
                <div class="workout-name">${workout.plan_name || 'Workout'}</div>
                <div class="workout-status ${workout.completed ? 'completed' : 'missed'}">
                    ${workout.completed ? '✅ Completed' : '❌ Missed'}
                </div>
            </div>
        `).join('');
    }
    
    updateMetrics() {
        if (!this.progressData) return;
        
        const workoutData = this.progressData.workout_logs || [];
        const filteredData = this.filterDataByPeriod(workoutData, 'date');
        
        // Calculate metrics
        const completedWorkouts = filteredData.filter(w => w.completed).length;
        const totalWorkouts = filteredData.length;
        const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;
        
        // Calculate streak
        const streak = this.calculateWorkoutStreak();
        
        // Calculate weight change
        const weightChange = this.calculateWeightChange();
        
        // Update UI
        document.getElementById('workout-streak').textContent = streak;
        document.getElementById('total-workouts').textContent = completedWorkouts;
        document.getElementById('completion-rate').textContent = completionRate;
        document.getElementById('weight-change').textContent = weightChange;
    }
    
    calculateWorkoutStreak() {
        const workoutData = this.progressData.workout_logs || [];
        if (workoutData.length === 0) return 0;
        
        // Sort by date
        const sortedData = workoutData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let streak = 0;
        for (const workout of sortedData) {
            if (workout.completed) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    calculateWeightChange() {
        const weightData = this.progressData.weight_logs || [];
        const filteredData = this.filterDataByPeriod(weightData, 'date');
        
        if (filteredData.length < 2) return '0.0';
        
        const firstWeight = filteredData[0].weight;
        const lastWeight = filteredData[filteredData.length - 1].weight;
        const change = (lastWeight - firstWeight).toFixed(1);
        
        return change.startsWith('-') ? change : `+${change}`;
    }
    
    switchChartType(chartId, type) {
        if (this.charts[chartId]) {
            this.charts[chartId].config.type = type;
            this.charts[chartId].update();
        }
    }
    
    async saveMeasurement() {
        const formData = {
            date: document.getElementById('measurement-date').value,
            weight: parseFloat(document.getElementById('measurement-weight').value),
            body_fat: parseFloat(document.getElementById('measurement-body-fat').value) || null,
            muscle_mass: parseFloat(document.getElementById('measurement-muscle').value) || null,
            notes: document.getElementById('measurement-notes').value
        };
        
        try {
            const userId = localStorage.getItem('fitlify_user_id') || 'demo_user';
            const response = await fetch('../src/backend/api/progress/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    ...formData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Measurement saved successfully!');
                document.getElementById('measurement-modal').classList.remove('active');
                document.getElementById('measurement-form').reset();
                
                // Reload data
                this.loadProgressData();
            } else {
                this.showNotification('Error saving measurement', 'error');
            }
        } catch (error) {
            console.error('Error saving measurement:', error);
            this.showNotification('Error saving measurement', 'error');
        }
    }
    
    exportData(format) {
        if (!this.progressData) {
            this.showNotification('No data available to export', 'error');
            return;
        }
        
        let content, filename, mimeType;
        
        switch (format) {
            case 'csv':
                content = this.generateCSV();
                filename = `fitlify_progress_${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
            case 'json':
                content = JSON.stringify(this.progressData, null, 2);
                filename = `fitlify_progress_${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
            case 'pdf':
                // For PDF, we'd typically use a library like jsPDF
                // For now, we'll create a simple text representation
                content = this.generateTextReport();
                filename = `fitlify_progress_${new Date().toISOString().split('T')[0]}.txt`;
                mimeType = 'text/plain';
                break;
            default:
                return;
        }
        
        this.downloadFile(content, filename, mimeType);
        this.showNotification(`Data exported as ${format.toUpperCase()} successfully!`);
    }
    
    generateCSV() {
        const weightData = this.progressData.weight_logs || [];
        const workoutData = this.progressData.workout_logs || [];
        
        let csv = 'Type,Date,Value,Notes\n';
        
        // Add weight data
        weightData.forEach(log => {
            csv += `Weight,${log.date},${log.weight}kg,${log.notes || ''}\n`;
        });
        
        // Add workout data
        workoutData.forEach(log => {
            csv += `Workout,${log.date},${log.completed ? 'Completed' : 'Missed'},${log.plan_name || ''}\n`;
        });
        
        return csv;
    }
    
    generateTextReport() {
        const weightData = this.progressData.weight_logs || [];
        const workoutData = this.progressData.workout_logs || [];
        
        let report = 'FITLIFY Progress Report\n';
        report += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        report += '=== WEIGHT PROGRESS ===\n';
        weightData.forEach(log => {
            report += `${log.date}: ${log.weight}kg\n`;
        });
        
        report += '\n=== WORKOUT HISTORY ===\n';
        workoutData.forEach(log => {
            report += `${log.date}: ${log.completed ? 'Completed' : 'Missed'} - ${log.plan_name || 'Workout'}\n`;
        });
        
        return report;
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
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
    
    updateUI() {
        this.updatePeriodDisplay();
        this.updateMetrics();
    }
}

// Initialize the progress analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProgressAnalytics();
});
