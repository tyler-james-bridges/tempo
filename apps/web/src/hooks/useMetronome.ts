'use client';

/**
 * High-precision metronome using Web Audio API
 * Ported from React Native app - uses look-ahead scheduling for sample-accurate timing
 *
 * Based on Chris Wilson's "A Tale of Two Clocks" scheduling pattern:
 * - setInterval runs every 25ms to check if notes need scheduling
 * - Notes are scheduled 150ms ahead using audioContext.currentTime
 * - Audio thread handles precise timing, immune to JS thread jitter
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'metronome_settings_v6';

export type SoundType = 'click' | 'beep' | 'wood' | 'cowbell';
export type SubdivisionType = 1 | 2 | 3 | 4;
export type AccentPattern = 0 | 1 | 2 | 3 | 4;

// Scheduling constants
const LOOKAHEAD = 25.0; // How often to call scheduler (ms)
const SCHEDULE_AHEAD_TIME = 0.15; // How far ahead to schedule audio (seconds)

// Audio buffer constants
const SAMPLE_RATE = 44100;
const CLICK_DURATION = 0.025; // 25ms click duration

// Sound parameters
interface SoundParams {
  accentFreq: number;
  normalFreq: number;
}

const SOUND_PARAMS: Record<SoundType, SoundParams> = {
  click: { accentFreq: 1200, normalFreq: 800 },
  beep: { accentFreq: 880, normalFreq: 660 },
  wood: { accentFreq: 400, normalFreq: 320 },
  cowbell: { accentFreq: 587, normalFreq: 540 },
};

/**
 * Generate a triangle wave audio buffer
 */
function generateClickBuffer(
  ctx: AudioContext,
  frequency: number,
  volume: number
): AudioBuffer {
  const numSamples = Math.floor(SAMPLE_RATE * CLICK_DURATION);
  const buffer = ctx.createBuffer(1, numSamples, SAMPLE_RATE);
  const data = buffer.getChannelData(0);

  const period = SAMPLE_RATE / frequency;

  for (let i = 0; i < numSamples; i++) {
    const phase = (i % period) / period;
    let sample: number;
    if (phase < 0.5) {
      sample = 4 * phase - 1;
    } else {
      sample = 3 - 4 * phase;
    }

    const envelope = Math.exp(-i / (numSamples * 0.3));
    data[i] = sample * volume * envelope;
  }

  return buffer;
}

interface MetronomeSettings {
  tempo?: number;
  beats?: number;
  soundType?: SoundType;
  subdivision?: SubdivisionType;
  volume?: number;
  accentPattern?: AccentPattern;
  countInEnabled?: boolean;
  countInBeats?: number;
  muteAudio?: boolean;
  audioLatency?: number;
}

export function useMetronome() {
  const [tempo, setTempoState] = useState(120);
  const [beats, setBeatsState] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [soundType, setSoundTypeState] = useState<SoundType>('click');
  const [subdivision, setSubdivisionState] = useState<SubdivisionType>(1);
  const [volume, setVolumeState] = useState(0.8);
  const [accentPattern, setAccentPatternState] = useState<AccentPattern>(0);
  const [countInEnabled, setCountInEnabledState] = useState(false);
  const [countInBeats, setCountInBeatsState] = useState(1);
  const [isCountingIn, setIsCountingIn] = useState(false);
  const [muteAudio, setMuteAudioState] = useState(false);
  const [audioLatency, setAudioLatencyState] = useState(0);

  // Audio context ref
  const audioContextRef = useRef<AudioContext | null>(null);

  // Pre-generated audio buffers
  const clickBuffersRef = useRef<{
    accent: AudioBuffer | null;
    normal: AudioBuffer | null;
    subdivision: AudioBuffer | null;
  }>({ accent: null, normal: null, subdivision: null });

  // Scheduler state refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(1);
  const currentSubRef = useRef(1);
  const countInBeatRef = useRef(0);
  const lastScheduledBeatTimeRef = useRef(0);

  // State refs for callbacks
  const muteAudioRef = useRef(muteAudio);
  const isCountingInRef = useRef(isCountingIn);
  const tempoRef = useRef(tempo);
  const beatsRef = useRef(beats);
  const subdivisionRef = useRef(subdivision);
  const volumeRef = useRef(volume);
  const accentPatternRef = useRef(accentPattern);
  const countInEnabledRef = useRef(countInEnabled);
  const countInBeatsRef = useRef(countInBeats);
  const audioLatencyRef = useRef(audioLatency);

  // Keep refs in sync
  muteAudioRef.current = muteAudio;
  audioLatencyRef.current = audioLatency;
  isCountingInRef.current = isCountingIn;
  tempoRef.current = tempo;
  beatsRef.current = beats;
  subdivisionRef.current = subdivision;
  volumeRef.current = volume;
  accentPatternRef.current = accentPattern;
  countInEnabledRef.current = countInEnabled;
  countInBeatsRef.current = countInBeats;

  // Load settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const d: MetronomeSettings = JSON.parse(stored);
        if (d.tempo) setTempoState(d.tempo);
        if (d.beats) setBeatsState(d.beats);
        if (d.soundType) setSoundTypeState(d.soundType);
        if (d.subdivision) setSubdivisionState(d.subdivision);
        if (d.volume !== undefined) setVolumeState(d.volume);
        if (d.accentPattern !== undefined)
          setAccentPatternState(d.accentPattern);
        if (d.countInEnabled !== undefined)
          setCountInEnabledState(d.countInEnabled);
        if (d.countInBeats !== undefined) setCountInBeatsState(d.countInBeats);
        if (d.muteAudio !== undefined) setMuteAudioState(d.muteAudio);
        if (d.audioLatency !== undefined) setAudioLatencyState(d.audioLatency);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tempo,
          beats,
          soundType,
          subdivision,
          volume,
          accentPattern,
          countInEnabled,
          countInBeats,
          muteAudio,
          audioLatency,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [
    tempo,
    beats,
    soundType,
    subdivision,
    volume,
    accentPattern,
    countInEnabled,
    countInBeats,
    muteAudio,
    audioLatency,
  ]);

  // Initialize audio context lazily (requires user interaction)
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      return audioContextRef.current;
    } catch {
      console.warn('AudioContext not available');
      return null;
    }
  }, []);

  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Generate audio buffers when sound type or volume changes
  const regenerateBuffers = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const params = SOUND_PARAMS[soundType];
    const vol = volume;

    clickBuffersRef.current = {
      accent: generateClickBuffer(ctx, params.accentFreq, vol * 1.0),
      normal: generateClickBuffer(ctx, params.normalFreq, vol * 0.8),
      subdivision: generateClickBuffer(ctx, params.normalFreq, vol * 0.5),
    };
  }, [soundType, volume]);

  useEffect(() => {
    if (audioContextRef.current) {
      regenerateBuffers();
    }
  }, [soundType, volume, regenerateBuffers]);

  const isAccented = useCallback((beat: number) => {
    const pattern = accentPatternRef.current;
    if (pattern === 0) return beat === 1;
    if (pattern === 1) return true;
    return (beat - 1) % pattern === 0;
  }, []);

  const scheduleNote = useCallback(
    (time: number, beat: number, sub: number, isCountIn: boolean) => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const muted = muteAudioRef.current;
      const latencyCompensation = audioLatencyRef.current / 1000;
      const buffers = clickBuffersRef.current;

      const isMainBeat = sub === 1;
      const accented = isCountIn || (isMainBeat && isAccented(beat));

      if (isMainBeat) {
        lastScheduledBeatTimeRef.current = time;

        const delay = Math.max(0, (time - ctx.currentTime) * 1000);
        setTimeout(() => {
          if (isCountIn) {
            setCurrentBeat(beat - beatsRef.current - 1);
          } else {
            setCurrentBeat(beat);
          }
        }, delay);
      }

      if (muted) return;
      if (!buffers.accent || !buffers.normal || !buffers.subdivision) return;

      const targetAudioTime = time - latencyCompensation;
      const audioTime =
        targetAudioTime < ctx.currentTime
          ? ctx.currentTime + 0.005
          : targetAudioTime;

      let buffer: AudioBuffer;
      if (accented) {
        buffer = buffers.accent;
      } else if (isMainBeat) {
        buffer = buffers.normal;
      } else {
        buffer = buffers.subdivision;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(audioTime);
    },
    [isAccented]
  );

  const advanceNote = useCallback(() => {
    const secondsPerBeat = 60.0 / tempoRef.current;
    const secondsPerSub = secondsPerBeat / subdivisionRef.current;

    if (isCountingInRef.current) {
      nextNoteTimeRef.current += secondsPerBeat;
    } else {
      nextNoteTimeRef.current += secondsPerSub;
    }

    if (isCountingInRef.current) {
      countInBeatRef.current++;

      const totalCountInBeats = beatsRef.current * countInBeatsRef.current;
      if (countInBeatRef.current >= totalCountInBeats) {
        isCountingInRef.current = false;
        setIsCountingIn(false);
        currentBeatRef.current = 1;
        currentSubRef.current = 1;
      }
    } else {
      currentSubRef.current++;
      if (currentSubRef.current > subdivisionRef.current) {
        currentSubRef.current = 1;
        currentBeatRef.current++;
        if (currentBeatRef.current > beatsRef.current) {
          currentBeatRef.current = 1;
        }
      }
    }
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const latencySeconds = audioLatencyRef.current / 1000;
    const totalLookAhead = SCHEDULE_AHEAD_TIME + latencySeconds;

    while (nextNoteTimeRef.current < ctx.currentTime + totalLookAhead) {
      if (isCountingInRef.current) {
        scheduleNote(
          nextNoteTimeRef.current,
          countInBeatRef.current + 1,
          1,
          true
        );
      } else {
        scheduleNote(
          nextNoteTimeRef.current,
          currentBeatRef.current,
          currentSubRef.current,
          false
        );
      }
      advanceNote();
    }
  }, [scheduleNote, advanceNote]);

  const start = useCallback(() => {
    if (isPlaying || isCountingIn) return;

    const ctx = initAudioContext();
    if (!ctx) return;

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Regenerate buffers if needed
    if (!clickBuffersRef.current.accent) {
      regenerateBuffers();
    }

    nextNoteTimeRef.current = ctx.currentTime;

    if (countInEnabledRef.current) {
      countInBeatRef.current = 0;
      isCountingInRef.current = true;
      setIsCountingIn(true);
      setIsPlaying(true);
    } else {
      currentBeatRef.current = 1;
      currentSubRef.current = 1;
      isCountingInRef.current = false;
      setIsPlaying(true);
    }

    timerRef.current = setInterval(scheduler, LOOKAHEAD);
    scheduler();
  }, [isPlaying, isCountingIn, scheduler, initAudioContext, regenerateBuffers]);

  const stop = useCallback(() => {
    if (!isPlaying) return;

    setIsPlaying(false);
    setIsCountingIn(false);
    isCountingInRef.current = false;
    setCurrentBeat(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isPlaying]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  const setTempo = useCallback((t: number) => {
    const newTempo = Math.max(30, Math.min(250, Math.round(t)));
    const ctx = audioContextRef.current;

    if (ctx && timerRef.current && newTempo !== tempoRef.current) {
      nextNoteTimeRef.current = ctx.currentTime;
    }

    setTempoState(newTempo);
  }, []);

  const setBeats = useCallback((b: number) => {
    setBeatsState(Math.max(1, Math.min(12, b)));
  }, []);

  const setSoundType = useCallback((s: SoundType) => {
    setSoundTypeState(s);
  }, []);

  const setSubdivision = useCallback((s: SubdivisionType) => {
    const ctx = audioContextRef.current;

    if (ctx && timerRef.current && s !== subdivisionRef.current) {
      nextNoteTimeRef.current = ctx.currentTime;
      currentSubRef.current = 1;
    }

    setSubdivisionState(s);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)));
  }, []);

  const setAccentPattern = useCallback((p: AccentPattern) => {
    setAccentPatternState(p);
  }, []);

  const setCountInEnabled = useCallback((enabled: boolean) => {
    setCountInEnabledState(enabled);
  }, []);

  const setCountInBeats = useCallback((multiplier: number) => {
    setCountInBeatsState(Math.max(1, Math.min(4, multiplier)));
  }, []);

  const setMuteAudio = useCallback((muted: boolean) => {
    setMuteAudioState(muted);
  }, []);

  const setAudioLatency = useCallback((latency: number) => {
    setAudioLatencyState(Math.max(0, Math.min(500, Math.round(latency))));
  }, []);

  // Tap tempo
  const tapTimes = useRef<number[]>([]);
  const tapTempo = useCallback(() => {
    const now = Date.now();

    if (
      tapTimes.current.length &&
      now - tapTimes.current[tapTimes.current.length - 1] > 2000
    ) {
      tapTimes.current = [];
    }

    tapTimes.current.push(now);
    if (tapTimes.current.length > 5) tapTimes.current.shift();

    if (tapTimes.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i] - tapTimes.current[i - 1]);
      }
      intervals.sort((a, b) => a - b);
      const median = intervals[Math.floor(intervals.length / 2)];
      setTempo(Math.round(60000 / median));
    }
  }, [setTempo]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    tempo,
    beats,
    isPlaying,
    currentBeat,
    soundType,
    subdivision,
    volume,
    accentPattern,
    countInEnabled,
    countInBeats,
    isCountingIn,
    muteAudio,
    audioLatency,
    isAccented,
    toggle,
    start,
    stop,
    setTempo,
    setBeats,
    setSoundType,
    setSubdivision,
    setVolume,
    setAccentPattern,
    setCountInEnabled,
    setCountInBeats,
    setMuteAudio,
    setAudioLatency,
    tapTempo,
  };
}
