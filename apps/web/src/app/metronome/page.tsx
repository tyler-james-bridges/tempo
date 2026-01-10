"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useMetronome } from "@/hooks/useMetronome";
import { useShow, type Part } from "@/hooks/useShow";
import { BeatRing } from "@/components/metronome/BeatRing";
import { TempoControls } from "@/components/metronome/TempoControls";
import { SettingsPanel } from "@/components/metronome/SettingsPanel";
import { ScoreBar } from "@/components/metronome/ScoreBar";
import type { User } from "@supabase/supabase-js";

const SUBDIVISIONS = [
  { value: 1, name: "Quarter" },
  { value: 2, name: "Eighth" },
  { value: 3, name: "Triplet" },
  { value: 4, name: "16th" },
] as const;

export default function MetronomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const metronome = useMetronome();
  const showManager = useShow();
  const {
    tempo,
    beats,
    isPlaying,
    currentBeat,
    soundType,
    subdivision,
    volume,
    accentPattern,
    countInEnabled,
    isCountingIn,
    isAccented,
    toggle,
    setTempo,
    setBeats,
    setSoundType,
    setSubdivision,
    setVolume,
    setAccentPattern,
    setCountInEnabled,
    tapTempo,
  } = metronome;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        router.push("/login");
      }
    });
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          toggle();
          break;
        case "ArrowUp":
          e.preventDefault();
          setTempo(tempo + 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          setTempo(tempo - 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setTempo(tempo - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          setTempo(tempo + 10);
          break;
        case "KeyT":
          e.preventDefault();
          tapTempo();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, setTempo, tempo, tapTempo]);

  // Handle selecting a part from ScoreBar
  const handleSelectPart = useCallback(
    (part: Part) => {
      showManager.setActivePart(part.id);
      setTempo(part.tempo);
      setBeats(part.beats);
    },
    [showManager, setTempo, setBeats]
  );

  const cycleSubdivision = useCallback(() => {
    const nextSub = subdivision === 4 ? 1 : ((subdivision + 1) as 1 | 2 | 3 | 4);
    setSubdivision(nextSub);
  }, [subdivision, setSubdivision]);

  const cycleTimeSignature = useCallback(() => {
    const nextBeats = beats >= 7 ? 2 : beats + 1;
    setBeats(nextBeats);
  }, [beats, setBeats]);

  const currentSubInfo = SUBDIVISIONS.find((s) => s.value === subdivision) || SUBDIVISIONS[0];
  const displayTempo = isCountingIn ? Math.abs(currentBeat) : tempo;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col select-none">
      {/* Glow overlay on downbeat */}
      <div
        className={`fixed inset-0 bg-[#E8913A] pointer-events-none transition-opacity duration-100 ${
          isPlaying && currentBeat === 1 ? "opacity-[0.08]" : "opacity-0"
        }`}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[#E8913A] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">TempoMap</span>
          </Link>
          <div className={`w-2 h-2 rounded-full transition-colors ${isPlaying ? "bg-[#E8913A] shadow-[0_0_8px_#E8913A]" : "bg-white/30"}`} />
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Open settings"
        >
          <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Score Bar - Part Navigation */}
      {showManager.hasShow && (
        <ScoreBar
          showName={showManager.show.name}
          parts={showManager.show.parts}
          activePartId={showManager.show.activePartId}
          onSelectPart={handleSelectPart}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        {/* Beat Ring with Tempo Display */}
        <BeatRing
          beats={beats}
          currentBeat={currentBeat}
          isPlaying={isPlaying}
          tempo={tempo}
          isAccented={isAccented}
          onTap={toggle}
        >
          <div className="flex flex-col items-center">
            <span
              className={`text-[96px] font-extralight tracking-[-4px] tabular-nums transition-colors ${
                isPlaying ? (isCountingIn ? "text-green-500" : "text-[#E8913A]") : "text-white"
              }`}
            >
              {displayTempo}
            </span>
            <span className="text-xs font-semibold tracking-[2px] text-white/40 -mt-2">
              {isCountingIn ? "COUNT IN" : "BPM"}
            </span>
          </div>
        </BeatRing>

        {/* Quick Settings Row */}
        <div className="flex gap-2 mt-8">
          <button
            onClick={cycleTimeSignature}
            className="px-6 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl flex flex-col items-center min-w-[85px] hover:bg-[#222] transition-colors"
          >
            <span className="text-base font-semibold text-white/80">{beats}/4</span>
            <span className="text-[10px] font-semibold tracking-[1px] text-white/40 mt-1">TIME</span>
          </button>

          <button
            onClick={cycleSubdivision}
            className="px-6 py-3 bg-[#E8913A]/10 border border-[#E8913A]/30 rounded-xl flex flex-col items-center min-w-[85px] hover:bg-[#E8913A]/20 transition-colors"
          >
            <span className="text-base font-semibold text-[#E8913A]">{currentSubInfo.name}</span>
            <span className="text-[10px] font-semibold tracking-[1px] text-[#E8913A]/60 mt-1">DIVISION</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="px-6 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl flex flex-col items-center min-w-[85px] hover:bg-[#222] transition-colors"
          >
            <span className="text-base font-semibold text-white/80">{soundType.toUpperCase()}</span>
            <span className="text-[10px] font-semibold tracking-[1px] text-white/40 mt-1">SOUND</span>
          </button>
        </div>

        {/* Tempo Controls */}
        <TempoControls
          tempo={tempo}
          setTempo={setTempo}
          isPlaying={isPlaying}
          toggle={toggle}
          countInEnabled={countInEnabled}
          setCountInEnabled={setCountInEnabled}
          onOpenSettings={() => setShowSettings(true)}
          tapTempo={tapTempo}
        />

        {/* Hint */}
        <p className="text-xs text-white/30 mt-6">
          Space to play/stop · Arrow keys to adjust · T for tap tempo
        </p>
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        tempo={tempo}
        setTempo={setTempo}
        beats={beats}
        setBeats={setBeats}
        subdivision={subdivision}
        setSubdivision={setSubdivision}
        soundType={soundType}
        setSoundType={setSoundType}
        volume={volume}
        setVolume={setVolume}
        accentPattern={accentPattern}
        setAccentPattern={setAccentPattern}
        countInEnabled={countInEnabled}
        setCountInEnabled={setCountInEnabled}
      />
    </div>
  );
}
