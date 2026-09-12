const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

/**
 * Official Gizmo Monogram Logo (GIZMO ICON.png)
 * 
 * Composition:
 * - Crimson Red Squircle container (#ED1C44 / #EE1D45)
 * - Pure White Geometric Stylized 'G' with precise faceted ribbon geometry
 */
const gizmoOfficialSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <clipPath id="squircle-clip">
      <rect width="512" height="512" rx="114" ry="114" />
    </clipPath>
  </defs>

  <!-- Red Squircle Base -->
  <rect width="512" height="512" rx="114" ry="114" fill="#EE1D45" />

  <!-- Master White Geometric 'G' Monogram -->
  <g id="gizmo-g-monogram" clip-path="url(#squircle-clip)">
    <!-- 1. Top Crown Cap (Trapezoid at top apex) -->
    <polygon points="198,82 290,82 354,168 262,168" fill="#FFFFFF" />

    <!-- 2. Main Outer Ribbon (Left Slanted Diagonal, Bottom-Left Wing, Bottom Wave & Inner Arch) -->
    <path d="
      M 198,82
      L 78,348
      L 152,430
      C 192,404 230,392 256,392
      C 282,392 320,404 360,430
      L 434,348
      L 352,300
      L 378,370
      C 346,348 304,334 256,334
      C 208,334 166,348 138,370
      L 220,188
      L 262,168
      L 198,82
      Z
    " fill="#FFFFFF" />

    <!-- 3. Horizontal Center Crossbar -->
    <polygon points="220,244 326,244 352,300 196,300" fill="#FFFFFF" />

    <!-- 4. Lower-Right Isometric Folding Ribbon Facet -->
    <polygon points="352,300 434,348 378,370" fill="#FFFFFF" opacity="0.80" />
  </g>
</svg>`;

console.log('Rendering all favicon sizes from Official GIZMO ICON logo...');

const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// Save master vector SVG
fs.writeFileSync(path.join(publicDir, 'icon.svg'), gizmoOfficialSvg);
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'icon.svg'), gizmoOfficialSvg);
}

// Function to render PNG using resvg-js with crisp anti-aliasing
function renderPng(size) {
  const resvg = new Resvg(gizmoOfficialSvg, {
    fitTo: { mode: 'width', value: size },
    shapeRendering: 2, // geometricPrecision
    imageRendering: 1, // optimizeQuality
  });
  return resvg.render().asPng();
}

const buf16 = renderPng(16);
const buf32 = renderPng(32);
const buf48 = renderPng(48);
const buf180 = renderPng(180);
const buf192 = renderPng(192);
const buf512 = renderPng(512);

// Function to create standard Windows/Browser multi-resolution ICO file
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

// Write to public folder
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), buf16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), buf32);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), buf32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), buf512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), buf512);

// Write to dist folder if it exists
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

console.log('✅ Official GIZMO ICON Favicons and App Icons generated successfully in all sizes: 16, 32, 48, 180, 192, 512 + multi-res ICO!');
