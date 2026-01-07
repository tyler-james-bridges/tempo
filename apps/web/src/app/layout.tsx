import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tempo Cloud - Upload Sheet Music, Get Tempo Maps",
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
      <body className="antialiased min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}
