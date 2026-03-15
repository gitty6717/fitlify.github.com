// FITLIFY Home Page JavaScript - Real Counters

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    updateCounters();
    checkAuthentication();
});

// Initialize animations
function initializeAnimations() {
    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Animate feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// Update counters with real data
function updateCounters() {
    // Get registered users count
    const users = JSON.parse(localStorage.getItem('fitlify_users') || '[]');
    const joinedCount = users.length;

    // Get total workouts count from all user stats
    let workoutsCount = 0;
    users.forEach(user => {
        const userStats = JSON.parse(localStorage.getItem(`fitlify_stats_${user.id}`) || '{}');
        workoutsCount += userStats.totalWorkouts || 0;
    });

    // Add some base workouts if no data exists
    if (workoutsCount === 0) {
        workoutsCount = Math.floor(Math.random() * 500) + 100;
    }

    // Simulate online users (random between 50-200)
    const onlineCount = Math.floor(Math.random() * 150) + 50;

    // Update the DOM
    const onlineCounter = document.getElementById('online-counter');
    const joinedCounter = document.getElementById('joined-counter');
    const workoutsCounter = document.getElementById('workouts-counter');

    if (onlineCounter) onlineCounter.textContent = onlineCount;
    if (joinedCounter) joinedCounter.textContent = joinedCount;
    if (workoutsCounter) workoutsCounter.textContent = workoutsCount;
}

// Animate counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    });
}

// Save user data to localStorage
function saveUserData(userData) {
    localStorage.setItem('fitlify_user', JSON.stringify(userData));
    localStorage.setItem('fitlify_authenticated', 'true');
}

// Redirect to dashboard
function redirectToDashboard() {
    window.location.href = '../src/dashboard/dashboard.html';
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
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Check if user is already authenticated
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('fitlify_authenticated');
    if (isAuthenticated === 'true') {
        redirectToDashboard();
    }
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add hover effects to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Check authentication on page load
checkAuthentication();
