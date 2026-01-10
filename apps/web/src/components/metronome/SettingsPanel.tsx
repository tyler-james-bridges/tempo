"use client";

import { useState } from "react";
import type { SoundType, SubdivisionType, AccentPattern } from "@/hooks/useMetronome";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tempo: number;
  setTempo: (tempo: number) => void;
  beats: number;
  setBeats: (beats: number) => void;
  subdivision: SubdivisionType;
  setSubdivision: (sub: SubdivisionType) => void;
  soundType: SoundType;
  setSoundType: (sound: SoundType) => void;
  volume: number;
  setVolume: (volume: number) => void;
  accentPattern: AccentPattern;
  setAccentPattern: (pattern: AccentPattern) => void;
  countInEnabled: boolean;
  setCountInEnabled: (enabled: boolean) => void;
}

const TABS = ["Tempo", "Sound", "Rhythm"] as const;
type Tab = (typeof TABS)[number];

const TIME_SIGNATURES = [
  { beats: 2, label: "2/4" },
  { beats: 3, label: "3/4" },
  { beats: 4, label: "4/4" },
  { beats: 5, label: "5/4" },
  { beats: 6, label: "6/4" },
  { beats: 7, label: "7/4" },
];

const SUBDIVISIONS = [
  { value: 1 as SubdivisionType, name: "Quarter" },
  { value: 2 as SubdivisionType, name: "Eighth" },
  { value: 3 as SubdivisionType, name: "Triplet" },
  { value: 4 as SubdivisionType, name: "16th" },
];

const SOUNDS: SoundType[] = ["click", "beep", "wood", "cowbell"];

const ACCENT_PATTERNS: { value: AccentPattern; label: string }[] = [
  { value: 0, label: "First beat only" },
  { value: 1, label: "All beats" },
  { value: 2, label: "Every 2nd beat" },
  { value: 3, label: "Every 3rd beat" },
  { value: 4, label: "Every 4th beat" },
];

export function SettingsPanel({
  isOpen,
  onClose,
  tempo,
  setTempo,
  beats,
  setBeats,
  subdivision,
  setSubdivision,
  soundType,
  setSoundType,
  volume,
  setVolume,
  accentPattern,
  setAccentPattern,
  countInEnabled,
  setCountInEnabled,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Tempo");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 5L5 15M5 5l10 10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-[#E8913A] border-b-2 border-[#E8913A]"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "Tempo" && (
            <div className="space-y-6">
              {/* Tempo slider */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Tempo: {tempo} BPM
                </label>
                <input
                  type="range"
                  min={30}
                  max={250}
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E8913A]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>30</span>
                  <span>250</span>
                </div>
              </div>

              {/* Time signature */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">Time Signature</label>
                <div className="grid grid-cols-6 gap-2">
                  {TIME_SIGNATURES.map((ts) => (
                    <button
                      key={ts.beats}
                      onClick={() => setBeats(ts.beats)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        beats === ts.beats
                          ? "bg-[#E8913A] text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {ts.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count-in */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Count-in</span>
                <button
                  onClick={() => setCountInEnabled(!countInEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    countInEnabled ? "bg-[#E8913A]" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      countInEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === "Sound" && (
            <div className="space-y-6">
              {/* Sound type */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">Click Sound</label>
                <div className="grid grid-cols-2 gap-2">
                  {SOUNDS.map((sound) => (
                    <button
                      key={sound}
                      onClick={() => setSoundType(sound)}
                      className={`py-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                        soundType === sound
                          ? "bg-[#E8913A] text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {sound}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume * 100}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E8913A]"
                />
              </div>
            </div>
          )}

          {activeTab === "Rhythm" && (
            <div className="space-y-6">
              {/* Subdivision */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">Subdivision</label>
                <div className="grid grid-cols-4 gap-2">
                  {SUBDIVISIONS.map((sub) => (
                    <button
                      key={sub.value}
                      onClick={() => setSubdivision(sub.value)}
                      className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                        subdivision === sub.value
                          ? "bg-[#E8913A] text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent pattern */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">Accent Pattern</label>
                <div className="space-y-2">
                  {ACCENT_PATTERNS.map((pattern) => (
                    <button
                      key={pattern.value}
                      onClick={() => setAccentPattern(pattern.value)}
                      className={`w-full py-3 px-4 rounded-lg text-sm font-medium text-left transition-colors ${
                        accentPattern === pattern.value
                          ? "bg-[#E8913A] text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {pattern.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
