"use client";

import React, { useState, useEffect, useMemo } from "react";
import "@/styles/glassmorphism-header.css";

import { Logo } from "../../ui/Logo";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import FilterPanel from "./FilterPanel";
import { VerticalThemeToggle } from "@/components/ui/VerticalThemeToggle";
import { FilterIcon } from "@/components/ui/FilterIcon";
import { type ViewMode } from "@/types/fahndungskarte";
import { useFilter } from "@/contexts/FilterContext";

/**
 * ModernHeader Component
 * Kombiniert DesktopHeader und MobileHeader in einer glasartigen Container-Struktur
 * Responsive Verhalten: In mobilen Zuständen ohne Abstand am oberen Rand und ohne Scroll-Animation
 */
export default function ModernHeader() {
  const [isMobile, setIsMobile] = useState(false);
  // Desktop: Filterleiste immer offen, Mobile: kann geöffnet/geschlossen werden
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid-4");
  const [resultCount, setResultCount] = useState<number | undefined>(undefined);
  
  // CSS-only Scroll-Detection ohne Re-Renders
  const { headerRef, spacerRef } = useScrollDetection();
  const { filters } = useFilter();
  const [ppSegments, setPPSegments] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [selectedSubStations, setSelectedSubStations] = useState<string[]>([]);
  
  // Lade Filter aus localStorage (PP-Segmente, Districts, Stations, Sub-Stations)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadFilters = () => {
        try {
          // PP-Segmente
          const savedSegments = localStorage.getItem('fahndung-selected-segments');
          if (savedSegments) {
            const segments = JSON.parse(savedSegments) as string[];
            setPPSegments(segments);
          } else {
            setPPSegments([]);
          }
          
          // Districts
          const savedDistricts = localStorage.getItem('fahndung-selected-districts');
          if (savedDistricts) {
            const districts = JSON.parse(savedDistricts) as string[];
            setSelectedDistricts(districts);
          } else {
            setSelectedDistricts([]);
          }
          
          // Stations
          const savedStations = localStorage.getItem('fahndung-selected-stations');
          if (savedStations) {
            const stations = JSON.parse(savedStations) as string[];
            setSelectedStations(stations);
          } else {
            setSelectedStations([]);
          }
          
          // Sub-Stations
          const savedSubStations = localStorage.getItem('fahndung-selected-sub-stations');
          if (savedSubStations) {
            const subStations = JSON.parse(savedSubStations) as string[];
            setSelectedSubStations(subStations);
          } else {
            setSelectedSubStations([]);
          }
        } catch (e) {
          console.error('Fehler beim Laden der Filter:', e);
          setPPSegments([]);
          setSelectedDistricts([]);
          setSelectedStations([]);
          setSelectedSubStations([]);
        }
      };
      
      loadFilters();
      
      // Höre auf Änderungen
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key?.startsWith('fahndung-selected-')) {
          loadFilters();
        }
      };
      
      const handleCustomEvent = (e: Event) => {
        const customEvent = e as CustomEvent<{ key: string; value: string }>;
        if (customEvent.detail?.key?.startsWith('fahndung-selected-')) {
          loadFilters();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('fahndung-filter-change', handleCustomEvent);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('fahndung-filter-change', handleCustomEvent);
      };
    }
    return undefined;
  }, []);
  
  // Prüfe ob aktive Filter vorhanden sind (inkl. alle localStorage-Filter)
  const hasActiveFilters = useMemo(() => {
    const active = !!(
      filters.searchTerm ||
      filters.types.length > 0 ||
      filters.timeRange !== "all" ||
      (filters.dateFrom ?? false) ||
      (filters.dateTo ?? false) ||
      (filters.neu ?? false) ||
      (filters.lka ?? false) ||
      (filters.bka ?? false) ||
      filters.stations.length > 0 ||
      ppSegments.length > 0 ||
      selectedDistricts.length > 0 ||
      selectedStations.length > 0 ||
      selectedSubStations.length > 0
    );
    return active;
  }, [filters, ppSegments, selectedDistricts, selectedStations, selectedSubStations]);

  // Lade viewMode aus localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('fahndung-view-mode') as ViewMode | null;
      if (savedViewMode && (savedViewMode === "grid-3" || savedViewMode === "grid-4" || savedViewMode === "list-flat")) {
        setViewMode(savedViewMode);
      }
    }
  }, []);

  // Speichere viewMode in localStorage
  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fahndung-view-mode', view);
      // Dispatch Custom Event für andere Komponenten auf der gleichen Seite
      window.dispatchEvent(new CustomEvent('viewModeChange', { detail: view }));
    }
  };

  // Höre auf Custom Events für viewMode-Änderungen (von HomeContent)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleViewModeChange = (e: CustomEvent<ViewMode>) => {
      setViewMode(e.detail);
    };

    // Höre auf Ergebnis-Count-Updates
    const handleResultCountUpdate = (e: CustomEvent<{ count: number }>) => {
      setResultCount(e.detail.count);
    };

    window.addEventListener('viewModeChange', handleViewModeChange as EventListener);
    window.addEventListener('fahndung-result-count-update', handleResultCountUpdate as EventListener);
    return () => {
      window.removeEventListener('viewModeChange', handleViewModeChange as EventListener);
      window.removeEventListener('fahndung-result-count-update', handleResultCountUpdate as EventListener);
    };
  }, []);

  const toggleFilter = () => {
    // Desktop: Filter kann geöffnet/geschlossen werden
    setIsFilterOpen((prev) => !prev);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

  // Responsive Erkennung
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1280; // Mobile bis 1280px, Desktop ab 1281px
      setIsMobile(mobile);
      // Desktop: Filterleiste immer offen, Mobile: geschlossen
      if (!mobile) {
        setIsFilterOpen(true);
      } else {
        setIsFilterOpen(false);
      }
    };

    // Initial check
    checkMobile();

    // Event listener für Resize
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filterleiste schließen bei Navigation-Klicks entfernt - Filterleiste bleibt offen

  return (
    <>
      {/* Font-Loading Optimierung */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @font-face {
            font-display: swap; /* Kritisch! */
            size-adjust: 105%; /* Verhindert Layout Shift */
          }
        `,
        }}
      />

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
          ${isMobile 
            ? 'h-14' // Mobile: Noch kompaktere Höhe ohne Animation
            : hasActiveFilters && !isMobile
              ? 'h-auto min-h-20 transition-all duration-300 ease-out [&.scrolled]:min-h-16' // Desktop: Erweitert wenn Filter aktiv
              : 'h-20 transition-all duration-300 ease-out [&.scrolled]:h-16' // Desktop: Mit Animation
          }
        `}
        role="banner"
        aria-label="Hauptnavigation"
      >
        {/* Glassmorphismus Container - freistehende Form */}
        <div
          className={`
          glass-header glass-header-container mx-auto
          ${hasActiveFilters && !isMobile ? 'min-h-full' : 'h-full'} max-w-[1273px]
          ${isMobile 
            ? 'mt-0 rounded-none' // Mobile: Kein Abstand, keine abgerundeten Ränder
            : 'mt-4 rounded-[10px] transition-all duration-300 [.scrolled_&]:mt-0' // Desktop: Mit Animation und Rundungen
          }
        `}
        >
          <div className={`${hasActiveFilters && !isMobile ? 'py-4' : 'h-full'} px-4 sm:px-6 lg:px-8`}>
            {/* Erste Zeile: Logo, Filter, Suchsymbol - immer in einer Reihe */}
            <div className="relative flex h-full items-center">
              {/* Logo - verkleinert, ca. 25-30% optisch */}
              <div className="flex-shrink-0">
                <Logo />
              </div>

              {/* Desktop: Filter zwischen Logo und Suchsymbol */}
              {!isMobile && (
                <div className="flex-1 flex items-center justify-center min-w-0 mx-4 sm:mx-6 lg:mx-8">
                  <FilterPanel 
                    isOpen={isFilterOpen} 
                    onClose={closeFilter}
                    onToggle={toggleFilter}
                    isMobile={false}
                    headerRef={headerRef}
                    resultCount={resultCount}
                    viewMode={viewMode}
                    onViewChange={handleViewChange}
                    isInline={true}
                  />
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

              {/* Mobile Header mit rechten Aktionen - bis 1280px */}
              <div className="flex items-center ml-auto desktop:hidden">
                {/* Filter Icon - zuerst mit mehr Platz */}
                <button
                  onClick={toggleFilter}
                  className="relative flex items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 mr-6"
                  aria-expanded={isFilterOpen}
                  aria-label="Filter öffnen"
                >
                  <FilterIcon size={28} className="h-7 w-7" />
                  {/* Badge - zeigt gefilterte Ergebnisse wenn Filter aktiv, sonst normale Badge */}
                  {resultCount !== undefined && resultCount >= 0 && (
                    <span 
                      className={`absolute top-0 right-0 translate-x-full -translate-y-1/2 font-bold rounded-full flex items-center justify-center ${
                        hasActiveFilters 
                          ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white' 
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                      style={{
                        width: hasActiveFilters ? 'auto' : '18px',
                        height: hasActiveFilters ? '22px' : '18px',
                        minWidth: hasActiveFilters ? '22px' : '18px',
                        padding: hasActiveFilters ? '0 6px' : '0',
                        fontSize: hasActiveFilters ? '11px' : '9px',
                        lineHeight: '1',
                        fontWeight: 'bold'
                      }}
                      title={hasActiveFilters ? 'Gefilterte Fahndungen' : 'Alle Fahndungen'}
                    >
                      {hasActiveFilters 
                        ? (resultCount > 999 ? '999+' : String(resultCount))
                        : (resultCount >= 10000 ? '10k+' : (resultCount > 999 ? '999+' : String(resultCount)))
                      }
                    </span>
                  )}
                </button>
                
                {/* Theme Toggle und Hamburger Menu - weiter rechts */}
                <div className="flex items-center gap-3">
                  {/* Separator */}
                  <div className="h-6 w-px bg-border/60" />
                  
                  {/* Theme Toggle - zweitens */}
                  <VerticalThemeToggle />
                  
                  {/* Separator */}
                  <div className="h-6 w-px bg-border/60" />
                  
                  {/* Hamburger Menu - zuletzt */}
                  <MobileHeader 
                    onFilterToggle={toggleFilter} 
                    isFilterOpen={isFilterOpen}
                    onFilterClose={closeFilter}
                  />
                </div>
              </div>
            </div>
            
            {/* Zweite Zeile: FilterChips (links) und Zurücksetzen (rechts) - nur wenn Filter aktiv */}
            {hasActiveFilters && !isMobile && (
              <div className="mt-3 pt-3 border-t border-border">
                <FilterPanel 
                  isOpen={isFilterOpen} 
                  onClose={closeFilter}
                  onToggle={toggleFilter}
                  isMobile={false}
                  headerRef={headerRef}
                  resultCount={resultCount}
                  viewMode={viewMode}
                  onViewChange={handleViewChange}
                  isInline={true}
                  showChipsOnly={true}
                />
              </div>
            )}
          </div>
          </div>
      </header>

      {/* Spacer für fixed Header */}
      <div 
        ref={spacerRef} 
        className={`
          ${isMobile 
            ? 'h-14' // Mobile: Kompaktere Höhe ohne Animation
            : hasActiveFilters && !isMobile
              ? 'min-h-20 transition-all duration-300 [.scrolled_&]:min-h-16' // Desktop: Erweitert wenn Filter aktiv
              : 'h-20 transition-all duration-300 [.scrolled_&]:h-16' // Desktop: Mit Animation
          }
        `} 
      />

      {/* Filter Panel - nur für Mobile, Desktop ist im Header integriert */}
      {isMobile && (
        <FilterPanel 
          isOpen={isFilterOpen} 
          onClose={() => {
            setIsFilterOpen(false);
          }} 
          isMobile={isMobile}
          headerRef={headerRef}
          resultCount={resultCount}
          viewMode={viewMode}
          onViewChange={handleViewChange}
        />
      )}

      {/* Spacer für Filter Panel - nur für Mobile */}
      {isMobile && isFilterOpen && (
        <div className="h-[80px] transition-all duration-300" />
      )}
    </>
  );
}

