'use client';

/**
 * Show Manager for managing tempo parts/movements
 * Ported from React Native app - uses localStorage for persistence
 */

import { useState, useCallback, useEffect } from 'react';

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
  cloudShowId?: string | null;
}

const DEFAULT_SHOW: Show = {
  name: '',
  parts: [],
  activePartId: null,
  cloudShowId: null,
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export function useShow() {
  const [show, setShow] = useState<Show>(DEFAULT_SHOW);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load show from storage
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Show;
        setShow(parsed);
      }
    } catch {
      console.warn('Failed to parse show data');
    }
    setIsLoaded(true);
  }, []);

  // Save show to storage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(show));
      } catch {
        console.warn('Failed to save show data');
      }
    }
  }, [show, isLoaded]);

  const activePart = show.parts.find((p) => p.id === show.activePartId) || null;

  const setShowName = useCallback((name: string) => {
    setShow((prev) => ({ ...prev, name }));
  }, []);

  const addPart = useCallback(
    (name: string, tempo: number, beats: number): Part => {
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
    },
    [show.parts.length]
  );

  const updatePart = useCallback(
    (id: string, updates: Partial<Omit<Part, 'id'>>) => {
      setShow((prev) => ({
        ...prev,
        parts: prev.parts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
    },
    []
  );

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

  const reorderParts = useCallback((fromIndex: number, toIndex: number) => {
    setShow((prev) => {
      const newParts = [...prev.parts];
      const [removed] = newParts.splice(fromIndex, 1);
      newParts.splice(toIndex, 0, removed);
      return { ...prev, parts: newParts };
    });
  }, []);

  const setActivePart = useCallback((id: string | null) => {
    setShow((prev) => ({ ...prev, activePartId: id }));
  }, []);

  const nextPart = useCallback(() => {
    setShow((prev) => {
      if (!prev.activePartId || prev.parts.length === 0) return prev;
      const currentIndex = prev.parts.findIndex(
        (p) => p.id === prev.activePartId
      );
      const nextIndex = (currentIndex + 1) % prev.parts.length;
      return { ...prev, activePartId: prev.parts[nextIndex].id };
    });
  }, []);

  const prevPart = useCallback(() => {
    setShow((prev) => {
      if (!prev.activePartId || prev.parts.length === 0) return prev;
      const currentIndex = prev.parts.findIndex(
        (p) => p.id === prev.activePartId
      );
      const prevIndex =
        currentIndex === 0 ? prev.parts.length - 1 : currentIndex - 1;
      return { ...prev, activePartId: prev.parts[prevIndex].id };
    });
  }, []);

  const clearShow = useCallback(() => {
    setShow(DEFAULT_SHOW);
  }, []);

  const setCloudShowId = useCallback((cloudShowId: string | null) => {
    setShow((prev) => ({ ...prev, cloudShowId }));
  }, []);

  const importShow = useCallback((importedShow: Show) => {
    setShow(importedShow);
  }, []);

  const hasShow = show.name.length > 0 || show.parts.length > 0;

  return {
    show,
    activePart,
    hasShow,
    isLoaded,
    setShowName,
    clearShow,
    importShow,
    setCloudShowId,
    isCloudSynced: !!show.cloudShowId,
    addPart,
    updatePart,
    deletePart,
    reorderParts,
    setActivePart,
    nextPart,
    prevPart,
  };
}

export type ShowHook = ReturnType<typeof useShow>;
