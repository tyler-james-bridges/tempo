export * from './metronome';

// Note values for Note Mixing
export type NoteValue = 'quarter' | 'eighth' | 'eighthTriplet' | 'sixteenth' | 'sixteenthTriplet';

export interface NoteMixSettings {
  quarter: number;      // 0-100
  eighth: number;       // 0-100
  eighthTriplet: number; // 0-100
  sixteenth: number;    // 0-100
  sixteenthTriplet: number; // 0-100
}

// Drum pattern categories
export type DrumCategory =
  | '8beat' | '16beat' | 'shuffle' | 'funk' | 'jazz'
  | 'blues' | 'techno' | 'house' | 'country' | 'reggae'
  | 'latin' | 'ballroom';

export interface DrumPattern {
  id: string;
  name: string;
  category: DrumCategory;
  pattern: number[]; // Beat pattern array
}

// Reference tone
export interface ReferenceToneSettings {
  note: string;        // C2-B6
  octave: number;      // 2-6
  a4Reference: number; // 438-445 Hz
  isPlaying: boolean;
}

// Rhythm Coach modes
export type RhythmCoachMode = 'timeCheck' | 'quietCount' | 'gradualUpDown' | 'stepUpDown';

export interface RhythmCoachSettings {
  mode: RhythmCoachMode;
  enabled: boolean;
  // Time Check
  measureCount: number;
  // Quiet Count
  quietBars: number;
  playBars: number;
  // Gradual Up/Down
  startTempo: number;
  endTempo: number;
  tempoChangePerBar: number;
  // Step Up/Down
  stepAmount: number;
  barsPerStep: number;
}

// Preset
export interface MetronomePreset {
  id: string;
  name: string;
  tempo: number;
  beat1: number;
  beat2: number | null;
  clickSound: import('./metronome').ClickSound;
  noteMix?: NoteMixSettings;
}

export interface TonePreset {
  id: string;
  name: string;
  note: string;
  octave: number;
  a4Reference: number;
}

// App mode/screen
export type AppMode = 'metronome' | 'drumPattern' | 'noteMix' | 'referenceTone' | 'rhythmCoach' | 'presets';
