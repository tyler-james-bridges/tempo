"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getStatusBadgeClass } from "@/lib/utils";

interface Show {
  id: string;
  name: string;
  source_type: string;
  source_filename: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface Part {
  id: string;
  name: string;
  tempo: number;
  beats: number;
  measure_start: number | null;
  measure_end: number | null;
  rehearsal_mark: string | null;
  position: number;
}

export default function ShowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const showId = params.id as string;

  const [show, setShow] = useState<Show | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPart, setAddingPart] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  const [newPartName, setNewPartName] = useState("");
  const [newPartTempo, setNewPartTempo] = useState(120);
  const [newPartBeats, setNewPartBeats] = useState(4);

  useEffect(() => {
    loadShow();

    // Subscribe to realtime updates for this show
    const supabase = createClient();
    const channel = supabase
      .channel(`show-${showId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shows",
          filter: `id=eq.${showId}`,
        },
        (payload) => {
          const updatedShow = payload.new as Show;
          setShow(updatedShow);

          // If processing just completed, reload parts
          if (updatedShow.status === "ready" || updatedShow.status === "error") {
            loadShow();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId]);

  const loadShow = async () => {
    const supabase = createClient();

    const { data: showData, error: showError } = await supabase
      .from("shows")
      .select("*")
      .eq("id", showId)
      .single();

    if (showError || !showData) {
      router.push("/dashboard");
      return;
    }

    setShow(showData);

    const { data: partsData } = await supabase
      .from("parts")
      .select("*")
      .eq("show_id", showId)
      .order("position");

    setParts(partsData || []);
    setLoading(false);
  };

  const addPart = async () => {
    if (!newPartName.trim()) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("parts")
      .insert({
        show_id: showId,
        name: newPartName,
        tempo: newPartTempo,
        beats: newPartBeats,
        position: parts.length,
      })
      .select()
      .single();

    if (!error && data) {
      setParts([...parts, data]);
      setNewPartName("");
      setNewPartTempo(120);
      setNewPartBeats(4);
      setAddingPart(false);
    }
  };

  const deletePart = async (partId: string) => {
    const supabase = createClient();
    await supabase.from("parts").delete().eq("id", partId);
    setParts(parts.filter((p) => p.id !== partId));
  };

  const reprocessShow = async () => {
    if (!show) return;

    setReprocessing(true);
    const supabase = createClient();

    try {
      await supabase.from("parts").delete().eq("show_id", showId);
      setParts([]);

      await supabase
        .from("shows")
        .update({ status: "processing", error_message: null })
        .eq("id", showId);

      setShow({ ...show, status: "processing", error_message: null });

      const { data: showData } = await supabase
        .from("shows")
        .select("pdf_url")
        .eq("id", showId)
        .single();

      if (!showData?.pdf_url) {
        throw new Error("No PDF URL found for this show");
      }

      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId, pdfUrl: showData.pdf_url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Processing failed");
      }

      await loadShow();
    } catch (error) {
      console.error("Reprocess error:", error);
      alert("Failed to reprocess: " + (error instanceof Error ? error.message : "Unknown error"));
      await loadShow();
    } finally {
      setReprocessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-[#5C5C5C]">Loading...</div>
      </div>
    );
  }

  if (!show) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      {/* Header */}
      <header className="border-b border-[#E8E8E6] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="h-4 w-px bg-[#E8E8E6]" />
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8913A] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1A1A1A]">TempoMap</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Show Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">{show.name}</h1>
              <span className={getStatusBadgeClass(show.status)}>{show.status}</span>
            </div>
            {show.source_filename && (
              <p className="text-[#5C5C5C] text-sm">{show.source_filename}</p>
            )}
          </div>
          {show.status !== "processing" && (
            <button
              onClick={reprocessShow}
              disabled={reprocessing}
              className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {reprocessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
                  Reprocessing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reprocess
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {show.status === "error" && show.error_message && (
          <div className="card p-4 mb-6 border-[#DC2626]/20 bg-[#DC2626]/5">
            <p className="text-[#DC2626] text-sm">{show.error_message}</p>
          </div>
        )}

        {/* Processing Status */}
        {(show.status === "pending" || show.status === "processing") && (
          <div className="card p-6 mb-6 border-[#CA8A04]/20 bg-[#CA8A04]/5">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#CA8A04] border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-[#CA8A04] font-medium">Processing PDF...</p>
                <p className="text-[#5C5C5C] text-sm">Extracting tempo information</p>
              </div>
            </div>
          </div>
        )}

        {/* Parts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Parts</h2>
              <p className="text-[#5C5C5C] text-sm">{parts.length} part{parts.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setAddingPart(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add part
            </button>
          </div>

          {/* Add Part Form */}
          {addingPart && (
            <div className="card p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Name</label>
                  <input
                    type="text"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    placeholder="e.g., Opener"
                    className="input w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Tempo (BPM)</label>
                  <input
                    type="number"
                    value={newPartTempo}
                    onChange={(e) => setNewPartTempo(Number(e.target.value))}
                    min={30}
                    max={300}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Beats</label>
                  <input
                    type="number"
                    value={newPartBeats}
                    onChange={(e) => setNewPartBeats(Number(e.target.value))}
                    min={1}
                    max={12}
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addPart} className="btn-primary text-sm">
                  Add
                </button>
                <button onClick={() => setAddingPart(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Parts List */}
          {parts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-[#5C5C5C]">No parts yet</p>
              <p className="text-[#8C8C8C] text-sm mt-1">
                {show.status === "processing" ? "Parts will appear after processing" : "Add parts manually"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {parts.map((part, index) => (
                <div key={part.id} className="part-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[#8C8C8C] text-sm w-6">{index + 1}</span>
                    <div>
                      <h3 className="font-medium text-[#1A1A1A]">{part.name}</h3>
                      {part.rehearsal_mark && (
                        <span className="text-[#E8913A] text-sm">Rehearsal {part.rehearsal_mark}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#E8913A] tempo-display">{part.tempo}</p>
                      <p className="text-[#8C8C8C] text-xs">BPM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-[#1A1A1A]">{part.beats}/4</p>
                      <p className="text-[#8C8C8C] text-xs">Time</p>
                    </div>
                    {part.measure_start && part.measure_end && (
                      <div className="text-center">
                        <p className="text-lg font-medium text-[#1A1A1A]">{part.measure_start}-{part.measure_end}</p>
                        <p className="text-[#8C8C8C] text-xs">Measures</p>
                      </div>
                    )}
                    <button
                      onClick={() => deletePart(part.id)}
                      className="text-[#8C8C8C] hover:text-[#DC2626] transition-colors p-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sync Info */}
        {parts.length > 0 && (
          <div className="card p-4 border-[#16A34A]/20 bg-[#16A34A]/5">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-[#16A34A] font-medium">Ready to practice</p>
                <p className="text-[#5C5C5C] text-sm">This show syncs automatically to the TempoMap app</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
