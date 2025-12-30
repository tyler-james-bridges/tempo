/**
 * Simple metronome using expo-av
 * Basic implementation that works in Expo Go
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'metronome_settings_v4';

export type SoundType = 'click' | 'beep' | 'wood' | 'cowbell';
export type SubdivisionType = 1 | 2 | 3 | 4;
export type AccentPattern = 0 | 1 | 2 | 3 | 4;

const SAMPLE_RATE = 44100;

// Generate different sounds based on type
function generateSound(type: SoundType, isAccent: boolean, vol: number): string {
  const duration = type === 'beep' ? 0.08 : type === 'cowbell' ? 0.12 : 0.05;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const buffer = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    switch (type) {
      case 'click': {
        // Sharp click: high frequency with fast decay
        const freq = isAccent ? 1200 : 800;
        const decay = Math.exp(-t * 60);
        sample = Math.sin(2 * Math.PI * freq * t) * decay;
        break;
      }
      case 'beep': {
        // Pure tone beep: sine wave with softer envelope
        const freq = isAccent ? 880 : 660;
        const attack = Math.min(1, t * 100);
        const decay = Math.exp(-t * 20);
        sample = Math.sin(2 * Math.PI * freq * t) * attack * decay;
        break;
      }
      case 'wood': {
        // Woodblock: lower freq, band-pass character, quick decay
        const freq = isAccent ? 400 : 320;
        const decay = Math.exp(-t * 80);
        const harmonic = Math.sin(2 * Math.PI * freq * 2.4 * t) * 0.3;
        sample = (Math.sin(2 * Math.PI * freq * t) + harmonic) * decay;
        break;
      }
      case 'cowbell': {
        // Cowbell: two inharmonic frequencies
        const f1 = isAccent ? 587 : 540;
        const f2 = isAccent ? 845 : 800;
        const decay = Math.exp(-t * 25);
        sample = (Math.sin(2 * Math.PI * f1 * t) * 0.6 +
                  Math.sin(2 * Math.PI * f2 * t) * 0.4) * decay;
        break;
      }
    }
    buffer[i] = sample * vol;
  }

  // Convert to WAV
  const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(wavBuffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    view.setInt16(44 + i * 2, Math.floor(buffer[i] * 32767), true);
  }

  const bytes = new Uint8Array(wavBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return 'data:audio/wav;base64,' + btoa(binary);
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

  // Sound refs - pool of 4 sounds for each type
  const accentSoundsRef = useRef<Audio.Sound[]>([]);
  const beatSoundsRef = useRef<Audio.Sound[]>([]);
  const subSoundsRef = useRef<Audio.Sound[]>([]);
  const soundIndexRef = useRef(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentBeatRef = useRef(1);
  const currentSubRef = useRef(1);

  // Load settings on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(s => {
      if (s) {
        const d = JSON.parse(s);
        if (d.tempo) setTempoState(d.tempo);
        if (d.beats) setBeatsState(d.beats);
        if (d.soundType) setSoundTypeState(d.soundType);
        if (d.subdivision) setSubdivisionState(d.subdivision);
        if (d.volume !== undefined) setVolumeState(d.volume);
        if (d.accentPattern !== undefined) setAccentPatternState(d.accentPattern);
      }
    }).catch(() => {});
  }, []);

  // Save settings
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      tempo, beats, soundType, subdivision, volume, accentPattern
    })).catch(() => {});
  }, [tempo, beats, soundType, subdivision, volume, accentPattern]);

  // Initialize sounds - regenerate when soundType changes
  useEffect(() => {
    const initSounds = async () => {
      // Unload existing sounds
      await Promise.all([
        ...accentSoundsRef.current.map(s => s.unloadAsync().catch(() => {})),
        ...beatSoundsRef.current.map(s => s.unloadAsync().catch(() => {})),
        ...subSoundsRef.current.map(s => s.unloadAsync().catch(() => {})),
      ]);
      accentSoundsRef.current = [];
      beatSoundsRef.current = [];
      subSoundsRef.current = [];

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      // Generate sound URIs based on current sound type
      const accentUri = generateSound(soundType, true, 1.0);
      const beatUri = generateSound(soundType, false, 0.85);
      const subUri = generateSound(soundType, false, 0.5);

      // Create pool of 4 sounds for each type
      const poolSize = 4;

      for (let i = 0; i < poolSize; i++) {
        const { sound: accent } = await Audio.Sound.createAsync(
          { uri: accentUri },
          { volume }
        );
        accentSoundsRef.current.push(accent);

        const { sound: beat } = await Audio.Sound.createAsync(
          { uri: beatUri },
          { volume }
        );
        beatSoundsRef.current.push(beat);

        const { sound: sub } = await Audio.Sound.createAsync(
          { uri: subUri },
          { volume: volume * 0.6 }
        );
        subSoundsRef.current.push(sub);
      }
    };

    initSounds();

    return () => {
      accentSoundsRef.current.forEach(s => s.unloadAsync().catch(() => {}));
      beatSoundsRef.current.forEach(s => s.unloadAsync().catch(() => {}));
      subSoundsRef.current.forEach(s => s.unloadAsync().catch(() => {}));
    };
  }, [soundType]);

  // Update volume on all sounds
  useEffect(() => {
    accentSoundsRef.current.forEach(s => s.setVolumeAsync(volume).catch(() => {}));
    beatSoundsRef.current.forEach(s => s.setVolumeAsync(volume).catch(() => {}));
    subSoundsRef.current.forEach(s => s.setVolumeAsync(volume * 0.6).catch(() => {}));
  }, [volume]);

  const isAccented = useCallback((beat: number) => {
    if (accentPattern === 0) return beat === 1;
    if (accentPattern === 1) return true;
    return (beat - 1) % accentPattern === 0;
  }, [accentPattern]);

  const playClick = useCallback(async (beat: number, sub: number) => {
    const idx = soundIndexRef.current;
    soundIndexRef.current = (soundIndexRef.current + 1) % 4;

    let sound: Audio.Sound | undefined;

    if (sub === 1) {
      if (isAccented(beat)) {
        sound = accentSoundsRef.current[idx];
      } else {
        sound = beatSoundsRef.current[idx];
      }
      setCurrentBeat(beat);
      Haptics.impactAsync(
        isAccented(beat) ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium
      );
    } else {
      sound = subSoundsRef.current[idx];
    }

    if (sound) {
      try {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch {
        // Ignore errors
      }
    }
  }, [isAccented]);

  const tick = useCallback(() => {
    playClick(currentBeatRef.current, currentSubRef.current);

    currentSubRef.current++;
    if (currentSubRef.current > subdivision) {
      currentSubRef.current = 1;
      currentBeatRef.current++;
      if (currentBeatRef.current > beats) {
        currentBeatRef.current = 1;
      }
    }
  }, [playClick, subdivision, beats]);

  const start = useCallback(() => {
    if (isPlaying) return;

    currentBeatRef.current = 1;
    currentSubRef.current = 1;
    setIsPlaying(true);

    // Play first tick immediately
    tick();

    // Calculate interval
    const msPerBeat = 60000 / tempo;
    const msPerSub = msPerBeat / subdivision;

    timerRef.current = setInterval(tick, msPerSub);
  }, [isPlaying, tempo, subdivision, tick]);

  const stop = useCallback(() => {
    if (!isPlaying) return;

    setIsPlaying(false);
    setCurrentBeat(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isPlaying]);

  // Restart if tempo/subdivision changes while playing
  useEffect(() => {
    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      const msPerBeat = 60000 / tempo;
      const msPerSub = msPerBeat / subdivision;
      timerRef.current = setInterval(tick, msPerSub);
    }
  }, [tempo, subdivision, isPlaying, tick]);

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

  // Tap tempo
  const tapTimes = useRef<number[]>([]);
  const tapTempo = useCallback(() => {
    const now = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (tapTimes.current.length && now - tapTimes.current[tapTimes.current.length - 1] > 2000) {
      tapTimes.current = [];
    }

    tapTimes.current.push(now);
    if (tapTimes.current.length > 5) tapTimes.current.shift();

    if (tapTimes.current.length >= 2) {
      let sum = 0;
      for (let i = 1; i < tapTimes.current.length; i++) {
        sum += tapTimes.current[i] - tapTimes.current[i - 1];
      }
      setTempo(Math.round(60000 / (sum / (tapTimes.current.length - 1))));
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
    toggle,
    start,
    stop,
    setTempo,
    setBeats,
    setSoundType,
    setSubdivision,
    setVolume,
    setAccentPattern,
    tapTempo,
  };
}
