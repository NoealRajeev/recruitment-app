// components/shared/DocumentViewer.tsx
"use client";

import { FileIcon } from "lucide-react";
import { useState } from "react";

interface DocumentViewerProps {
  url: string;
  type: string;
}

export function DocumentViewer({ url, type }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isImage = ["jpg", "jpeg", "png", "gif"].some((ext) =>
    url.toLowerCase().endsWith(ext)
  );
  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Document: ${type}`}
          className="max-h-full max-w-full object-contain"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      ) : isPdf ? (
        <iframe
          src={url}
          className="w-full h-full"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4">
          <FileIcon className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Preview not available</p>
          <a
            href={url}
            download
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            Download File
          </a>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
        </div>
      )}
    </div>
  );
}
