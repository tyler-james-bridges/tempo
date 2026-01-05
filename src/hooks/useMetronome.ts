/**
 * High-precision metronome using react-native-audio-api
 * Uses Web Audio API look-ahead scheduling for sample-accurate timing
 *
 * Based on Chris Wilson's "A Tale of Two Clocks" scheduling pattern:
 * - setInterval runs every 25ms to check if notes need scheduling
 * - Notes are scheduled 100ms ahead using audioContext.currentTime
 * - Audio thread handles precise timing, immune to JS thread jitter
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioContext, OscillatorType } from 'react-native-audio-api';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'metronome_settings_v4';

export type SoundType = 'click' | 'beep' | 'wood' | 'cowbell';
export type SubdivisionType = 1 | 2 | 3 | 4;
export type AccentPattern = 0 | 1 | 2 | 3 | 4;

// Scheduling constants (from Chris Wilson's pattern)
const LOOKAHEAD = 25.0;          // How often to call scheduler (ms)
const SCHEDULE_AHEAD_TIME = 0.1; // How far ahead to schedule audio (seconds)

// Sound synthesis parameters for each sound type
interface SoundParams {
  accentFreq: number;
  normalFreq: number;
  decay: number;
  duration: number;
  type: OscillatorType;
}

const SOUND_PARAMS: Record<SoundType, SoundParams> = {
  click: {
    accentFreq: 1200,
    normalFreq: 800,
    decay: 60,
    duration: 0.05,
    type: 'sine',
  },
  beep: {
    accentFreq: 880,
    normalFreq: 660,
    decay: 20,
    duration: 0.08,
    type: 'sine',
  },
  wood: {
    accentFreq: 400,
    normalFreq: 320,
    decay: 80,
    duration: 0.05,
    type: 'triangle',
  },
  cowbell: {
    accentFreq: 587,
    normalFreq: 540,
    decay: 25,
    duration: 0.12,
    type: 'square',
  },
};

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
  const [isCountingIn, setIsCountingIn] = useState(false);
  const [muteAudio, setMuteAudioState] = useState(false);

  // Audio context ref
  const audioContextRef = useRef<AudioContext | null>(null);

  // Scheduler state refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);       // When the next note is due (in audioContext time)
  const currentBeatRef = useRef(1);        // Current beat in the measure
  const currentSubRef = useRef(1);         // Current subdivision within the beat
  const countInBeatRef = useRef(0);        // Count-in beat counter

  // State refs for callbacks
  const muteAudioRef = useRef(muteAudio);
  const isCountingInRef = useRef(isCountingIn);
  const tempoRef = useRef(tempo);
  const beatsRef = useRef(beats);
  const subdivisionRef = useRef(subdivision);
  const volumeRef = useRef(volume);
  const soundTypeRef = useRef(soundType);
  const accentPatternRef = useRef(accentPattern);
  const countInEnabledRef = useRef(countInEnabled);

  // Keep refs in sync
  muteAudioRef.current = muteAudio;
  isCountingInRef.current = isCountingIn;
  tempoRef.current = tempo;
  beatsRef.current = beats;
  subdivisionRef.current = subdivision;
  volumeRef.current = volume;
  soundTypeRef.current = soundType;
  accentPatternRef.current = accentPattern;
  countInEnabledRef.current = countInEnabled;

  // Load settings on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((s: string | null) => {
      if (s) {
        const d = JSON.parse(s) as {
          tempo?: number;
          beats?: number;
          soundType?: SoundType;
          subdivision?: SubdivisionType;
          volume?: number;
          accentPattern?: AccentPattern;
          countInEnabled?: boolean;
          muteAudio?: boolean;
        };
        if (d.tempo) setTempoState(d.tempo);
        if (d.beats) setBeatsState(d.beats);
        if (d.soundType) setSoundTypeState(d.soundType);
        if (d.subdivision) setSubdivisionState(d.subdivision);
        if (d.volume !== undefined) setVolumeState(d.volume);
        if (d.accentPattern !== undefined) setAccentPatternState(d.accentPattern);
        if (d.countInEnabled !== undefined) setCountInEnabledState(d.countInEnabled);
        if (d.muteAudio !== undefined) setMuteAudioState(d.muteAudio);
      }
    }).catch(() => {});
  }, []);

  // Save settings
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      tempo, beats, soundType, subdivision, volume, accentPattern, countInEnabled, muteAudio
    })).catch(() => {});
  }, [tempo, beats, soundType, subdivision, volume, accentPattern, countInEnabled, muteAudio]);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new AudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const isAccented = useCallback((beat: number) => {
    const pattern = accentPatternRef.current;
    if (pattern === 0) return beat === 1;
    if (pattern === 1) return true;
    return (beat - 1) % pattern === 0;
  }, []);

  /**
   * Schedule a single click/beep at a precise time using Web Audio
   * Creates an oscillator with envelope for each note
   */
  const scheduleNote = useCallback((time: number, beat: number, sub: number, isCountIn: boolean) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const muted = muteAudioRef.current;
    const vol = volumeRef.current;
    const type = soundTypeRef.current;
    const params = SOUND_PARAMS[type];

    // Determine if this is a main beat or subdivision
    const isMainBeat = sub === 1;
    const accented = isCountIn || (isMainBeat && isAccented(beat));

    // Update visual state on main beats (schedule this for the JS thread)
    if (isMainBeat) {
      const delay = Math.max(0, (time - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (isCountIn) {
          setCurrentBeat(beat - beatsRef.current - 1); // Negative countdown
        } else {
          setCurrentBeat(beat);
        }
        // Haptic feedback
        Haptics.impactAsync(
          accented ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium
        );
      }, delay);
    }

    // Skip audio if muted
    if (muted) return;

    // Create oscillator and gain nodes for this note
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Set oscillator properties
    const freq = accented ? params.accentFreq : params.normalFreq;
    oscillator.type = params.type;
    oscillator.frequency.setValueAtTime(freq, time);

    // For cowbell, add a second oscillator for inharmonic sound
    if (type === 'cowbell') {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const freq2 = accented ? 845 : 800;
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq2, time);

      // Envelope for second oscillator
      const attackEnd = time + 0.002;
      const peakVol = vol * (accented ? 0.4 : 0.3) * (isMainBeat ? 1 : 0.5);
      gain2.gain.setValueAtTime(0, time);
      gain2.gain.linearRampToValueAtTime(peakVol, attackEnd);
      gain2.gain.exponentialRampToValueAtTime(0.001, time + params.duration);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(time);
      osc2.stop(time + params.duration);
    }

    // Create envelope: quick attack, exponential decay
    const attackEnd = time + 0.002;
    const peakVol = vol * (accented ? 1.0 : 0.85) * (isMainBeat ? 1 : 0.5);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peakVol, attackEnd);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + params.duration);

    // Connect and play
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(time);
    oscillator.stop(time + params.duration);
  }, [isAccented]);

  /**
   * Advance to the next note in the sequence
   * Updates beat/subdivision counters and calculates next note time
   */
  const advanceNote = useCallback(() => {
    const secondsPerBeat = 60.0 / tempoRef.current;
    const secondsPerSub = secondsPerBeat / subdivisionRef.current;

    // Add the note duration to the next note time
    if (isCountingInRef.current) {
      // Count-in: only full beats, no subdivisions
      nextNoteTimeRef.current += secondsPerBeat;
    } else {
      nextNoteTimeRef.current += secondsPerSub;
    }

    // Advance beat/subdivision counters
    if (isCountingInRef.current) {
      countInBeatRef.current++;

      // Check if count-in is complete
      if (countInBeatRef.current >= beatsRef.current) {
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

  /**
   * The scheduler - called by setInterval every LOOKAHEAD ms
   * Schedules all notes that will be needed before the next interval
   */
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Schedule all notes that are due before the next scheduler call
    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
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

    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Resume context if suspended (required on some platforms)
    if (ctx.state === 'suspended') {
      // Context will auto-resume on first interaction
    }

    // Initialize timing
    nextNoteTimeRef.current = ctx.currentTime;

    if (countInEnabledRef.current) {
      // Start count-in
      countInBeatRef.current = 0;
      isCountingInRef.current = true;
      setIsCountingIn(true);
      setIsPlaying(true);
    } else {
      // Normal start
      currentBeatRef.current = 1;
      currentSubRef.current = 1;
      isCountingInRef.current = false;
      setIsPlaying(true);
    }

    // Start the scheduler
    timerRef.current = setInterval(scheduler, LOOKAHEAD);

    // Run scheduler immediately for first notes
    scheduler();
  }, [isPlaying, isCountingIn, scheduler]);

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
    setTempoState(Math.max(30, Math.min(250, Math.round(t))));
  }, []);

  const setBeats = useCallback((b: number) => {
    setBeatsState(Math.max(1, Math.min(12, b)));
  }, []);

  const setSoundType = useCallback((s: SoundType) => {
    setSoundTypeState(s);
  }, []);

  const setSubdivision = useCallback((s: SubdivisionType) => {
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

  const setMuteAudio = useCallback((muted: boolean) => {
    setMuteAudioState(muted);
  }, []);

  // Tap tempo
  const tapTimes = useRef<number[]>([]);
  const tapTempo = useCallback(() => {
    const now = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Reset if more than 2 seconds since last tap
    if (tapTimes.current.length && now - tapTimes.current[tapTimes.current.length - 1] > 2000) {
      tapTimes.current = [];
    }

    tapTimes.current.push(now);
    if (tapTimes.current.length > 5) tapTimes.current.shift();

    if (tapTimes.current.length >= 2) {
      // Use median instead of mean for more robust averaging
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
    currentSubdivision: 0,
    soundType,
    subdivision,
    volume,
    accentPattern,
    countInEnabled,
    isCountingIn,
    muteAudio,
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
    setMuteAudio,
    tapTempo,
  };
}
