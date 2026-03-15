@echo off
echo =========================================
echo    Fitlify Build Script (New Structure)
echo =========================================
echo.

REM Change to the src directory where package.json is located
cd /d "%~dp0..\"

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install --prefix packages
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Building application...
call npm run build:win --prefix packages
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [3/4] Build Complete!
echo =========================================
echo.
echo Installer location: ..\..\Fitlify-Setup-1.0.0.exe
echo Portable version: ..\..\Fitlify-Portable-1.0.0.exe
echo.
echo [4/4] Testing build...
if exist "..\..\Fitlify-Setup-1.0.0.exe" (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed - installer not found
)

echo.
echo To run the app: call npm start --prefix packages
echo To run server only: call npm run server --prefix packages
echo.
pause
