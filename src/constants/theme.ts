/**
 * Tempo Drumline - 2026 Design System
 * Ultra-minimal, clean, professional
 *
 * Design Philosophy:
 * - The tempo IS the interface
 * - Negative space is a feature
 * - One accent color, maximum impact
 * - Typography-first design
 * - Gesture-driven interactions
 */

// Single accent color - electric cyan that cuts through the dark
const ACCENT = '#00E5FF';

export const colors = {
  // Pure blacks for OLED
  bg: {
    primary: '#000000',
    elevated: '#0A0A0A',
    surface: '#141414',
    overlay: 'rgba(0, 0, 0, 0.85)',
  },

  // The accent - used sparingly for maximum impact
  accent: {
    primary: ACCENT,
    dim: 'rgba(0, 229, 255, 0.6)',
    glow: 'rgba(0, 229, 255, 0.15)',
    subtle: 'rgba(0, 229, 255, 0.08)',
  },

  // Playing state - warm pulse
  active: {
    primary: '#FF3D00',
    glow: 'rgba(255, 61, 0, 0.2)',
  },

  // Text hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(255, 255, 255, 0.35)',
    disabled: 'rgba(255, 255, 255, 0.2)',
  },

  // Minimal borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.12)',
  },

  // Beat indicators
  beat: {
    inactive: 'rgba(255, 255, 255, 0.15)',
    active: ACCENT,
    accent: '#FFFFFF',
  },

  // Status
  success: '#00E676',
  warning: '#FFAB00',
  error: '#FF5252',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 100,
};

// Typography - clean, modern, impactful
export const font = {
  // The hero - massive tempo display
  tempo: {
    fontSize: 144,
    fontWeight: '200' as const,
    letterSpacing: -8,
    lineHeight: 144,
  },
  // Large numbers
  large: {
    fontSize: 72,
    fontWeight: '300' as const,
    letterSpacing: -3,
  },
  // Section headers
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  // Body
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  // Small labels
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  // Tiny captions
  caption: {
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
};

// Animation timing
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    tension: 300,
    friction: 20,
  },
};

// DCI/WGI standard tempos
export const DRUMLINE_PRESETS = [
  { bpm: 120, name: '8 to 5', desc: 'Standard march' },
  { bpm: 132, name: '6 to 5', desc: 'Quick step' },
  { bpm: 144, name: 'Double', desc: 'Double time' },
  { bpm: 160, name: 'Sprint', desc: 'High energy' },
  { bpm: 180, name: 'Burner', desc: 'Maximum' },
];

// Common show tempos
export const SHOW_PRESETS = [
  { bpm: 60, name: 'Ballad' },
  { bpm: 72, name: 'Slow' },
  { bpm: 84, name: 'Medium Slow' },
  { bpm: 96, name: 'Medium' },
  { bpm: 108, name: 'Medium Fast' },
  { bpm: 120, name: 'Fast' },
  { bpm: 138, name: 'Very Fast' },
  { bpm: 152, name: 'Presto' },
];

// Subdivisions
export const SUBDIVISIONS = [
  { value: 1, symbol: '𝅘𝅥', name: 'Quarter' },
  { value: 2, symbol: '𝅘𝅥𝅮', name: 'Eighth' },
  { value: 3, symbol: '³', name: 'Triplet' },
  { value: 4, symbol: '𝅘𝅥𝅯', name: '16th' },
];

// Time signatures
export const TIME_SIGS = [
  { beats: 2, label: '2/4' },
  { beats: 3, label: '3/4' },
  { beats: 4, label: '4/4' },
  { beats: 5, label: '5/4' },
  { beats: 6, label: '6/4' },
  { beats: 7, label: '7/4' },
];

export default { colors, spacing, radius, font, animation };
