/**
 * Types for AI-powered sheet music analysis
 *
 * These types define the structure of data extracted from sheet music PDFs
 * by Claude's vision API, which is then converted to the Show/Part structure.
 */

/**
 * A tempo change detected in the score
 */
export interface TempoChange {
  /** Measure number where the change occurs */
  measure: number;
  /** BPM value */
  tempo: number;
  /** Original marking text (e.g., "Allegro", "rit.", "accel.") */
  marking?: string;
  /** Whether this is an exact BPM or a relative change */
  type: 'absolute' | 'relative';
}

/**
 * A time signature change detected in the score
 */
export interface TimeSignatureChange {
  /** Measure number where the change occurs */
  measure: number;
  /** Top number (beats per measure) */
  numerator: number;
  /** Bottom number (note value that gets one beat) */
  denominator: number;
}

/**
 * A rehearsal mark or section label
 */
export interface RehearsalMark {
  /** Measure number where the mark appears */
  measure: number;
  /** Label text (e.g., "A", "B", "Verse", "Chorus", "Intro") */
  label: string;
}

/**
 * A fermata (pause/hold) detected in the score
 */
export interface Fermata {
  /** Measure number */
  measure: number;
  /** Beat within the measure (1-based) */
  beat: number;
  /** Estimated duration of the fermata */
  duration?: 'short' | 'medium' | 'long';
}

/**
 * Complete analysis result from Claude
 */
export interface AnalyzedScore {
  /** Title of the piece (if visible) */
  title?: string;
  /** Composer name (if visible) */
  composer?: string;
  /** Initial tempo in BPM */
  initialTempo: number;
  /** Initial time signature */
  initialTimeSignature: {
    numerator: number;
    denominator: number;
  };
  /** Estimated total measures in the analyzed pages */
  totalMeasures: number;
  /** All tempo changes detected */
  tempoChanges: TempoChange[];
  /** All time signature changes detected */
  timeSignatureChanges: TimeSignatureChange[];
  /** All rehearsal marks/section labels detected */
  rehearsalMarks: RehearsalMark[];
  /** All fermatas detected */
  fermatas: Fermata[];
  /** Claude's confidence in the analysis (0-1) */
  confidence: number;
  /** Any additional observations or notes */
  rawNotes?: string;
}

/**
 * Standard Italian tempo markings with their typical BPM ranges
 * Used as fallback when no metronome marking is given
 */
export const TEMPO_MARKINGS: Record<string, { min: number; max: number; default: number }> = {
  grave: { min: 20, max: 40, default: 35 },
  largo: { min: 40, max: 60, default: 50 },
  larghetto: { min: 60, max: 66, default: 63 },
  adagio: { min: 66, max: 76, default: 71 },
  andante: { min: 76, max: 108, default: 92 },
  andantino: { min: 80, max: 108, default: 94 },
  moderato: { min: 108, max: 120, default: 114 },
  allegretto: { min: 112, max: 120, default: 116 },
  allegro: { min: 120, max: 156, default: 138 },
  vivace: { min: 156, max: 176, default: 166 },
  presto: { min: 168, max: 200, default: 184 },
  prestissimo: { min: 200, max: 240, default: 208 },
};

/**
 * Supported image MIME types for Claude vision API
 */
export type SupportedImageType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';

/**
 * Supported document types
 */
export type SupportedDocumentType = 'application/pdf';
