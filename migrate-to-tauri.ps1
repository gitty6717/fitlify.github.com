# Migrate Fitlify from Electron to Tauri
Write-Host "🚀 Migrating Fitlify from Electron to Tauri..." -ForegroundColor Green

Write-Host "`nStep 1: Setting up Tauri configuration..." -ForegroundColor Cyan

# Create src-tauri directory structure
if (-not (Test-Path "src-tauri")) {
    New-Item -ItemType Directory -Path "src-tauri" -Force
    New-Item -ItemType Directory -Path "src-tauri/src" -Force
    New-Item -ItemType Directory -Path "src-tauri/icons" -Force
    Write-Host "✅ Created src-tauri directory structure" -ForegroundColor Green
} else {
    Write-Host "✅ src-tauri directory already exists" -ForegroundColor Yellow
}

Write-Host "`nStep 2: Copying application files..." -ForegroundColor Cyan

# Copy dist to Tauri build directory
if (Test-Path "dist") {
    Copy-Item -Path "dist\*" -Destination "dist-tauri" -Recurse -Force
    Write-Host "✅ Copied dist files to dist-tauri" -ForegroundColor Green
} else {
    Write-Host "❌ dist directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 3: Setting up Tauri dependencies..." -ForegroundColor Cyan

# Create package.json for Tauri
if (Test-Path "package-tauri.json") {
    Copy-Item -Path "package-tauri.json" -Destination "package.json" -Force
    Write-Host "✅ Updated package.json for Tauri" -ForegroundColor Green
} else {
    Write-Host "❌ package-tauri.json not found" -ForegroundColor Red
    exit 1
}

# Copy tauri.conf.json
if (Test-Path "tauri.conf.json") {
    Copy-Item -Path "tauri.conf.json" -Destination "src-tauri/tauri.conf.json" -Force
    Write-Host "✅ Copied Tauri configuration" -ForegroundColor Green
} else {
    Write-Host "❌ tauri.conf.json not found" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 4: Installing Tauri dependencies..." -ForegroundColor Cyan

# Install Tauri CLI and dependencies
try {
    npm install -g @tauri-apps/cli
    npm install
    Write-Host "✅ Installed Tauri dependencies" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 5: Creating Tauri icons..." -ForegroundColor Cyan

# Create placeholder icons (you'll need to replace with actual icons)
$iconSizes = @("32x32.png", "128x128.png", "128x128@2x.png", "icon.icns", "icon.ico")
foreach ($size in $iconSizes) {
    $iconPath = "src-tauri/icons/$size"
    if (-not (Test-Path $iconPath)) {
        # Create placeholder icon (you should replace with actual icons)
        New-Item -ItemType File -Path $iconPath -Force
        Write-Host "✅ Created placeholder: $size" -ForegroundColor Green
    }
}

Write-Host "`nStep 6: Setting up Tauri main process..." -ForegroundColor Cyan

# Copy Tauri main.js
if (Test-Path "src-tauri/src/main.js") {
    Write-Host "✅ Tauri main.js is ready" -ForegroundColor Green
} else {
    Write-Host "❌ src-tauri/src/main.js not found" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 7: Creating development server..." -ForegroundColor Cyan

# Create a simple development server for Tauri
$devServerContent = @"
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../dist-tauri')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist-tauri/index.html'));
});

app.listen(port, () => {
    console.log(`Tauri dev server running on http://localhost:${port}`);
});
"@

Set-Content -Path "dev-server.js" -Value $devServerContent
Write-Host "✅ Created development server" -ForegroundColor Green

Write-Host "`nMigration Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Run 'npm run tauri:dev' for development" -ForegroundColor White
Write-Host "2. Run 'npm run tauri:build' for production build" -ForegroundColor White
Write-Host "3. Replace placeholder icons in src-tauri/icons/" -ForegroundColor White
Write-Host "4. Test the application thoroughly" -ForegroundColor White
Write-Host "5. Commit changes to repository" -ForegroundColor White

Write-Host "`nTauri Benefits:" -ForegroundColor Magenta
Write-Host "• Smaller bundle size" -ForegroundColor White
Write-Host "• Better performance" -ForegroundColor White
Write-Host "• Enhanced security" -ForegroundColor White
Write-Host "• Cross-platform support" -ForegroundColor White
Write-Host "• Modern web technologies" -ForegroundColor White

Write-Host "`n🎉 Fitlify is now ready for Tauri!" -ForegroundColor Green
