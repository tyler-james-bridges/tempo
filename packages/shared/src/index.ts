/**
 * Shared Types for Tempo App
 *
 * Used by both mobile app and web portal
 */

// ============================================
// Core Metronome Types (existing)
// ============================================

export type SoundType = 'click' | 'beep' | 'wood' | 'cowbell';
export type SubdivisionType = 1 | 2 | 3 | 4;
export type AccentPattern = 0 | 1 | 2 | 3 | 4;

// ============================================
// Part & Show Types (existing, now shared)
// ============================================

export interface Part {
  id: string;
  name: string;
  tempo: number;
  beats: number;
  /** First measure number (from PDF extraction) */
  measureStart?: number;
  /** Last measure number (from PDF extraction) */
  measureEnd?: number;
  /** Rehearsal mark e.g., "A", "B", "Ballad" */
  rehearsalMark?: string;
  /** Position in show order */
  position?: number;
}

export interface Show {
  name: string;
  parts: Part[];
  activePartId: string | null;
}

// ============================================
// Cloud Types (new for Tempo Cloud)
// ============================================

export type ShowStatus = 'pending' | 'processing' | 'ready' | 'error';
export type ShowSourceType = 'pdf_upload' | 'dropbox' | 'manual';

export interface CloudShow {
  id: string;
  userId: string;
  name: string;
  sourceType: ShowSourceType;
  sourceFilename?: string;
  pdfUrl?: string;
  musicxmlUrl?: string;
  status: ShowStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudPart {
  id: string;
  showId: string;
  name: string;
  tempo: number;
  beats: number;
  measureStart?: number;
  measureEnd?: number;
  rehearsalMark?: string;
  position: number;
  createdAt: string;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface UploadRequest {
  filename: string;
  contentType: string;
  fileSize: number;
}

export interface UploadResponse {
  uploadUrl: string;
  showId: string;
}

export interface ProcessingStatus {
  showId: string;
  status: ShowStatus;
  progress?: number;
  errorMessage?: string;
}

// ============================================
// Utility Types
// ============================================

export type PartialPart = Partial<Omit<Part, 'id'>> & { id: string };

/** Convert CloudShow + CloudParts to local Show format */
export function cloudToLocalShow(cloudShow: CloudShow, cloudParts: CloudPart[]): Show {
  return {
    name: cloudShow.name,
    parts: cloudParts
      .sort((a, b) => a.position - b.position)
      .map((p) => ({
        id: p.id,
        name: p.name,
        tempo: p.tempo,
        beats: p.beats,
        measureStart: p.measureStart,
        measureEnd: p.measureEnd,
        rehearsalMark: p.rehearsalMark,
        position: p.position,
      })),
    activePartId: null,
  };
}
