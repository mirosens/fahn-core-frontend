"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { useStableSearchParams } from "@/hooks/useStableSearchParams";
import FilterPanel from "./FilterPanel";
import { FilterIcon } from "@/components/ui/FilterIcon";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import { CompactHeaderFilter } from "@/components/fahndungen/CompactHeaderFilter";

export default function ModernHeader() {
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [resultCount, setResultCount] = useState<number | undefined>(undefined);

  const { headerRef, spacerRef } = useScrollDetection();
  const pathname = usePathname();
  const { searchTerm, fahndungsart, dienststelle } = useStableSearchParams();

  const isFahndungenPage = pathname === "/fahndungen" || pathname === "/";

  // Prüfe ob aktive Filter vorhanden sind
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      (fahndungsart && fahndungsart !== "alle") ||
      (dienststelle && dienststelle !== "alle")
    );
  }, [searchTerm, fahndungsart, dienststelle]);

  // Höre auf Ergebnis-Count-Updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResultCountUpdate = (e: CustomEvent<{ count: number }>) => {
      setResultCount(e.detail.count);
    };

    window.addEventListener(
      "fahndung-result-count-update",
      handleResultCountUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "fahndung-result-count-update",
        handleResultCountUpdate as EventListener
      );
    };
  }, []);

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

  // Responsive Erkennung
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1280;
      setIsMobile(mobile);
      // Desktop: Filter immer sichtbar, Mobile: kann geöffnet/geschlossen werden
      if (!mobile) {
        setIsFilterOpen(true);
      } else {
        setIsFilterOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Skip Link für Screenreader */}
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:ring-4 focus:ring-primary/30"
      >
        Zum Hauptinhalt springen
      </a>

      <header
        ref={headerRef}
        className={`
          fixed left-0 right-0 top-0 z-50 
          ${
            isMobile
              ? "h-14"
              : hasActiveFilters && !isMobile
                ? "h-auto min-h-20 transition-all duration-300 ease-out [&.scrolled]:min-h-16"
                : "h-20 transition-all duration-300 ease-out [&.scrolled]:h-16"
          }
        `}
        role="banner"
        aria-label="Hauptnavigation"
      >
        {/* Glassmorphismus Container */}
        <div
          className={`
          glass-header glass-header-container mx-auto
          ${hasActiveFilters && !isMobile ? "min-h-full" : "h-full"} max-w-[1273px]
          ${
            isMobile
              ? "mt-0 rounded-none"
              : "mt-4 rounded-[10px] transition-all duration-300 [.scrolled_&]:mt-0"
          }
        `}
        >
          <div
            className={`${hasActiveFilters && !isMobile ? "py-4" : "h-full"} px-4 sm:px-6 lg:px-8`}
          >
            {/* Erste Zeile: Logo, Filter, Actions */}
            <div className="relative flex h-full items-center">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Logo />
              </div>

              {/* Desktop: Filter zwischen Logo und Actions - inline im Header */}
              {!isMobile && isFahndungenPage && (
                <div className="flex-1 flex items-center justify-center min-w-0 mx-4 sm:mx-6 lg:mx-8">
                  <CompactHeaderFilter />
                </div>
              )}

              {/* Desktop Header - mit gleichmäßigen Abständen - nur ab 1281px */}
              <div className="hidden desktop:block flex-shrink-0 ml-auto">
                <DesktopHeader
                  onFilterToggle={toggleFilter}
                  isFilterOpen={isFilterOpen}
                  onFilterClose={closeFilter}
                  resultCount={resultCount}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>

              {/* Mobile Actions - rechts */}
              <div className="flex items-center ml-auto desktop:hidden">
                {isFahndungenPage && (
                  <button
                    onClick={toggleFilter}
                    className="relative flex items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 mr-6"
                    aria-expanded={isFilterOpen}
                    aria-label="Filter öffnen"
                  >
                    <FilterIcon size={28} className="h-7 w-7" />
                    {resultCount !== undefined && resultCount >= 0 && (
                      <span
                        className={`absolute top-0 right-0 translate-x-full -translate-y-1/2 font-bold rounded-full flex items-center justify-center ${
                          hasActiveFilters
                            ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                        style={{
                          width: hasActiveFilters ? "auto" : "18px",
                          height: hasActiveFilters ? "22px" : "18px",
                          minWidth: hasActiveFilters ? "22px" : "18px",
                          padding: hasActiveFilters ? "0 6px" : "0",
                          fontSize: hasActiveFilters ? "11px" : "9px",
                          lineHeight: "1",
                          fontWeight: "bold",
                        }}
                      >
                        {hasActiveFilters
                          ? resultCount > 999
                            ? "999+"
                            : String(resultCount)
                          : resultCount >= 10000
                            ? "10k+"
                            : resultCount > 999
                              ? "999+"
                              : String(resultCount)}
                      </span>
                    )}
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="h-6 w-px bg-border/60" />
                  <MobileHeader
                    onFilterToggle={toggleFilter}
                    isFilterOpen={isFilterOpen}
                    onFilterClose={closeFilter}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer für fixed Header */}
      <div
        ref={spacerRef}
        className={`
          ${
            isMobile
              ? "h-14"
              : hasActiveFilters && !isMobile
                ? "min-h-20 transition-all duration-300 [.scrolled_&]:min-h-16"
                : "h-20 transition-all duration-300 [.scrolled_&]:h-16"
          }
        `}
      />

      {/* Filter Panel - nur für Mobile, Desktop wird inline angezeigt */}
      {isMobile && isFahndungenPage && (
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={closeFilter}
          isMobile={isMobile}
          headerRef={headerRef}
        />
      )}

      {/* Spacer für Filter Panel - nur für Mobile */}
      {isMobile && isFilterOpen && (
        <div className="h-[80px] transition-all duration-300" />
      )}
    </>
  );
}
