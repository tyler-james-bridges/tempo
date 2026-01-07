import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TempoMap - Upload Sheet Music, Get Tempo Maps",
  description:
    "Upload your sheet music PDFs and automatically extract tempo markings, measures, and rehearsal marks for your metronome app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAFAF9] text-[#1A1A1A]">
        {children}
      </body>
    </html>
  );
}
