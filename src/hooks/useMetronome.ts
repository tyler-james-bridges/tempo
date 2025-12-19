import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { MetronomeState, ClickSound, BeatAccent } from '../types/metronome';
import {
  METRONOME_CONFIG,
  DEFAULT_TEMPO,
  DEFAULT_BEAT1,
  DEFAULT_BEAT2,
  DEFAULT_CLICK_SOUND,
} from '../constants/metronome';
import { SOUND_URIS } from '../utils/soundGenerator';

interface UseMetronomeReturn {
  state: MetronomeState;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  setTempo: (tempo: number) => void;
  setBeat1: (beat: number) => void;
  setBeat2: (beat: number | null) => void;
  setClickSound: (sound: ClickSound) => void;
  tapTempo: () => void;
}

export function useMetronome(): UseMetronomeReturn {
  const [state, setState] = useState<MetronomeState>({
    tempo: DEFAULT_TEMPO,
    beat1: DEFAULT_BEAT1,
    beat2: DEFAULT_BEAT2,
    isPlaying: false,
    currentBeat: 0,
    clickSound: DEFAULT_CLICK_SOUND,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextTickTimeRef = useRef<number>(0);
  const tapTimesRef = useRef<number[]>([]);
  const isPlayingRef = useRef(false);
  const stateRef = useRef(state);
  const soundsRef = useRef<Record<ClickSound, Audio.Sound | null>>({
    click: null,
    beep: null,
    wood: null,
    voice: null,
  });

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        // Pre-load all sounds
        const soundTypes: ClickSound[] = ['click', 'beep', 'wood', 'voice'];
        for (const soundType of soundTypes) {
          try {
            const { sound } = await Audio.Sound.createAsync(
              { uri: SOUND_URIS[soundType] },
              { shouldPlay: false }
            );
            soundsRef.current[soundType] = sound;
          } catch (e) {
            console.log(`Failed to load ${soundType} sound`);
          }
        }
      } catch (e) {
        console.log('Failed to initialize audio');
      }
    };

    initAudio();

    return () => {
      // Cleanup sounds
      Object.values(soundsRef.current).forEach((sound) => {
        if (sound) {
          sound.unloadAsync();
        }
      });
    };
  }, []);

  // Get beat accent type
  const getBeatAccent = useCallback((beatNumber: number): BeatAccent => {
    const currentState = stateRef.current;
    if (beatNumber === 1) return 'strong';
    if (currentState.beat2 && beatNumber % currentState.beat2 === 1) return 'medium';
    return 'weak';
  }, []);

  // Play click sound
  const playClick = useCallback(async (accent: BeatAccent) => {
    try {
      const soundType = stateRef.current.clickSound;
      const sound = soundsRef.current[soundType];

      if (sound) {
        const volume = accent === 'strong' ? 1.0 : accent === 'medium' ? 0.8 : 0.6;
        await sound.setVolumeAsync(volume);
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      // Silent fail if sound doesn't play
    }
  }, []);

  // Precise tick function with drift compensation
  const tick = useCallback(() => {
    if (!isPlayingRef.current) return;

    const now = Date.now();
    const drift = now - nextTickTimeRef.current;
    const currentState = stateRef.current;
    const interval = 60000 / currentState.tempo;

    setState((prev) => {
      const nextBeat = prev.currentBeat >= prev.beat1 ? 1 : prev.currentBeat + 1;
      const accent = getBeatAccent(nextBeat);

      // Play sound
      playClick(accent);

      return {
        ...prev,
        currentBeat: nextBeat,
      };
    });

    // Schedule next tick with drift compensation
    nextTickTimeRef.current += interval;
    const nextDelay = Math.max(0, interval - drift);

    intervalRef.current = setTimeout(tick, nextDelay);
  }, [getBeatAccent, playClick]);

  const start = useCallback(() => {
    if (isPlayingRef.current) return;

    isPlayingRef.current = true;
    setState((prev) => ({ ...prev, isPlaying: true, currentBeat: 0 }));
    nextTickTimeRef.current = Date.now();
    tick();
  }, [tick]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isPlaying: false, currentBeat: 0 }));
  }, []);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const setTempo = useCallback((tempo: number) => {
    const clampedTempo = Math.max(
      METRONOME_CONFIG.minTempo,
      Math.min(METRONOME_CONFIG.maxTempo, tempo)
    );
    setState((prev) => ({ ...prev, tempo: clampedTempo }));
  }, []);

  const setBeat1 = useCallback((beat: number) => {
    const clampedBeat = Math.max(
      METRONOME_CONFIG.minBeat,
      Math.min(METRONOME_CONFIG.maxBeat, beat)
    );
    setState((prev) => ({ ...prev, beat1: clampedBeat }));
  }, []);

  const setBeat2 = useCallback((beat: number | null) => {
    if (beat === null) {
      setState((prev) => ({ ...prev, beat2: null }));
      return;
    }
    const clampedBeat = Math.max(
      METRONOME_CONFIG.minBeat,
      Math.min(METRONOME_CONFIG.maxBeat, beat)
    );
    setState((prev) => ({ ...prev, beat2: clampedBeat }));
  }, []);

  const setClickSound = useCallback((sound: ClickSound) => {
    setState((prev) => ({ ...prev, clickSound: sound }));
  }, []);

  // Tap tempo - calculates BPM from tap intervals
  const tapTempo = useCallback(() => {
    const now = Date.now();
    const taps = tapTimesRef.current;

    // Reset if last tap was more than 2 seconds ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);

    // Keep only last 4 taps
    if (taps.length > 4) {
      taps.shift();
    }

    // Calculate average interval from at least 2 taps
    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newTempo = Math.round(60000 / avgInterval);
      setTempo(newTempo);
    }
  }, [setTempo]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return {
    state,
    start,
    stop,
    toggle,
    setTempo,
    setBeat1,
    setBeat2,
    setClickSound,
    tapTempo,
  };
}
