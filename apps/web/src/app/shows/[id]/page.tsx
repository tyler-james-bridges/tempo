"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

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

  // New part form
  const [newPartName, setNewPartName] = useState("");
  const [newPartTempo, setNewPartTempo] = useState(120);
  const [newPartBeats, setNewPartBeats] = useState(4);

  useEffect(() => {
    loadShow();
  }, [showId]);

  const loadShow = async () => {
    const supabase = createClient();

    // Load show
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

    // Load parts
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
      // Delete existing parts
      await supabase.from("parts").delete().eq("show_id", showId);
      setParts([]);

      // Update show status
      await supabase
        .from("shows")
        .update({ status: "processing", error_message: null })
        .eq("id", showId);

      setShow({ ...show, status: "processing", error_message: null });

      // Get the PDF URL from the show
      const { data: showData } = await supabase
        .from("shows")
        .select("pdf_url")
        .eq("id", showId)
        .single();

      if (!showData?.pdf_url) {
        throw new Error("No PDF URL found for this show");
      }

      // Trigger reprocessing
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId, pdfUrl: showData.pdf_url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Processing failed");
      }

      // Reload the show data
      await loadShow();
    } catch (error) {
      console.error("Reprocess error:", error);
      alert("Failed to reprocess: " + (error instanceof Error ? error.message : "Unknown error"));
      await loadShow(); // Reload to get current state
    } finally {
      setReprocessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-green-400 bg-green-400/10";
      case "processing":
        return "text-yellow-400 bg-yellow-400/10";
      case "error":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-white/60 bg-white/5";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!show) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-white/60 hover:text-white transition"
            >
              ← Back
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#00e5ff]">Tempo</span>
              <span className="text-sm text-white/60">Cloud</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Show Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{show.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                show.status
              )}`}
            >
              {show.status}
            </span>
            {show.status !== "processing" && (
              <button
                onClick={reprocessShow}
                disabled={reprocessing}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-white/20 text-white/70 hover:text-white hover:border-[#00e5ff]/50 hover:bg-[#00e5ff]/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/20 disabled:hover:bg-transparent disabled:hover:text-white/70 flex items-center gap-2"
              >
                {reprocessing ? (
                  <>
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-[#00e5ff]/40 border-t-[#00e5ff] rounded-full" />
                    <span>Reprocessing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Reprocess PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
          {show.source_filename && (
            <p className="text-white/40">{show.source_filename}</p>
          )}
          {show.status === "error" && show.error_message && (
            <p className="text-red-400 mt-2">{show.error_message}</p>
          )}
        </div>

        {/* Processing Status */}
        {show.status === "pending" && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
              <div>
                <p className="font-medium text-yellow-400">
                  Processing your PDF...
                </p>
                <p className="text-white/60 text-sm mt-1">
                  We&apos;re extracting tempo and measure information from your
                  sheet music. This may take a few minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Parts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Parts / Movements</h2>
            <button
              onClick={() => setAddingPart(true)}
              className="bg-[#00e5ff] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#00e5ff]/90 transition"
            >
              + Add Part
            </button>
          </div>

          {/* Add Part Form */}
          {addingPart && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Part Name
                  </label>
                  <input
                    type="text"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    placeholder="e.g., Opener, Ballad, Closer"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Tempo (BPM)
                  </label>
                  <input
                    type="number"
                    value={newPartTempo}
                    onChange={(e) => setNewPartTempo(Number(e.target.value))}
                    min={30}
                    max={300}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Beats per Measure
                  </label>
                  <input
                    type="number"
                    value={newPartBeats}
                    onChange={(e) => setNewPartBeats(Number(e.target.value))}
                    min={1}
                    max={12}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addPart}
                  className="bg-[#00e5ff] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#00e5ff]/90 transition"
                >
                  Add Part
                </button>
                <button
                  onClick={() => setAddingPart(false)}
                  className="px-4 py-2 rounded-lg font-medium text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Parts List */}
          {parts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
              <p className="text-white/40">No parts yet</p>
              <p className="text-white/30 text-sm mt-1">
                {show.status === "pending"
                  ? "Parts will appear here after processing completes"
                  : "Add parts manually using the button above"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {parts.map((part, index) => (
                <div
                  key={part.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.07] transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-white/40 text-sm w-8">
                      {index + 1}.
                    </span>
                    <div>
                      <h3 className="font-medium">{part.name}</h3>
                      {part.rehearsal_mark && (
                        <span className="text-[#00e5ff] text-sm">
                          [{part.rehearsal_mark}]
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#00e5ff]">
                        {part.tempo}
                      </p>
                      <p className="text-white/40 text-xs">BPM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium">{part.beats}/4</p>
                      <p className="text-white/40 text-xs">Time</p>
                    </div>
                    {part.measure_start && part.measure_end && (
                      <div className="text-center">
                        <p className="text-lg font-medium">
                          {part.measure_start}-{part.measure_end}
                        </p>
                        <p className="text-white/40 text-xs">Measures</p>
                      </div>
                    )}
                    <button
                      onClick={() => deletePart(part.id)}
                      className="text-red-400/60 hover:text-red-400 transition p-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sync to App Info */}
        {parts.length > 0 && (
          <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl p-6">
            <h3 className="font-semibold text-[#00e5ff] mb-2">
              Ready to Practice!
            </h3>
            <p className="text-white/70 text-sm">
              This show will automatically sync to your Tempo app. Open the app
              and select this show to start practicing with the correct tempos.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
