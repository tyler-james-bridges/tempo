/**
 * TempoMap - 2026 Design System
 * Ultra-minimal, clean, professional - App Store Premium Quality
 *
 * Design Philosophy:
 * - The tempo IS the interface
 * - Generous negative space for visual breathing room
 * - Single accent color (Deep Marigold), maximum impact
 * - Typography-first design with clear hierarchy
 * - Gesture-driven interactions
 * - WCAG AA+ accessibility compliant
 * - Minimum 44px touch targets (iOS HIG)
 * - Consistent spacing using 4px/8px grid
 *
 * Design aligned with TempoMap web app for brand consistency
 */

// Primary accent - Deep Marigold (matches web app)
const ACCENT = '#E8913A';
const ACCENT_HOVER = '#D4822E';
const ACCENT_ACTIVE = '#C67520';

export const colors = {
  // Pure blacks for OLED displays - saves battery, looks premium
  bg: {
    primary: '#000000',
    elevated: '#0A0A0A',
    surface: '#141414',
    card: '#1A1A1A',          // For cards/panels needing more contrast
    overlay: 'rgba(0, 0, 0, 0.85)',
  },

  // Accent - Deep Marigold, used sparingly for maximum visual impact
  accent: {
    primary: ACCENT,
    hover: ACCENT_HOVER,      // For pressed states
    active: ACCENT_ACTIVE,    // For active/selected states
    bright: '#F5A04D',        // Lighter variant for highlights
    dim: 'rgba(232, 145, 58, 0.6)',
    glow: 'rgba(232, 145, 58, 0.15)',
    subtle: 'rgba(232, 145, 58, 0.08)',
    muted: 'rgba(232, 145, 58, 0.12)', // Matches web --accent-primary-muted
  },

  // Active/Playing state - uses same marigold for consistency
  active: {
    primary: ACCENT,
    bright: '#F5A04D',
    glow: 'rgba(232, 145, 58, 0.2)',
  },

  // Text hierarchy - WCAG AA compliant contrast ratios
  text: {
    primary: '#FFFFFF',           // 21:1 contrast - headings, important content
    secondary: 'rgba(255, 255, 255, 0.87)', // 15:1 contrast - body text
    tertiary: 'rgba(255, 255, 255, 0.6)',   // 9:1 contrast - labels, meta
    disabled: 'rgba(255, 255, 255, 0.38)',  // 5:1 contrast - decorative only
    muted: 'rgba(255, 255, 255, 0.5)',      // Additional muted state
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

  // Semantic colors - clear visual feedback (aligned with web)
  success: '#16A34A',
  successMuted: 'rgba(22, 163, 74, 0.15)',
  warning: '#CA8A04',
  warningMuted: 'rgba(202, 138, 4, 0.15)',
  error: '#DC2626',
  errorMuted: 'rgba(220, 38, 38, 0.15)',
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
