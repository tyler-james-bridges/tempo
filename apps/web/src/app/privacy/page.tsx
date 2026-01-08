import Link from "next/link";

export default function PrivacyPolicy() {
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
        <article className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Privacy Policy</h1>
          <p className="text-[#5C5C5C] mb-8">Last updated: January 8, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Overview</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              TempoMap (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a metronome application designed for musicians.
              We are committed to protecting your privacy. This policy explains what information we collect,
              how we use it, and your rights regarding your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Information We Collect</h2>

            <h3 className="text-lg font-medium text-[#1A1A1A] mt-4 mb-2">Account Information (Optional)</h3>
            <p className="text-[#5C5C5C] leading-relaxed mb-3">
              If you choose to create an account for cloud sync features, we collect:
            </p>
            <ul className="list-disc pl-6 text-[#5C5C5C] space-y-1 mb-4">
              <li>Email address</li>
              <li>Password (encrypted, never stored in plain text)</li>
            </ul>

            <h3 className="text-lg font-medium text-[#1A1A1A] mt-4 mb-2">App Data</h3>
            <p className="text-[#5C5C5C] leading-relaxed mb-3">
              If you use cloud sync, we store:
            </p>
            <ul className="list-disc pl-6 text-[#5C5C5C] space-y-1 mb-4">
              <li>Your tempo maps and show configurations</li>
              <li>App preferences and settings</li>
            </ul>

            <h3 className="text-lg font-medium text-[#1A1A1A] mt-4 mb-2">Local Data</h3>
            <p className="text-[#5C5C5C] leading-relaxed">
              The app stores preferences locally on your device. This data never leaves your device
              unless you enable cloud sync.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Information We Do NOT Collect</h2>
            <ul className="list-disc pl-6 text-[#5C5C5C] space-y-1">
              <li>Device identifiers or advertising IDs (IDFA/AAID)</li>
              <li>Location data</li>
              <li>Contacts or personal files</li>
              <li>Usage analytics or tracking data</li>
              <li>Any data for advertising purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">How We Use Your Information</h2>
            <p className="text-[#5C5C5C] leading-relaxed mb-3">
              We use your information solely to:
            </p>
            <ul className="list-disc pl-6 text-[#5C5C5C] space-y-1">
              <li>Provide the TempoMap service</li>
              <li>Sync your data across devices (if you opt in)</li>
              <li>Authenticate your account</li>
              <li>Respond to support requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Data Storage & Security</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              Your data is stored securely using Supabase, which provides enterprise-grade security
              including encryption at rest and in transit. We do not sell, rent, or share your
              personal information with third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Third-Party Services</h2>
            <p className="text-[#5C5C5C] leading-relaxed mb-3">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-[#5C5C5C] space-y-1">
              <li><strong>Supabase</strong> - Authentication and database hosting (<a href="https://supabase.com/privacy" className="text-[#E8913A] hover:underline">Privacy Policy</a>)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Your Rights</h2>
            <p className="text-[#5C5C5C] leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-[#5C5C5C] space-y-1">
              <li>Access your personal data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data</li>
              <li>Use the app without creating an account</li>
            </ul>
            <p className="text-[#5C5C5C] leading-relaxed mt-3">
              To exercise these rights, contact us at the email below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Children&apos;s Privacy</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              TempoMap does not knowingly collect information from children under 13. The app is
              suitable for all ages and does not require personal information to function.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Changes to This Policy</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Contact Us</h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              If you have questions about this privacy policy or your data, contact us at:
            </p>
            <p className="text-[#5C5C5C] mt-2">
              <a href="mailto:tylerscv22@gmail.com" className="text-[#E8913A] hover:underline">
                tylerscv22@gmail.com
              </a>
            </p>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E6] bg-white px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[#8C8C8C] text-sm">&copy; {new Date().getFullYear()} TempoMap</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[#5C5C5C] text-sm transition-colors">
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
