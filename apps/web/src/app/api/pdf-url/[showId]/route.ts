import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Admin client for storage operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;

    // Verify user is authenticated
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get show and verify ownership (RLS will handle this)
    const { data: show, error } = await supabase
      .from("shows")
      .select("pdf_url, user_id")
      .eq("id", showId)
      .single();

    if (error || !show) {
      return NextResponse.json(
        { error: "Show not found" },
        { status: 404 }
      );
    }

    if (!show.pdf_url) {
      return NextResponse.json(
        { error: "No PDF associated with this show" },
        { status: 404 }
      );
    }

    // Extract file path from stored URL or path
    // Handle both full URL format and path-only format
    let filePath = show.pdf_url;

    // If it's a full URL, extract the path
    if (filePath.includes("/storage/v1/object/public/pdfs/")) {
      filePath = filePath.split("/storage/v1/object/public/pdfs/")[1];
    } else if (filePath.includes("/storage/v1/object/sign/pdfs/")) {
      filePath = filePath.split("/storage/v1/object/sign/pdfs/")[1];
    }

    // Generate signed URL (1 hour expiration)
    const { data, error: signError } = await supabaseAdmin.storage
      .from("pdfs")
      .createSignedUrl(filePath, 3600);

    if (signError || !data) {
      console.error("Failed to create signed URL:", signError);
      return NextResponse.json(
        { error: "Failed to generate PDF URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error) {
    console.error("PDF URL handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
