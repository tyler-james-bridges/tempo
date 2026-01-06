/**
 * Score Analyzer Hook
 *
 * Wraps the useShow hook with AI-powered sheet music analysis capabilities.
 * Handles file selection, Claude API integration, and conversion of analysis
 * results to the Show/Part structure.
 */

import { useState, useCallback } from 'react';
import { useShow, Part } from './useShow';
import {
  analyzeSheetMusicImage,
  analyzeSheetMusicPdf,
  isSupportedImageType,
  isPdfType,
  getBase64FromDataUrl,
  getMimeTypeFromDataUrl,
  ClaudeApiError,
} from '../services/claudeApi';
import {
  AnalyzedScore,
  RehearsalMark,
  TempoChange,
  TimeSignatureChange,
  SupportedImageType,
} from '../types/scoreAnalysis';

export interface AnalyzerState {
  /** Whether analysis is in progress */
  isAnalyzing: boolean;
  /** Error message if analysis failed */
  error: string | null;
  /** Last successful analysis result */
  lastAnalysis: AnalyzedScore | null;
  /** Progress message during analysis */
  progressMessage: string;
}

/**
 * Get the tempo at a specific measure number
 */
function getTempoAtMeasure(analysis: AnalyzedScore, measure: number): number {
  // Find the most recent tempo change at or before this measure
  const relevantChanges = analysis.tempoChanges
    .filter((tc) => tc.measure <= measure && tc.type === 'absolute')
    .sort((a, b) => b.measure - a.measure);

  return relevantChanges[0]?.tempo || analysis.initialTempo;
}

/**
 * Get the time signature at a specific measure number
 */
function getTimeSignatureAtMeasure(
  analysis: AnalyzedScore,
  measure: number
): { numerator: number; denominator: number } {
  // Find the most recent time signature change at or before this measure
  const relevantChanges = analysis.timeSignatureChanges
    .filter((ts) => ts.measure <= measure)
    .sort((a, b) => b.measure - a.measure);

  return relevantChanges[0] || analysis.initialTimeSignature;
}

/**
 * Convert an AnalyzedScore to an array of Parts for the show
 */
function convertAnalysisToParts(analysis: AnalyzedScore): Omit<Part, 'id'>[] {
  const parts: Omit<Part, 'id'>[] = [];

  if (analysis.rehearsalMarks.length > 0) {
    // Create parts from rehearsal marks
    for (const mark of analysis.rehearsalMarks) {
      const tempo = getTempoAtMeasure(analysis, mark.measure);
      const timeSig = getTimeSignatureAtMeasure(analysis, mark.measure);

      parts.push({
        name: mark.label,
        tempo,
        beats: timeSig.numerator,
      });
    }
  } else if (analysis.tempoChanges.length > 0) {
    // No rehearsal marks - create parts from significant tempo changes
    const absoluteChanges = analysis.tempoChanges.filter((tc) => tc.type === 'absolute');

    if (absoluteChanges.length > 0) {
      // Add initial part if first tempo change isn't at measure 1
      if (absoluteChanges[0].measure > 1) {
        const timeSig = analysis.initialTimeSignature;
        parts.push({
          name: 'Intro',
          tempo: analysis.initialTempo,
          beats: timeSig.numerator,
        });
      }

      // Add parts for each tempo change
      for (const change of absoluteChanges) {
        const timeSig = getTimeSignatureAtMeasure(analysis, change.measure);
        parts.push({
          name: change.marking || `m.${change.measure}`,
          tempo: change.tempo,
          beats: timeSig.numerator,
        });
      }
    } else {
      // Only relative changes - create single part
      parts.push({
        name: analysis.title || 'Full Score',
        tempo: analysis.initialTempo,
        beats: analysis.initialTimeSignature.numerator,
      });
    }
  } else {
    // No tempo changes or rehearsal marks - single part with initial values
    parts.push({
      name: analysis.title || 'Full Score',
      tempo: analysis.initialTempo,
      beats: analysis.initialTimeSignature.numerator,
    });
  }

  return parts;
}

/**
 * Hook for analyzing sheet music and importing into the show manager
 */
export function useScoreAnalyzer() {
  const showManager = useShow();

  const [state, setState] = useState<AnalyzerState>({
    isAnalyzing: false,
    error: null,
    lastAnalysis: null,
    progressMessage: '',
  });

  /**
   * Import an already-analyzed score into the show
   */
  const importAnalysis = useCallback(
    (analysis: AnalyzedScore) => {
      // Clear existing show
      showManager.clearShow();

      // Set show name from title or composer
      const showName = analysis.title
        ? analysis.composer
          ? `${analysis.title} - ${analysis.composer}`
          : analysis.title
        : 'Imported Score';

      showManager.setShowName(showName);

      // Convert to parts and add each one
      const parts = convertAnalysisToParts(analysis);
      for (const part of parts) {
        showManager.addPart(part.name, part.tempo, part.beats);
      }

      setState((prev) => ({ ...prev, lastAnalysis: analysis }));
    },
    [showManager]
  );

  /**
   * Analyze a sheet music file (image or PDF) and optionally import it
   *
   * @param fileUri - URI or data URL of the file
   * @param apiKey - Anthropic API key
   * @param autoImport - Whether to automatically import after analysis
   */
  const analyzeFile = useCallback(
    async (
      fileUri: string,
      apiKey: string,
      autoImport: boolean = true
    ): Promise<AnalyzedScore> => {
      setState({
        isAnalyzing: true,
        error: null,
        lastAnalysis: null,
        progressMessage: 'Preparing file...',
      });

      try {
        // Handle data URL format
        let base64Data: string;
        let mimeType: string | null;

        if (fileUri.startsWith('data:')) {
          mimeType = getMimeTypeFromDataUrl(fileUri);
          base64Data = getBase64FromDataUrl(fileUri);
        } else {
          // For file:// URIs, we need to read the file
          // This will be handled by the component that calls this
          throw new ClaudeApiError(
            'File URI format not supported. Please provide a data URL or base64 data.'
          );
        }

        if (!mimeType) {
          throw new ClaudeApiError('Could not determine file type');
        }

        setState((prev) => ({ ...prev, progressMessage: 'Analyzing sheet music...' }));

        let analysis: AnalyzedScore;

        if (isPdfType(mimeType)) {
          analysis = await analyzeSheetMusicPdf(base64Data, apiKey);
        } else if (isSupportedImageType(mimeType)) {
          analysis = await analyzeSheetMusicImage(base64Data, mimeType, apiKey);
        } else {
          throw new ClaudeApiError(
            `Unsupported file type: ${mimeType}. Please use PNG, JPEG, WebP, GIF, or PDF.`
          );
        }

        setState((prev) => ({
          ...prev,
          progressMessage: 'Analysis complete!',
          lastAnalysis: analysis,
        }));

        if (autoImport) {
          importAnalysis(analysis);
        }

        setState((prev) => ({ ...prev, isAnalyzing: false, progressMessage: '' }));
        return analysis;
      } catch (error) {
        const errorMessage =
          error instanceof ClaudeApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : 'An unknown error occurred';

        setState({
          isAnalyzing: false,
          error: errorMessage,
          lastAnalysis: null,
          progressMessage: '',
        });

        throw error;
      }
    },
    [importAnalysis]
  );

  /**
   * Analyze from base64 data directly
   */
  const analyzeBase64 = useCallback(
    async (
      base64Data: string,
      mimeType: string,
      apiKey: string,
      autoImport: boolean = true
    ): Promise<AnalyzedScore> => {
      setState({
        isAnalyzing: true,
        error: null,
        lastAnalysis: null,
        progressMessage: 'Analyzing sheet music...',
      });

      try {
        let analysis: AnalyzedScore;

        if (isPdfType(mimeType)) {
          analysis = await analyzeSheetMusicPdf(base64Data, apiKey);
        } else if (isSupportedImageType(mimeType)) {
          analysis = await analyzeSheetMusicImage(
            base64Data,
            mimeType as SupportedImageType,
            apiKey
          );
        } else {
          throw new ClaudeApiError(
            `Unsupported file type: ${mimeType}. Please use PNG, JPEG, WebP, GIF, or PDF.`
          );
        }

        setState((prev) => ({
          ...prev,
          progressMessage: 'Analysis complete!',
          lastAnalysis: analysis,
        }));

        if (autoImport) {
          importAnalysis(analysis);
        }

        setState((prev) => ({ ...prev, isAnalyzing: false, progressMessage: '' }));
        return analysis;
      } catch (error) {
        const errorMessage =
          error instanceof ClaudeApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : 'An unknown error occurred';

        setState({
          isAnalyzing: false,
          error: errorMessage,
          lastAnalysis: null,
          progressMessage: '',
        });

        throw error;
      }
    },
    [importAnalysis]
  );

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // Show manager passthrough
    ...showManager,

    // Analyzer state
    isAnalyzing: state.isAnalyzing,
    analysisError: state.error,
    lastAnalysis: state.lastAnalysis,
    progressMessage: state.progressMessage,

    // Analyzer actions
    analyzeFile,
    analyzeBase64,
    importAnalysis,
    clearError,
  };
}

export type ScoreAnalyzerHook = ReturnType<typeof useScoreAnalyzer>;
