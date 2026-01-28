'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import { getStatusBadgeClass } from '@/lib/utils';

// Dynamic import to avoid SSR issues with pdfjs-dist
const PdfViewer = dynamic(
  () => import('@/components/PdfViewer').then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function ShowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const showId = params.id as string;

  const { isLoaded } = useUser();

  // Convex queries and mutations
  const showWithParts = useQuery(
    api.shows.getShowWithParts,
    showId ? { showId: showId as Id<'shows'> } : 'skip'
  );
  const createPartMutation = useMutation(api.parts.createPart);
  const deletePartMutation = useMutation(api.parts.deletePart);
  const updateShowStatusMutation = useMutation(api.shows.updateShowStatus);

  const [addingPart, setAddingPart] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartTempo, setNewPartTempo] = useState(120);
  const [newPartBeats, setNewPartBeats] = useState(4);
  const [showPdf, setShowPdf] = useState(false);

  // Loading state - wait for auth and data
  const loading = !isLoaded || showWithParts === undefined;

  // Redirect if no show found (after loading)
  if (!loading && showWithParts === null) {
    router.push('/dashboard');
    return null;
  }

  const show = showWithParts?.show;
  const parts = showWithParts?.parts ?? [];

  const addPart = async () => {
    if (!newPartName.trim() || !show) return;

    try {
      await createPartMutation({
        showId: show._id,
        name: newPartName,
        tempo: newPartTempo,
        beats: newPartBeats,
      });

      setNewPartName('');
      setNewPartTempo(120);
      setNewPartBeats(4);
      setAddingPart(false);
    } catch (error) {
      console.error('Failed to add part:', error);
    }
  };

  const deletePart = async (partId: string) => {
    try {
      await deletePartMutation({
        partId: partId as Id<'parts'>,
      });
    } catch (error) {
      console.error('Failed to delete part:', error);
    }
  };

  const reprocessShow = async () => {
    if (!show) return;

    setReprocessing(true);

    try {
      // Delete all parts for this show
      for (const part of parts) {
        await deletePartMutation({
          partId: part._id,
        });
      }

      // Update show status to processing
      await updateShowStatusMutation({
        showId: show._id,
        status: 'processing',
      });

      // Note: PDF reprocessing would need to be triggered via an API route
      // that can access the Convex storage URL and call the AI processing
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId: show._id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Processing failed');
      }
    } catch (error) {
      console.error('Reprocess error:', error);
      alert(
        'Failed to reprocess: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
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
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <div className="h-4 w-px bg-[#E8E8E6]" />
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8913A] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
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
              <span className={getStatusBadgeClass(show.status)}>
                {show.status}
              </span>
            </div>
            {show.sourceFilename && (
              <p className="text-[#5C5C5C] text-sm">{show.sourceFilename}</p>
            )}
          </div>
          {show.status !== 'processing' && (
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reprocess
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {show.status === 'error' && show.errorMessage && (
          <div className="card p-4 mb-6 border-[#DC2626]/20 bg-[#DC2626]/5">
            <p className="text-[#DC2626] text-sm">{show.errorMessage}</p>
          </div>
        )}

        {/* Processing Status */}
        {(show.status === 'pending' || show.status === 'processing') && (
          <div className="card p-6 mb-6 border-[#CA8A04]/20 bg-[#CA8A04]/5">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#CA8A04] border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-[#CA8A04] font-medium">Processing PDF...</p>
                <p className="text-[#5C5C5C] text-sm">
                  Extracting tempo information
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Section */}
        {show.pdfStorageId && (
          <div className="card mb-6 overflow-hidden">
            <button
              onClick={() => setShowPdf(!showPdf)}
              className="w-full p-4 flex items-center justify-between hover:bg-[#FAFAF9] transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#5C5C5C]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium text-[#1A1A1A]">
                  {show.sourceFilename || 'Sheet Music PDF'}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-[#5C5C5C] transition-transform ${showPdf ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showPdf && (
              <div className="border-t border-[#E8E8E6] p-4">
                <PdfViewer showId={showId} />
              </div>
            )}
          </div>
        )}

        {/* Parts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Parts</h2>
              <p className="text-[#5C5C5C] text-sm">
                {parts.length} part{parts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setAddingPart(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add part
            </button>
          </div>

          {/* Add Part Form */}
          {addingPart && (
            <div className="card p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Name
                  </label>
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
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Tempo (BPM)
                  </label>
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
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Beats
                  </label>
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
                <button
                  onClick={() => setAddingPart(false)}
                  className="btn-secondary text-sm"
                >
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
                {show.status === 'processing'
                  ? 'Parts will appear after processing'
                  : 'Add parts manually'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {parts.map((part, index) => (
                <div
                  key={part._id}
                  className="part-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[#8C8C8C] text-sm w-6">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-[#1A1A1A]">
                        {part.name}
                      </h3>
                      {part.rehearsalMark && (
                        <span className="text-[#E8913A] text-sm">
                          Rehearsal {part.rehearsalMark}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#E8913A] tempo-display">
                        {part.tempo}
                      </p>
                      <p className="text-[#8C8C8C] text-xs">BPM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-[#1A1A1A]">
                        {part.beats}/4
                      </p>
                      <p className="text-[#8C8C8C] text-xs">Time</p>
                    </div>
                    {part.measureStart && part.measureEnd && (
                      <div className="text-center">
                        <p className="text-lg font-medium text-[#1A1A1A]">
                          {part.measureStart}-{part.measureEnd}
                        </p>
                        <p className="text-[#8C8C8C] text-xs">Measures</p>
                      </div>
                    )}
                    <button
                      onClick={() => deletePart(part._id)}
                      className="text-[#8C8C8C] hover:text-[#DC2626] transition-colors p-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
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
              <svg
                className="w-5 h-5 text-[#16A34A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <p className="text-[#16A34A] font-medium">Ready to practice</p>
                <p className="text-[#5C5C5C] text-sm">
                  This show syncs automatically to the TempoMap app
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
