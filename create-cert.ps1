# Create self-signed certificate for Fitlify
Write-Host "Creating self-signed certificate for Fitlify..." -ForegroundColor Green

# Create certificate in current user store
$cert = New-SelfSignedCertificate -DnsName "fitlify.com" -CertStoreLocation "Cert:\CurrentUser\My" -KeyUsage "DigitalSignature" -KeySpec "Signature" -FriendlyName "Fitlify Application" -NotAfter (Get-Date).AddYears(10)

if ($cert) {
    Write-Host "Certificate created successfully!" -ForegroundColor Green
    Write-Host "Thumbprint: $($cert.Thumbprint)" -ForegroundColor Yellow
    
    # Export to PFX file
    $securePassword = ConvertTo-SecureString -AsPlainText "fitlify123" -Force
    Export-PfxCertificate -Cert "Cert:\CurrentUser\My\$($cert.Thumbprint)" -FilePath "fitlify.pfx" -Password $securePassword -Force
    
    if (Test-Path "fitlify.pfx") {
        Write-Host "Certificate exported to fitlify.pfx" -ForegroundColor Green
        Write-Host "Password: fitlify123" -ForegroundColor Yellow
    } else {
        Write-Host "Failed to export certificate" -ForegroundColor Red
    }
} else {
    Write-Host "Failed to create certificate" -ForegroundColor Red
}

Write-Host "Certificate creation process completed." -ForegroundColor Cyan
