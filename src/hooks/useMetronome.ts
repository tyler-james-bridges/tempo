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

// Generate click sound programmatically using oscillator-style approach
const generateClickBuffer = async (
  frequency: number,
  duration: number,
  volume: number
): Promise<Audio.Sound> => {
  // For now, we'll use a simple approach - in production, you'd use actual audio files
  // or generate WAV buffers. This is a placeholder that will be enhanced.
  const sound = new Audio.Sound();
  return sound;
};

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
  const soundRef = useRef<Audio.Sound | null>(null);
  const accentSoundRef = useRef<Audio.Sound | null>(null);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });
    };
    initAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (accentSoundRef.current) {
        accentSoundRef.current.unloadAsync();
      }
    };
  }, []);

  // Get beat accent type
  const getBeatAccent = useCallback(
    (beatNumber: number): BeatAccent => {
      if (beatNumber === 1) return 'strong';
      if (state.beat2 && beatNumber % state.beat2 === 1) return 'medium';
      return 'weak';
    },
    [state.beat2]
  );

  // Play click sound
  const playClick = useCallback(async (accent: BeatAccent) => {
    try {
      // Create a new sound instance for each click to avoid timing issues
      const { sound } = await Audio.Sound.createAsync(
        // Using different frequencies for different accents
        // In production, these would be actual audio files
        require('../../assets/sounds/click.wav'),
        {
          shouldPlay: true,
          volume: accent === 'strong' ? 1.0 : accent === 'medium' ? 0.8 : 0.6,
        }
      );

      // Unload after playing to free memory
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Sound file not found - will be added later
      console.log('Click sound not loaded yet');
    }
  }, []);

  // Precise tick function with drift compensation
  const tick = useCallback(() => {
    const now = Date.now();
    const drift = now - nextTickTimeRef.current;
    const interval = 60000 / state.tempo;

    setState((prev) => {
      const nextBeat = prev.currentBeat >= prev.beat1 ? 1 : prev.currentBeat + 1;
      const accent = getBeatAccent(nextBeat);

      // Play sound asynchronously
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
  }, [state.tempo, getBeatAccent, playClick]);

  const start = useCallback(() => {
    if (state.isPlaying) return;

    setState((prev) => ({ ...prev, isPlaying: true, currentBeat: 0 }));
    nextTickTimeRef.current = Date.now();
    tick();
  }, [state.isPlaying, tick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isPlaying: false, currentBeat: 0 }));
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      stop();
    } else {
      start();
    }
  }, [state.isPlaying, start, stop]);

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
