import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#00e5ff]">Tempo</span>
            <span className="text-sm text-white/60">Cloud</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-white/80 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-[#00e5ff] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#00e5ff]/90 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Upload Sheet Music.
            <br />
            <span className="text-[#00e5ff]">Get Tempo Maps.</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Automatically extract tempo markings, measures, and rehearsal marks
            from your sheet music PDFs. Sync directly to the Tempo app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="bg-[#00e5ff] text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#00e5ff]/90 transition"
            >
              Start Free
            </Link>
            <Link
              href="#how-it-works"
              className="border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 transition"
            >
              How It Works
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">Upload PDFs</h3>
              <p className="text-white/60 text-sm">
                Drag & drop sheet music PDFs or import from Dropbox. Supports
                scanned and digital scores.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold mb-2">Auto-Extract</h3>
              <p className="text-white/60 text-sm">
                Our AI analyzes your music and extracts tempo markings, time
                signatures, and rehearsal marks.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">Sync to App</h3>
              <p className="text-white/60 text-sm">
                Your extracted tempo maps appear instantly in the Tempo
                metronome app. Practice smarter.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-white/40 text-sm">
          <p>Built for marching arts. Perfect for DCI, WGI, and beyond.</p>
        </div>
      </footer>
    </div>
  );
}
