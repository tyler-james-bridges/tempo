import Link from "next/link";

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      {/* Header */}
      <header className="border-b border-[#E8E8E6] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8913A] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">TempoMap</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Support</h1>
          <p className="text-[#5C5C5C] mb-10">Get help with TempoMap</p>

          {/* Contact */}
          <section className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Contact Us</h2>
            <p className="text-[#5C5C5C] leading-relaxed mb-4">
              Have a question, bug report, or feature request? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:support@tempomap.app"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Support
            </a>
          </section>

          {/* FAQ */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-medium text-[#1A1A1A] mb-2">How do I sync my tempo maps across devices?</h3>
                <p className="text-[#5C5C5C] text-sm leading-relaxed">
                  Create a free account in the app or on our website. Once signed in, your tempo maps
                  will automatically sync across all your devices.
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-medium text-[#1A1A1A] mb-2">Can I use the app without an account?</h3>
                <p className="text-[#5C5C5C] text-sm leading-relaxed">
                  Yes! The metronome works completely offline without an account. An account is only
                  needed if you want to sync tempo maps from uploaded sheet music.
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-medium text-[#1A1A1A] mb-2">How do I upload sheet music?</h3>
                <p className="text-[#5C5C5C] text-sm leading-relaxed">
                  Log in to the web dashboard, go to a show, and upload your PDF. Our AI will extract
                  tempo markings, time signatures, and rehearsal marks automatically.
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-medium text-[#1A1A1A] mb-2">What file formats are supported?</h3>
                <p className="text-[#5C5C5C] text-sm leading-relaxed">
                  We currently support PDF files. Both scanned and digital sheet music work, though
                  digital PDFs typically produce more accurate results.
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-medium text-[#1A1A1A] mb-2">How do I delete my account?</h3>
                <p className="text-[#5C5C5C] text-sm leading-relaxed">
                  Email us at support@tempomap.app and we&apos;ll delete your account and all associated
                  data within 48 hours.
                </p>
              </div>

              <div className="card p-5">
                <h3 className="font-medium text-[#1A1A1A] mb-2">Is my data secure?</h3>
                <p className="text-[#5C5C5C] text-sm leading-relaxed">
                  Yes. We use Supabase for authentication and data storage, which provides
                  enterprise-grade security with encryption at rest and in transit. See our{" "}
                  <Link href="/privacy" className="text-[#E8913A] hover:underline">Privacy Policy</Link> for details.
                </p>
              </div>
            </div>
          </section>

          {/* App Info */}
          <section className="card p-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">App Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#8C8C8C]">Version</span>
                <p className="text-[#1A1A1A]">1.0.0</p>
              </div>
              <div>
                <span className="text-[#8C8C8C]">Platform</span>
                <p className="text-[#1A1A1A]">iOS, Android, Web</p>
              </div>
              <div>
                <span className="text-[#8C8C8C]">Developer</span>
                <p className="text-[#1A1A1A]">Tyler James-Bridges</p>
              </div>
              <div>
                <span className="text-[#8C8C8C]">Contact</span>
                <p className="text-[#1A1A1A]">support@tempomap.app</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E6] bg-white px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[#8C8C8C] text-sm">&copy; {new Date().getFullYear()} TempoMap</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
              Terms
            </Link>
            <Link href="/support" className="text-[#5C5C5C] text-sm transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
