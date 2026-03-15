# Create proper Fitlify application icon
Write-Host "Creating Fitlify application icon..." -ForegroundColor Green

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Drawing2D

# Create a 512x512 high-resolution icon
$iconSize = 512
$bitmap = New-Object System.Drawing.Bitmap $iconSize, $iconSize
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Create gradient background (purple to blue gradient)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush `
    (New-Object System.Drawing.Point 0, 0), `
    (New-Object System.Drawing.Point $iconSize, $iconSize), `
    [System.Drawing.Color]::FromArgb(102, 126, 234), `
    [System.Drawing.Color]::FromArgb(118, 75, 162)
$graphics.FillRectangle($brush, 0, 0, $iconSize, $iconSize)

# Add subtle inner glow effect
$glowBrush = New-Object System.Drawing.Drawing2D.RadialGradientBrush `
    (New-Object System.Drawing.Point ($iconSize/2), ($iconSize/2)), 0, `
    (New-Object System.Drawing.Point ($iconSize/2), ($iconSize/2)), ($iconSize/1.5)
$glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(50, 255, 255, 255)
$glowBrush.SurroundColor = [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
$graphics.FillRectangle($glowBrush, 0, 0, $iconSize, $iconSize)

# Create main circular background
$circleSize = $iconSize * 0.6
$circleX = ($iconSize - $circleSize) / 2
$circleY = ($iconSize - $circleSize) / 2
$circleRect = New-Object System.Drawing.Rectangle $circleX, $circleY, $circleSize, $circleSize

# Create gradient for circle
$circleBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush `
    (New-Object System.Drawing.Point $circleX, $circleY), `
    (New-Object System.Drawing.Point ($circleX + $circleSize), ($circleY + $circleSize)), `
    [System.Drawing.Color]::FromArgb(255, 255, 255), `
    [System.Drawing.Color]::FromArgb(240, 240, 255)
$graphics.FillEllipse($circleBrush, $circleRect)

# Add shadow to circle
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 0, 0, 0))
$shadowOffset = 15
$shadowRect = New-Object System.Drawing.Rectangle ($circleX + $shadowOffset), ($circleY + $shadowOffset), $circleSize, $circleSize
$graphics.FillEllipse($shadowBrush, $shadowRect)

# Draw main circle
$graphics.FillEllipse($circleBrush, $circleRect)

# Add border to circle
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 200, 220), 8)
$graphics.DrawEllipse($borderPen, $circleRect)

# Draw "F" text with better styling
$fontSize = $iconSize * 0.35
$font = New-Object System.Drawing.Font "Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(102, 126, 234))
$text = "F"

# Measure text for centering
$textSize = $graphics.MeasureString($text, $font)
$textX = ($iconSize - $textSize.Width) / 2
$textY = ($iconSize - $textSize.Height) / 2

# Add text shadow
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 0, 0, 0))
$graphics.DrawString($text, $font, $shadowBrush, ($textX + 8), ($textY + 8))

# Draw main text
$graphics.DrawString($text, $font, $textBrush, $textX, $textY)

# Add "Fitlify" text below the logo
$subtitleFont = New-Object System.Drawing.Font "Segoe UI", ($iconSize * 0.08), [System.Drawing.FontStyle]::Regular
$subtitleText = "Fitlify"
$subtitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$subtitleSize = $graphics.MeasureString($subtitleText, $subtitleFont)
$subtitleX = ($iconSize - $subtitleSize.Width) / 2
$subtitleY = ($iconSize * 0.75)
$graphics.DrawString($subtitleText, $subtitleFont, $subtitleBrush, $subtitleX, $subtitleY)

# Save as PNG (high quality)
$bitmap.Save("assets\fitlify-icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created fitlify-icon-512.png" -ForegroundColor Green

# Create 256x256 version
$bitmap256 = New-Object System.Drawing.Bitmap 256, 256
$graphics256 = [System.Drawing.Graphics]::FromImage($bitmap256)
$graphics256.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics256.DrawImage($bitmap, 0, 0, 256, 256)
$bitmap256.Save("assets\fitlify-icon-256.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created fitlify-icon-256.png" -ForegroundColor Green

# Create 128x128 version
$bitmap128 = New-Object System.Drawing.Bitmap 128, 128
$graphics128 = [System.Drawing.Graphics]::FromImage($bitmap128)
$graphics128.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics128.DrawImage($bitmap, 0, 0, 128, 128)
$bitmap128.Save("assets\fitlify-icon-128.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created fitlify-icon-128.png" -ForegroundColor Green

# Create ICO file for Windows
$iconStream = New-Object System.IO.MemoryStream
$iconWriter = New-Object System.IO.BinaryWriter $iconStream

# ICO header
$iconWriter.Write([UInt16]0)  # Reserved
$iconWriter.Write([UInt16]1)  # Type (1 = ICO)
$iconWriter.Write([UInt16]2)  # Number of images (256x256 and 128x128)

# Image 1: 256x256
$iconWriter.Write([Byte]0)    # Width (0 = 256)
$iconWriter.Write([Byte]0)    # Height (0 = 256)
$iconWriter.Write([Byte]0)    # Colors (0 = >256)
$iconWriter.Write([Byte]0)    # Reserved
$iconWriter.Write([UInt16]1)  # Color planes
$iconWriter.Write([UInt16]32) # Bits per pixel
$iconWriter.Write([UInt32]0)  # Size in bytes (will be filled later)
$iconWriter.Write([UInt32]22) # Offset to image data

# Image 2: 128x128
$iconWriter.Write([Byte]128)  # Width
$iconWriter.Write([Byte]128)  # Height
$iconWriter.Write([Byte]0)    # Colors (0 = >256)
$iconWriter.Write([Byte]0)    # Reserved
$iconWriter.Write([UInt16]1)  # Color planes
$iconWriter.Write([UInt16]32) # Bits per pixel
$iconWriter.Write([UInt32]0)  # Size in bytes (will be filled later)
$iconWriter.Write([UInt32]0)  # Offset to image data (will be calculated)

# Write 256x256 image data
$iconWriter.Write([UInt32]40) # Header size
$iconWriter.Write([UInt32]256) # Width
$iconWriter.Write([UInt32]512) # Height (doubled for XOR+AND masks)
$iconWriter.Write([UInt16]1)  # Planes
$iconWriter.Write([UInt16]32) # Bits per pixel
$iconWriter.Write([UInt32]0)  # Compression
$iconWriter.Write([UInt32]0)  # Image size (uncompressed)
$iconWriter.Write([UInt32]0)  # X pixels per meter
$iconWriter.Write([UInt32]0)  # Y pixels per meter
$iconWriter.Write([UInt32]0)  # Colors used
$iconWriter.Write([UInt32]0)  # Important colors

# Write 256x256 pixel data (BGRA format)
for ($y = 255; $y -ge 0; $y--) {
    for ($x = 0; $x -lt 256; $x++) {
        $pixel = $bitmap256.GetPixel($x, $y)
        $iconWriter.Write([Byte]$pixel.B)  # Blue
        $iconWriter.Write([Byte]$pixel.G)  # Green
        $iconWriter.Write([Byte]$pixel.R)  # Red
        $iconWriter.Write([Byte]$pixel.A)  # Alpha
    }
}

# AND mask for 256x256 (all transparent)
$andMaskSize = [Math]::Ceiling(256 * 256 / 8.0)
$iconWriter.Write([byte[]](&[System.Array]::CreateInstance([byte], $andMaskSize)))

# Update size and offset for second image
$imageDataSize1 = $iconStream.Length - 22
$iconStream.Seek(6, [System.IO.SeekOrigin]::Begin)
$iconWriter.Write([UInt32]$imageDataSize1)
$iconWriter.Write([UInt32]($imageDataSize1 + 22))

# Write 128x128 image data
$iconWriter.Write([UInt32]40) # Header size
$iconWriter.Write([UInt32]128) # Width
$iconWriter.Write([UInt32]256) # Height (doubled for XOR+AND masks)
$iconWriter.Write([UInt16]1)  # Planes
$iconWriter.Write([UInt16]32) # Bits per pixel
$iconWriter.Write([UInt32]0)  # Compression
$iconWriter.Write([UInt32]0)  # Image size (uncompressed)
$iconWriter.Write([UInt32]0)  # X pixels per meter
$iconWriter.Write([UInt32]0)  # Y pixels per meter
$iconWriter.Write([UInt32]0)  # Colors used
$iconWriter.Write([UInt32]0)  # Important colors

# Write 128x128 pixel data (BGRA format)
for ($y = 127; $y -ge 0; $y--) {
    for ($x = 0; $x -lt 128; $x++) {
        $pixel = $bitmap128.GetPixel($x, $y)
        $iconWriter.Write([Byte]$pixel.B)  # Blue
        $iconWriter.Write([Byte]$pixel.G)  # Green
        $iconWriter.Write([Byte]$pixel.R)  # Red
        $iconWriter.Write([Byte]$pixel.A)  # Alpha
    }
}

# AND mask for 128x128 (all transparent)
$andMaskSize = [Math]::Ceiling(128 * 128 / 8.0)
$iconWriter.Write([byte[]](&[System.Array]::CreateInstance([byte], $andMaskSize)))

# Save ICO file
[System.IO.File]::WriteAllBytes("assets\icon.ico", $iconStream.ToArray())
Write-Host "Created icon.ico with proper Fitlify branding!" -ForegroundColor Green

# Copy main icon as icon.png for compatibility
$bitmap.Save("assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created icon.png" -ForegroundColor Green

# Clean up
$graphics.Dispose()
$graphics256.Dispose()
$graphics128.Dispose()
$bitmap.Dispose()
$bitmap256.Dispose()
$bitmap128.Dispose()
$iconWriter.Dispose()
$iconStream.Dispose()

Write-Host "Fitlify icon creation completed successfully!" -ForegroundColor Cyan
Write-Host "Icons created:" -ForegroundColor Yellow
Write-Host "  - assets/icon.ico (Windows icon)" -ForegroundColor White
Write-Host "  - assets/icon.png (512x512 PNG)" -ForegroundColor White
Write-Host "  - assets/fitlify-icon-512.png" -ForegroundColor White
Write-Host "  - assets/fitlify-icon-256.png" -ForegroundColor White
Write-Host "  - assets/fitlify-icon-128.png" -ForegroundColor White
