/**
 * Synced Show Hook
 *
 * Wraps useShow with cloud sync capabilities.
 * When a show is linked to the cloud (has cloudShowId),
 * all operations automatically sync to Supabase in the background.
 *
 * Uses optimistic updates - local state changes immediately,
 * cloud sync happens asynchronously.
 */

import { useCallback, useRef } from "react";
import { useShow, type Part } from "./useShow";
import { useAuth } from "./useAuth";
import { useCloudSync } from "./useCloudSync";

export function useSyncedShow() {
  const show = useShow();
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user?.id ?? null);

  const { cloudShowId } = show.show;
  const isCloudSynced = !!cloudShowId;

  // Keep track of pending cloud operations for ID mapping
  const pendingCloudIds = useRef<Map<string, Promise<string | null>>>(new Map());

  // Synced add part - creates locally first, then syncs to cloud
  const addPart = useCallback(
    (name: string, tempo: number, beats: number): Part => {
      // Add locally first (optimistic)
      const localPart = show.addPart(name, tempo, beats);

      // Sync to cloud in background if connected
      if (isCloudSynced && cloudShowId) {
        const cloudPromise = cloudSync.createCloudPart(cloudShowId, {
          name: localPart.name,
          tempo: localPart.tempo,
          beats: localPart.beats,
        });

        // Track the mapping for potential future updates
        pendingCloudIds.current.set(localPart.id, cloudPromise);

        // When cloud ID is ready, update the local part to use it
        cloudPromise.then((cloudId) => {
          if (cloudId && cloudId !== localPart.id) {
            // Update local part with cloud ID for consistency
            // This ensures updates/deletes use the correct ID
            show.importShow({
              ...show.show,
              parts: show.show.parts.map((p) =>
                p.id === localPart.id ? { ...p, id: cloudId } : p
              ),
              activePartId:
                show.show.activePartId === localPart.id
                  ? cloudId
                  : show.show.activePartId,
            });
          }
          pendingCloudIds.current.delete(localPart.id);
        });
      }

      return localPart;
    },
    [isCloudSynced, cloudShowId, cloudSync, show]
  );

  // Synced update part - updates locally first, then syncs to cloud
  const updatePart = useCallback(
    (id: string, updates: Partial<Omit<Part, "id">>) => {
      // Update locally first (optimistic)
      show.updatePart(id, updates);

      // Sync to cloud in background if connected
      if (isCloudSynced) {
        cloudSync.updateCloudPart(id, updates);
      }
    },
    [isCloudSynced, cloudSync, show]
  );

  // Synced delete part - deletes locally first, then syncs to cloud
  const deletePart = useCallback(
    (id: string) => {
      // Delete locally first (optimistic)
      show.deletePart(id);

      // Sync to cloud in background if connected
      if (isCloudSynced) {
        cloudSync.deleteCloudPart(id);
      }
    },
    [isCloudSynced, cloudSync, show]
  );

  // Synced reorder parts - reorders locally first, then syncs to cloud
  const reorderParts = useCallback(
    (fromIndex: number, toIndex: number) => {
      // Calculate new order before reordering locally
      const newParts = [...show.show.parts];
      const [removed] = newParts.splice(fromIndex, 1);
      newParts.splice(toIndex, 0, removed);
      const partIds = newParts.map((p) => p.id);

      // Reorder locally first (optimistic)
      show.reorderParts(fromIndex, toIndex);

      // Sync to cloud in background if connected
      if (isCloudSynced && cloudShowId) {
        cloudSync.reorderCloudParts(cloudShowId, partIds);
      }
    },
    [isCloudSynced, cloudShowId, cloudSync, show]
  );

  // Synced set show name - updates locally first, then syncs to cloud
  const setShowName = useCallback(
    (name: string) => {
      // Update locally first (optimistic)
      show.setShowName(name);

      // Sync to cloud in background if connected
      if (isCloudSynced && cloudShowId) {
        cloudSync.updateCloudShowName(cloudShowId, name);
      }
    },
    [isCloudSynced, cloudShowId, cloudSync, show]
  );

  // Disconnect from cloud (keep local data)
  const disconnectFromCloud = useCallback(() => {
    show.setCloudShowId(null);
  }, [show]);

  return {
    // Pass through state
    show: show.show,
    activePart: show.activePart,
    hasShow: show.hasShow,
    isLoaded: show.isLoaded,

    // Cloud sync info
    isCloudSynced,
    cloudShowId,
    auth,
    cloudSync,

    // Show operations (synced)
    setShowName,
    clearShow: show.clearShow,
    importShow: show.importShow,
    disconnectFromCloud,

    // Part operations (synced)
    addPart,
    updatePart,
    deletePart,
    reorderParts,

    // Navigation (local only)
    setActivePart: show.setActivePart,
    nextPart: show.nextPart,
    prevPart: show.prevPart,
  };
}

export type SyncedShowHook = ReturnType<typeof useSyncedShow>;
