# Fitlify - New Structure Documentation

## 📁 Complete Directory Structure

```
fitlify/
├── dist/                                    # Build output & new src location
│   ├── src/                                 # Main application source
│   │   ├── packages/                        # Package management
│   │   │   ├── package.json               # Main package configuration
│   │   │   └── package-lock.json          # Dependency lock file
│   │   ├── server/                         # Server-related files
│   │   │   ├── main.js                     # Electron main process
│   │   │   ├── database.js                 # Database manager
│   │   │   ├── preload.js                  # Preload script
│   │   │   ├── updater.js                  # Auto-update system
│   │   │   └── server.js                   # Express server
│   │   ├── backend/                        # Python backend files
│   │   │   ├── ai_fitness_level.py
│   │   │   ├── ai_workout_generator.py
│   │   │   ├── app.py
│   │   │   └── pydb.py
│   │   ├── home/                           # Home page
│   │   ├── login/                          # Login page
│   │   ├── signup/                         # Signup page
│   │   ├── dashboard/                      # Dashboard
│   │   ├── profile/                        # User profile
│   │   ├── progress/                       # Progress tracking
│   │   ├── exercise_selector/              # Exercise selection
│   │   ├── goal_selector/                  # Goal setting
│   │   ├── form/                           # Forms
│   │   ├── plan/                           # Workout plans
│   │   ├── coach_chat/                     # AI coach
│   │   ├── minigames/                      # Fitness games
│   │   ├── shared/                         # Shared components
│   │   ├── assets/                         # Static assets
│   │   ├── database/                       # Database files
│   │   ├── batch files/                    # Build scripts
│   │   │   ├── build-app.bat              # Original build script
│   │   │   ├── build-new.bat              # New build script
│   │   │   ├── update-paths.js            # Path updater
│   │   │   └── create-installer.js        # Installer creator
│   │   ├── guides (.MDs)/                  # Documentation
│   │   │   ├── AUTO-UPDATE-GUIDE.md
│   │   │   └── other .md files
│   │   ├── main.js                         # Entry point (copy)
│   │   ├── preload.js                      # Preload (copy)
│   │   ├── package.json                    # Package config (copy)
│   │   ├── node_modules/                   # Dependencies
│   │   └── test-*.html                     # Test files
│   ├── Fitlify-Setup-1.0.0.exe             # Windows installer
│   ├── Fitlify-Portable-1.0.0.exe          # Portable version
│   └── win-unpacked/                       # Unpacked build
└── node_modules/                           # Root node modules (legacy)
```

## 🔄 Route Updates Completed

### 1. **File Paths Updated**
- All HTML and JS files updated to use new structure
- Relative paths corrected for dist/src organization
- Navigation links updated throughout app

### 2. **Import Paths Fixed**
- `main.js`: Updated to `../home/index.html`
- `database.js`: Updated to `../database/users.json`
- All server files properly referenced

### 3. **Build Configuration**
- `package.json`: Updated for new structure
- Build output: `../../` (points to dist root)
- Files array includes all necessary folders

## 🚀 Build & Run Commands

### From `dist/src/` directory:
```bash
# Install dependencies
npm install

# Run the app
npm start

# Run server only
npm run server

# Build Windows installer
npm run build:win

# Build portable version
npm run build:portable
```

### Using Batch Files:
```bash
# New build script
"batch files/build-new.bat"

# Original build script (legacy)
"batch files/build-app.bat"
```

## 📦 Package Management

### **packages/ folder**
- `package.json`: Main configuration
- `package-lock.json`: Dependency lock
- Contains all npm dependencies

### **server/ folder**
- All Electron and Node.js server files
- Database management
- Auto-update system
- Preload scripts

## 🗄️ Backend Integration

### **backend/ folder**
- Python AI modules
- Flask app (`app.py`)
- Database operations (`pydb.py`)
- Fitness level assessment
- Workout generation

## 🔧 Auto-Update System

### **Features**
- GitHub integration for releases
- Automatic update checking
- User-controlled installations
- Fallback update methods

### **Configuration**
- Update manager in `server/updater.js`
- GitHub publisher in `package.json`
- IPC handlers in `main.js`

## 📋 File Organization Summary

| Folder | Purpose | Contents |
|--------|---------|----------|
| `packages/` | Dependencies | package.json, node_modules |
| `server/` | Electron Server | main.js, database.js, preload.js |
| `backend/` | Python Backend | AI modules, Flask app |
| `batch files/` | Build Scripts | build-app.bat, update-paths.js |
| `guides (.MDs)/` | Documentation | .md files |
| All other folders | UI Components | HTML, CSS, JS files |

## 🎯 Benefits of New Structure

1. **Clean Separation**: Server, backend, and UI clearly separated
2. **Easy Maintenance**: Related files grouped together
3. **Scalable**: Easy to add new components
4. **Build Ready**: Optimized for electron-builder
5. **Documentation**: All guides in one place

## 🔄 Migration Complete

✅ All files moved to appropriate folders  
✅ All routes and paths updated  
✅ Build system working  
✅ Auto-update functional  
✅ Documentation organized  

The application is now fully restructured with proper separation of concerns and updated routing!
