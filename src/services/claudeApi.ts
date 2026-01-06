/**
 * Claude API Service for Sheet Music Analysis
 *
 * Handles communication with the Anthropic Claude API for analyzing
 * sheet music images/PDFs and extracting tempo, time signature,
 * and structural information.
 */

import {
  AnalyzedScore,
  SupportedImageType,
  SupportedDocumentType,
} from '../types/scoreAnalysis';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Prompt template for sheet music analysis
 * Carefully crafted to extract musical information accurately
 */
const ANALYSIS_PROMPT = `You are a professional musician and music notation expert. Analyze this sheet music and extract all tempo-related information.

Return a JSON object with the following structure:
{
  "title": "Title if visible, null otherwise",
  "composer": "Composer if visible, null otherwise",
  "initialTempo": <number BPM - estimate from marking if only Italian term given>,
  "initialTimeSignature": { "numerator": <number>, "denominator": <number> },
  "totalMeasures": <estimated total measures visible>,
  "tempoChanges": [
    { "measure": <number>, "tempo": <BPM>, "marking": "original text", "type": "absolute" }
  ],
  "timeSignatureChanges": [
    { "measure": <number>, "numerator": <number>, "denominator": <number> }
  ],
  "rehearsalMarks": [
    { "measure": <number>, "label": "A" }
  ],
  "fermatas": [
    { "measure": <number>, "beat": <number>, "duration": "medium" }
  ],
  "confidence": <0-1 how confident you are in this analysis>,
  "rawNotes": "Any additional observations about the score"
}

For tempo markings, use these BPM values:
- Grave: 35 BPM
- Largo: 50 BPM
- Larghetto: 63 BPM
- Adagio: 71 BPM
- Andante: 92 BPM
- Moderato: 114 BPM
- Allegretto: 116 BPM
- Allegro: 138 BPM
- Vivace: 166 BPM
- Presto: 184 BPM
- Prestissimo: 208 BPM

If a metronome marking is given (e.g., ♩=120), use that exact value.
For "rit." or "rall." mark type as "relative" and estimate the target tempo.
For "accel." mark type as "relative" and estimate the target tempo.

If you see rehearsal letters (A, B, C) or section names (Intro, Verse, Chorus, Bridge), include them as rehearsalMarks.

Return ONLY the JSON object, no markdown formatting or explanation.`;

/**
 * Error class for Claude API errors
 */
export class ClaudeApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public type?: string
  ) {
    super(message);
    this.name = 'ClaudeApiError';
  }
}

/**
 * Analyze sheet music from a base64-encoded image
 *
 * @param imageBase64 - Base64 encoded image data (without data URL prefix)
 * @param mimeType - MIME type of the image
 * @param apiKey - Anthropic API key
 * @returns Analyzed score data
 */
export async function analyzeSheetMusicImage(
  imageBase64: string,
  mimeType: SupportedImageType,
  apiKey: string
): Promise<AnalyzedScore> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  return handleResponse(response);
}

/**
 * Analyze sheet music from a base64-encoded PDF
 *
 * @param pdfBase64 - Base64 encoded PDF data (without data URL prefix)
 * @param apiKey - Anthropic API key
 * @returns Analyzed score data
 */
export async function analyzeSheetMusicPdf(
  pdfBase64: string,
  apiKey: string
): Promise<AnalyzedScore> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf' as SupportedDocumentType,
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  return handleResponse(response);
}

/**
 * Handle API response and parse JSON
 */
async function handleResponse(response: Response): Promise<AnalyzedScore> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ClaudeApiError(
      errorData.error?.message || `API request failed with status ${response.status}`,
      response.status,
      errorData.error?.type
    );
  }

  const data = await response.json();
  const content = data.content?.[0];

  if (!content || content.type !== 'text') {
    throw new ClaudeApiError('Unexpected response format from Claude API');
  }

  // Parse the JSON from Claude's response
  // Claude might include markdown code blocks, so we extract just the JSON
  let jsonText = content.text.trim();

  // Remove markdown code block if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const analysis = JSON.parse(jsonText) as AnalyzedScore;
    return validateAndNormalizeAnalysis(analysis);
  } catch {
    throw new ClaudeApiError('Failed to parse analysis response as JSON');
  }
}

/**
 * Validate and normalize the analysis result
 */
function validateAndNormalizeAnalysis(analysis: AnalyzedScore): AnalyzedScore {
  // Ensure required fields have defaults
  return {
    title: analysis.title || undefined,
    composer: analysis.composer || undefined,
    initialTempo: Math.max(20, Math.min(300, analysis.initialTempo || 120)),
    initialTimeSignature: analysis.initialTimeSignature || { numerator: 4, denominator: 4 },
    totalMeasures: Math.max(1, analysis.totalMeasures || 1),
    tempoChanges: (analysis.tempoChanges || []).map((tc) => ({
      measure: Math.max(1, tc.measure),
      tempo: Math.max(20, Math.min(300, tc.tempo)),
      marking: tc.marking,
      type: tc.type || 'absolute',
    })),
    timeSignatureChanges: (analysis.timeSignatureChanges || []).map((ts) => ({
      measure: Math.max(1, ts.measure),
      numerator: Math.max(1, Math.min(16, ts.numerator)),
      denominator: Math.max(1, Math.min(16, ts.denominator)),
    })),
    rehearsalMarks: (analysis.rehearsalMarks || []).map((rm) => ({
      measure: Math.max(1, rm.measure),
      label: rm.label || 'Unknown',
    })),
    fermatas: (analysis.fermatas || []).map((f) => ({
      measure: Math.max(1, f.measure),
      beat: Math.max(1, f.beat),
      duration: f.duration || 'medium',
    })),
    confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
    rawNotes: analysis.rawNotes,
  };
}

/**
 * Determine if a file is a supported type
 */
export function isSupportedImageType(mimeType: string): mimeType is SupportedImageType {
  return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(mimeType);
}

/**
 * Determine if a file is a PDF
 */
export function isPdfType(mimeType: string): mimeType is SupportedDocumentType {
  return mimeType === 'application/pdf';
}

/**
 * Extract MIME type from a data URL
 */
export function getMimeTypeFromDataUrl(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:([^;]+);/);
  return match ? match[1] : null;
}

/**
 * Extract base64 data from a data URL
 */
export function getBase64FromDataUrl(dataUrl: string): string {
  const base64Index = dataUrl.indexOf('base64,');
  if (base64Index === -1) {
    throw new ClaudeApiError('Invalid data URL format');
  }
  return dataUrl.substring(base64Index + 7);
}
