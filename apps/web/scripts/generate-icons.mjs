import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_ICON = path.join(
  __dirname,
  '../../../ios/tempomonorepo/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png'
);
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

const SIZES = [192, 512];

async function generateIcons() {
  console.log('Generating PWA icons from:', SOURCE_ICON);
  console.log('Output directory:', OUTPUT_DIR);

  for (const size of SIZES) {
    // Standard icon
    await sharp(SOURCE_ICON)
      .resize(size, size)
      .png()
      .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);

    // Maskable icon (with safe zone - content at 80% of icon size)
    const padding = Math.round(size * 0.1); // 10% padding on each side
    const contentSize = size - padding * 2;

    await sharp(SOURCE_ICON)
      .resize(contentSize, contentSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 232, g: 145, b: 58, alpha: 1 }, // #E8913A - accent color
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`));
    console.log(`Generated icon-maskable-${size}x${size}.png`);
  }

  console.log('Done!');
}

generateIcons().catch(console.error);
