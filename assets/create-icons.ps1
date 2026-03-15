# Create application icons for Fitlify
Write-Host "Creating application icons for Fitlify..." -ForegroundColor Green

# Create a simple icon using PowerShell
Add-Type -AssemblyName System.Drawing

# Create a 256x256 icon with gradient background
$iconSize = 256
$bitmap = New-Object System.Drawing.Bitmap $iconSize, $iconSize
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Create gradient background (purple to blue)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush `
    (New-Object System.Drawing.Point 0, 0), `
    (New-Object System.Drawing.Point $iconSize, $iconSize), `
    [System.Drawing.Color]::FromArgb(102, 126, 234), `
    [System.Drawing.Color]::FromArgb(118, 75, 162)
$graphics.FillRectangle($brush, 0, 0, $iconSize, $iconSize)

# Add white circle for logo background
$circleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$circleRect = New-Object System.Drawing.Rectangle ($iconSize/4), ($iconSize/4), ($iconSize/2), ($iconSize/2)
$graphics.FillEllipse($circleBrush, $circleRect)

# Add "F" text
$font = New-Object System.Drawing.Font "Arial", ($iconSize/3), [System.Drawing.FontStyle]::Bold
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(102, 126, 234))
$text = "F"
$textSize = $graphics.MeasureString($text, $font)
$textX = ($iconSize - $textSize.Width) / 2
$textY = ($iconSize - $textSize.Height) / 2
$graphics.DrawString($text, $font, $brush, $textX, $textY)

# Save as PNG
$bitmap.Save("assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created icon.png" -ForegroundColor Green

# Create ICO file (Windows icon)
$iconStream = New-Object System.IO.MemoryStream
$iconWriter = New-Object System.IO.BinaryWriter $iconStream

# ICO header
$iconWriter.Write([UInt16]0)  # Reserved
$iconWriter.Write([UInt16]1)  # Type (1 = ICO)
$iconWriter.Write([UInt16]1)  # Number of images

# Image entry
$iconWriter.Write([Byte]0)    # Width (0 = 256)
$iconWriter.Write([Byte]0)    # Height (0 = 256)
$iconWriter.Write([Byte]0)    # Colors (0 = >256)
$iconWriter.Write([Byte]0)    # Reserved
$iconWriter.Write([UInt16]1)  # Color planes
$iconWriter.Write([UInt16]32) # Bits per pixel
$iconWriter.Write([UInt32]0)  # Size in bytes (will be filled later)
$iconWriter.Write([UInt32]22) # Offset to image data

# BMP header for ICO
$iconWriter.Write([UInt32]40) # Header size
$iconWriter.Write([UInt32]$iconSize) # Width
$iconWriter.Write([UInt32]($iconSize * 2)) # Height (doubled for XOR+AND masks)
$iconWriter.Write([UInt16]1)  # Planes
$iconWriter.Write([UInt16]32) # Bits per pixel
$iconWriter.Write([UInt32]0)  # Compression
$iconWriter.Write([UInt32]0)  # Image size (uncompressed)
$iconWriter.Write([UInt32]0)  # X pixels per meter
$iconWriter.Write([UInt32]0)  # Y pixels per meter
$iconWriter.Write([UInt32]0)  # Colors used
$iconWriter.Write([UInt32]0)  # Important colors

# Write pixel data (BGRA format)
for ($y = $iconSize - 1; $y -ge 0; $y--) {
    for ($x = 0; $x -lt $iconSize; $x++) {
        $pixel = $bitmap.GetPixel($x, $y)
        $iconWriter.Write([Byte]$pixel.B)  # Blue
        $iconWriter.Write([Byte]$pixel.G)  # Green
        $iconWriter.Write([Byte]$pixel.R)  # Red
        $iconWriter.Write([Byte]$pixel.A)  # Alpha
    }
}

# AND mask (all transparent)
$andMaskSize = [Math]::Ceiling($iconSize * $iconSize / 8.0)
$iconWriter.Write([byte[]](&[System.Array]::CreateInstance([byte], $andMaskSize)))

# Update size in header
$iconStream.Seek(14, [System.IO.SeekOrigin]::Begin)
$imageDataSize = $iconStream.Length - 22
$iconWriter.Write([UInt32]$imageDataSize)

# Save ICO file
[System.IO.File]::WriteAllBytes("assets\icon.ico", $iconStream.ToArray())
Write-Host "Created icon.ico" -ForegroundColor Green

# Clean up
$graphics.Dispose()
$bitmap.Dispose()
$iconWriter.Dispose()
$iconStream.Dispose()

Write-Host "Icon creation completed!" -ForegroundColor Cyan
