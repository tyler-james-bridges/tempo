'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-[#5C5C5C]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  // Get user metadata
  const email = user.primaryEmailAddress?.emailAddress;
  const userId = user.id;
  const createdAt = user.createdAt;
  const lastSignInAt = user.lastSignInAt;
  const emailVerified =
    user.primaryEmailAddress?.verification?.status === 'verified';
  const provider = user.externalAccounts?.[0]?.provider || 'email';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      {/* Header */}
      <header className="border-b border-[#E8E8E6] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors text-sm flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <div className="h-4 w-px bg-[#E8E8E6]" />
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8913A] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#1A1A1A]">TempoMap</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">Settings</h1>

        {/* Profile Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5C5C5C] mb-1">
                Email
              </label>
              <p className="text-[#1A1A1A]">{email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C5C5C] mb-1">
                User ID
              </label>
              <p className="text-[#1A1A1A] font-mono text-sm">{userId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C5C5C] mb-1">
                Account Created
              </label>
              <p className="text-[#1A1A1A]">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C5C5C] mb-1">
                Last Sign In
              </label>
              <p className="text-[#1A1A1A]">
                {lastSignInAt
                  ? new Date(lastSignInAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : 'Unknown'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C5C5C] mb-1">
                Email Verified
              </label>
              <p className="text-[#1A1A1A]">
                {emailVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-[#16A34A]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="text-[#CA8A04]">Not verified</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Authentication Provider */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Authentication
          </h2>

          <div>
            <label className="block text-sm font-medium text-[#5C5C5C] mb-1">
              Sign-in Method
            </label>
            <p className="text-[#1A1A1A] capitalize">{provider}</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border-[#DC2626]/20">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Account Actions
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-[#5C5C5C] text-sm mb-3">
                Sign out of your account on this device.
              </p>
              <button onClick={handleSignOut} className="btn-secondary text-sm">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
