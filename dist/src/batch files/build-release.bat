@echo off
echo =========================================
echo    Fitlify Build and Release Script
echo =========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Building application...
call npm run build:win
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [3/4] Creating GitHub release...
REM Get version from package.json
for /f "tokens=*" %%i in ('node -e "console.log(require('./package.json').version)"') do set VERSION=%%i

echo Version: %VERSION%

REM Create release notes
echo Creating release notes...
echo # Fitlify v%VERSION% > release-notes.md
echo. >> release-notes.md
echo ## Features >> release-notes.md
echo - Auto-update system with GitHub integration >> release-notes.md
echo - Restructured codebase with src/ folder >> release-notes.md
echo - Fixed authentication system >> release-notes.md
echo - Improved database management >> release-notes.md
echo. >> release-notes.md
echo ## Bug Fixes >> release-notes.md
echo - Fixed login/signup redirect loops >> release-notes.md
echo - Improved error handling >> release-notes.md
echo - Enhanced UI responsiveness >> release-notes.md
echo. >> release-notes.md
echo ## Installation >> release-notes.md
echo 1. Download Fitlify-Setup-%VERSION%.exe >> release-notes.md
echo 2. Run the installer >> release-notes.md
echo 3. Enjoy the new features! >> release-notes.md

echo.
echo [4/4] Build Complete!
echo =========================================
echo.
echo Installer location: dist\Fitlify-Setup-%VERSION%.exe
echo Portable version: dist\Fitlify-Portable-%VERSION%.exe
echo Release notes: release-notes.md
echo.
echo To create GitHub release:
echo 1. Upload the installer to GitHub Releases
echo 2. Copy contents from release-notes.md
echo 3. Tag with v%VERSION%
echo.
pause
