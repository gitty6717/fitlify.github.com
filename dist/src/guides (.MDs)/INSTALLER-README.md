# Fitlify Installer v1.0.0

## What's New in This Version

### ✅ Authentication System Fixed
- Resolved infinite redirect loop between login/signup pages
- Consistent session management across all authentication pages
- Proper validation and error handling

### ✅ Database Integration
- Built-in Node.js/Express API server
- JSON-based user database with automatic initialization
- API endpoints for login, signup, and user management
- Server automatically starts when Fitlify launches

### ✅ Professional Installer Features
- **7-Page Wizard Installation**:
  1. Welcome Screen
  2. License Agreement
  3. Choose Install Location
  4. Additional Tasks (Desktop/Start Menu shortcuts)
  5. Ready to Install Summary
  6. Installation Progress
  7. Installation Complete

- **Application Registration**:
  - Windows Start Menu entry
  - Desktop shortcut creation
  - Windows Search integration
  - Proper uninstallation

### ✅ Demo Accounts
Pre-configured for testing:
- **Email**: `demo@fitlify.com` | **Password**: `demo123`
- **Email**: `test@test.com` | **Password**: `password`

## Installation Instructions

1. Run `Fitlify-Setup-1.0.0.exe`
2. Follow the 7-step wizard
3. Choose installation directory (default: `C:\Program Files\Fitlify`)
4. Select optional shortcuts
5. Launch Fitlify after installation

## Technical Details

### Server Configuration
- API Server runs on `http://localhost:3001`
- Database stored in `database/users.json`
- Server starts automatically when app launches
- Server shuts down cleanly when app closes

### File Structure (Installed)
```
Fitlify/
├── Fitlify.exe              # Main application
├── server.js                # API server
├── package.json             # Dependencies
├── database/
│   └── users.json           # User database
├── home/                    # App pages
├── login/
├── signup/
├── dashboard/
└── ... (other app folders)
```

### API Endpoints
- `POST /api/login` - User authentication
- `POST /api/signup` - User registration
- `GET /api/health` - Server status check

## Troubleshooting

### Server Issues
If the API server fails to start:
1. Check if port 3001 is available
2. Verify database files exist in `database/` folder
3. Restart the application

### Authentication Issues
1. Use demo accounts to test
2. Check browser console for errors
3. Ensure server is running (test at `http://localhost:3001/api/health`)

### Uninstallation
1. Use "Uninstall Fitlify" from Start Menu
2. Or run "Uninstall.exe" from installation folder
3. All files and registry entries will be removed

## Development
To run in development mode:
```bash
npm run dev
```
This starts both the server and Electron app simultaneously.

## Support
For issues or questions, check the logs in the application console or contact support.
