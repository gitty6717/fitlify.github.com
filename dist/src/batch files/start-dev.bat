@echo off
echo =========================================
echo    Fitlify Development Server
echo =========================================
echo.

REM Start the API server
echo [1/2] Starting API server...
start "Fitlify API Server" cmd /k "npm run server"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 3 /nobreak >nul

REM Start Electron app
echo [2/2] Starting Electron app...
start "Fitlify App" cmd /k "node_modules\electron\dist\electron.exe ."

echo.
echo =========================================
echo    Development Environment Started!
echo =========================================
echo.
echo API Server: http://localhost:3001
echo Test Page: test-auth.html
echo.
pause
