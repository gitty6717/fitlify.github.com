# Build signed installer for Fitlify
Write-Host "Building signed installer for Fitlify..." -ForegroundColor Green

# Build unsigned installer first
Write-Host "Building unsigned installer..." -ForegroundColor Yellow
& npm run build:win

if ($LASTEXITCODE -eq 0) {
    Write-Host "Unsigned build completed successfully!" -ForegroundColor Green
    
    # Try to sign the installer
    Write-Host "Attempting to sign installer..." -ForegroundColor Yellow
    
    $certPath = "Cert:\CurrentUser\My\E1B2AD3C1BED13CDE83D0860AA2E7788FA24BD97"
    $installerPath = "..\Fitlify-Setup-1.0.1.exe"
    $pfxPath = "fitlify.pfx"
    $password = "fitlify123"
    
    # Try different signing tools
    if (Test-Path $installerPath) {
        Write-Host "Found installer: $installerPath" -ForegroundColor Green
        
        # Try signtool (Windows SDK)
        try {
            & signtool sign /f $pfxPath /d "Fitlify" /du https://github.com/gitty6717/fitlify.github.com /p $password $installerPath
            Write-Host "Successfully signed with signtool!" -ForegroundColor Green
        } catch {
            Write-Host "signtool failed, trying alternative..." -ForegroundColor Yellow
        }
        
        # Try SignTool (alternative)
        try {
            & "C:\Program Files (x86)\Windows Kits\10\bin\10.0.18362.0\x86\signtool.exe" sign /f $pfxPath /d "Fitlify" /du https://github.com/gitty6717/fitlify.github.com /p $password $installerPath
            Write-Host "Successfully signed with SignTool!" -ForegroundColor Green
        } catch {
            Write-Host "SignTool failed, installer will be unsigned" -ForegroundColor Red
        }
    } else {
        Write-Host "Installer not found!" -ForegroundColor Red
    }
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}

Write-Host "Build process completed." -ForegroundColor Cyan
