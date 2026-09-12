const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

/**
 * Official Gizmo Monogram Logo (GIZMO ICON.png)
 * 
 * Composition:
 * - Crimson Red Squircle container (#EE1D45)
 * - Pure White Geometric Stylized 'G' with precise faceted ribbon geometry
 */
function generateGizmoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Crimson Red Squircle Base -->
  <rect width="512" height="512" rx="112" ry="112" fill="#EE1D45" />

  <!-- Master White Geometric 'G' Monogram -->
  <g id="gizmo-g-logo">
    <!-- 1. Top Crown / Upper Diagonal Chevron -->
    <!-- Top-Right Slanted Bar (Forms the upper apex of the G) -->
    <polygon points="196,82 290,82 356,168 262,168" fill="#FFFFFF" />

    <!-- 2. Main Outer Ribbon (Left Leg & Bottom Swoop) -->
    <!-- Starts from top-left, slants down-left to corner, points down-right, swoops across bottom, corners up-right -->
    <path d="
      M 196,82
      L 78,348
      L 152,430
      C 190,402 230,388 256,388
      C 282,388 322,402 360,430
      L 434,348
      L 350,300
      L 380,370
      C 346,346 304,332 256,332
      C 208,332 166,346 138,370
      L 220,186
      L 262,168
      L 196,82
      Z
    " fill="#FFFFFF" />

    <!-- 3. Horizontal Middle Crossbar -->
    <polygon points="220,244 326,244 350,300 196,300" fill="#FFFFFF" />

    <!-- 4. Lower-Right Isometric Facet (Folding ribbon effect) -->
    <polygon points="350,300 434,348 380,370" fill="#FFFFFF" opacity="0.82" />
  </g>
</svg>`;
}

const svg = generateGizmoSvg();
fs.writeFileSync(path.join(__dirname, 'test-gizmo-icon.svg'), svg);
console.log('Generated test-gizmo-icon.svg');
