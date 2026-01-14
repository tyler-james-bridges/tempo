"use client";

/**
 * CloudShowsPanel - Cloud sync section for settings
 *
 * Shows the user's cloud shows and allows importing them into the metronome.
 * Also allows uploading new sheet music PDFs directly.
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import type { CloudSyncHook } from "@/hooks/useCloudSync";
import type { ShowHook } from "@/hooks/useShow";

interface CloudShowsPanelProps {
  cloudSync: CloudSyncHook;
  showManager: ShowHook;
  onShowImported?: () => void;
  isAuthenticated?: boolean;
}

export function CloudShowsPanel({
  cloudSync,
  showManager,
  onShowImported,
  isAuthenticated,
}: CloudShowsPanelProps) {
  const [importingShowId, setImportingShowId] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState<{
    showId: string;
    showName: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadError(null);

    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be under 10MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Refresh the shows list to include the new upload
      await cloudSync.fetchShows();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // Show login prompt for unauthenticated users (unless in guest mode)
  if (!isAuthenticated && !guestMode) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-white/80 font-medium mb-1">Sign in to save shows</h3>
          <p className="text-white/40 text-sm mb-6">
            Your uploaded sheet music will be saved to your account
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-[#E8913A] hover:bg-[#E8913A]/90 text-white text-sm font-medium rounded-xl transition-colors text-center"
            >
              Sign in
            </Link>
            <button
              onClick={() => setGuestMode(true)}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-xl transition-colors"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Guest mode warning */}
      {!isAuthenticated && guestMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <p className="text-amber-400 text-sm font-medium">Guest mode</p>
          <p className="text-amber-400/70 text-xs mt-1">
            Uploads won&apos;t be saved.{" "}
            <Link href="/login" className="underline hover:text-amber-400">
              Sign in
            </Link>{" "}
            to save your shows.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white/40 tracking-wider uppercase">
            Your Shows
          </h3>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => cloudSync.fetchShows()}
            disabled={cloudSync.loading}
            className="text-xs text-[#E8913A] hover:text-[#E8913A]/80 disabled:opacity-50 transition-colors"
          >
            {cloudSync.loading ? "Syncing..." : "Refresh"}
          </button>
        )}
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

      {/* Upload Zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors ${
          dragActive
            ? "border-[#E8913A] bg-[#E8913A]/10"
            : "border-white/20 hover:border-white/30"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-sm text-white/60">Processing PDF...</span>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-white/40 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-white/60">
                Drop PDF here or <span className="text-[#E8913A]">browse</span>
              </span>
              <span className="text-xs text-white/30 mt-1">Max 10MB</span>
            </>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
          {uploadError}
        </div>
      )}

      {/* Shows List - only for authenticated users */}
      {isAuthenticated && cloudSync.loading && cloudSync.readyShows.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isAuthenticated && cloudSync.readyShows.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-white/30 text-xs">No shows yet</p>
        </div>
      ) : isAuthenticated ? (
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
      ) : null}

      {/* Last synced - only for authenticated users */}
      {isAuthenticated && cloudSync.lastSynced && (
        <p className="text-xs text-white/30 text-center">
          Last synced: {cloudSync.lastSynced.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
