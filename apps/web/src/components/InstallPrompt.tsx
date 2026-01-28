'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const STORAGE_KEY = 'pwa-install-prompt-dismissed';
const DISMISS_DURATION_DAYS = 7;

function isMobileDevice(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
      userAgent
    ) ||
    (/macintosh/.test(userAgent) && navigator.maxTouchPoints > 1)
  );
}

function isIOSDevice(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isMacWithTouch =
    /macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
  return isIOS || isMacWithTouch;
}

function isStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function wasRecentlyDismissed(): boolean {
  const dismissedAt = localStorage.getItem(STORAGE_KEY);
  if (!dismissedAt) return false;
  const daysSinceDismissal =
    (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
  return daysSinceDismissal < DISMISS_DURATION_DAYS;
}

export function InstallPrompt(): React.ReactNode {
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (!isMobileDevice() || isStandaloneMode() || wasRecentlyDismissed())
      return;

    const ios = isIOSDevice();
    setIsIOS(ios);

    function handleBeforeInstallPrompt(e: BeforeInstallPromptEvent): void {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (ios) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt
        );
      };
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  async function handleInstallClick(): Promise<void> {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss(): void {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShowPrompt(false);
    setShowIOSInstructions(false);
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed banner */}
      <div className="h-16" aria-hidden="true" />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in"
        role="dialog"
        aria-labelledby="install-prompt-title"
      >
        <div className="bg-[#1A1A1A] text-white px-4 py-3">
          <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
            <p id="install-prompt-title" className="text-sm flex-1">
              Add to home screen for the best experience
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-[#E8913A] hover:bg-[#d4822e] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {isIOS ? 'How to' : 'Install'}
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={handleDismiss}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-instructions-title"
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white shadow-xl p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="ios-instructions-title"
              className="text-lg font-semibold text-[var(--text-primary)] mb-4"
            >
              Install TempoMap on iOS
            </h3>

            <ol className="space-y-4 text-sm text-[var(--text-secondary)]">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] flex items-center justify-center font-semibold text-xs">
                  1
                </span>
                <div>
                  <p>
                    Tap the{' '}
                    <span className="inline-flex items-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="inline mx-1"
                      >
                        <path
                          d="M12 5V19M12 5L6 11M12 5L18 11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <rect
                          x="4"
                          y="17"
                          width="16"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        />
                      </svg>
                      <strong>Share</strong>
                    </span>{' '}
                    button in Safari
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] flex items-center justify-center font-semibold text-xs">
                  2
                </span>
                <div>
                  <p>
                    Scroll down and tap{' '}
                    <strong>&quot;Add to Home Screen&quot;</strong>
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] flex items-center justify-center font-semibold text-xs">
                  3
                </span>
                <div>
                  <p>
                    Tap <strong>&quot;Add&quot;</strong> in the top right corner
                  </p>
                </div>
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="mt-6 w-full btn-primary text-sm py-2.5"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
