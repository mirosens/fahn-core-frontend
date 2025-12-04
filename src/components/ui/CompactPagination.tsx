"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CompactPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CompactPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}: CompactPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Berechnet sichtbare Seitennummern mit Ellipsen (maximal 3 Seiten)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage === 1) {
      pages.push(1, 2, "...", totalPages);
    } else if (currentPage === totalPages) {
      pages.push(1, "...", totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage, "...", totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex items-center gap-3 ${className}`}
    >
      {/* Info - Anzahl der Fahndungen */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
        <span className="font-medium text-foreground">
          {startItem}–{endItem}
        </span>
        <span>von</span>
        <span className="font-medium text-foreground">{totalItems}</span>
      </div>

      {/* Navigation Buttons */}
      <div className="inline-flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Vorherige Seite"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
        >
          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
        </button>

        {/* Pages - Kompakt */}
        <div className="inline-flex items-center gap-0.5">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-7 w-7 items-center justify-center text-muted-foreground text-xs"
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
                  flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
        >
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
