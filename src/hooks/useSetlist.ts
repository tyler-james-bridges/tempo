/**
 * Setlist Manager for Drumline Shows
 *
 * Allows creating and managing tempo sequences for:
 * - Show rehearsals (multiple movements with different tempos)
 * - Warmup sequences
 * - Exercises with tempo progression
 */

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tempo_setlists_v1';

export interface SetlistItem {
  id: string;
  name: string;
  tempo: number;
  beats: number;
  measures?: number; // Optional: auto-advance after N measures
  notes?: string;
}

export interface Setlist {
  id: string;
  name: string;
  items: SetlistItem[];
  createdAt: number;
  updatedAt: number;
}

interface SetlistState {
  setlists: Setlist[];
  activeSetlistId: string | null;
  activeItemIndex: number;
  isPlaying: boolean;
}

const DEFAULT_STATE: SetlistState = {
  setlists: [],
  activeSetlistId: null,
  activeItemIndex: 0,
  isPlaying: false,
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export function useSetlist() {
  const [state, setState] = useState<SetlistState>(DEFAULT_STATE);

  // Load setlists from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          try {
            const parsed = JSON.parse(data) as { setlists: Setlist[] };
            setState((prev) => ({ ...prev, setlists: parsed.setlists }));
          } catch {
            console.warn('Failed to parse setlists');
          }
        }
      })
      .catch(console.warn);
  }, []);

  // Save setlists to storage
  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ setlists: state.setlists })
    ).catch(console.warn);
  }, [state.setlists]);

  // Get active setlist
  const activeSetlist = state.setlists.find(
    (s) => s.id === state.activeSetlistId
  );

  // Get current item
  const currentItem = activeSetlist?.items[state.activeItemIndex];

  // Create new setlist
  const createSetlist = useCallback((name: string): Setlist => {
    const now = Date.now();
    const newSetlist: Setlist = {
      id: generateId(),
      name,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    setState((prev) => ({
      ...prev,
      setlists: [...prev.setlists, newSetlist],
    }));

    return newSetlist;
  }, []);

  // Delete setlist
  const deleteSetlist = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      setlists: prev.setlists.filter((s) => s.id !== id),
      activeSetlistId: prev.activeSetlistId === id ? null : prev.activeSetlistId,
    }));
  }, []);

  // Rename setlist
  const renameSetlist = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      setlists: prev.setlists.map((s) =>
        s.id === id ? { ...s, name, updatedAt: Date.now() } : s
      ),
    }));
  }, []);

  // Add item to setlist
  const addItem = useCallback(
    (setlistId: string, item: Omit<SetlistItem, 'id'>) => {
      const newItem: SetlistItem = {
        ...item,
        id: generateId(),
      };

      setState((prev) => ({
        ...prev,
        setlists: prev.setlists.map((s) =>
          s.id === setlistId
            ? { ...s, items: [...s.items, newItem], updatedAt: Date.now() }
            : s
        ),
      }));

      return newItem;
    },
    []
  );

  // Update item
  const updateItem = useCallback(
    (setlistId: string, itemId: string, updates: Partial<SetlistItem>) => {
      setState((prev) => ({
        ...prev,
        setlists: prev.setlists.map((s) =>
          s.id === setlistId
            ? {
                ...s,
                items: s.items.map((i) =>
                  i.id === itemId ? { ...i, ...updates } : i
                ),
                updatedAt: Date.now(),
              }
            : s
        ),
      }));
    },
    []
  );

  // Remove item
  const removeItem = useCallback((setlistId: string, itemId: string) => {
    setState((prev) => ({
      ...prev,
      setlists: prev.setlists.map((s) =>
        s.id === setlistId
          ? {
              ...s,
              items: s.items.filter((i) => i.id !== itemId),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
  }, []);

  // Reorder items
  const reorderItems = useCallback(
    (setlistId: string, fromIndex: number, toIndex: number) => {
      setState((prev) => ({
        ...prev,
        setlists: prev.setlists.map((s) => {
          if (s.id !== setlistId) return s;

          const items = [...s.items];
          const [removed] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, removed);

          return { ...s, items, updatedAt: Date.now() };
        }),
      }));
    },
    []
  );

  // Set active setlist
  const setActiveSetlist = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      activeSetlistId: id,
      activeItemIndex: 0,
    }));
  }, []);

  // Navigate to item
  const goToItem = useCallback((index: number) => {
    setState((prev) => {
      const setlist = prev.setlists.find((s) => s.id === prev.activeSetlistId);
      if (!setlist) return prev;

      const clampedIndex = Math.max(0, Math.min(index, setlist.items.length - 1));
      return { ...prev, activeItemIndex: clampedIndex };
    });
  }, []);

  // Go to next item
  const nextItem = useCallback(() => {
    setState((prev) => {
      const setlist = prev.setlists.find((s) => s.id === prev.activeSetlistId);
      if (!setlist) return prev;

      const nextIndex = prev.activeItemIndex + 1;
      if (nextIndex >= setlist.items.length) {
        return { ...prev, activeItemIndex: 0 }; // Loop back
      }
      return { ...prev, activeItemIndex: nextIndex };
    });
  }, []);

  // Go to previous item
  const prevItem = useCallback(() => {
    setState((prev) => {
      const setlist = prev.setlists.find((s) => s.id === prev.activeSetlistId);
      if (!setlist) return prev;

      const prevIndex = prev.activeItemIndex - 1;
      if (prevIndex < 0) {
        return { ...prev, activeItemIndex: setlist.items.length - 1 }; // Loop to end
      }
      return { ...prev, activeItemIndex: prevIndex };
    });
  }, []);

  // Duplicate setlist
  const duplicateSetlist = useCallback((id: string) => {
    const setlist = state.setlists.find((s) => s.id === id);
    if (!setlist) return null;

    const now = Date.now();
    const newSetlist: Setlist = {
      ...setlist,
      id: generateId(),
      name: `${setlist.name} (Copy)`,
      items: setlist.items.map((item) => ({ ...item, id: generateId() })),
      createdAt: now,
      updatedAt: now,
    };

    setState((prev) => ({
      ...prev,
      setlists: [...prev.setlists, newSetlist],
    }));

    return newSetlist;
  }, [state.setlists]);

  return {
    // State
    setlists: state.setlists,
    activeSetlist,
    activeItemIndex: state.activeItemIndex,
    currentItem,
    hasNext: activeSetlist
      ? state.activeItemIndex < activeSetlist.items.length - 1
      : false,
    hasPrev: state.activeItemIndex > 0,

    // Setlist operations
    createSetlist,
    deleteSetlist,
    renameSetlist,
    duplicateSetlist,
    setActiveSetlist,

    // Item operations
    addItem,
    updateItem,
    removeItem,
    reorderItems,

    // Navigation
    goToItem,
    nextItem,
    prevItem,
  };
}

export type SetlistHook = ReturnType<typeof useSetlist>;
