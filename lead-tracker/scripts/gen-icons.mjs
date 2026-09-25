// Renders public/icons/*.png from scripts/icon.svg. Requires sharp: `npm install -D sharp`.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('./icon.svg', import.meta.url));
const out = (name) => new URL(`../public/icons/${name}`, import.meta.url).pathname;

for (const size of [192, 512]) await sharp(svg).resize(size, size).png().toFile(out(`icon-${size}.png`));
await sharp(svg).resize(180, 180).flatten({ background: '#0b0e13' }).png().toFile(out('apple-touch-icon.png'));

// Maskable: full-bleed background with the artwork inset into the safe zone.
const inner = await sharp(svg).resize(384, 384).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#10b981' } })
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(out('icon-maskable-512.png'));
