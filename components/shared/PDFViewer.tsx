// components/shared/PDFViewer.tsx
"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useState, useEffect } from "react";
import { FileIcon } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        // If it's already a direct URL (http/https)
        if (url.startsWith("http")) {
          setPdfUrl(url);
          return;
        }

        // For S3 documents, fetch the presigned URL
        console.log("Fetching presigned URL for:", url);
        const response = await fetch(
          `/api/documents/${encodeURIComponent(url)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch PDF URL");
        }

        const data = await response.json();
        console.log("Received presigned URL:", data.url);
        setPdfUrl(data.url);
      } catch (err) {
        console.error("Error fetching PDF:", err);
        setError(err instanceof Error ? err.message : "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfUrl();
  }, [url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    setError("Failed to render PDF. The file may be corrupted.");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <FileIcon className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 mb-1">Failed to load PDF preview</p>
        <p className="text-xs text-gray-400">{error}</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileIcon className="h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No PDF URL available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full">
      <Document
        file={pdfUrl} // Simplified to just pass the URL string
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
          </div>
        }
        className="w-full h-full"
        options={{
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        }}
      >
        <Page
          pageNumber={pageNumber}
          width={600}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
          }
        />
      </Document>
      {numPages && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
