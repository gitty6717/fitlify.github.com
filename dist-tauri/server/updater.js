const { autoUpdater } = require('electron-updater');
const { dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');

class UpdateManager {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.updateAvailable = false;
        this.setupAutoUpdater();
    }

    setupAutoUpdater() {
        // Configure auto-updater
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.on('update-available', (info) => {
            this.updateAvailable = true;
            this.showUpdateAvailableDialog(info);
        });

        autoUpdater.on('update-downloaded', (info) => {
            this.showUpdateDownloadedDialog();
        });

        autoUpdater.on('error', (err) => {
            console.error('Update error:', err);
        });

        // Check for updates every hour
        setInterval(() => {
            autoUpdater.checkForUpdatesAndNotify();
        }, 3600000);
    }

    showUpdateAvailableDialog(info) {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'Update Available',
            message: 'A new version of Fitlify is available!',
            detail: `Version ${info.version} is ready to download.\n\nChanges:\n${this.formatReleaseNotes(info.releaseNotes)}`,
            buttons: ['Download Update', 'Later'],
            defaultId: 0
        }).then((result) => {
            if (result.response === 0) {
                this.downloadUpdate();
            }
        });
    }

    showUpdateDownloadedDialog() {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'Update Ready',
            message: 'Update has been downloaded and is ready to install!',
            detail: 'The app will restart to complete the update.',
            buttons: ['Restart Now', 'Later'],
            defaultId: 0
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    }

    downloadUpdate() {
        // Show progress in main window
        if (this.mainWindow) {
            this.mainWindow.webContents.send('update-progress', { status: 'downloading' });
        }
        
        autoUpdater.downloadUpdate();
    }

    formatReleaseNotes(notes) {
        if (!notes) return 'Bug fixes and improvements.';
        if (typeof notes === 'string') return notes;
        if (Array.isArray(notes)) return notes.join('\n');
        return 'Bug fixes and improvements.';
    }

    // Manual update check
    checkForUpdates() {
        autoUpdater.checkForUpdatesAndNotify();
    }
}

// GitHub-based update checker (fallback)
class GitHubUpdateChecker {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.repoOwner = 'your-username'; // Replace with actual GitHub username
        this.repoName = 'fitlify';
        this.currentVersion = app.getVersion();
    }

    async checkForUpdates() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`);
            const release = await response.json();
            
            if (this.isNewerVersion(release.tag_name)) {
                this.showGitHubUpdateDialog(release);
            }
        } catch (error) {
            console.error('GitHub update check failed:', error);
        }
    }

    isNewerVersion(latestVersion) {
        const current = this.currentVersion.replace('v', '').split('.').map(Number);
        const latest = latestVersion.replace('v', '').split('.').map(Number);
        
        for (let i = 0; i < Math.max(current.length, latest.length); i++) {
            const currentNum = current[i] || 0;
            const latestNum = latest[i] || 0;
            
            if (latestNum > currentNum) return true;
            if (latestNum < currentNum) return false;
        }
        
        return false;
    }

    showGitHubUpdateDialog(release) {
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'Update Available',
            message: `Fitlify ${release.tag_name} is available!`,
            detail: release.body || 'New features and bug fixes are available.',
            buttons: ['Download from GitHub', 'Skip'],
            defaultId: 0
        }).then((result) => {
            if (result.response === 0) {
                // Open GitHub release page
                const { shell } = require('electron');
                shell.openExternal(release.html_url);
            }
        });
    }
}

module.exports = { UpdateManager, GitHubUpdateChecker };
