"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Use CDN worker to avoid bundle bloat
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  showId: string;
}

export function PdfViewer({ showId }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSignedUrl() {
      try {
        const response = await fetch(`/api/pdf-url/${showId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load PDF");
        }
        const { url } = await response.json();
        setPdfUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    }

    fetchSignedUrl();
  }, [showId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-[#8C8C8C]">
        <p>{error}</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="text-center p-8 text-[#8C8C8C]">
        <p>No PDF available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-[#F5F4F2] rounded-lg">
        <button
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
          className="px-3 py-1.5 text-sm bg-white rounded-md border border-[#E8E8E6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FAFAF9] transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-[#5C5C5C]">
          Page {pageNumber} of {numPages || "..."}
        </span>
        <button
          onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
          disabled={pageNumber >= numPages}
          className="px-3 py-1.5 text-sm bg-white rounded-md border border-[#E8E8E6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FAFAF9] transition-colors"
        >
          Next
        </button>
        <div className="w-px h-6 bg-[#E8E8E6]" />
        <select
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="px-2 py-1.5 text-sm bg-white rounded-md border border-[#E8E8E6]"
        >
          <option value={0.5}>50%</option>
          <option value={0.75}>75%</option>
          <option value={1}>100%</option>
          <option value={1.25}>125%</option>
          <option value={1.5}>150%</option>
        </select>
      </div>

      {/* PDF Document */}
      <div className="flex justify-center overflow-auto bg-[#E8E8E6] rounded-lg p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center justify-center p-8">
              <div className="w-6 h-6 border-2 border-[#E8913A] border-t-transparent rounded-full animate-spin" />
            </div>
          }
          error={
            <div className="text-center p-8 text-red-500">
              Failed to load PDF
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}
