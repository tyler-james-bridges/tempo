"use client";

/**
 * CloudShowsPanel - Cloud sync section for settings
 *
 * Shows the user's cloud shows and allows importing them into the metronome.
 * Also allows uploading new sheet music PDFs directly.
 */

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
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
  const [uploadingFilename, setUploadingFilename] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Clear uploadingFilename when the show appears in the list
  useEffect(() => {
    if (uploadingFilename && cloudSync.readyShows.some(
      (show) => show.source_filename === uploadingFilename
    )) {
      setUploadingFilename(null);
    }
  }, [cloudSync.readyShows, uploadingFilename]);
  const [dragActive, setDragActive] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    showId: string;
    showName: string;
  } | null>(null);
  const [deletingShow, setDeletingShow] = useState<{
    id: string;
    name: string;
    source_filename?: string | null;
    created_at: string;
  } | null>(null);

  // Convex mutations and actions for file upload
  const generateUploadUrl = useMutation(api.shows.generateUploadUrl);
  const createShowFromPdf = useMutation(api.shows.createShowFromPdf);
  const processPdf = useAction(api.processing.processPdf);
  const deleteShowMutation = useMutation(api.shows.deleteShow);

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

  const handleDeleteShow = async (showId: string) => {
    // Cache the show data before deleting so we can keep rendering it
    const showToDelete = cloudSync.readyShows.find((s) => s.id === showId);
    if (showToDelete) {
      setDeletingShow(showToDelete);
    }
    setConfirmDelete(null);

    try {
      await deleteShowMutation({ showId: showId as Id<"shows"> });
    } catch (error) {
      console.error("Failed to delete show:", error);
    } finally {
      setDeletingShow(null);
    }
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

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File size must be under 50MB");
      return;
    }

    setUploading(true);
    setUploadingFilename(file.name);

    try {
      // Step 1: Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file directly to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await response.json();

      // Step 3: Create show record
      const showId = await createShowFromPdf({
        name: file.name.replace(".pdf", ""),
        sourceFilename: file.name,
        pdfStorageId: storageId,
      });

      // Step 4: Trigger PDF processing action (runs async on server)
      processPdf({ showId }).catch((err) => {
        console.error("PDF processing failed:", err);
      });

      // Refresh the shows list to include the new upload
      await cloudSync.fetchShows();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload failed"
      );
      setUploadingFilename(null); // Only clear on error
    } finally {
      setUploading(false);
      // Don't clear uploadingFilename here - useEffect will clear it when the show appears in the list
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

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="bg-[#1A1A1A] border border-red-500/20 rounded-xl p-4 space-y-3">
          <p className="text-sm text-white/80">
            Delete &quot;{confirmDelete.showName}&quot;? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 px-3 py-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteShow(confirmDelete.showId)}
              className="flex-1 px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Delete
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
          <span className="text-xs text-white/30 mt-1">Max 50MB</span>
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
      {isAuthenticated && cloudSync.loading && cloudSync.readyShows.length === 0 && !uploading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isAuthenticated && cloudSync.readyShows.length === 0 && !uploading ? (
        <div className="text-center py-4">
          <p className="text-white/30 text-xs">No shows yet</p>
        </div>
      ) : isAuthenticated ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {/* Uploading placeholder card */}
          {uploadingFilename && (
            <div className="w-full text-left px-4 py-3 rounded-xl border border-[#E8913A]/30 bg-[#E8913A]/5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white/70">
                    {uploadingFilename.replace(".pdf", "")}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {uploadingFilename} • Processing...
                  </p>
                </div>
                <div className="w-5 h-5 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
          {cloudSync.readyShows.map((show) => {
            const isCurrentShow = showManager.show.cloudShowId === show.id;
            const isImporting = importingShowId === show.id;
            const isDeleting = deletingShow?.id === show.id;

            return (
              <div
                key={show.id}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  isCurrentShow
                    ? "bg-[#E8913A]/10 border-[#E8913A]/30"
                    : isDeleting
                    ? "bg-red-500/5 border-red-500/20"
                    : "bg-[#1A1A1A] border-white/5"
                } ${isImporting || isDeleting ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleImportShow(show.id, show.name)}
                    disabled={isImporting || isCurrentShow || isDeleting}
                    className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity disabled:hover:opacity-100"
                  >
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
                  </button>
                  <div className="flex items-center gap-2">
                    {isDeleting ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : isImporting ? (
                      <div className="w-5 h-5 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
                    ) : isCurrentShow ? (
                      <span className="text-xs text-[#E8913A] font-medium px-2 py-1 bg-[#E8913A]/10 rounded">
                        Active
                      </span>
                    ) : null}
                    {!isDeleting && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete({ showId: show.id, showName: show.name });
                        }}
                        disabled={isImporting}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors disabled:opacity-50"
                        aria-label="Delete show"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
