// FITLIFY Shared Navigation Handler
class NavigationHandler {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.hamburger = null;
        this.closeBtn = null;
        this.baseUrl = this.getBaseUrl();
        
        this.init();
    }
    
    getBaseUrl() {
        // Check if we're running in production (installed app) vs development
        if (window.location.protocol === 'file:') {
            return '../src'; // Local installed files
        } else {
            return '../src'; // Development mode
        }
    }
    
    init() {
        this.createSidebar();
        this.setupEventListeners();
    }
    
    createSidebar() {
        // Get current page to highlight active link
        const currentPage = window.location.pathname.split('/').pop() || 'home.html';
        
        // Create sidebar HTML
        const sidebarHTML = `
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <h2>Menu</h2>
                    <button class="sidebar-close" id="sidebar-close">&times;</button>
                </div>
                <div class="sidebar-content">
                    <nav class="sidebar-nav">
                        <a href="${this.baseUrl}/index.html" class="sidebar-link ${currentPage === 'home.html' ? 'active' : ''}">
                            <span class="sidebar-icon">🏠</span>
                            <span>Home</span>
                        </a>
                        <a href="${this.baseUrl}/dashboard/dashboard.html" class="sidebar-link ${currentPage === 'dashboard.html' ? 'active' : ''}">
                            <span class="sidebar-icon">📊</span>
                            <span>Dashboard</span>
                        </a>
                        <a href="${this.baseUrl}/profile/profile.html" class="sidebar-link ${currentPage === 'profile.html' ? 'active' : ''}">
                            <span class="sidebar-icon">👤</span>
                            <span>Profile</span>
                        </a>
                        <a href="${this.baseUrl}/progress/progress.html" class="sidebar-link ${currentPage === 'progress.html' ? 'active' : ''}">
                            <span class="sidebar-icon">📈</span>
                            <span>Progress</span>
                        </a>
                        <a href="${this.baseUrl}/exercise_selector/exercise_selector.html" class="sidebar-link ${currentPage === 'exercise_selector.html' ? 'active' : ''}">
                            <span class="sidebar-icon">🏋️</span>
                            <span>Exercises</span>
                        </a>
                        <a href="${this.baseUrl}/goal_selector/goal_selector.html" class="sidebar-link ${currentPage === 'goal_selector.html' ? 'active' : ''}">
                            <span class="sidebar-icon">🎯</span>
                            <span>Goals</span>
                        </a>
                        <a href="${this.baseUrl}/coach_chat/coach_chat.html" class="sidebar-link ${currentPage === 'coach_chat.html' ? 'active' : ''}">
                            <span class="sidebar-icon">🤖</span>
                            <span>AI Coach</span>
                        </a>
                        <a href="${this.baseUrl}/minigames/games.html" class="sidebar-link ${currentPage === 'games.html' ? 'active' : ''}">
                            <span class="sidebar-icon">🎮</span>
                            <span>Minigames</span>
                        </a>
                    </nav>
                </div>
            </aside>
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
        `;
        
        // Insert sidebar at the beginning of body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sidebarHTML;
        
        while (tempDiv.firstChild) {
            document.body.insertBefore(tempDiv.firstChild, document.body.firstChild);
        }
        
        // Store references
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebar-overlay');
        
        // Add hamburger to navbar if not exists
        this.addHamburgerToNavbar();
    }
    
    addHamburgerToNavbar() {
        const navbar = document.querySelector('.nav-container');
        if (!navbar) return;
        
        // Check if hamburger already exists
        if (navbar.querySelector('.hamburger-menu')) return;
        
        // Find nav-left or create it
        let navLeft = navbar.querySelector('.nav-left');
        
        if (!navLeft) {
            navLeft = document.createElement('div');
            navLeft.className = 'nav-left';
            
            // Move logo into nav-left
            const logo = navbar.querySelector('.nav-logo');
            if (logo) {
                navbar.insertBefore(navLeft, navbar.firstChild);
                navLeft.appendChild(logo);
            }
        }
        
        // Insert hamburger before logo
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger-menu';
        hamburger.id = 'hamburger-menu';
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        hamburger.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        
        navLeft.insertBefore(hamburger, navLeft.firstChild);
        this.hamburger = hamburger;
        this.closeBtn = document.getElementById('sidebar-close');
    }
    
    setupEventListeners() {
        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Hamburger click
            if (e.target.closest('#hamburger-menu')) {
                e.preventDefault();
                this.toggleSidebar();
            }
            
            // Close button click
            if (e.target.closest('#sidebar-close')) {
                e.preventDefault();
                this.closeSidebar();
            }
            
            // Overlay click
            if (e.target.closest('#sidebar-overlay')) {
                this.closeSidebar();
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar?.classList.contains('active')) {
                this.closeSidebar();
            }
        });
    }
    
    toggleSidebar() {
        const isActive = this.sidebar.classList.contains('active');
        
        if (isActive) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        this.sidebar.classList.add('active');
        this.overlay.classList.add('active');
        if (this.hamburger) this.hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        if (this.hamburger) this.hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NavigationHandler();
    });
} else {
    new NavigationHandler();
}
