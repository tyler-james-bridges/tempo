/**
 * Show Manager for DCI/WGI Score Integration
 *
 * Manages a single show with multiple parts/movements,
 * each with their own tempo and time signature.
 */

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tempo_show_v1';

export interface Part {
  id: string;
  name: string;
  tempo: number;
  beats: number;
}

export interface Show {
  name: string;
  parts: Part[];
  activePartId: string | null;
}

const DEFAULT_SHOW: Show = {
  name: '',
  parts: [],
  activePartId: null,
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export function useShow() {
  const [show, setShow] = useState<Show>(DEFAULT_SHOW);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load show from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          try {
            const parsed = JSON.parse(data) as Show;
            setShow(parsed);
          } catch {
            console.warn('Failed to parse show data');
          }
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  // Save show to storage
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(show)).catch(console.warn);
    }
  }, [show, isLoaded]);

  // Get active part
  const activePart = show.parts.find((p) => p.id === show.activePartId) || null;

  // Set show name
  const setShowName = useCallback((name: string) => {
    setShow((prev) => ({ ...prev, name }));
  }, []);

  // Add a new part
  const addPart = useCallback((name: string, tempo: number, beats: number): Part => {
    const newPart: Part = {
      id: generateId(),
      name: name.trim() || `Part ${show.parts.length + 1}`,
      tempo,
      beats,
    };

    setShow((prev) => ({
      ...prev,
      parts: [...prev.parts, newPart],
      activePartId: prev.activePartId || newPart.id,
    }));

    return newPart;
  }, [show.parts.length]);

  // Update a part
  const updatePart = useCallback((id: string, updates: Partial<Omit<Part, 'id'>>) => {
    setShow((prev) => ({
      ...prev,
      parts: prev.parts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  // Delete a part
  const deletePart = useCallback((id: string) => {
    setShow((prev) => {
      const newParts = prev.parts.filter((p) => p.id !== id);
      return {
        ...prev,
        parts: newParts,
        activePartId:
          prev.activePartId === id
            ? newParts[0]?.id || null
            : prev.activePartId,
      };
    });
  }, []);

  // Reorder parts
  const reorderParts = useCallback((fromIndex: number, toIndex: number) => {
    setShow((prev) => {
      const newParts = [...prev.parts];
      const [removed] = newParts.splice(fromIndex, 1);
      newParts.splice(toIndex, 0, removed);
      return { ...prev, parts: newParts };
    });
  }, []);

  // Set active part
  const setActivePart = useCallback((id: string | null) => {
    setShow((prev) => ({ ...prev, activePartId: id }));
  }, []);

  // Navigate to next part
  const nextPart = useCallback(() => {
    setShow((prev) => {
      if (!prev.activePartId || prev.parts.length === 0) return prev;
      const currentIndex = prev.parts.findIndex((p) => p.id === prev.activePartId);
      const nextIndex = (currentIndex + 1) % prev.parts.length;
      return { ...prev, activePartId: prev.parts[nextIndex].id };
    });
  }, []);

  // Navigate to previous part
  const prevPart = useCallback(() => {
    setShow((prev) => {
      if (!prev.activePartId || prev.parts.length === 0) return prev;
      const currentIndex = prev.parts.findIndex((p) => p.id === prev.activePartId);
      const prevIndex = currentIndex === 0 ? prev.parts.length - 1 : currentIndex - 1;
      return { ...prev, activePartId: prev.parts[prevIndex].id };
    });
  }, []);

  // Clear show
  const clearShow = useCallback(() => {
    setShow(DEFAULT_SHOW);
  }, []);

  // Check if show has content
  const hasShow = show.name.length > 0 || show.parts.length > 0;

  return {
    // State
    show,
    activePart,
    hasShow,
    isLoaded,

    // Show operations
    setShowName,
    clearShow,

    // Part operations
    addPart,
    updatePart,
    deletePart,
    reorderParts,

    // Navigation
    setActivePart,
    nextPart,
    prevPart,
  };
}

export type ShowHook = ReturnType<typeof useShow>;
