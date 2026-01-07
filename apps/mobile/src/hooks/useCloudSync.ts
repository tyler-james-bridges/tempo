/**
 * Cloud Sync for Tempo Shows
 *
 * Fetches shows from Supabase cloud and converts them
 * to the local format for use in the metronome.
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
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
