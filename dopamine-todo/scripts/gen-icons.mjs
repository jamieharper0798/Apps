import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptsDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = path.join(scriptsDir, '../public/icons/');
mkdirSync(outDir, { recursive: true });

const source = path.join(scriptsDir, 'icon-source.webp');
const APP_BG = '#0b0a14';

// Regular icons: the source image is already a finished square icon, used as-is.
for (const size of [192, 512]) {
  await sharp(source)
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
  console.log('wrote', `icon-${size}.png`);
}

await sharp(source)
  .resize(180, 180)
  .png()
  .toFile(path.join(outDir, 'apple-touch-icon.png'));
console.log('wrote', 'apple-touch-icon.png');

// Maskable icons: OS masks (circle, squircle, etc.) can crop right up to the edge,
// so shrink the icon to ~62% and center it on the app's background color.
for (const size of [192, 512]) {
  const inset = Math.round(size * 0.62);
  const resized = await sharp(source).resize(inset, inset).toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: APP_BG,
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, `icon-maskable-${size}.png`));
  console.log('wrote', `icon-maskable-${size}.png`);
}
