"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FahndungenFilter } from "../fahndungen/FahndungenFilter";

interface ModernHeaderProps {
  showFilters?: boolean;
}

export function ModernHeader({ showFilters = false }: ModernHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isFahndungenPage = pathname?.includes("/fahndungen");

  return (
    <>
      {/* Header Spacer für fixed positioning */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? "h-16"
            : showFilters && isFahndungenPage
              ? "h-32"
              : "h-20"
        }`}
      />

      {/* Main Header */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b shadow-sm"
            : "bg-transparent"
        }`}
        role="banner"
      >
        {/* Glass header container */}
        <div
          className={`glass-header-container mx-auto max-w-6xl transition-all duration-300 ${
            isScrolled
              ? "mt-0 bg-background/95 backdrop-blur-md border border-border/50 rounded-none shadow-sm"
              : "mt-4 bg-background/80 backdrop-blur-sm border border-border/30 rounded-lg shadow-lg"
          }`}
        >
          {/* Main header row */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div
                  className="h-10 w-10 rounded-md bg-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg
                    className="h-6 w-6 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Polizei Baden-Württemberg
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    Fahndungsportal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav
              className="hidden items-center gap-6 text-sm font-medium md:flex"
              aria-label="Hauptnavigation"
            >
              <Link
                href="/"
                className={`hover:text-primary transition-colors ${
                  pathname === "/" ? "text-primary" : "text-foreground"
                }`}
              >
                Start
              </Link>
              <Link
                href="/fahndungen"
                className={`hover:text-primary transition-colors ${
                  pathname?.includes("/fahndungen")
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                Fahndungen
              </Link>
              <Link
                href="/hinweise"
                className={`hover:text-primary transition-colors ${
                  pathname?.includes("/hinweise")
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                Hinweise
              </Link>
              <Link
                href="/informationen"
                className={`hover:text-primary transition-colors ${
                  pathname?.includes("/informationen")
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                Informationen
              </Link>
            </nav>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Filter Toggle für Fahndungen-Seiten */}
              {isFahndungenPage && (
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isFilterOpen
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  aria-expanded={isFilterOpen}
                  aria-label="Filter öffnen/schließen"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Filter</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="md:hidden flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Menü öffnen"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Inline Filter Row (Desktop only, nicht-scrolled state) */}
          {showFilters && isFahndungenPage && !isScrolled && !isMobile && (
            <div className="border-t border-border/20 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <Suspense
                  fallback={
                    <div className="flex-1 h-10 bg-muted animate-pulse rounded" />
                  }
                >
                  <FahndungenFilter className="flex-1" />
                </Suspense>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Erweiterte Filter</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Sticky Filter Panel (when scrolled or mobile) */}
      {isFilterOpen && isFahndungenPage && (
        <div
          className={`fixed z-40 left-0 right-0 transition-all duration-300 ${
            isScrolled ? "top-16" : "top-20"
          }`}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-b-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Fahndungen filtern</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  aria-label="Filter schließen"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <Suspense
                fallback={
                  <div className="h-20 bg-muted animate-pulse rounded" />
                }
              >
                <FahndungenFilter />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
