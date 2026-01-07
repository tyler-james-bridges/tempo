/**
 * Cloud Sync for Tempo Shows
 *
 * Fetches shows from Supabase cloud and converts them
 * to the local format for use in the metronome.
 *
 * Includes Supabase Realtime subscriptions for live updates.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
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
  };
}

export function useCloudSync(userId: string | null) {
  const [state, setState] = useState<CloudSyncState>({
    shows: [],
    loading: false,
    error: null,
    lastSynced: null,
  });

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
  }, [userId]);

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
    [userId]
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
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "shows",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Shows change:", payload.eventType);
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
          const showId = (payload.new as CloudPart)?.show_id || (payload.old as { show_id?: string })?.show_id;
          if (showId && state.shows.some((s) => s.id === showId)) {
            console.log("Parts change:", payload.eventType);
            fetchShows();
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    channelRef.current = channel;

    // Cleanup on unmount or userId change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, fetchShows, state.shows]);

  // Get only ready shows (processed and available)
  const readyShows = state.shows.filter((s) => s.status === "ready");

  return {
    // State
    shows: state.shows,
    readyShows,
    loading: state.loading,
    error: state.error,
    lastSynced: state.lastSynced,

    // Actions
    fetchShows,
    fetchShowWithParts,
  };
}
