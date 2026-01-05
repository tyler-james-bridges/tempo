/**
 * Tempo Drumline - 2026 Design System
 * Ultra-minimal, clean, professional - App Store Premium Quality
 *
 * Design Philosophy:
 * - The tempo IS the interface
 * - Generous negative space for visual breathing room
 * - Single accent color, maximum impact
 * - Typography-first design with clear hierarchy
 * - Gesture-driven interactions
 * - WCAG AA+ accessibility compliant
 * - Minimum 44px touch targets (iOS HIG)
 * - Consistent spacing using 4px/8px grid
 */

// Primary accent - electric cyan with excellent contrast on dark
const ACCENT = '#00E5FF';

export const colors = {
  // Pure blacks for OLED displays - saves battery, looks premium
  bg: {
    primary: '#000000',
    elevated: '#0C0C0C',
    surface: '#161616',
    card: '#1A1A1A',          // For cards/panels needing more contrast
    overlay: 'rgba(0, 0, 0, 0.9)',
  },

  // Accent - used sparingly for maximum visual impact
  accent: {
    primary: ACCENT,
    bright: '#33EBFF',        // For hover/pressed states
    dim: 'rgba(0, 229, 255, 0.5)',
    glow: 'rgba(0, 229, 255, 0.12)',
    subtle: 'rgba(0, 229, 255, 0.06)',
  },

  // Active/Playing state - warm orange pulse
  active: {
    primary: '#FF5722',
    bright: '#FF7043',
    glow: 'rgba(255, 87, 34, 0.18)',
  },

  // Text hierarchy - WCAG AA compliant contrast ratios
  text: {
    primary: '#FFFFFF',           // 21:1 contrast - headings, important content
    secondary: 'rgba(255, 255, 255, 0.87)', // 15:1 contrast - body text
    tertiary: 'rgba(255, 255, 255, 0.6)',   // 9:1 contrast - labels, meta
    disabled: 'rgba(255, 255, 255, 0.38)',  // 5:1 contrast - decorative only
  },

  // Borders - subtle but visible for separation
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.25)',  // For focused/active states
  },

  // Beat indicators - high visibility
  beat: {
    inactive: 'rgba(255, 255, 255, 0.3)',
    active: ACCENT,
    accent: '#FFFFFF',
  },

  // Semantic colors - clear visual feedback
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF5252',
};

// Spacing based on 4px grid - use consistently throughout the app
export const spacing = {
  xs: 4,    // Tight spacing, inner padding
  sm: 8,    // Standard gap between related elements
  md: 16,   // Section padding, medium gaps
  lg: 24,   // Card padding, section spacing
  xl: 32,   // Large section gaps
  xxl: 48,  // Major section separation
  xxxl: 64, // Hero spacing
};

// Touch target sizes - iOS HIG compliance
export const touchTarget = {
  min: 44,    // Minimum touch target (iOS HIG)
  comfortable: 48, // Comfortable touch target
  large: 56,  // Large button (primary actions)
};

export const radius = {
  xs: 4,    // Subtle rounding (badges)
  sm: 8,    // Standard chips, small buttons
  md: 12,   // Cards, input fields
  lg: 20,   // Large cards, modals
  xl: 28,   // Bottom sheets, drawers
  pill: 100, // Fully rounded (toggle switches, pills)
};

// Typography - clean, modern, impactful
// Uses system font stack for optimal rendering
// All sizes are accessible (minimum 12px for readability)
export const font = {
  // Hero tempo display - thin weight for elegance
  tempo: {
    fontSize: 96,
    fontWeight: '200' as const,
    letterSpacing: -4,
    lineHeight: 96,
  },
  // Large numbers for secondary displays
  large: {
    fontSize: 56,
    fontWeight: '300' as const,
    letterSpacing: -2,
  },
  // Section headers - prominent but not overwhelming
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  // Secondary headers
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  // Body text - comfortable reading size
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  // Smaller body text
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  // Section labels - uppercase, tracking
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  // Captions and helper text
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  // Small text - minimum readable size
  small: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
};

// Animation timing - smooth, responsive feel
export const animation = {
  instant: 100, // Immediate feedback
  fast: 150,    // Quick transitions
  normal: 250,  // Standard transitions
  slow: 400,    // Emphasis transitions
  spring: {
    // Default spring for modals/drawers
    tension: 300,
    friction: 20,
  },
  springBouncy: {
    // More playful spring
    tension: 400,
    friction: 15,
  },
  springGentle: {
    // Subtle, professional spring
    tension: 200,
    friction: 25,
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

export default { colors, spacing, touchTarget, radius, font, animation };
