"use client";

import { useState, useEffect, useCallback } from "react";

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

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Check if user previously dismissed the prompt
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt, 10));
      const daysSinceDismissal =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < DISMISS_DURATION_DAYS) {
        return; // Don't show prompt if recently dismissed
      }
    }

    // For Android/Chrome - listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS Safari - show prompt after a short delay if not standalone
    if (ios && !standalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
      return () => {
        clearTimeout(timer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowPrompt(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error prompting install:", error);
    }
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShowPrompt(false);
    setShowIOSInstructions(false);
  }, []);

  // Don't render if already in standalone mode or prompt shouldn't show
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in"
        role="dialog"
        aria-labelledby="install-prompt-title"
        aria-describedby="install-prompt-description"
      >
        <div className="mx-auto max-w-lg rounded-xl bg-white border border-[var(--border-subtle)] shadow-lg p-4">
          <div className="flex items-start gap-4">
            {/* App Icon */}
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

            <div className="flex-1 min-w-0">
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

              <div className="mt-3 flex gap-2">
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

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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

      {/* iOS Instructions Modal */}
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
