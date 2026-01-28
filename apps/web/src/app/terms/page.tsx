import Link from 'next/link';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      {/* Header */}
      <header className="border-b border-[#E8E8E6] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8913A] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              TempoMap
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-12 px-6">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Terms of Service
          </h1>
          <p className="text-[#5C5C5C] mb-8">Last updated: January 8, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              By accessing or using TempoMap (&quot;the Service&quot;), you
              agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use the Service. We reserve the
              right to update these terms at any time, and your continued use of
              the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              2. Description of Service
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              TempoMap is a metronome application and tempo map management
              service for musicians. The Service allows users to upload sheet
              music, extract tempo information, and sync tempo maps across
              devices. The Service is provided &quot;as is&quot; and may be
              modified or discontinued at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              3. User Accounts
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed mb-3">
              To access certain features, you may need to create an account. You
              agree to:
            </p>
            <ul className="list-disc pl-6 text-[#5C5C5C] space-y-1">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              4. Acceptable Use
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-[#5C5C5C] space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>
                Upload content that infringes on intellectual property rights
              </li>
              <li>
                Attempt to gain unauthorized access to the Service or its
                systems
              </li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>
                Use automated systems to access the Service without permission
              </li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              5. Content Ownership
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed mb-3">
              <strong>Your Content:</strong> You retain ownership of any content
              you upload to the Service, including sheet music and tempo maps.
              By uploading content, you grant us a limited license to store,
              process, and display your content solely for the purpose of
              providing the Service to you.
            </p>
            <p className="text-[#5C5C5C] leading-relaxed">
              <strong>Our Content:</strong> The Service, including its design,
              features, and code, is owned by TempoMap and protected by
              intellectual property laws. You may not copy, modify, or
              distribute any part of the Service without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              6. Copyright and Sheet Music
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              You are responsible for ensuring you have the right to upload any
              sheet music to the Service. We do not claim ownership of uploaded
              content and do not share it with third parties. The Service
              extracts tempo and timing information only; we do not reproduce or
              distribute the musical content itself.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              7. Privacy
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy" className="text-[#E8913A] hover:underline">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your
              information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
              IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR COMPLETELY SECURE. THE ACCURACY OF TEMPO EXTRACTION
              FROM SHEET MUSIC DEPENDS ON THE QUALITY AND FORMAT OF THE SOURCE
              MATERIAL.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              9. Limitation of Liability
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TEMPOMAP SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA,
              PROFITS, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              10. Termination
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              We may suspend or terminate your access to the Service at any
              time, with or without cause, and with or without notice. You may
              delete your account at any time by contacting us. Upon
              termination, your right to use the Service will immediately cease,
              and we may delete your account data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              11. Changes to Terms
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes by posting a notice on the
              Service or sending an email. Your continued use of the Service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              12. Governing Law
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              These terms shall be governed by and construed in accordance with
              the laws of the United States, without regard to its conflict of
              law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              13. Contact
            </h2>
            <p className="text-[#5C5C5C] leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <p className="text-[#5C5C5C] mt-2">
              <a
                href="mailto:support@tempomap.app"
                className="text-[#E8913A] hover:underline"
              >
                support@tempomap.app
              </a>
            </p>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E6] bg-white px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[#8C8C8C] text-sm">
            &copy; {new Date().getFullYear()} TempoMap
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[#5C5C5C] text-sm transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
