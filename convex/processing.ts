"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Retry helper with exponential backoff for rate limits
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 5000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a rate limit error
      const isRateLimit =
        lastError.message?.includes("rate_limit") ||
        lastError.message?.includes("429") ||
        (error as { status?: number })?.status === 429;

      if (!isRateLimit || attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 5s, 10s, 20s
      const delayMs = baseDelayMs * Math.pow(2, attempt);
      console.log(
        `Rate limited. Retrying in ${delayMs / 1000}s (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Interface for extracted part data from Claude
 */
interface ExtractedPart {
  name: string;
  tempo: number;
  beats: number;
  measure_start: number | null;
  measure_end: number | null;
}

/**
 * The prompt sent to Claude for tempo extraction from sheet music PDFs
 */
const TEMPO_EXTRACTION_PROMPT = `Analyze this sheet music PDF and extract all tempo markings, time signatures, and section/movement names.

For each distinct section or tempo change, provide:
1. Section name (e.g., "Opener", "Movement 1", "Ballad", "Closer", or rehearsal marks like "A", "B", etc.)
2. Tempo in BPM (beats per minute) - look for markings like "♩= 120" or "q = 144" or tempo words like "Allegro"
3. Time signature (beats per measure, e.g., 4 for 4/4, 3 for 3/4)
4. Starting measure number if visible
5. Ending measure number if visible

Return your response as a JSON array with this exact format:
[
  {
    "name": "Section Name",
    "tempo": 120,
    "beats": 4,
    "measure_start": 1,
    "measure_end": 32
  }
]

If you can't determine measure numbers, use null for those fields.
If you can't find explicit tempo markings, make educated guesses based on tempo words (Allegro ≈ 120-168, Andante ≈ 76-108, etc.).
If this appears to be marching band/drum corps music, common sections are: Opener, Movement 1/2/3, Ballad, Closer.

IMPORTANT: Return ONLY the JSON array, no other text or explanation.`;

/**
 * Parse Claude's response to extract JSON array of parts
 */
function parseClaudeResponse(responseText: string): ExtractedPart[] {
  let jsonStr = responseText.trim();

  // Handle potential markdown code blocks
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith("```")) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  const parsed = JSON.parse(jsonStr);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("No tempo data extracted from PDF");
  }

  return parsed;
}

/**
 * Format error message for user display
 */
function formatErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unknown processing error";
  }

  if (error.message.includes("rate_limit")) {
    return "Rate limit exceeded. Please try again in a few minutes.";
  }
  if (error.message.includes("Failed to fetch PDF")) {
    return "Could not download the PDF. Please try uploading again.";
  }
  if (error.message.includes("Failed to parse") || error.message.includes("JSON")) {
    return "Could not extract tempo data from this PDF. Try a clearer scan.";
  }
  if (error.message.includes("No tempo data")) {
    return "No tempo markings found in this PDF. You may need to add parts manually.";
  }

  return error.message;
}

/**
 * Process a PDF to extract tempo information using Claude API
 *
 * This action:
 * 1. Gets the show and PDF from Convex storage
 * 2. Sends the PDF to Claude API for tempo extraction
 * 3. Creates parts in the database from the extraction
 * 4. Updates show status to "ready" or "error"
 */
export const processPdf = action({
  args: {
    showId: v.id("shows"),
  },
  handler: async (ctx, args) => {
    const { showId } = args;

    // Get the show
    const show = await ctx.runQuery(internal.shows.getShowInternal, { showId });
    if (!show) {
      throw new Error("Show not found");
    }

    if (!show.pdfStorageId) {
      throw new Error("Show does not have a PDF");
    }

    // Update status to processing
    await ctx.runMutation(internal.shows.updateShowStatusInternal, {
      showId,
      status: "processing",
    });

    try {
      // Get the PDF URL from storage
      const pdfUrl = await ctx.runQuery(internal.shows.getPdfUrlInternal, {
        storageId: show.pdfStorageId,
      });

      if (!pdfUrl) {
        throw new Error("Failed to get PDF URL from storage");
      }

      // Fetch the PDF
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

      // Initialize Anthropic client
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Send to Claude for analysis (with retry for rate limits)
      const message = await withRetry(() =>
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: pdfBase64,
                  },
                },
                {
                  type: "text",
                  text: TEMPO_EXTRACTION_PROMPT,
                },
              ],
            },
          ],
        })
      );

      // Extract response text
      const responseText =
        message.content[0].type === "text" ? message.content[0].text : "";

      // Parse Claude's response
      let extractedParts: ExtractedPart[];
      try {
        extractedParts = parseClaudeResponse(responseText);
      } catch {
        throw new Error("Failed to parse tempo data from PDF");
      }

      // Convert extracted parts to Convex format
      const partsToCreate = extractedParts.map((part, index) => ({
        name: part.name || `Part ${index + 1}`,
        tempo: part.tempo || 120,
        beats: part.beats || 4,
        measureStart: part.measure_start ?? undefined,
        measureEnd: part.measure_end ?? undefined,
        position: index,
      }));

      // Create parts in database
      await ctx.runMutation(internal.parts.createPartsFromExtraction, {
        showId,
        parts: partsToCreate,
      });

      // Update show status to ready
      await ctx.runMutation(internal.shows.updateShowStatusInternal, {
        showId,
        status: "ready",
      });

      return {
        success: true,
        message: "Processing complete",
        partsCreated: extractedParts.length,
      };
    } catch (error) {
      console.error("PDF processing error:", error);

      // Format user-friendly error message
      const errorMessage = formatErrorMessage(error);

      // Update show status to error
      await ctx.runMutation(internal.shows.updateShowStatusInternal, {
        showId,
        status: "error",
        errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});
