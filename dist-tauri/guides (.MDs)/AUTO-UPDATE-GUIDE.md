# Fitlify Auto-Update System

## Overview
Fitlify now includes an automatic update system that checks for new releases on GitHub and downloads updates seamlessly.

## Features

### ✅ Auto-Update Capabilities
- **Automatic Checks**: Checks for updates every hour
- **GitHub Integration**: Monitors GitHub releases for new versions
- **Seamless Updates**: Downloads and installs updates in the background
- **User Control**: Users choose when to install updates
- **Fallback System**: Multiple update checking methods

### ✅ New Structure
- **src/ Folder**: All application files now organized in `src/` directory
- **Clean Root**: Only essential files remain in root directory
- **Updated Paths**: All internal links updated to new structure

## How It Works

### 1. Update Detection
```
GitHub API → Version Check → Update Available Dialog
```

### 2. Update Process
```
User Accepts → Download Update → Install Prompt → Restart & Update
```

### 3. Fallback Methods
- Primary: electron-updater with GitHub releases
- Secondary: Direct GitHub API calls
- Tertiary: Manual update notifications

## File Structure

### Before
```
fitlify/
├── home/
├── login/
├── dashboard/
├── ... (other folders)
├── main.js
├── package.json
└── ...
```

### After
```
fitlify/
├── src/
│   ├── home/
│   ├── login/
│   ├── dashboard/
│   ├── assets/
│   ├── database/
│   └── ... (all app folders)
├── main.js
├── database.js
├── preload.js
├── updater.js
├── package.json
└── ...
```

## Update Configuration

### GitHub Setup
1. Create GitHub repository
2. Enable releases
3. Update `package.json` with your GitHub details:
```json
"publish": {
  "provider": "github",
  "owner": "your-username",
  "repo": "fitlify"
}
```

### Build Process
```bash
# Build and create release
npm run build:win
# Or use the build script
build-release.bat
```

## User Experience

### Update Notification
- Dialog appears when update is available
- Shows version and release notes
- Options: "Download Update" or "Later"

### Download Progress
- Progress indicator in main window
- Background download
- Non-blocking user experience

### Installation
- Notification when download completes
- Options: "Restart Now" or "Later"
- Automatic restart and update

## Development

### Adding Update UI Elements
```javascript
// Check for updates manually
window.electronAPI.checkForUpdates();

// Listen for update progress
window.electronAPI.onUpdateProgress((data) => {
  console.log('Update status:', data.status);
});
```

### Update Triggers
- Automatic: Every hour
- Manual: Via API call
- Startup: 5 seconds after app launch

## Troubleshooting

### Update Not Working
1. Check GitHub repository configuration
2. Verify release tags match version format
3. Ensure internet connectivity
4. Check firewall/antivirus settings

### Path Issues
All paths automatically updated to use `src/` prefix:
- Old: `../dashboard/dashboard.html`
- New: `../src/dashboard/dashboard.html`

### Database Location
Database now stored at: `src/database/users.json`

## Security

### Update Verification
- Digital signatures on updates
- GitHub release verification
- Secure download channels

### User Privacy
- No personal data sent during update checks
- Anonymous version checking
- Local update storage

## Release Process

1. **Update Version** in `package.json`
2. **Build Application**: `npm run build:win`
3. **Create Release** on GitHub
4. **Upload Installer** to release
5. **Tag Release** with version number

## Benefits

### For Users
- Always up-to-date application
- Seamless update experience
- No manual download required
- Automatic bug fixes and features

### For Developers
- Easier deployment process
- Automatic user updates
- Reduced support burden
- Consistent user base

## Future Enhancements

- [ ] Delta updates (smaller downloads)
- [ ] Scheduled update windows
- [ ] Update rollback capability
- [ ] Beta update channel
- [ ] Update statistics dashboard
