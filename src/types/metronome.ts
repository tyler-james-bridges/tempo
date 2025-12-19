export type ClickSound = 'click' | 'beep' | 'wood' | 'voice';

export interface MetronomeState {
  tempo: number;         // 30-250 BPM
  beat1: number;         // 1-9
  beat2: number | null;  // OFF (null) or 1-9
  isPlaying: boolean;
  currentBeat: number;
  clickSound: ClickSound;
}

export interface MetronomeConfig {
  minTempo: number;
  maxTempo: number;
  minBeat: number;
  maxBeat: number;
}

export type BeatAccent = 'strong' | 'medium' | 'weak';
