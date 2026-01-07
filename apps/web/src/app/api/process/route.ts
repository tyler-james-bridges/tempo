import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Lazy-init clients to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

interface ExtractedPart {
  name: string;
  tempo: number;
  beats: number;
  measure_start: number | null;
  measure_end: number | null;
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const anthropic = getAnthropic();

  try {
    const { showId, pdfUrl } = await request.json();

    if (!showId) {
      return NextResponse.json(
        { error: "Missing showId" },
        { status: 400 }
      );
    }

    console.log(`Processing show ${showId}...`);
    console.log(`PDF URL: ${pdfUrl}`);

    // Update status to processing
    await supabaseAdmin
      .from("shows")
      .update({ status: "processing" })
      .eq("id", showId);

    try {
      // Fetch the PDF
      console.log("Fetching PDF...");
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
      console.log(`PDF fetched, size: ${pdfBuffer.byteLength} bytes`);

      // Send to Claude for analysis
      console.log("Sending to Claude for analysis...");
      const message = await anthropic.messages.create({
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
                text: `Analyze this sheet music PDF and extract all tempo markings, time signatures, and section/movement names.

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

IMPORTANT: Return ONLY the JSON array, no other text or explanation.`,
              },
            ],
          },
        ],
      });

      // Parse Claude's response
      const responseText = message.content[0].type === "text"
        ? message.content[0].text
        : "";

      console.log("Claude response:", responseText);

      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      let extractedParts: ExtractedPart[];
      try {
        extractedParts = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Failed to parse Claude response as JSON:", parseError);
        console.error("Raw response:", responseText);
        throw new Error("Failed to parse tempo data from PDF");
      }

      if (!Array.isArray(extractedParts) || extractedParts.length === 0) {
        throw new Error("No tempo data extracted from PDF");
      }

      console.log(`Extracted ${extractedParts.length} parts from PDF`);

      // Insert parts into database
      const partsToInsert = extractedParts.map((part, index) => ({
        show_id: showId,
        name: part.name || `Part ${index + 1}`,
        tempo: part.tempo || 120,
        beats: part.beats || 4,
        measure_start: part.measure_start,
        measure_end: part.measure_end,
        position: index,
      }));

      const { error: partsError } = await supabaseAdmin
        .from("parts")
        .insert(partsToInsert);

      if (partsError) {
        throw new Error(`Failed to create parts: ${partsError.message}`);
      }

      // Update show status to ready
      await supabaseAdmin
        .from("shows")
        .update({ status: "ready" })
        .eq("id", showId);

      console.log(`Show ${showId} processed successfully with ${extractedParts.length} parts`);

      return NextResponse.json({
        success: true,
        message: "Processing complete",
        partsCreated: extractedParts.length,
        parts: extractedParts,
      });

    } catch (processingError) {
      console.error("Processing error:", processingError);

      // Update show status to error
      await supabaseAdmin
        .from("shows")
        .update({
          status: "error",
          error_message: processingError instanceof Error
            ? processingError.message
            : "Unknown processing error",
        })
        .eq("id", showId);

      return NextResponse.json(
        { error: "Processing failed", details: processingError instanceof Error ? processingError.message : "Unknown error" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Process handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
