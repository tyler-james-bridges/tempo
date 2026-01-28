import type { Metadata, Viewport } from 'next';
import './globals.css';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'TempoMap - Upload Sheet Music, Get Tempo Maps',
  description:
    'Upload your sheet music PDFs and automatically extract tempo markings, measures, and rehearsal marks for your metronome app.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TempoMap',
  },
  openGraph: {
    title: 'TempoMap - Upload Sheet Music, Get Tempo Maps',
    description:
      'Upload your sheet music PDFs and automatically extract tempo markings, measures, and rehearsal marks for your metronome app.',
    type: 'website',
    siteName: 'TempoMap',
  },
  twitter: {
    card: 'summary',
    title: 'TempoMap - Upload Sheet Music, Get Tempo Maps',
    description:
      'Upload your sheet music PDFs and automatically extract tempo markings, measures, and rehearsal marks for your metronome app.',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#FAFAF9',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#FAFAF9] text-[#1A1A1A]">
        <Providers>
          {children}
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
