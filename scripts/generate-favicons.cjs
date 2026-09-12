const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Math SDF for squircle rounded rectangle
function sdRoundBox(x, y, cx, cy, halfW, halfH, r) {
  const dx = Math.abs(x - cx) - (halfW - r);
  const dy = Math.abs(y - cy) - (halfH - r);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  const outsideDist = Math.sqrt(ax * ax + ay * ay);
  const insideDist = Math.min(Math.max(dx, dy), 0);
  return outsideDist + insideDist - r;
}

// Check if (x, y) is inside the bold geometric 'G' in normalized coordinates [0, 512]
function insideG(x, y) {
  const cx = 256;
  const cy = 256;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Outer radius 86, inner radius 46 (thickness = 40)
  const angle = Math.atan2(dy, dx); // -PI to +PI

  // Opening on the right side: angle between -0.75 rad and +0.70 rad
  const isRightOpening = (angle > -0.75 && angle < 0.70);

  // Crossbar & right vertical stem
  const inStem = (x >= 278 && x <= 322 && y >= 250 && y <= 320);
  const inBar = (x >= 240 && x <= 320 && y >= 244 && y <= 282);

  if (inStem || inBar) return true;

  if (dist <= 88 && dist >= 46) {
    if (!isRightOpening) return true;
  }
  return false;
}

function renderIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const scale = 512 / size;

  // Maskable icons require extra padding (safe area is 80% circle in center)
  const contentScale = isMaskable ? 0.75 : 0.94;
  const offset = (1 - contentScale) * 256;

  // Supersampling 4x4 (16 samples per pixel)
  const SAMPLES = 4;
  const step = 1 / SAMPLES;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;

      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const rawX = (px + (sx + 0.5) * step) * scale;
          const rawY = (py + (sy + 0.5) * step) * scale;

          // Normalized centered coords
          const normX = (rawX - offset) / contentScale;
          const normY = (rawY - offset) / contentScale;

          // Outer squircle boundary
          let bgAlpha = 0;
          if (isMaskable) {
            // Fill entire canvas for maskable icon
            bgAlpha = 1;
          } else {
            const dBox = sdRoundBox(rawX, rawY, 256, 256, 246, 246, size <= 32 ? 50 : 80);
            bgAlpha = Math.max(0, Math.min(1, 0.5 - dBox / scale));
          }

          if (bgAlpha <= 0) {
            continue;
          }

          // Default background: Obsidian black #09090b
          let pixR = 9, pixG = 9, pixB = 11;

          // Subtle coral border ring around squircle (opacity 0.25)
          const dBorder = Math.abs(sdRoundBox(rawX, rawY, 256, 256, 220, 220, 60)) - 4;
          if (dBorder < 0) {
            const ringMix = Math.max(0, Math.min(0.25, 0.25 * (1 - dBorder / -4)));
            pixR = Math.round(pixR * (1 - ringMix) + 255 * ringMix);
            pixG = Math.round(pixG * (1 - ringMix) + 87 * ringMix);
            pixB = Math.round(pixB * (1 - ringMix) + 56 * ringMix);
          }

          // Center circle: Coral Red #FF5738 (radius ~ 160 in 512 canvas)
          const dCircle = Math.sqrt((normX - 256) ** 2 + (normY - 256) ** 2) - 160;
          const circleAlpha = Math.max(0, Math.min(1, 0.5 - dCircle / (scale / contentScale)));

          if (circleAlpha > 0) {
            // Coral Red: #FF5738 -> rgb(255, 87, 56)
            pixR = Math.round(pixR * (1 - circleAlpha) + 255 * circleAlpha);
            pixG = Math.round(pixG * (1 - circleAlpha) + 87 * circleAlpha);
            pixB = Math.round(pixB * (1 - circleAlpha) + 56 * circleAlpha);

            // Bold 'G' glyph in white: #FFFFFF
            if (insideG(normX, normY)) {
              pixR = 255;
              pixG = 255;
              pixB = 255;
            }
          }

          rSum += pixR * bgAlpha;
          gSum += pixG * bgAlpha;
          bSum += pixB * bgAlpha;
          aSum += bgAlpha;
        }
      }

      const totalSamples = SAMPLES * SAMPLES;
      const finalA = Math.round((aSum / totalSamples) * 255);
      const finalR = finalA > 0 ? Math.round(rSum / aSum) : 0;
      const finalG = finalA > 0 ? Math.round(gSum / aSum) : 0;
      const finalB = finalA > 0 ? Math.round(bSum / aSum) : 0;

      const pIdx = (py * size + px) * 4;
      png.data[pIdx] = finalR;
      png.data[pIdx + 1] = finalG;
      png.data[pIdx + 2] = finalB;
      png.data[pIdx + 3] = finalA;
    }
  }

  return PNG.sync.write(png);
}

function createIco(images) {
  // images: array of { width, height, buffer }
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  let offset = 6 + count * 16;

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color palette count (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map((img) => img.buffer)]);
}

console.log('Generating high-fidelity Gizmo favicons & icons...');

const buf16 = renderIcon(16);
const buf32 = renderIcon(32);
const buf48 = renderIcon(48);
const buf180 = renderIcon(180);
const buf192 = renderIcon(192);
const buf512 = renderIcon(512);
const bufMaskable512 = renderIcon(512, true);

const icoBuf = createIco([
  { width: 16, height: 16, buffer: buf16 },
  { width: 32, height: 32, buffer: buf32 },
  { width: 48, height: 48, buffer: buf48 },
]);

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), buf16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), buf32);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), buf32);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), buf512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), bufMaskable512);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

console.log('Favicons and touch icons generated successfully!');
