"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { CloudShow } from "@tempo/shared";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [shows, setShows] = useState<CloudShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      loadShows();
    });
  }, [router]);

  const loadShows = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("shows")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setShows(data as CloudShow[]);
    }
    setLoading(false);
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
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be under 50MB");
      return;
    }

    setUploading(true);

    try {
      // Upload via API route
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Add to local state
      setShows((prev) => [result.show, ...prev]);
    } catch (error) {
      alert(
        "Failed to upload: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-green-400 bg-green-400/10";
      case "processing":
        return "text-yellow-400 bg-yellow-400/10";
      case "error":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-white/60 bg-white/5";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#00e5ff]">Tempo</span>
            <span className="text-sm text-white/60">Cloud</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-white/60 hover:text-white text-sm transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Shows</h1>
        </div>

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-10 mb-10 text-center transition-colors ${
            dragActive
              ? "border-[#00e5ff] bg-[#00e5ff]/5"
              : "border-white/20 hover:border-white/40"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="text-white/60">
              <div className="animate-spin w-8 h-8 border-2 border-[#00e5ff] border-t-transparent rounded-full mx-auto mb-4" />
              Uploading...
            </div>
          ) : (
            <>
              <div className="text-4xl mb-4">📄</div>
              <p className="text-lg font-medium mb-2">
                Drag & drop your sheet music PDF
              </p>
              <p className="text-white/60 text-sm mb-4">or</p>
              <label className="inline-block bg-[#00e5ff] text-black px-6 py-2 rounded-lg font-medium cursor-pointer hover:bg-[#00e5ff]/90 transition">
                Browse Files
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
              <p className="text-white/40 text-xs mt-4">
                PDF files up to 50MB supported
              </p>
            </>
          )}
        </div>

        {/* Shows List */}
        {shows.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-lg">No shows yet</p>
            <p className="text-sm mt-2">
              Upload a sheet music PDF to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {shows.map((show) => (
              <div
                key={show.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition cursor-pointer"
                onClick={() => router.push(`/shows/${show.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{show.name}</h3>
                    <p className="text-white/40 text-sm mt-1">
                      {show.source_filename || "Manual entry"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        show.status
                      )}`}
                    >
                      {show.status}
                    </span>
                    <span className="text-white/40 text-sm">
                      {new Date(show.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
