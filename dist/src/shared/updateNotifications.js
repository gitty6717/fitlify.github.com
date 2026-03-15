// Update Notifications and What's New Banner System
class UpdateNotificationManager {
    constructor() {
        this.lastVersion = localStorage.getItem('fitlify_last_version') || '1.0.0';
        this.currentVersion = '2.1.1';
        this.hasShownWhatsNew = localStorage.getItem('fitlify_whats_new_shown') === 'true';
        this.init();
    }

    init() {
        // Check if version changed
        if (this.isVersionNewer(this.currentVersion, this.lastVersion)) {
            this.showWhatsNewBanner();
            this.updateLastVersion();
        }
        
        // Listen for update events
        this.setupUpdateListeners();
    }

    isVersionNewer(current, last) {
        const currentParts = current.split('.').map(Number);
        const lastParts = last.split('.').map(Number);
        
        for (let i = 0; i < Math.max(currentParts.length, lastParts.length); i++) {
            const currentPart = currentParts[i] || 0;
            const lastPart = lastParts[i] || 0;
            
            if (currentPart > lastPart) return true;
            if (currentPart < lastPart) return false;
        }
        
        return false;
    }

    updateLastVersion() {
        localStorage.setItem('fitlify_last_version', this.currentVersion);
    }

    showWhatsNewBanner() {
        // Create banner container
        const banner = document.createElement('div');
        banner.id = 'whats-new-banner';
        banner.innerHTML = `
            <div class="whats-new-content">
                <div class="whats-new-header">
                    <div class="whats-new-icon">🎉</div>
                    <div class="whats-new-title">
                        <h3>Fitlify Updated to v${this.currentVersion}</h3>
                        <p>Exciting new features and improvements!</p>
                    </div>
                    <button class="whats-new-close" onclick="this.closest('#whats-new-banner').remove()">×</button>
                </div>
                <div class="whats-new-features">
                    <div class="feature-item">
                        <div class="feature-icon">🔐</div>
                        <div class="feature-text">
                            <h4>Enhanced Security</h4>
                            <p>Secure authentication with bcrypt password hashing and JWT tokens</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✨</div>
                        <div class="feature-text">
                            <h4>Improved UI/UX</h4>
                            <p>Real-time validation, better error messages, and smoother navigation</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🔄</div>
                        <div class="feature-text">
                            <h4>Auto-Update System</h4>
                            <p>Silent updates with automatic session reactivation</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🛡️</div>
                        <div class="feature-text">
                            <h4>Code Signing</h4>
                            <p>Digital certificate prevents security warnings on Windows/macOS/Linux</p>
                        </div>
                    </div>
                </div>
                <div class="whats-new-actions">
                    <button class="btn btn-primary" onclick="updateNotificationManager.dismissBanner()">Got it!</button>
                    <button class="btn btn-secondary" onclick="updateNotificationManager.viewReleaseNotes()">View Release Notes</button>
                </div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #whats-new-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }

            .whats-new-content {
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.4s ease-out;
            }

            .whats-new-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 16px 16px 0 0;
                position: relative;
            }

            .whats-new-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }

            .whats-new-title h3 {
                margin: 0 0 8px 0;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .whats-new-title p {
                margin: 0;
                opacity: 0.9;
                font-size: 1rem;
            }

            .whats-new-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 1.5rem;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .whats-new-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .whats-new-features {
                padding: 30px;
            }

            .feature-item {
                display: flex;
                align-items: flex-start;
                margin-bottom: 25px;
            }

            .feature-icon {
                font-size: 2rem;
                margin-right: 20px;
                flex-shrink: 0;
            }

            .feature-text h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .feature-text p {
                margin: 0;
                color: #666;
                font-size: 0.95rem;
                line-height: 1.5;
            }

            .whats-new-actions {
                padding: 20px 30px 30px;
                display: flex;
                gap: 15px;
                justify-content: flex-end;
            }

            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
            }

            .btn-secondary {
                background: #f0f0f0;
                color: #333;
            }

            .btn-secondary:hover {
                background: #e0e0e0;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(50px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .whats-new-content {
                    width: 95%;
                    margin: 20px;
                }

                .whats-new-header {
                    padding: 20px;
                }

                .whats-new-features {
                    padding: 20px;
                }

                .feature-item {
                    flex-direction: column;
                    text-align: center;
                }

                .feature-icon {
                    margin-right: 0;
                    margin-bottom: 10px;
                }

                .whats-new-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);

        // Add to page
        document.body.appendChild(banner);

        // Mark as shown
        this.hasShownWhatsNew = true;
        localStorage.setItem('fitlify_whats_new_shown', 'true');
    }

    dismissBanner() {
        const banner = document.getElementById('whats-new-banner');
        if (banner) {
            banner.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => banner.remove(), 300);
        }
    }

    viewReleaseNotes() {
        // Open GitHub release notes
        window.open('https://github.com/gitty6717/fitlify.github.com/releases', '_blank');
        this.dismissBanner();
    }

    setupUpdateListeners() {
        // Listen for update events from main process
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            
            ipcRenderer.on('update-available', (event, info) => {
                this.showUpdateNotification(info);
            });

            ipcRenderer.on('update-downloaded', (event, info) => {
                this.showUpdateReadyNotification(info);
            });
        }
    }

    showUpdateNotification(info) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">🔄</div>
                <div class="update-text">
                    <h4>Update Available</h4>
                    <p>Fitlify ${info.version} is ready to download</p>
                </div>
                <div class="update-actions">
                    <button class="btn btn-primary" onclick="updateNotificationManager.downloadUpdate()">Download</button>
                    <button class="btn btn-secondary" onclick="this.closest('.update-notification').remove()">Later</button>
                </div>
            </div>
        `;

        // Add notification styles
        if (!document.querySelector('#update-notification-styles')) {
            const notificationStyles = document.createElement('style');
            notificationStyles.id = 'update-notification-styles';
            notificationStyles.textContent = `
                .update-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    max-width: 400px;
                    z-index: 9999;
                    animation: slideInRight 0.4s ease-out;
                }

                .update-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                }

                .update-icon {
                    font-size: 2rem;
                    flex-shrink: 0;
                }

                .update-text h4 {
                    margin: 0 0 5px 0;
                    color: #333;
                    font-size: 1.1rem;
                }

                .update-text p {
                    margin: 0 0 15px 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                .update-actions {
                    display: flex;
                    gap: 10px;
                }

                .update-actions .btn {
                    padding: 8px 16px;
                    font-size: 0.9rem;
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(notificationStyles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    showUpdateReadyNotification(info) {
        const notification = document.createElement('div');
        notification.className = 'update-notification update-ready';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">✅</div>
                <div class="update-text">
                    <h4>Update Ready</h4>
                    <p>Fitlify ${info.version} has been downloaded. Restart to apply updates.</p>
                </div>
                <div class="update-actions">
                    <button class="btn btn-primary" onclick="updateNotificationManager.restartApp()">Restart Now</button>
                    <button class="btn btn-secondary" onclick="this.closest('.update-notification').remove()">Later</button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Don't auto-remove this notification
    }

    downloadUpdate() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('download-update');
        }
        // Remove notification
        document.querySelector('.update-notification')?.remove();
    }

    restartApp() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('restart-app');
        }
    }
}

// Initialize the update notification manager
const updateNotificationManager = new UpdateNotificationManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpdateNotificationManager;
}
