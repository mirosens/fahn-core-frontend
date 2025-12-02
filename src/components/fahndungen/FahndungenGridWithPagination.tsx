"use client";

import React, { useState, useMemo, useEffect } from "react";
import { type FahndungItem } from "@/lib/typo3Client";
import { FlipCard } from "./FlipCard";
import { ModernPagination } from "@/components/ui/ModernPagination";
import type { ViewMode } from "@/components/ui/ViewModeDropdown";

interface FahndungenGridWithPaginationProps {
  fahndungen: FahndungItem[];
  viewMode?: ViewMode;
  itemsPerPage?: number;
  showPagination?: boolean;
  showItemsInfo?: boolean;
  onFahndungClick?: (fahndung: FahndungItem) => void;
  className?: string;
}

export function FahndungenGridWithPagination({
  fahndungen,
  viewMode = "grid-4",
  itemsPerPage = 8,
  showPagination = true,
  showItemsInfo = true,
  onFahndungClick,
  className = "",
}: FahndungenGridWithPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Paginierte Items berechnen
  const paginatedFahndungen = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fahndungen.slice(startIndex, endIndex);
  }, [fahndungen, currentPage, itemsPerPage]);

  // Reset currentPage wenn sich die Gesamtanzahl der Items ändert
  useEffect(() => {
    const totalPages = Math.ceil(fahndungen.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      // Verwende setTimeout, um setState asynchron aufzurufen
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [fahndungen.length, itemsPerPage, currentPage]);

  // Grid-Klassen basierend auf viewMode
  const getGridClasses = () => {
    switch (viewMode) {
      case "grid-4":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case "grid-3":
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  // Gap-Klassen basierend auf viewMode
  const getGapClasses = () => {
    switch (viewMode) {
      case "grid-4":
        return "gap-6"; // Kompaktere 24px Abstände für 4er-Grid
      case "grid-3":
      default:
        return "gap-x-8 gap-y-12"; // Mehr vertikaler Abstand für 3er-Grid
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Grid Container */}
      <div
        className={`grid ${getGridClasses()} ${getGapClasses()} w-full pt-1 pb-8`}
      >
        {paginatedFahndungen.map((fahndung) => (
          <FlipCard
            key={fahndung.id}
            fahndung={fahndung}
            layoutMode={viewMode === "grid-4" ? "grid-4" : "default"}
            onDetailsClick={() => {
              if (onFahndungClick) {
                onFahndungClick(fahndung);
              }
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && fahndungen.length > itemsPerPage && (
        <div className="mt-5 lg:mt-6 mb-8 lg:mb-10 flex justify-center">
          <ModernPagination
            currentPage={currentPage}
            totalItems={fahndungen.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Items Info */}
      {showItemsInfo && fahndungen.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          Zeige {paginatedFahndungen.length} von {fahndungen.length} Fahndungen
        </div>
      )}
    </div>
  );
}
