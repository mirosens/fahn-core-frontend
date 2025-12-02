"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function ModernPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Berechnet sichtbare Seitennummern mit Ellipsen
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex flex-col items-center gap-3 ${className}`}
    >
      {/* Info */}
      <output className="text-xs text-muted-foreground" aria-live="polite">
        <span className="font-medium">
          {startItem}–{endItem}
        </span>
        <span className="mx-1">von</span>
        <span className="font-medium">{totalItems}</span>
      </output>

      {/* Buttons */}
      <div className="inline-flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Vorherige Seite"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Pages */}
        <div className="inline-flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                  aria-hidden="true"
                >
                  ⋯
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                aria-label={`${isActive ? "Aktuelle Seite, " : ""}Seite ${page}`}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Nächste Seite"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
