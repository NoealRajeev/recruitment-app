// components/ui/Pagination.tsx
"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrev}
        className={`flex items-center gap-1 ${!canPrev ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Previous page"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-sm text-gray-600 mx-4">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        className={`flex items-center gap-1 ${!canNext ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Next page"
      >
        Next
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
