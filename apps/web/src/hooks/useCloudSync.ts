"use client";

/**
 * Cloud Sync for Tempo Shows - Convex Version
 *
 * Uses Convex for reactive queries and mutations.
 * Realtime updates are automatic with Convex.
 */

import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { Show } from "./useShow";

// Types from Convex
type ConvexShow = {
  _id: Id<"shows">;
  _creationTime: number;
  userId: string;
  name: string;
  sourceType: "pdf_upload" | "manual" | "import";
  sourceFilename?: string;
  pdfStorageId?: Id<"_storage">;
  status: "pending" | "processing" | "ready" | "error";
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
};

type ConvexPart = {
  _id: Id<"parts">;
  _creationTime: number;
  showId: Id<"shows">;
  name: string;
  tempo: number;
  beats: number;
  measureStart?: number;
  measureEnd?: number;
  rehearsalMark?: string;
  position: number;
  createdAt: number;
};

/**
 * Convert Convex show to CloudShow format for backward compatibility
 */
function toCloudShow(show: ConvexShow) {
  return {
    id: show._id,
    user_id: show.userId,
    name: show.name,
    source_type: show.sourceType,
    source_filename: show.sourceFilename ?? null,
    pdf_url: null, // Will be fetched separately if needed
    status: show.status,
    error_message: show.errorMessage ?? null,
    created_at: new Date(show.createdAt).toISOString(),
    updated_at: new Date(show.updatedAt).toISOString(),
    // Also include original fields for components expecting them
    sourceFilename: show.sourceFilename,
    createdAt: show.createdAt,
  };
}

/**
 * Convert Convex show+parts to local Show format for import
 */
function toLocalShow(
  show: ConvexShow,
  parts: ConvexPart[]
): Show {
  return {
    name: show.name,
    parts: parts.map((p) => ({
      id: p._id,
      name: p.name,
      tempo: p.tempo,
      beats: p.beats,
    })),
    activePartId: parts.length > 0 ? parts[0]._id : null,
    cloudShowId: show._id,
  };
}

export function useCloudSync() {
  const convex = useConvex();

  // Reactive queries - auto-update when data changes
  const shows = useQuery(api.shows.listUserShows);
  const readyShowsQuery = useQuery(api.shows.listReadyShows);

  // Mutations
  const createPartMutation = useMutation(api.parts.createPart);
  const updatePartMutation = useMutation(api.parts.updatePart);
  const deletePartMutation = useMutation(api.parts.deletePart);
  const updateShowMutation = useMutation(api.shows.updateShow);

  // Transform shows to legacy format
  const transformedShows = shows?.map(toCloudShow) ?? [];
  const readyShows = readyShowsQuery?.map(toCloudShow) ?? [];

  // Fetch a show with its parts for import into local storage
  const fetchShowWithParts = async (showId: string): Promise<Show | null> => {
    try {
      const result = await convex.query(api.shows.getShowWithParts, {
        showId: showId as Id<"shows">,
      });

      if (!result) {
        return null;
      }

      return toLocalShow(result.show, result.parts);
    } catch (err) {
      console.error("Failed to fetch show with parts:", err);
      return null;
    }
  };

  // Create a new part in the cloud
  const createCloudPart = async (
    showId: string,
    part: { name: string; tempo: number; beats: number }
  ): Promise<string | null> => {
    try {
      const partId = await createPartMutation({
        showId: showId as Id<"shows">,
        name: part.name,
        tempo: part.tempo,
        beats: part.beats,
      });
      return partId;
    } catch (err) {
      console.error("Failed to create cloud part:", err);
      return null;
    }
  };

  // Update an existing part in the cloud
  const updateCloudPart = async (
    partId: string,
    updates: Partial<{ name: string; tempo: number; beats: number }>
  ): Promise<boolean> => {
    try {
      await updatePartMutation({
        partId: partId as Id<"parts">,
        ...updates,
      });
      return true;
    } catch (err) {
      console.error("Failed to update cloud part:", err);
      return false;
    }
  };

  // Delete a part from the cloud
  const deleteCloudPart = async (partId: string): Promise<boolean> => {
    try {
      await deletePartMutation({
        partId: partId as Id<"parts">,
      });
      return true;
    } catch (err) {
      console.error("Failed to delete cloud part:", err);
      return false;
    }
  };

  // Update show name in the cloud
  const updateCloudShowName = async (
    showId: string,
    name: string
  ): Promise<boolean> => {
    try {
      await updateShowMutation({
        showId: showId as Id<"shows">,
        name,
      });
      return true;
    } catch (err) {
      console.error("Failed to update cloud show name:", err);
      return false;
    }
  };

  return {
    // State - Convex handles reactivity automatically
    shows: transformedShows,
    readyShows,
    loading: shows === undefined,
    error: null,
    lastSynced: shows ? new Date() : null,

    // Read actions
    fetchShows: () => {}, // No-op, Convex is reactive
    fetchShowWithParts,

    // Write actions
    createCloudPart,
    updateCloudPart,
    deleteCloudPart,
    updateCloudShowName,
  };
}

export type CloudSyncHook = ReturnType<typeof useCloudSync>;
