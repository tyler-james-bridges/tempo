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
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'metronome_settings_v5';

export type SoundType = 'click' | 'beep' | 'wood' | 'cowbell';
export type SubdivisionType = 1 | 2 | 3 | 4;
export type AccentPattern = 0 | 1 | 2 | 3 | 4;

// Bluetooth latency compensation: typical ranges
// Wired/built-in: 0-20ms
// Bluetooth A2DP (SBC): 100-200ms
// Bluetooth A2DP (AAC): 120-180ms
// Bluetooth A2DP (aptX): 70-150ms
// Megavox and similar speakers: 150-300ms

// Scheduling constants (from Chris Wilson's pattern)
const LOOKAHEAD = 25.0;          // How often to call scheduler (ms)
const SCHEDULE_AHEAD_TIME = 0.15; // How far ahead to schedule audio (seconds)
const MAX_LATENCY_COMPENSATION = 0.5; // Maximum latency compensation (500ms)

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
    duration: 0.03,  // Shortened to prevent overlap at fast tempos
    type: 'sine',
  },
  beep: {
    accentFreq: 880,
    normalFreq: 660,
    decay: 20,
    duration: 0.04,  // Shortened to prevent overlap at fast tempos
    type: 'sine',
  },
  wood: {
    accentFreq: 400,
    normalFreq: 320,
    decay: 80,
    duration: 0.03,  // Shortened to prevent overlap at fast tempos
    type: 'triangle',
  },
  cowbell: {
    accentFreq: 587,
    normalFreq: 540,
    decay: 25,
    duration: 0.05,  // Shortened from 0.12 - was causing overlap at fast tempos
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
  // Bluetooth/audio latency compensation in milliseconds
  // Audio is scheduled earlier by this amount so it arrives on time through BT speakers
  const [audioLatency, setAudioLatencyState] = useState(0);

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
  const audioLatencyRef = useRef(audioLatency);

  // Keep refs in sync
  muteAudioRef.current = muteAudio;
  audioLatencyRef.current = audioLatency;
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
    AsyncStorage.getItem(STORAGE_KEY)
      .then((s: string | null) => {
        if (s) {
          try {
            const d = JSON.parse(s) as {
              tempo?: number;
              beats?: number;
              soundType?: SoundType;
              subdivision?: SubdivisionType;
              volume?: number;
              accentPattern?: AccentPattern;
              countInEnabled?: boolean;
              muteAudio?: boolean;
              audioLatency?: number;
            };
            if (d.tempo) setTempoState(d.tempo);
            if (d.beats) setBeatsState(d.beats);
            if (d.soundType) setSoundTypeState(d.soundType);
            if (d.subdivision) setSubdivisionState(d.subdivision);
            if (d.volume !== undefined) setVolumeState(d.volume);
            if (d.accentPattern !== undefined) setAccentPatternState(d.accentPattern);
            if (d.countInEnabled !== undefined) setCountInEnabledState(d.countInEnabled);
            if (d.muteAudio !== undefined) setMuteAudioState(d.muteAudio);
            if (d.audioLatency !== undefined) setAudioLatencyState(d.audioLatency);
          } catch (parseError) {
            console.warn('Failed to parse metronome settings:', parseError);
            // Clear corrupted data
            AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
          }
        }
      })
      .catch((error) => {
        console.warn('Failed to load metronome settings:', error);
      });
  }, []);

  // Save settings
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      tempo, beats, soundType, subdivision, volume, accentPattern, countInEnabled, muteAudio, audioLatency
    })).catch((error) => {
      console.warn('Failed to save metronome settings:', error);
    });
  }, [tempo, beats, soundType, subdivision, volume, accentPattern, countInEnabled, muteAudio, audioLatency]);

  // Initialize audio context with fallback for unsupported devices
  useEffect(() => {
    try {
      audioContextRef.current = new AudioContext();
    } catch (error) {
      console.warn('AudioContext not available, audio will be disabled:', error);
      audioContextRef.current = null;
    }

    return () => {
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (error) {
          console.warn('Error closing AudioContext:', error);
        }
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
   *
   * BLUETOOTH LATENCY COMPENSATION:
   * - Visual feedback fires at the scheduled "time"
   * - Audio is scheduled EARLIER by audioLatency ms so it arrives on time through BT speakers
   * - This compensates for A2DP encoding/transmission delay (typically 100-300ms)
   */
  const scheduleNote = useCallback((time: number, beat: number, sub: number, isCountIn: boolean) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const muted = muteAudioRef.current;
    const vol = volumeRef.current;
    const type = soundTypeRef.current;
    const params = SOUND_PARAMS[type];
    const latencyCompensation = audioLatencyRef.current / 1000; // Convert ms to seconds

    // Determine if this is a main beat or subdivision
    const isMainBeat = sub === 1;
    const accented = isCountIn || (isMainBeat && isAccented(beat));

    // Update visual state on main beats (schedule this for the JS thread)
    // Visual feedback always fires at the intended "time" - no latency adjustment
    if (isMainBeat) {
      // Record scheduled time for latency calibration
      lastScheduledBeatTimeRef.current = time;

      const delay = Math.max(0, (time - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (isCountIn) {
          setCurrentBeat(beat - beatsRef.current - 1); // Negative countdown
        } else {
          setCurrentBeat(beat);
        }
      }, delay);
    }

    // Skip audio if muted
    if (muted) return;

    // BLUETOOTH LATENCY COMPENSATION:
    // Schedule audio EARLIER by the latency amount so it arrives through BT on time
    // This is the key to making Bluetooth speakers work correctly
    // We add a small buffer (5ms) to ensure we never schedule in the past
    const minAudioTime = ctx.currentTime + 0.005;
    const audioTime = Math.max(minAudioTime, time - latencyCompensation);

    // Create oscillator and gain nodes for this note
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Set oscillator properties
    const freq = accented ? params.accentFreq : params.normalFreq;
    oscillator.type = params.type;
    oscillator.frequency.setValueAtTime(freq, audioTime);

    // For cowbell, add a second oscillator for inharmonic sound
    if (type === 'cowbell') {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const freq2 = accented ? 845 : 800;
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq2, audioTime);

      // Envelope for second oscillator
      const attackEnd = audioTime + 0.002;
      const peakVol = vol * (accented ? 0.4 : 0.3) * (isMainBeat ? 1 : 0.5);
      gain2.gain.setValueAtTime(0, audioTime);
      gain2.gain.linearRampToValueAtTime(peakVol, attackEnd);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioTime + params.duration);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(audioTime);
      osc2.stop(audioTime + params.duration);
    }

    // Create envelope: quick attack, exponential decay
    const attackEnd = audioTime + 0.002;
    const peakVol = vol * (accented ? 1.0 : 0.85) * (isMainBeat ? 1 : 0.5);

    gainNode.gain.setValueAtTime(0, audioTime);
    gainNode.gain.linearRampToValueAtTime(peakVol, attackEnd);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioTime + params.duration);

    // Connect and play
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(audioTime);
    oscillator.stop(audioTime + params.duration);
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
   *
   * IMPORTANT: We look ahead by SCHEDULE_AHEAD_TIME + latency compensation
   * to ensure audio can be scheduled early enough for Bluetooth speakers
   */
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Look ahead enough to account for latency compensation
    const latencySeconds = audioLatencyRef.current / 1000;
    const totalLookAhead = SCHEDULE_AHEAD_TIME + latencySeconds;

    // Schedule all notes that are due before the next scheduler call
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

  /**
   * Set tempo with smooth transition handling when playing
   * When tempo changes mid-playback, we need to reset the scheduler timing
   * to prevent audio glitches from old timing references
   */
  const setTempo = useCallback((t: number) => {
    const newTempo = Math.max(30, Math.min(250, Math.round(t)));
    const ctx = audioContextRef.current;

    // If playing and tempo actually changed, reset the scheduler timing
    if (ctx && timerRef.current && newTempo !== tempoRef.current) {
      // Reset nextNoteTime to current time
      // This ensures the scheduler picks up the new tempo immediately
      // The next note will be scheduled based on the new tempo
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

  /**
   * Set subdivision with smooth transition handling when playing
   * Same principle as tempo - reset scheduler timing when changed
   */
  const setSubdivision = useCallback((s: SubdivisionType) => {
    const ctx = audioContextRef.current;

    // If playing and subdivision actually changed, reset the scheduler timing
    if (ctx && timerRef.current && s !== subdivisionRef.current) {
      nextNoteTimeRef.current = ctx.currentTime;
      currentSubRef.current = 1; // Reset to first subdivision of current beat
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

  const setMuteAudio = useCallback((muted: boolean) => {
    setMuteAudioState(muted);
  }, []);

  // Bluetooth/audio output latency compensation (0-500ms)
  const setAudioLatency = useCallback((latency: number) => {
    setAudioLatencyState(Math.max(0, Math.min(500, Math.round(latency))));
  }, []);

  /**
   * LATENCY CALIBRATION SYSTEM
   *
   * How it works:
   * 1. User starts calibration mode (metronome plays at fixed tempo)
   * 2. User taps when they HEAR the beat (not see it)
   * 3. We track the difference between when we scheduled the beat vs when user tapped
   * 4. The average difference = the Bluetooth latency
   *
   * This is the killer feature for Bluetooth speakers like Megavox
   */
  const [isCalibrating, setIsCalibrating] = useState(false);
  const calibrationTapsRef = useRef<{ scheduled: number; tapped: number }[]>([]);
  const lastScheduledBeatTimeRef = useRef(0);
  const calibrationBeatsPlayedRef = useRef(0);

  // Track when we schedule each beat for calibration purposes
  const recordScheduledBeatTime = useCallback((time: number) => {
    lastScheduledBeatTimeRef.current = time;
    if (isCalibrating) {
      calibrationBeatsPlayedRef.current++;
    }
  }, [isCalibrating]);

  // User taps when they hear the beat - we record the difference
  const calibrationTap = useCallback(() => {
    if (!isCalibrating) return;

    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const scheduled = lastScheduledBeatTimeRef.current;

    // Only record if we have a recent scheduled beat (within ~1 second)
    if (scheduled > 0 && now - scheduled < 1) {
      // The difference is how late the user tapped after we scheduled
      // This represents the perceived latency
      const latencyMs = (now - scheduled) * 1000;

      // Only record reasonable latencies (0-600ms)
      if (latencyMs >= 0 && latencyMs <= 600) {
        calibrationTapsRef.current.push({ scheduled, tapped: now });
      }
    }
  }, [isCalibrating]);

  // Calculate the measured latency from calibration taps
  const getCalibrationResult = useCallback((): number | null => {
    const taps = calibrationTapsRef.current;
    if (taps.length < 4) return null;

    // Calculate latencies and use median for robustness
    const latencies = taps.map(t => (t.tapped - t.scheduled) * 1000);
    latencies.sort((a, b) => a - b);

    // Remove outliers (top and bottom 20%)
    const trimCount = Math.floor(latencies.length * 0.2);
    const trimmed = latencies.slice(trimCount, latencies.length - trimCount);

    if (trimmed.length === 0) return null;

    // Return median of trimmed values
    const median = trimmed[Math.floor(trimmed.length / 2)];
    return Math.round(median);
  }, []);

  // Start calibration mode
  const startCalibration = useCallback(() => {
    calibrationTapsRef.current = [];
    calibrationBeatsPlayedRef.current = 0;
    setIsCalibrating(true);

    // Temporarily set latency to 0 during calibration
    // (we want to measure the raw latency)
    audioLatencyRef.current = 0;

    if (!isPlaying) {
      start();
    }
  }, [isPlaying, start]);

  // Stop calibration and apply result
  const stopCalibration = useCallback((applyResult: boolean = true) => {
    setIsCalibrating(false);

    if (applyResult) {
      const result = getCalibrationResult();
      if (result !== null && result >= 0) {
        setAudioLatency(result);
      }
    }

    // Restore the audio latency ref
    audioLatencyRef.current = audioLatency;
  }, [getCalibrationResult, setAudioLatency, audioLatency]);

  // Tap tempo
  const tapTimes = useRef<number[]>([]);
  const tapTempo = useCallback(() => {
    const now = Date.now();

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
    audioLatency,
    isCalibrating,
    calibrationTapCount: calibrationTapsRef.current.length,
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
    setMuteAudio,
    setAudioLatency,
    startCalibration,
    stopCalibration,
    calibrationTap,
    getCalibrationResult,
    tapTempo,
  };
}
