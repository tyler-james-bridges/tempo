"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const STORAGE_KEY = "pwa-install-prompt-dismissed";
const DISMISS_DURATION_DAYS = 7;

function isMobileDevice(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent) ||
    (/macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
}

function isIOSDevice(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isMacWithTouch = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
  return isIOS || isMacWithTouch;
}

function isStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function wasRecentlyDismissed(): boolean {
  const dismissedAt = localStorage.getItem(STORAGE_KEY);
  if (!dismissedAt) return false;
  const daysSinceDismissal = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
  return daysSinceDismissal < DISMISS_DURATION_DAYS;
}

export function InstallPrompt(): React.ReactNode {
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (!isMobileDevice() || isStandaloneMode() || wasRecentlyDismissed()) return;

    const ios = isIOSDevice();
    setIsIOS(ios);

    function handleBeforeInstallPrompt(e: BeforeInstallPromptEvent): void {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (ios) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
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
    if (outcome === "accepted") {
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
      <div className="h-[200px] sm:h-[140px]" aria-hidden="true" />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 animate-fade-in"
        role="dialog"
        aria-labelledby="install-prompt-title"
        aria-describedby="install-prompt-description"
      >
        <div className="relative mx-auto max-w-lg rounded-xl bg-white border border-[var(--border-subtle)] shadow-lg p-4 sm:p-4">
          {/* Close button - absolute positioned on mobile for better layout */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 sm:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Dismiss install prompt"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
            {/* Icon and text container - horizontal on mobile, part of row on desktop */}
            <div className="flex items-start gap-3 sm:gap-4 sm:flex-1 sm:min-w-0">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M9 19V13H15V19M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                <h3
                  id="install-prompt-title"
                  className="text-base font-semibold text-[var(--text-primary)]"
                >
                  Install TempoMap
                </h3>
                <p
                  id="install-prompt-description"
                  className="mt-1 text-sm text-[var(--text-secondary)]"
                >
                  Add to your home screen for quick access and a native app
                  experience.
                </p>

                {/* Desktop buttons - inline with text */}
                <div className="hidden sm:flex mt-3 gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    {isIOS ? "How to Install" : "Install"}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile buttons - full width, stacked below content */}
            <div className="flex sm:hidden flex-col gap-2 w-full">
              <button
                onClick={handleInstallClick}
                className="btn-primary text-sm py-3 px-4 w-full min-h-[44px]"
              >
                {isIOS ? "How to Install" : "Install"}
              </button>
              <button
                onClick={handleDismiss}
                className="btn-secondary text-sm py-3 px-4 w-full min-h-[44px]"
              >
                Not now
              </button>
            </div>

            {/* Desktop close button */}
            <button
              onClick={handleDismiss}
              className="hidden sm:flex flex-shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Dismiss install prompt"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
                    Tap the{" "}
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
                    </span>{" "}
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
                    Scroll down and tap{" "}
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
