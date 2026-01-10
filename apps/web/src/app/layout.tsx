import type { Metadata, Viewport } from "next";
import "./globals.css";
import { InstallPrompt } from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "TempoMap - Upload Sheet Music, Get Tempo Maps",
  description:
    "Upload your sheet music PDFs and automatically extract tempo markings, measures, and rehearsal marks for your metronome app.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TempoMap",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "TempoMap - Upload Sheet Music, Get Tempo Maps",
    description:
      "Upload your sheet music PDFs and automatically extract tempo markings, measures, and rehearsal marks for your metronome app.",
    type: "website",
    siteName: "TempoMap",
  },
  twitter: {
    card: "summary",
    title: "TempoMap - Upload Sheet Music, Get Tempo Maps",
    description:
      "Upload your sheet music PDFs and automatically extract tempo markings, measures, and rehearsal marks for your metronome app.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA iOS specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TempoMap" />
        <link
          rel="apple-touch-icon"
          href="/icons/icon-192x192.png"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href="/icons/icon-512x512.png"
          sizes="512x512"
        />

        {/* Splash screen for iOS */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#FAFAF9" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#FAFAF9] text-[#1A1A1A]">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
