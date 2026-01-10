"use client";

/**
 * CloudShowsPanel - Cloud sync section for settings
 *
 * Shows the user's cloud shows and allows importing them into the metronome.
 */

import { useState } from "react";
import type { CloudSyncHook } from "@/hooks/useCloudSync";
import type { ShowHook } from "@/hooks/useShow";

interface CloudShowsPanelProps {
  cloudSync: CloudSyncHook;
  showManager: ShowHook;
  onShowImported?: () => void;
}

export function CloudShowsPanel({
  cloudSync,
  showManager,
  onShowImported,
}: CloudShowsPanelProps) {
  const [importingShowId, setImportingShowId] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState<{
    showId: string;
    showName: string;
  } | null>(null);

  const handleImportShow = async (showId: string, showName: string) => {
    // If there's an existing show, confirm replacement
    if (showManager.hasShow) {
      setConfirmReplace({ showId, showName });
      return;
    }

    await doImportShow(showId);
  };

  const doImportShow = async (showId: string) => {
    setImportingShowId(showId);
    setConfirmReplace(null);

    const localShow = await cloudSync.fetchShowWithParts(showId);

    if (localShow) {
      showManager.importShow(localShow);
      onShowImported?.();
    }

    setImportingShowId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white/40 tracking-wider uppercase">
            Your Shows
          </h3>
        </div>
        <button
          onClick={() => cloudSync.fetchShows()}
          disabled={cloudSync.loading}
          className="text-xs text-[#E8913A] hover:text-[#E8913A]/80 disabled:opacity-50 transition-colors"
        >
          {cloudSync.loading ? "Syncing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {cloudSync.error && (
        <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
          {cloudSync.error}
        </div>
      )}

      {/* Confirm Replace Dialog */}
      {confirmReplace && (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-sm text-white/80">
            Replace &quot;{showManager.show.name || "current show"}&quot; with &quot;
            {confirmReplace.showName}&quot;?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmReplace(null)}
              className="flex-1 px-3 py-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => doImportShow(confirmReplace.showId)}
              className="flex-1 px-3 py-2 text-sm text-white bg-[#E8913A] hover:bg-[#E8913A]/80 rounded-lg transition-colors"
            >
              Replace
            </button>
          </div>
        </div>
      )}

      {/* Shows List */}
      {cloudSync.loading && cloudSync.readyShows.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cloudSync.readyShows.length === 0 ? (
        <div className="text-center py-8 bg-[#1A1A1A] rounded-xl border border-white/5">
          <p className="text-white/50 text-sm">No shows yet</p>
          <p className="text-white/30 text-xs mt-1">
            Upload sheet music from the dashboard
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {cloudSync.readyShows.map((show) => {
            const isCurrentShow = showManager.show.cloudShowId === show.id;
            const isImporting = importingShowId === show.id;

            return (
              <button
                key={show.id}
                onClick={() => handleImportShow(show.id, show.name)}
                disabled={isImporting || isCurrentShow}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  isCurrentShow
                    ? "bg-[#E8913A]/10 border-[#E8913A]/30"
                    : "bg-[#1A1A1A] border-white/5 hover:border-white/20 hover:bg-[#222]"
                } ${isImporting ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrentShow ? "text-[#E8913A]" : "text-white/90"
                      }`}
                    >
                      {show.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {show.source_filename || "Manual"} •{" "}
                      {formatDate(show.created_at)}
                    </p>
                  </div>
                  {isImporting ? (
                    <div className="w-5 h-5 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
                  ) : isCurrentShow ? (
                    <span className="text-xs text-[#E8913A] font-medium px-2 py-1 bg-[#E8913A]/10 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-white/40 group-hover:text-white/60">
                      Load
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Last synced */}
      {cloudSync.lastSynced && (
        <p className="text-xs text-white/30 text-center">
          Last synced: {cloudSync.lastSynced.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
