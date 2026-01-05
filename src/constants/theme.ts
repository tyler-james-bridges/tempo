/**
 * Tempo Drumline - Design System
 * A professional metronome for drum corps and WGI drumline groups
 *
 * Modern, sleek design inspired by Pro Metronome and Dropspin
 */

export const colors = {
  // Core background
  background: {
    primary: '#0A0A0F',      // Deep dark for OLED
    secondary: '#12121A',     // Slightly lighter
    tertiary: '#1A1A24',      // Card backgrounds
    elevated: '#22222E',      // Elevated surfaces
  },

  // Primary accent - Electric Cyan
  accent: {
    primary: '#00D4FF',       // Main accent
    secondary: '#00A3CC',     // Darker variant
    tertiary: '#007A99',      // Even darker
    glow: 'rgba(0, 212, 255, 0.3)',
    subtle: 'rgba(0, 212, 255, 0.1)',
  },

  // Secondary accent - Pulse Orange (for active states)
  pulse: {
    primary: '#FF6B35',       // Active/playing state
    secondary: '#CC5529',     // Darker
    glow: 'rgba(255, 107, 53, 0.4)',
    subtle: 'rgba(255, 107, 53, 0.15)',
  },

  // Accent colors for subdivisions
  subdivision: {
    quarter: '#00D4FF',       // Cyan
    eighth: '#00FF94',        // Green
    triplet: '#FFD600',       // Yellow
    sixteenth: '#FF00D4',     // Magenta
  },

  // Status colors
  status: {
    success: '#00FF94',
    warning: '#FFD600',
    error: '#FF4757',
    info: '#00D4FF',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    muted: 'rgba(255, 255, 255, 0.3)',
  },

  // Border colors
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(255, 255, 255, 0.05)',
    accent: 'rgba(0, 212, 255, 0.3)',
    glow: 'rgba(0, 212, 255, 0.5)',
  },

  // Bluetooth/connection colors
  bluetooth: {
    connected: '#00FF94',
    connecting: '#FFD600',
    disconnected: 'rgba(255, 255, 255, 0.3)',
    searching: '#00D4FF',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Large display for tempo
  tempo: {
    fontSize: 120,
    fontWeight: '100' as const,
    letterSpacing: -6,
  },
  // Medium display for beat count
  display: {
    fontSize: 64,
    fontWeight: '200' as const,
    letterSpacing: -2,
  },
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  // Labels and captions
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
};

// DCI/WGI standard tempos
export const DRUMLINE_TEMPOS = {
  // Standard drill tempos
  drill: [
    { tempo: 120, label: 'March Tempo', description: 'Standard 8-to-5' },
    { tempo: 132, label: 'Quick March', description: '6-to-5 step' },
    { tempo: 144, label: 'Double Time', description: 'Fast 8-to-5' },
    { tempo: 160, label: 'Sprint Tempo', description: 'High intensity' },
    { tempo: 180, label: 'Burner', description: 'Max speed' },
  ],
  // Common show tempos
  show: [
    { tempo: 60, label: 'Ballad', description: 'Slow, expressive' },
    { tempo: 72, label: 'Adagio', description: 'Slow, graceful' },
    { tempo: 80, label: 'Andante', description: 'Walking pace' },
    { tempo: 96, label: 'Moderato', description: 'Moderate' },
    { tempo: 108, label: 'Allegretto', description: 'Light, brisk' },
    { tempo: 120, label: 'Allegro', description: 'Fast, bright' },
    { tempo: 138, label: 'Vivace', description: 'Lively' },
    { tempo: 152, label: 'Presto', description: 'Very fast' },
  ],
  // Practice tempos
  practice: [
    { tempo: 40, label: 'Slow Practice', description: 'Detail work' },
    { tempo: 60, label: 'Medium Slow', description: 'Building speed' },
    { tempo: 80, label: 'Medium', description: 'Comfortable' },
    { tempo: 100, label: 'Medium Fast', description: 'Challenge' },
    { tempo: 120, label: 'Performance', description: 'Show speed' },
  ],
};

// Subdivision patterns for drumline
export const SUBDIVISION_PATTERNS = {
  basic: [
    { id: 1, label: '♩', name: 'Quarter', description: '1 per beat' },
    { id: 2, label: '♪♪', name: 'Eighth', description: '2 per beat' },
    { id: 3, label: '♪³', name: 'Triplet', description: '3 per beat' },
    { id: 4, label: '♬', name: 'Sixteenth', description: '4 per beat' },
  ],
  advanced: [
    { id: 5, label: '♪⁵', name: 'Quintuplet', description: '5 per beat' },
    { id: 6, label: '♪⁶', name: 'Sextuplet', description: '6 per beat' },
  ],
};

// Time signatures common in drumline
export const TIME_SIGNATURES = [
  { beats: 2, subdivision: 4, label: '2/4' },
  { beats: 3, subdivision: 4, label: '3/4' },
  { beats: 4, subdivision: 4, label: '4/4' },
  { beats: 5, subdivision: 4, label: '5/4' },
  { beats: 6, subdivision: 4, label: '6/4' },
  { beats: 7, subdivision: 4, label: '7/4' },
  { beats: 6, subdivision: 8, label: '6/8' },
  { beats: 9, subdivision: 8, label: '9/8' },
  { beats: 12, subdivision: 8, label: '12/8' },
];

// Metronome sounds optimized for drumline
export const SOUND_PRESETS = {
  rimshot: {
    label: 'Rimshot',
    icon: '🥁',
    description: 'Sharp, cutting click',
  },
  woodblock: {
    label: 'Woodblock',
    icon: '🪵',
    description: 'Classic metronome',
  },
  hihat: {
    label: 'Hi-Hat',
    icon: '🎤',
    description: 'Soft, musical',
  },
  cowbell: {
    label: 'Cowbell',
    icon: '🔔',
    description: 'Loud, piercing',
  },
  beep: {
    label: 'Digital',
    icon: '📻',
    description: 'Electronic beep',
  },
  voice: {
    label: 'Count',
    icon: '🗣️',
    description: 'Voice count-off',
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  DRUMLINE_TEMPOS,
  SUBDIVISION_PATTERNS,
  TIME_SIGNATURES,
  SOUND_PRESETS,
};
