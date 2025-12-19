import { MetronomeConfig, ClickSound } from '../types/metronome';

export const METRONOME_CONFIG: MetronomeConfig = {
  minTempo: 30,
  maxTempo: 250,
  minBeat: 1,
  maxBeat: 9,
};

export const DEFAULT_TEMPO = 120;
export const DEFAULT_BEAT1 = 4;
export const DEFAULT_BEAT2 = null;
export const DEFAULT_CLICK_SOUND: ClickSound = 'click';

// DB-90 color scheme
export const COLORS = {
  // Main body colors
  background: '#1a1a1a',
  bodyGray: '#2d2d2d',
  bodyAccent: '#3a3a3a',

  // LCD Display
  lcdBackground: '#1e3a1e',
  lcdText: '#00ff00',
  lcdTextDim: '#004400',

  // LED colors
  ledRed: '#ff0000',
  ledRedDim: '#330000',
  ledGreen: '#00ff00',
  ledGreenDim: '#003300',
  ledOrange: '#ff6600',
  ledOrangeDim: '#331100',

  // UI elements
  buttonGray: '#404040',
  buttonPressed: '#505050',
  sliderTrack: '#333333',
  sliderThumb: '#666666',
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  accent: '#ff6600',  // Boss orange
};

export const CLICK_SOUNDS: { id: ClickSound; name: string }[] = [
  { id: 'click', name: 'Click' },
  { id: 'beep', name: 'Beep' },
  { id: 'wood', name: 'Wood' },
  { id: 'voice', name: 'Voice' },
];
