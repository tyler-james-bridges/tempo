"use client";

interface TempoControlsProps {
  tempo: number;
  setTempo: (tempo: number) => void;
  isPlaying: boolean;
  toggle: () => void;
  countInEnabled: boolean;
  setCountInEnabled: (enabled: boolean) => void;
  tapTempo: () => void;
}

export function TempoControls({
  tempo,
  setTempo,
  isPlaying,
  toggle,
  countInEnabled,
  setCountInEnabled,
  tapTempo,
}: TempoControlsProps) {
  return (
    <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
      {/* Tempo adjustment row */}
      <div className="flex justify-center items-center gap-3">
        <button
          onClick={() => setTempo(Math.round(tempo / 2))}
          className="w-14 h-14 rounded-full bg-[#E8913A]/10 border border-[#E8913A]/30 flex items-center justify-center hover:bg-[#E8913A]/20 active:scale-95 transition-all"
          aria-label="Half tempo"
        >
          <span className="text-base font-bold text-[#E8913A]">½×</span>
        </button>

        <button
          onClick={() => setTempo(tempo - 1)}
          className="w-14 h-14 rounded-full bg-[#141414] border border-white/10 flex items-center justify-center hover:bg-[#1A1A1A] active:scale-95 transition-all"
          aria-label="Decrease tempo"
        >
          <span className="text-lg font-semibold text-white/80">−</span>
        </button>

        <button
          onClick={() => setTempo(tempo + 1)}
          className="w-14 h-14 rounded-full bg-[#141414] border border-white/10 flex items-center justify-center hover:bg-[#1A1A1A] active:scale-95 transition-all"
          aria-label="Increase tempo"
        >
          <span className="text-lg font-semibold text-white/80">+</span>
        </button>

        <button
          onClick={() => setTempo(tempo * 2)}
          className="w-14 h-14 rounded-full bg-[#E8913A]/10 border border-[#E8913A]/30 flex items-center justify-center hover:bg-[#E8913A]/20 active:scale-95 transition-all"
          aria-label="Double tempo"
        >
          <span className="text-base font-bold text-[#E8913A]">2×</span>
        </button>
      </div>

      {/* Main action row */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => setCountInEnabled(!countInEnabled)}
          className={`h-12 px-6 rounded-lg border flex items-center justify-center min-w-[100px] transition-all ${
            countInEnabled
              ? "bg-green-600 border-green-600 text-white"
              : "bg-[#1A1A1A] border-white/20 text-white/80 hover:bg-[#222]"
          }`}
        >
          <span className="text-[13px] font-semibold tracking-[0.5px]">COUNT-IN</span>
        </button>

        {/* Main play/stop button */}
        <button
          onClick={toggle}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            isPlaying
              ? "bg-[#D4822E] shadow-[0_4px_16px_rgba(232,145,58,0.4)]"
              : "bg-[#E8913A] shadow-[0_4px_12px_rgba(232,145,58,0.3)]"
          }`}
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <div className="w-6 h-6 bg-white rounded" />
          ) : (
            <div
              className="w-0 h-0 ml-1.5"
              style={{
                borderLeft: "24px solid white",
                borderTop: "15px solid transparent",
                borderBottom: "15px solid transparent",
              }}
            />
          )}
        </button>

        <button
          onClick={tapTempo}
          className="h-12 px-6 rounded-lg bg-[#1A1A1A] border border-white/20 flex items-center justify-center min-w-[100px] hover:bg-[#222] transition-colors"
        >
          <span className="text-[13px] font-semibold tracking-[0.5px] text-white/80">TAP</span>
        </button>
      </div>
    </div>
  );
}
