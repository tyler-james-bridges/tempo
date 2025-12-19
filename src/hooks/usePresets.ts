import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetronomePreset, TonePreset } from '../types';
import { DEFAULT_TEMPO, DEFAULT_BEAT1, DEFAULT_CLICK_SOUND } from '../constants/metronome';

const METRONOME_PRESETS_KEY = '@db90_metronome_presets';
const TONE_PRESETS_KEY = '@db90_tone_presets';

// Default presets
const DEFAULT_METRONOME_PRESETS: MetronomePreset[] = [
  { id: '1', name: 'Standard 4/4', tempo: 120, beat1: 4, beat2: null, clickSound: 'click' },
  { id: '2', name: 'Waltz 3/4', tempo: 96, beat1: 3, beat2: null, clickSound: 'click' },
  { id: '3', name: 'Fast Rock', tempo: 160, beat1: 4, beat2: null, clickSound: 'beep' },
  { id: '4', name: 'Slow Ballad', tempo: 60, beat1: 4, beat2: null, clickSound: 'wood' },
  { id: '5', name: 'Jazz Swing', tempo: 140, beat1: 4, beat2: 3, clickSound: 'wood' },
];

const DEFAULT_TONE_PRESETS: TonePreset[] = [
  { id: '1', name: 'Standard A', note: 'A', octave: 4, a4Reference: 440 },
  { id: '2', name: 'Baroque A', note: 'A', octave: 4, a4Reference: 415 },
  { id: '3', name: 'Concert A', note: 'A', octave: 4, a4Reference: 442 },
  { id: '4', name: 'Guitar Low E', note: 'E', octave: 2, a4Reference: 440 },
  { id: '5', name: 'Middle C', note: 'C', octave: 4, a4Reference: 440 },
];

export function usePresets() {
  const [metronomePresets, setMetronomePresets] = useState<MetronomePreset[]>(DEFAULT_METRONOME_PRESETS);
  const [tonePresets, setTonePresets] = useState<TonePreset[]>(DEFAULT_TONE_PRESETS);
  const [isLoading, setIsLoading] = useState(true);

  // Load presets from storage
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const [metronomeData, toneData] = await Promise.all([
          AsyncStorage.getItem(METRONOME_PRESETS_KEY),
          AsyncStorage.getItem(TONE_PRESETS_KEY),
        ]);

        if (metronomeData) {
          setMetronomePresets(JSON.parse(metronomeData));
        }
        if (toneData) {
          setTonePresets(JSON.parse(toneData));
        }
      } catch (e) {
        console.log('Failed to load presets');
      } finally {
        setIsLoading(false);
      }
    };

    loadPresets();
  }, []);

  // Save metronome preset
  const saveMetronomePreset = useCallback(async (preset: Omit<MetronomePreset, 'id'>) => {
    const newPreset: MetronomePreset = {
      ...preset,
      id: Date.now().toString(),
    };

    const updated = [...metronomePresets, newPreset];
    setMetronomePresets(updated);

    try {
      await AsyncStorage.setItem(METRONOME_PRESETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log('Failed to save preset');
    }

    return newPreset;
  }, [metronomePresets]);

  // Delete metronome preset
  const deleteMetronomePreset = useCallback(async (id: string) => {
    const updated = metronomePresets.filter((p) => p.id !== id);
    setMetronomePresets(updated);

    try {
      await AsyncStorage.setItem(METRONOME_PRESETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log('Failed to delete preset');
    }
  }, [metronomePresets]);

  // Save tone preset
  const saveTonePreset = useCallback(async (preset: Omit<TonePreset, 'id'>) => {
    const newPreset: TonePreset = {
      ...preset,
      id: Date.now().toString(),
    };

    const updated = [...tonePresets, newPreset];
    setTonePresets(updated);

    try {
      await AsyncStorage.setItem(TONE_PRESETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log('Failed to save tone preset');
    }

    return newPreset;
  }, [tonePresets]);

  // Delete tone preset
  const deleteTonePreset = useCallback(async (id: string) => {
    const updated = tonePresets.filter((p) => p.id !== id);
    setTonePresets(updated);

    try {
      await AsyncStorage.setItem(TONE_PRESETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log('Failed to delete tone preset');
    }
  }, [tonePresets]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    setMetronomePresets(DEFAULT_METRONOME_PRESETS);
    setTonePresets(DEFAULT_TONE_PRESETS);

    try {
      await Promise.all([
        AsyncStorage.removeItem(METRONOME_PRESETS_KEY),
        AsyncStorage.removeItem(TONE_PRESETS_KEY),
      ]);
    } catch (e) {
      console.log('Failed to reset presets');
    }
  }, []);

  return {
    metronomePresets,
    tonePresets,
    isLoading,
    saveMetronomePreset,
    deleteMetronomePreset,
    saveTonePreset,
    deleteTonePreset,
    resetToDefaults,
  };
}
