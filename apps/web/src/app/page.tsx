"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const router = useRouter();
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
            <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">Tempo</span>
          </Link>

          <nav className="flex items-center gap-4">
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
            Built for DCI, WGI, and marching arts
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-[#1A1A1A]">
            Upload sheet music.
            <br />
            <span className="text-[#E8913A]">Get tempo maps.</span>
          </h1>

          <p className="text-lg text-[#5C5C5C] mb-10 max-w-xl mx-auto leading-relaxed">
            Extract tempo markings, time signatures, and rehearsal marks
            from your PDFs. Sync directly to the Tempo metronome app.
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
              href="#how-it-works"
              className="btn-secondary text-base px-8 py-3 inline-flex items-center justify-center gap-2"
            >
              How it works
            </Link>
          </div>

          {/* Feature Cards */}
          <div id="how-it-works" className="grid md:grid-cols-3 gap-6 text-left">
            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-[#E8913A]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#E8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#1A1A1A]">Upload PDFs</h3>
              <p className="text-[#5C5C5C] text-sm leading-relaxed">
                Drag & drop sheet music PDFs. Supports scanned and digital scores.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-[#E8913A]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#E8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#1A1A1A]">AI analysis</h3>
              <p className="text-[#5C5C5C] text-sm leading-relaxed">
                AI extracts tempo markings, time signatures, and section markers.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-[#E8913A]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#E8913A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#1A1A1A]">Sync to app</h3>
              <p className="text-[#5C5C5C] text-sm leading-relaxed">
                Tempo maps appear instantly in the Tempo metronome app.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-[#F5F4F2]">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-3 text-[#1A1A1A]">
              Ready to practice smarter?
            </h2>
            <p className="text-[#5C5C5C] mb-6">
              Free to use. No credit card required.
            </p>
            <Link
              href="/signup"
              className="btn-primary text-base px-8 py-3 inline-flex items-center justify-center"
            >
              Create free account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E8E8E6] bg-white px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[#8C8C8C] text-sm">© {new Date().getFullYear()} Tempo</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
