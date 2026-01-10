"use client";

import type { Part } from "@/hooks/useShow";

interface ScoreBarProps {
  showName: string;
  parts: Part[];
  activePartId: string | null;
  onSelectPart: (part: Part) => void;
  onOpenSettings: () => void;
}

export function ScoreBar({ showName, parts, activePartId, onSelectPart, onOpenSettings }: ScoreBarProps) {
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
      </div>
    </div>
  );
}
