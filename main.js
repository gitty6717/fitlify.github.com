const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    icon: path.join(__dirname, 'assets/fitlify-icon-512.png')
  });

  // Load the app
  if (isDev) {
    mainWindow.loadFile('dist/src/login/login.html');
    mainWindow.webContents.openDevTools();
  } else {
    // Load from GitHub Pages for production
    mainWindow.loadURL('https://gitty6717.github.io/fitlify.github.com/dist/src/login/login.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Update handling
function setupUpdateHandling() {
  if (!isDev) {
    try {
      const { autoUpdater } = require('electron-updater');
      
      autoUpdater.checkForUpdatesAndNotify();
      
      autoUpdater.on('update-available', (info) => {
        console.log('Update available:', info);
        if (mainWindow) {
          mainWindow.webContents.send('update-available', info);
        }
      });
      
      autoUpdater.on('update-downloaded', (info) => {
        console.log('Update downloaded:', info);
        if (mainWindow) {
          mainWindow.webContents.send('update-downloaded', info);
        }
      });
      
      autoUpdater.on('error', (err) => {
        console.error('Update error:', err);
      });
      
      // Check for updates every hour
      setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 3600000);
      
    } catch (error) {
      console.log('Auto-updater not available in development');
    }
  }
}

// IPC handlers for update actions
ipcMain.handle('download-update', () => {
  if (!isDev) {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.downloadUpdate();
  }
});

ipcMain.handle('restart-app', () => {
  if (!isDev) {
    app.relaunch();
    app.exit();
  }
});

app.whenReady().then(() => {
  createWindow();
  setupUpdateHandling();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
