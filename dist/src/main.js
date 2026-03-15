const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const DatabaseManager = require('./database.js');
const { UpdateManager, GitHubUpdateChecker } = require('./updater.js');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;
let db;
let updateManager;

// Initialize database
function initializeDatabase() {
    console.log('Initializing Fitlify database...');
    db = new DatabaseManager();
    console.log('Database initialized with', db.getUsers().length, 'users');
}

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        // icon: path.join(__dirname, '../src/assets/logo.png'), // Commented out - file doesn't exist
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: false, // Allow local file access
            preload: path.join(__dirname, 'preload.js')
        },
        show: false, // Don't show until ready
        titleBarStyle: 'default',
        backgroundColor: '#0a0a0a'
    });

    // Load the app
    const indexPath = path.join(__dirname, '../index.html');
    mainWindow.loadFile(indexPath);

    // Remove default menu
    Menu.setApplicationMenu(null);

    // Show window when ready to prevent flickering
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Handle external links - open in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Emitted when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished initialization
app.on('ready', () => {
    initializeDatabase();
    createWindow();
    
    // Initialize update manager after window is created
    setTimeout(() => {
        updateManager = new UpdateManager(mainWindow);
        
        // Also set up GitHub checker as fallback
        const githubChecker = new GitHubUpdateChecker(mainWindow);
        setTimeout(() => githubChecker.checkForUpdates(), 5000);
    }, 3000);
});

// IPC handlers
ipcMain.on('check-for-updates', () => {
    if (updateManager) {
        updateManager.checkForUpdates();
    }
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (mainWindow === null) {
        createWindow();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});
