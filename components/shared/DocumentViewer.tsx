// components/shared/DocumentViewer.tsx
"use client";

import { FileIcon, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { PDFViewer } from "./PDFViewer";

interface DocumentViewerProps {
  url: string;
  type: string;
}

export function DocumentViewer({ url, type }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert to absolute URL if it's a relative path
  const absoluteUrl = url.startsWith("/")
    ? `${window.location.origin}${url}`
    : url;

  const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
  const isPdf = /\.(pdf)$/i.test(url);
  const fileName = url.split("/").pop() || "document";

  useEffect(() => {
    console.log("Document URL:", {
      original: url,
      absolute: absoluteUrl,
      type,
      isImage,
      isPdf,
    });
  }, [url]);

  const handleError = (errorType: string) => {
    console.error(`DocumentViewer Error (${errorType}):`, {
      url,
      absoluteUrl,
      type,
    });
    setError(`Failed to load ${errorType} preview`);
    setIsLoading(false);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = absoluteUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{type}</span>
        <button
          onClick={handleDownload}
          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      <div className="border rounded-md p-2 h-64 flex flex-col items-center justify-center bg-gray-50 relative">
        {error ? (
          <div className="text-red-500 text-center">
            {error}
            <button
              onClick={() => window.open(absoluteUrl, "_blank")}
              className="mt-2 text-blue-600 hover:underline block"
            >
              Open in new tab
            </button>
          </div>
        ) : isImage ? (
          <img
            src={absoluteUrl}
            alt={`Document: ${type}`}
            className="max-h-full max-w-full object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => handleError("image")}
          />
        ) : isPdf ? (
          <PDFViewer url={absoluteUrl} />
        ) : (
          <div className="flex flex-col items-center">
            <FileIcon className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Preview not available for this file type
            </p>
          </div>
        )}

        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 truncate">{fileName}</div>
    </div>
  );
}
