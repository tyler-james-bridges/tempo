"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { getStatusBadgeClass } from "@/lib/utils";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-[#5C5C5C]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      {/* Header */}
      <header className="border-b border-[#E8E8E6] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8913A] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">TempoMap</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-[#5C5C5C] text-sm hidden sm:block">{user?.email}</span>
            <Link
              href="/settings"
              className="text-[#5C5C5C] hover:text-[#1A1A1A] text-sm transition-colors"
            >
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="text-[#5C5C5C] hover:text-[#1A1A1A] text-sm transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Your Shows</h1>
            <p className="text-[#5C5C5C] text-sm mt-1">{shows.length} show{shows.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className={`upload-zone p-10 mb-8 text-center ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#5C5C5C]">Processing PDF...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#E8913A]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#E8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-base font-medium mb-1 text-[#1A1A1A]">
                Drop your sheet music PDF here
              </p>
              <p className="text-[#5C5C5C] text-sm mb-4">or</p>
              <label className="btn-primary cursor-pointer text-sm">
                Browse files
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
              <p className="text-[#8C8C8C] text-xs mt-4">
                PDF files up to 50MB
              </p>
            </>
          )}
        </div>

        {/* Shows List */}
        {shows.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-[#5C5C5C]">No shows yet</p>
            <p className="text-[#8C8C8C] text-sm mt-1">
              Upload a PDF to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shows.map((show) => (
              <div
                key={show.id}
                className="card card-interactive p-4 flex items-center justify-between"
                onClick={() => router.push(`/shows/${show.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F4F2] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#5C5C5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1A1A1A]">{show.name}</h3>
                    <p className="text-[#8C8C8C] text-sm">
                      {show.sourceFilename || "Manual entry"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={getStatusBadgeClass(show.status)}>
                    {show.status}
                  </span>
                  <span className="text-[#8C8C8C] text-sm">
                    {new Date(show.createdAt).toLocaleDateString()}
                  </span>
                  <svg className="w-4 h-4 text-[#8C8C8C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
