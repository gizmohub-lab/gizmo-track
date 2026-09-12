/**
 * Centralized Gizmo Portal Theme System
 * Primary Brand & UI Accent: #EE1D45
 */

export const GIZMO_THEME = {
  // Primary brand accent
  accent: '#EE1D45',
  accentHover: '#D8143C',
  accentActive: '#B80D30',

  // Light tints for selected cards, badges, pill backgrounds
  accentLight: '#FFF0F3',
  accentLighter: '#FFF5F7',
  accentBorder: '#FFB8C5',

  // Subtle glows and overlay masks
  accentGlow: 'rgba(238, 29, 69, 0.15)',
  accentMuted: 'rgba(238, 29, 69, 0.08)',
  accentSelection: '#EE1D45',
} as const;

export default GIZMO_THEME;
