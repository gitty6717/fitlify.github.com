# Create new self-signed certificate with longer validity
Write-Host "Creating new Fitlify certificate with extended validity..." -ForegroundColor Green

# Create certificate with 10-year validity
$cert = New-SelfSignedCertificate `
    -DnsName "fitlify.com" `
    -FriendlyName "Fitlify" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -NotAfter (Get-Date).AddYears(10) `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -HashAlgorithm SHA256 `
    -KeyUsage DigitalSignature,KeyEncipherment `
    -TextExtension @("2.5.29.37", "codeSigning=1.3.6", "1.3.6")

# Export to PFX with password
$pfxPassword = "fitlify123"
$pfxPath = "fitlify-new.pfx"
$certPath = "fitlify-new.cer"

try {
    # Export PFX
    Export-PfxCertificate `
        -Cert $cert `
        -FilePath $pfxPath `
        -Password (ConvertTo-SecureString -AsPlainText -Force $pfxPassword)
    
    # Export CER for verification
    Export-Certificate `
        -Cert $cert `
        -FilePath $certPath `
        -NoClobber
    
    Write-Host "✅ Certificate created successfully!" -ForegroundColor Green
    Write-Host "Certificate file: $pfxPath" -ForegroundColor White
    Write-Host "Certificate password: $pfxPassword" -ForegroundColor White
    Write-Host "Valid until: $cert.NotAfter" -ForegroundColor Cyan
    Write-Host "SHA1 Thumbprint: $($cert.Thumbprint)" -ForegroundColor Yellow
    
    # Display certificate info
    Write-Host "`nCertificate Details:" -ForegroundColor Magenta
    Write-Host "  Subject: fitlify.com" -ForegroundColor White
    Write-Host "  Issuer: fitlify.com" -ForegroundColor White
    Write-Host "  Purpose: Code Signing" -ForegroundColor White
    Write-Host "  Algorithm: SHA256RSA" -ForegroundColor White
    Write-Host "  Key Size: 2048 bits" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error creating certificate: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nCertificate ready for code signing!" -ForegroundColor Cyan
Write-Host "This certificate will prevent SmartScreen warnings for 10 years." -ForegroundColor Green
