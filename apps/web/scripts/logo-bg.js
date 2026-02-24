// Replace black background with midnight blue (#193e6b)
// Run: node scripts/logo-bg.js

import sharp from 'sharp';

const MIDNIGHT = [25, 62, 107]; // #193e6b

const input = 'public/logo.png';
const output = 'public/logo.png';

const img = sharp(input);
const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3] ?? 255;
  // Replace dark/black pixels (background) with midnight blue
  if (r < 40 && g < 40 && b < 40 && a > 200) {
    data[i] = MIDNIGHT[0];
    data[i + 1] = MIDNIGHT[1];
    data[i + 2] = MIDNIGHT[2];
  }
}

await sharp(Buffer.from(data), { raw: { width, height, channels } })
  .png()
  .toFile(output);

console.log('Logo background updated to midnight blue.');
