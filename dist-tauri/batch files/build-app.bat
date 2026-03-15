@echo off
echo =========================================
echo    Fitlify Desktop App Builder
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
echo [2/4] Building Windows installer...
call npm run build:win
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo =========================================
echo    Build Complete!
echo =========================================
echo.
echo Installer location: dist\Fitlify-Setup-1.0.0.exe
echo Portable version: dist\Fitlify-Portable-1.0.0.exe
echo.
pause
