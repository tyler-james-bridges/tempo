"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

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

          <nav className="flex items-center gap-4">
            <Link
              href="/metronome"
              className="text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors text-sm font-medium"
            >
              Metronome
            </Link>
            {loading ? (
              <div className="w-20 h-8" />
            ) : user ? (
              <Link
                href="/dashboard"
                className="btn-primary text-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-sm"
                >
                  Sign up free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-[#FAFAF9]">
        <div className="max-w-3xl mx-auto text-center">
          {/* Audience Tag */}
          <div className="inline-flex items-center gap-2 bg-[#E8913A]/10 text-[#E8913A] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            Purpose-built for DCI, WGI, and beyond
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-[#1A1A1A]">
            Upload sheet music.
            <br />
            <span className="text-[#E8913A]">Get tempo maps.</span>
          </h1>

          <p className="text-lg text-[#5C5C5C] mb-10 max-w-xl mx-auto leading-relaxed">
            Extract tempo markings, time signatures, and rehearsal marks
            from your PDFs. Sync directly to the TempoMap app.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="btn-primary text-base px-8 py-3 inline-flex items-center justify-center gap-2"
            >
              {user ? "Go to Dashboard" : "Get started free"}
            </Link>
            <Link
              href="/metronome"
              className="btn-secondary text-base px-8 py-3 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              Try Metronome
            </Link>
          </div>

          {/* How It Works - Pipeline Style */}
          <div id="how-it-works" className="max-w-4xl mx-auto">
            {/* Pipeline Container */}
            <div className="pipeline-container">
              {/* Music Staff (5 lines) with animated glow */}
              <div className="pipeline-staff">
                <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="staff-svg">
                  <line x1="0" y1="2" x2="400" y2="2" />
                  <line x1="0" y1="7" x2="400" y2="7" />
                  <line x1="0" y1="12" x2="400" y2="12" />
                  <line x1="0" y1="17" x2="400" y2="17" />
                  <line x1="0" y1="22" x2="400" y2="22" />
                </svg>
                <div className="staff-glow" />
              </div>

              {/* Step 1: Upload */}
              <div className="pipeline-step">
                <div className="pipeline-node">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="pipeline-label">Upload PDF</div>
                <div className="pipeline-detail">Digital or scanned scores</div>
              </div>

              {/* Step 2: AI Analysis */}
              <div className="pipeline-step">
                <div className="pipeline-node">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <div className="pipeline-label">AI Analysis</div>
                <div className="pipeline-detail">Reads tempo, time sig, rehearsals</div>
              </div>

              {/* Step 3: Sync */}
              <div className="pipeline-step">
                <div className="pipeline-node">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <div className="pipeline-label">Sync to App</div>
                <div className="pipeline-detail">Practice with click track</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="py-16 bg-[#F5F4F2]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-3 text-[#1A1A1A]">
            {user ? "Ready to upload?" : "Ready to practice smarter?"}
          </h2>
          <p className="text-[#5C5C5C] mb-6">
            {user ? "Upload your sheet music and get tempo maps in seconds." : "Free to use. No credit card required."}
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="btn-primary text-base px-8 py-3 inline-flex items-center justify-center"
          >
            {user ? "Go to Dashboard" : "Create free account"}
          </Link>
          {!user && (
            <p className="text-[#5C5C5C] text-sm mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-[#E8913A] hover:underline font-medium">
                Log in
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E6] bg-white px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[#8C8C8C] text-sm">© {new Date().getFullYear()} TempoMap</span>
          <div className="flex items-center gap-6">
            <Link href="/metronome" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
              Metronome
            </Link>
            <Link href="/privacy" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
              Terms
            </Link>
            <Link href="/support" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
