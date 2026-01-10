"use client";

import type { Part } from "@/hooks/useShow";

interface ScoreBarProps {
  showName: string;
  parts: Part[];
  activePartId: string | null;
  onSelectPart: (part: Part) => void;
  onOpenSettings: () => void;
  onClearShow: () => void;
}

export function ScoreBar({ showName, parts, activePartId, onSelectPart, onOpenSettings, onClearShow }: ScoreBarProps) {
  if (parts.length === 0) return null;

  return (
    <div className="w-full px-4 py-3 border-b border-white/10">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {/* Show name */}
        <button
          onClick={onOpenSettings}
          className="flex-shrink-0 text-sm font-medium text-white/60 hover:text-white/80 transition-colors"
        >
          {showName || "Untitled Show"}
        </button>

        <div className="w-px h-4 bg-white/20 flex-shrink-0" />

        {/* Part pills */}
        <div className="flex gap-2 flex-shrink-0">
          {parts.map((part) => {
            const isActive = part.id === activePartId;
            return (
              <button
                key={part.id}
                onClick={() => onSelectPart(part)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#E8913A] text-white shadow-[0_0_8px_rgba(232,145,58,0.4)]"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {part.name}
              </button>
            );
          })}
        </div>

        {/* Clear button */}
        <button
          onClick={onClearShow}
          className="flex-shrink-0 p-1.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
          title="Clear show"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
