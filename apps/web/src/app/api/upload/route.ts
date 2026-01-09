import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";

// Admin client for storage operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data with the file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${user.id}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("pdfs")
      .upload(filePath, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file: " + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("pdfs").getPublicUrl(filePath);

    // Create show record
    const { data: show, error: showError } = await supabase
      .from("shows")
      .insert({
        user_id: user.id,
        name: file.name.replace(".pdf", ""),
        source_type: "pdf_upload",
        source_filename: file.name,
        pdf_url: publicUrl,
        status: "processing",
      })
      .select()
      .single();

    if (showError) {
      console.error("Show creation error:", showError);
      return NextResponse.json(
        { error: "Failed to create show: " + showError.message },
        { status: 500 }
      );
    }

    // Trigger processing after response is sent (keeps function alive)
    const processUrl = new URL("/api/process", request.url);
    after(async () => {
      try {
        const response = await fetch(processUrl.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          },
          body: JSON.stringify({ showId: show.id, pdfUrl: publicUrl }),
        });
        if (!response.ok) {
          console.error("Process API failed:", await response.text());
        }
      } catch (error) {
        console.error("Process fetch error:", error);
      }
    });

    return NextResponse.json({
      success: true,
      show,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
