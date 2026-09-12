const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// High-fidelity SVG of the Official Geometric GIZMO ICON Logo
const mascotSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <clipPath id="squircleClip">
      <rect width="512" height="512" rx="112" ry="112"/>
    </clipPath>
  </defs>

  <!-- 1. OFFICIAL GIZMO CRIMSON SQUIRCLE APP CONTAINER -->
  <rect width="512" height="512" rx="112" ry="112" fill="#E61C3D"/>

  <!-- 2. OFFICIAL GEOMETRIC GIZMO 'G' EMBLEM -->
  <g id="gizmo-emblem" fill="#FFFFFF">
    <!-- Top-Right Apex Block -->
    <polygon points="206,82 322,82 354,168 254,168" />

    <!-- Left Slanted Ribbon & Arched Bottom Base -->
    <path d="
      M 206,82
      L 254,168
      L 136,370
      Q 256,344 382,372
      L 348,300
      L 410,300
      L 434,348
      L 362,430
      Q 256,404 152,430
      L 78,348
      Z
    " />

    <!-- Center Horizontal Crossbar of G -->
    <polygon points="228,244 326,244 348,300 198,300" />

    <!-- Right Outer Wing / Facet -->
    <polygon points="348,300 410,300 434,348 382,372" />
  </g>
</svg>`;

console.log('Writing mascot SVG & rendering all favicon sizes...');

const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// Save master SVG
fs.writeFileSync(path.join(publicDir, 'icon.svg'), mascotSvg);
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'icon.svg'), mascotSvg);
}

// Function to render PNG using resvg-js
function renderPng(size) {
  const resvg = new Resvg(mascotSvg, {
    fitTo: { mode: 'width', value: size }
  });
  return resvg.render().asPng();
}

const buf16 = renderPng(16);
const buf32 = renderPng(32);
const buf48 = renderPng(48);
const buf180 = renderPng(180);
const buf192 = renderPng(192);
const buf512 = renderPng(512);

// Function to create standard multi-size ICO
function createIco(images) {
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
    entry.writeUInt8(0, 2); // color palette count
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

const icoBuf = createIco([
  { width: 16, height: 16, buffer: buf16 },
  { width: 32, height: 32, buffer: buf32 },
  { width: 48, height: 48, buffer: buf48 },
]);

// Write to public
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), buf16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), buf32);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), buf32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), buf512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), buf512);

// Also copy to dist if dist exists
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'favicon-16x16.png'), buf16);
  fs.writeFileSync(path.join(distDir, 'favicon-32x32.png'), buf32);
  fs.writeFileSync(path.join(distDir, 'favicon.png'), buf32);
  fs.writeFileSync(path.join(distDir, 'favicon.ico'), icoBuf);
  fs.writeFileSync(path.join(distDir, 'apple-touch-icon.png'), buf180);
  fs.writeFileSync(path.join(distDir, 'pwa-192x192.png'), buf192);
  fs.writeFileSync(path.join(distDir, 'pwa-512x512.png'), buf512);
  fs.writeFileSync(path.join(distDir, 'pwa-maskable-512x512.png'), buf512);
}

console.log('Official Geometric GIZMO ICON Favicons successfully generated!');
