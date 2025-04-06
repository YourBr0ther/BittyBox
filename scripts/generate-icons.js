const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourcePath = path.join(__dirname, '../BittyBox-Icon.png');
const destinationDir = path.join(__dirname, '../public/icons');

// Ensure the destination directory exists
if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

// Generate icons for each size
async function generateIcons() {
  for (const size of iconSizes) {
    const destinationPath = path.join(destinationDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(sourcePath)
        .resize(size, size)
        .toFile(destinationPath);
      console.log(`Generated icon: ${destinationPath}`);
    } catch (error) {
      console.error(`Error generating icon ${size}x${size}:`, error);
    }
  }
  
  // Also create a maskable icon with padding
  const maskableSize = 512;
  const maskableDestination = path.join(destinationDir, `maskable-icon-512x512.png`);
  
  try {
    await sharp(sourcePath)
      .resize(Math.floor(maskableSize * 0.8), Math.floor(maskableSize * 0.8))
      .extend({
        top: Math.floor(maskableSize * 0.1),
        bottom: Math.floor(maskableSize * 0.1),
        left: Math.floor(maskableSize * 0.1),
        right: Math.floor(maskableSize * 0.1),
        background: { r: 245, g: 176, b: 206, alpha: 1 } // Pink background
      })
      .toFile(maskableDestination);
    console.log(`Generated maskable icon: ${maskableDestination}`);
  } catch (error) {
    console.error('Error generating maskable icon:', error);
  }
  
  // Create favicon.ico
  const faviconDestination = path.join(__dirname, '../public/favicon.ico');
  try {
    await sharp(sourcePath)
      .resize(32, 32)
      .toFile(faviconDestination);
    console.log(`Generated favicon: ${faviconDestination}`);
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateIcons()
  .then(() => console.log('All icons generated successfully!'))
  .catch(err => console.error('Error in icon generation:', err)); 