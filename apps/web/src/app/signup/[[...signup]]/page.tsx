import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#FAFAF9]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8913A] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1A1A1A]">TempoMap</span>
          </Link>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-sm border border-[#E5E5E5] rounded-2xl",
              headerTitle: "text-[#1A1A1A]",
              headerSubtitle: "text-[#5C5C5C]",
              formButtonPrimary: "bg-[#E8913A] hover:bg-[#D4822F]",
              footerActionLink: "text-[#E8913A] hover:text-[#D4822F]",
            },
          }}
          routing="path"
          path="/signup"
          signInUrl="/login"
          fallbackRedirectUrl="/dashboard"
        />

        <p className="text-center mt-6">
          <Link href="/" className="text-[#8C8C8C] hover:text-[#5C5C5C] text-sm transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
