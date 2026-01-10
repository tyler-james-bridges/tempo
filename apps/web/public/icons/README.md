# PWA Icons

This directory contains icons for the TempoMap Progressive Web App.

## Required Icons

You need to create the following PNG icons from `icon.svg`:

- `icon-192x192.png` - Standard icon (192x192 pixels)
- `icon-512x512.png` - Large icon (512x512 pixels)
- `icon-maskable-192x192.png` - Maskable icon with safe zone (192x192 pixels)
- `icon-maskable-512x512.png` - Maskable icon with safe zone (512x512 pixels)

## Generating Icons

### Option 1: Using an online tool
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `icon.svg`
3. Download the generated icons

### Option 2: Using ImageMagick (command line)
```bash
# Install ImageMagick if needed
brew install imagemagick

# Generate standard icons
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 512x512 icon-512x512.png

# For maskable icons, add padding (safe zone is 80% of icon)
convert icon.svg -resize 154x154 -gravity center -background "#E8913A" -extent 192x192 icon-maskable-192x192.png
convert icon.svg -resize 410x410 -gravity center -background "#E8913A" -extent 512x512 icon-maskable-512x512.png
```

### Option 3: Using sharp (Node.js)
```javascript
const sharp = require('sharp');

// Generate standard icons
sharp('icon.svg').resize(192, 192).toFile('icon-192x192.png');
sharp('icon.svg').resize(512, 512).toFile('icon-512x512.png');
```

## Maskable Icons

Maskable icons are used on Android devices. They have a "safe zone" in the center (80% of the icon area) where the main content should be. The outer 10% on each side may be cropped depending on the device's icon shape (circle, rounded square, etc.).

For more info: https://web.dev/maskable-icon/
