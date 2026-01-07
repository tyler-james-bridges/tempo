/**
 * User Presets Manager
 *
 * Allows users to save and manage their own tempo presets
 */

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tempo_user_presets_v1';

export interface TempoPreset {
  id: string;
  name: string;
  bpm: number;
  beats: number;
  createdAt: number;
}

const DEFAULT_PRESETS: TempoPreset[] = [
  { id: 'default-1', name: 'Slow', bpm: 60, beats: 4, createdAt: 0 },
  { id: 'default-2', name: 'Medium', bpm: 90, beats: 4, createdAt: 0 },
  { id: 'default-3', name: 'Walking', bpm: 120, beats: 4, createdAt: 0 },
  { id: 'default-4', name: 'Fast', bpm: 140, beats: 4, createdAt: 0 },
];

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export function usePresets() {
  const [presets, setPresetsState] = useState<TempoPreset[]>(DEFAULT_PRESETS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load presets from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          try {
            const parsed = JSON.parse(data) as { presets: TempoPreset[] };
            if (parsed.presets && parsed.presets.length > 0) {
              setPresetsState(parsed.presets);
            }
          } catch {
            console.warn('Failed to parse presets');
          }
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  // Save presets to storage
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ presets })
      ).catch(console.warn);
    }
  }, [presets, isLoaded]);

  // Add a new preset
  const addPreset = useCallback((name: string, bpm: number, beats: number): TempoPreset => {
    const newPreset: TempoPreset = {
      id: generateId(),
      name: name.trim() || `Preset ${bpm}`,
      bpm,
      beats,
      createdAt: Date.now(),
    };

    setPresetsState((prev) => [...prev, newPreset]);
    return newPreset;
  }, []);

  // Update a preset
  const updatePreset = useCallback((id: string, updates: Partial<Omit<TempoPreset, 'id' | 'createdAt'>>) => {
    setPresetsState((prev) =>
      prev.map((preset) =>
        preset.id === id ? { ...preset, ...updates } : preset
      )
    );
  }, []);

  // Delete a preset
  const deletePreset = useCallback((id: string) => {
    setPresetsState((prev) => prev.filter((preset) => preset.id !== id));
  }, []);

  // Reset to default presets
  const resetToDefaults = useCallback(() => {
    setPresetsState(DEFAULT_PRESETS);
  }, []);

  // Reorder presets
  const reorderPresets = useCallback((fromIndex: number, toIndex: number) => {
    setPresetsState((prev) => {
      const newPresets = [...prev];
      const [removed] = newPresets.splice(fromIndex, 1);
      newPresets.splice(toIndex, 0, removed);
      return newPresets;
    });
  }, []);

  return {
    presets,
    isLoaded,
    addPreset,
    updatePreset,
    deletePreset,
    resetToDefaults,
    reorderPresets,
  };
}

export type PresetsHook = ReturnType<typeof usePresets>;
