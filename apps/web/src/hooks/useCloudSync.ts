"use client";

/**
 * Cloud Sync for Tempo Shows
 *
 * Fetches shows from Supabase cloud and converts them
 * to the local format for use in the metronome.
 *
 * Ported from React Native app.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Part, Show } from "./useShow";

// Cloud types (from Supabase)
interface CloudShow {
  id: string;
  user_id: string;
  name: string;
  source_type: string;
  source_filename: string | null;
  pdf_url: string | null;
  status: "pending" | "processing" | "ready" | "error";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface CloudPart {
  id: string;
  show_id: string;
  name: string;
  tempo: number;
  beats: number;
  measure_start: number | null;
  measure_end: number | null;
  rehearsal_mark: string | null;
  position: number;
  created_at: string;
}

interface CloudSyncState {
  shows: CloudShow[];
  loading: boolean;
  error: string | null;
  lastSynced: Date | null;
}

/**
 * Convert a cloud show with parts to local format
 */
function cloudToLocalShow(cloudShow: CloudShow, cloudParts: CloudPart[]): Show {
  // Sort parts by position
  const sortedParts = [...cloudParts].sort((a, b) => a.position - b.position);

  const parts: Part[] = sortedParts.map((cp) => ({
    id: cp.id,
    name: cp.name,
    tempo: cp.tempo,
    beats: cp.beats,
  }));

  return {
    name: cloudShow.name,
    parts,
    activePartId: parts[0]?.id ?? null,
    cloudShowId: cloudShow.id,
  };
}

export function useCloudSync(userId: string | null) {
  const [state, setState] = useState<CloudSyncState>({
    shows: [],
    loading: false,
    error: null,
    lastSynced: null,
  });

  const supabase = createClient();

  // Fetch all shows for the user
  const fetchShows = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, shows: [], loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from("shows")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setState({
        shows: (data as CloudShow[]) || [],
        loading: false,
        error: null,
        lastSynced: new Date(),
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch shows",
      }));
    }
  }, [userId, supabase]);

  // Fetch a single show with its parts
  const fetchShowWithParts = useCallback(
    async (showId: string): Promise<Show | null> => {
      if (!userId) return null;

      try {
        // Fetch show
        const { data: showData, error: showError } = await supabase
          .from("shows")
          .select("*")
          .eq("id", showId)
          .single();

        if (showError) throw showError;

        // Fetch parts
        const { data: partsData, error: partsError } = await supabase
          .from("parts")
          .select("*")
          .eq("show_id", showId)
          .order("position");

        if (partsError) throw partsError;

        return cloudToLocalShow(
          showData as CloudShow,
          (partsData as CloudPart[]) || []
        );
      } catch (err) {
        console.error("Failed to fetch show with parts:", err);
        return null;
      }
    },
    [userId, supabase]
  );

  // Auto-fetch shows when userId changes
  useEffect(() => {
    if (userId) {
      fetchShows();
    } else {
      setState({
        shows: [],
        loading: false,
        error: null,
        lastSynced: null,
      });
    }
  }, [userId, fetchShows]);

  // Realtime subscriptions for live updates
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) {
      // Clean up if user logs out
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Create a channel for this user's data
    const channel = supabase
      .channel(`user-${userId}-sync`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shows",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refresh shows list on any change
          fetchShows();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "parts",
        },
        (payload) => {
          // Check if this part belongs to one of user's shows
          const showId =
            (payload.new as CloudPart)?.show_id ||
            (payload.old as { show_id?: string })?.show_id;
          if (showId && state.shows.some((s) => s.id === showId)) {
            fetchShows();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup on unmount or userId change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, fetchShows, state.shows, supabase]);

  // Get only ready shows (processed and available)
  const readyShows = state.shows.filter((s) => s.status === "ready");

  // ============================================
  // WRITE OPERATIONS (Two-way sync)
  // ============================================

  // Create a new part in the cloud
  const createCloudPart = useCallback(
    async (
      showId: string,
      part: { name: string; tempo: number; beats: number }
    ): Promise<string | null> => {
      if (!userId) return null;

      try {
        // Get current max position
        const { data: existingParts } = await supabase
          .from("parts")
          .select("position")
          .eq("show_id", showId)
          .order("position", { ascending: false })
          .limit(1);

        const nextPosition = (existingParts?.[0]?.position ?? -1) + 1;

        const { data, error } = await supabase
          .from("parts")
          .insert({
            show_id: showId,
            name: part.name,
            tempo: part.tempo,
            beats: part.beats,
            position: nextPosition,
          })
          .select()
          .single();

        if (error) throw error;
        return data.id;
      } catch (err) {
        console.error("Failed to create cloud part:", err);
        return null;
      }
    },
    [userId, supabase]
  );

  // Update an existing part in the cloud
  const updateCloudPart = useCallback(
    async (
      partId: string,
      updates: Partial<{ name: string; tempo: number; beats: number }>
    ): Promise<boolean> => {
      if (!userId) return false;

      try {
        const { error } = await supabase
          .from("parts")
          .update({
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.tempo !== undefined && { tempo: updates.tempo }),
            ...(updates.beats !== undefined && { beats: updates.beats }),
          })
          .eq("id", partId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to update cloud part:", err);
        return false;
      }
    },
    [userId, supabase]
  );

  // Delete a part from the cloud
  const deleteCloudPart = useCallback(
    async (partId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        const { error } = await supabase.from("parts").delete().eq("id", partId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to delete cloud part:", err);
        return false;
      }
    },
    [userId, supabase]
  );

  // Update show name in the cloud
  const updateCloudShowName = useCallback(
    async (showId: string, name: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        const { error } = await supabase
          .from("shows")
          .update({ name, updated_at: new Date().toISOString() })
          .eq("id", showId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to update cloud show name:", err);
        return false;
      }
    },
    [userId, supabase]
  );

  return {
    // State
    shows: state.shows,
    readyShows,
    loading: state.loading,
    error: state.error,
    lastSynced: state.lastSynced,

    // Read actions
    fetchShows,
    fetchShowWithParts,

    // Write actions (two-way sync)
    createCloudPart,
    updateCloudPart,
    deleteCloudPart,
    updateCloudShowName,
  };
}

export type CloudSyncHook = ReturnType<typeof useCloudSync>;
