const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

/**
 * Master SVG of the Official Gizmo Character Mascot (GIZMO ICON 02.png)
 * Exact composition:
 * - Red Squircle container (rx/ry=112 on 512x512)
 * - Green curly hair with layered lobes and highlights
 * - Peach skin face with ears
 * - Big cartoon eyes with dark green iris & white specular highlight
 * - Thick arched dark green eyebrows
 * - Nose contour, mouth smirk, chin crease, and light stipple stubble
 */
const mascotSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <clipPath id="squircle">
      <rect width="512" height="512" rx="112" ry="112" />
    </clipPath>
    <radialGradient id="irisGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#2D7A52"/>
      <stop offset="50%" stop-color="#144C32"/>
      <stop offset="100%" stop-color="#082B1B"/>
    </radialGradient>
    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#185638"/>
      <stop offset="100%" stop-color="#0B3722"/>
    </linearGradient>
    <pattern id="stipple" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.65" fill="#1C3829" opacity="0.35"/>
      <circle cx="5" cy="5" r="0.55" fill="#1C3829" opacity="0.25"/>
    </pattern>
  </defs>

  <!-- 1. RED SQUIRCLE BACKGROUND -->
  <rect width="512" height="512" rx="112" ry="112" fill="#E81C43" />

  <g id="gizmo-mascot" transform="translate(0, 10)">
    <!-- 2. BACK / NAPE CURLS (behind head and ears) -->
    <!-- Left Bottom Nape Curls -->
    <path d="M 130 380 C 120 410, 140 435, 165 425 C 150 405, 140 385, 130 380 Z" fill="#0A321F" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
    <path d="M 148 400 C 140 435, 175 450, 195 435 C 180 415, 160 405, 148 400 Z" fill="#0A321F" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
    
    <!-- Right Bottom Nape Curls -->
    <path d="M 382 380 C 392 410, 372 435, 347 425 C 362 405, 372 385, 382 380 Z" fill="#0A321F" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
    <path d="M 364 400 C 372 435, 337 450, 317 435 C 332 415, 352 405, 364 400 Z" fill="#0A321F" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
    
    <!-- Under Chin Nape Base -->
    <path d="M 180 415 C 210 448, 302 448, 332 415 C 290 440, 222 440, 180 415 Z" fill="#0A321F" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>

    <!-- 3. EARS (Behind front hair, attached to face) -->
    <!-- Left Ear -->
    <g id="left-ear">
      <path d="M 142 280 C 85 285, 80 370, 145 365" fill="#F8E7D1" stroke="#051C11" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 116 308 C 100 325, 115 348, 134 340" fill="none" stroke="#051C11" stroke-width="6" stroke-linecap="round"/>
      <path d="M 125 320 C 130 330, 138 332, 142 330" fill="none" stroke="#051C11" stroke-width="5" stroke-linecap="round"/>
    </g>

    <!-- Right Ear -->
    <g id="right-ear">
      <path d="M 370 280 C 427 285, 432 370, 367 365" fill="#F8E7D1" stroke="#051C11" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 396 308 C 412 325, 397 348, 378 340" fill="none" stroke="#051C11" stroke-width="6" stroke-linecap="round"/>
      <path d="M 387 320 C 382 330, 374 332, 370 330" fill="none" stroke="#051C11" stroke-width="5" stroke-linecap="round"/>
    </g>

    <!-- 4. FACE BASE & JAW -->
    <path d="M 142 220 C 135 320, 155 410, 256 450 C 357 410, 377 320, 370 220 C 330 180, 182 180, 142 220 Z" 
          fill="#F8E7D1" stroke="#051C11" stroke-width="8" stroke-linejoin="round" />

    <!-- 5. STUBBLE / SHADOW TEXTURE (Chin & upper lip area) -->
    <!-- Chin/Jaw Stipple Zone -->
    <path d="M 180 340 C 180 400, 205 435, 256 440 C 307 435, 332 400, 332 340 C 332 375, 305 410, 256 415 C 207 410, 180 375, 180 340 Z" fill="url(#stipple)"/>
    <path d="M 195 365 C 215 390, 297 390, 317 365 C 310 395, 280 418, 256 418 C 232 418, 202 395, 195 365 Z" fill="url(#stipple)"/>

    <!-- 6. TOP & SURROUNDING CURLY HAIR MASS (Lush Green Curls) -->
    <g id="main-hair">
      <!-- Back main crown silhouette -->
      <path d="
        M 130 250
        C 90 230, 85 160, 130 130
        C 105 85, 160 50, 205 75
        C 225 35, 287 35, 307 75
        C 352 50, 407 85, 382 130
        C 427 160, 422 230, 382 250
        C 415 285, 395 330, 375 335
        C 365 240, 340 180, 256 175
        C 172 180, 147 240, 137 335
        C 117 330, 97 285, 130 250 Z
      " fill="url(#hairGrad)" stroke="#051C11" stroke-width="8" stroke-linejoin="round"/>

      <!-- Individual Distinct Curly Lobes with Highlights -->
      <!-- Left side curl clusters -->
      <path d="M 98 178 C 88 140, 128 115, 155 132 C 122 135, 105 155, 98 178 Z" fill="#0C3E25" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <path d="M 92 230 C 80 190, 120 170, 142 195 C 115 198, 98 212, 92 230 Z" fill="#0C3E25" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <path d="M 108 280 C 95 245, 135 230, 150 255 C 128 258, 115 268, 108 280 Z" fill="#0C3E25" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>

      <!-- Right side curl clusters -->
      <path d="M 414 178 C 424 140, 384 115, 357 132 C 390 135, 407 155, 414 178 Z" fill="#0C3E25" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <path d="M 420 230 C 432 190, 392 170, 370 195 C 397 198, 414 212, 420 230 Z" fill="#0C3E25" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <path d="M 404 280 C 417 245, 377 230, 362 255 C 384 258, 397 268, 404 280 Z" fill="#0C3E25" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>

      <!-- Top Crown Curl Tufts -->
      <path d="M 150 115 C 145 65, 205 50, 225 90 C 195 82, 165 92, 150 115 Z" fill="#1B623E" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <path d="M 215 75 C 235 30, 290 35, 295 80 C 270 65, 238 68, 215 75 Z" fill="#1B623E" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <path d="M 285 75 C 310 40, 365 55, 360 105 C 340 85, 310 82, 285 75 Z" fill="#1B623E" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <path d="M 335 105 C 380 90, 405 135, 380 165 C 382 140, 360 120, 335 105 Z" fill="#1B623E" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>

      <!-- Inner Hair Detail Swirls -->
      <path d="M 240 100 C 265 110, 285 145, 260 165 C 245 145, 245 120, 240 100 Z" fill="none" stroke="#051C11" stroke-width="7" stroke-linecap="round"/>
      <path d="M 315 130 C 340 145, 345 175, 325 190" fill="none" stroke="#051C11" stroke-width="6" stroke-linecap="round"/>
      <path d="M 195 130 C 170 145, 165 175, 185 190" fill="none" stroke="#051C11" stroke-width="6" stroke-linecap="round"/>

      <!-- 7. FOREHEAD CURL LOCK (Distinctive Center-Right Curl on Forehead) -->
      <path d="M 272 165 C 295 160, 335 180, 330 215 C 322 235, 305 230, 308 215 C 312 195, 288 185, 272 182" 
            fill="#0E432A" stroke="#051C11" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 310 205 C 322 195, 328 215, 318 222 C 312 225, 308 215, 310 205 Z" fill="#1B623E"/>

      <!-- Front Hairline Wavy Outline -->
      <path d="
        M 148 235
        C 145 200, 180 185, 205 198
        C 225 180, 265 175, 290 195
        C 315 185, 355 198, 364 235
      " fill="none" stroke="#051C11" stroke-width="8" stroke-linecap="round"/>
    </g>

    <!-- 8. EYEBROWS (Thick, Dark Green, Expressive) -->
    <!-- Left Eyebrow -->
    <path d="M 168 248 C 185 224, 230 226, 246 250 C 228 238, 188 238, 168 248 Z" 
          fill="#072B1A" stroke="#051C11" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
    <!-- Right Eyebrow -->
    <path d="M 266 250 C 282 226, 327 224, 344 248 C 324 238, 284 238, 266 250 Z" 
          fill="#072B1A" stroke="#051C11" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>

    <!-- 9. EYES (Large, expressive anime-cartoon eyes) -->
    <!-- Left Eye -->
    <g id="left-eye">
      <!-- Sclera / White -->
      <path d="M 172 292 C 172 262, 238 262, 238 292 C 238 322, 172 322, 172 292 Z" 
            fill="#FFFFFF" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <!-- Iris -->
      <ellipse cx="205" cy="292" rx="20" ry="24" fill="url(#irisGrad)" stroke="#051C11" stroke-width="3"/>
      <!-- Pupil -->
      <ellipse cx="205" cy="292" rx="12" ry="15" fill="#04120B"/>
      <!-- Specular Reflection Highlight -->
      <circle cx="197" cy="282" r="6" fill="#FFFFFF"/>
      <circle cx="212" cy="298" r="2.5" fill="#FFFFFF" opacity="0.85"/>
      <!-- Eyelid Crease Above -->
      <path d="M 180 262 C 195 255, 218 255, 230 262" fill="none" stroke="#051C11" stroke-width="4.5" stroke-linecap="round"/>
    </g>

    <!-- Right Eye -->
    <g id="right-eye">
      <!-- Sclera / White -->
      <path d="M 274 292 C 274 262, 340 262, 340 292 C 340 322, 274 322, 274 292 Z" 
            fill="#FFFFFF" stroke="#051C11" stroke-width="7" stroke-linejoin="round"/>
      <!-- Iris -->
      <ellipse cx="307" cy="292" rx="20" ry="24" fill="url(#irisGrad)" stroke="#051C11" stroke-width="3"/>
      <!-- Pupil -->
      <ellipse cx="307" cy="292" rx="12" ry="15" fill="#04120B"/>
      <!-- Specular Reflection Highlight -->
      <circle cx="299" cy="282" r="6" fill="#FFFFFF"/>
      <circle cx="314" cy="298" r="2.5" fill="#FFFFFF" opacity="0.85"/>
      <!-- Eyelid Crease Above -->
      <path d="M 282 262 C 294 255, 317 255, 332 262" fill="none" stroke="#051C11" stroke-width="4.5" stroke-linecap="round"/>
    </g>

    <!-- 10. NOSE -->
    <g id="nose">
      <path d="M 254 280 L 246 338 C 248 348, 264 348, 270 338" 
            fill="none" stroke="#051C11" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- 11. MOUTH (Friendly Asymmetrical Smirk) -->
    <g id="mouth">
      <!-- Upper Lip Smile Curve -->
      <path d="M 218 368 C 242 374, 280 372, 298 355" 
            fill="none" stroke="#051C11" stroke-width="7.5" stroke-linecap="round"/>
      <!-- Right corner smirk tick -->
      <path d="M 296 353 C 299 356, 303 360, 301 364" 
            fill="none" stroke="#051C11" stroke-width="6" stroke-linecap="round"/>
      <!-- Lower Lip Shadow -->
      <path d="M 242 388 C 254 394, 272 392, 280 388" 
            fill="none" stroke="#051C11" stroke-width="5.5" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

console.log('Rendering all favicon sizes from master Official Gizmo Character Logo...');

const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// Save master vector SVG
fs.writeFileSync(path.join(publicDir, 'icon.svg'), mascotSvg);
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'icon.svg'), mascotSvg);
}

// Function to render PNG using resvg-js with crisp anti-aliasing
function renderPng(size) {
  const resvg = new Resvg(mascotSvg, {
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

console.log('✅ Official Gizmo Mascot Character Favicons generated successfully in all sizes: 16, 32, 48, 180, 192, 512 + multi-res ICO!');
