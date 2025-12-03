"use client";



import React, { useEffect, useCallback, useRef, useMemo } from "react";

import { CompactFilter, type CompactFilterState } from "@/components/fahndungen/CompactFilter";
import { useFilter } from "@/contexts/FilterContext";
import { type ViewMode } from "@/types/fahndungskarte";
import { MobileFilterTabs } from "./MobileFilterTabs";
import FilterChips from "@/components/filtersystem/FilterChips";
import { type ModernFilterState } from "@/components/filtersystem/ModernFahndungFilter";



interface FilterPanelProps {

  isOpen: boolean;

  onClose: () => void;

  isMobile?: boolean;

  onFilterChange?: (filters: CompactFilterState) => void;

  defaultValues?: Partial<CompactFilterState>;

  headerRef?: React.RefObject<HTMLElement | null>;
  
  // Prop für Ergebnisanzahl
  resultCount?: number;

  // Neue Props für alle Funktionen von ModernFahndungFilter
  availableLocations?: string[]; // Verfügbare Tatorte aus den Daten
  availableStations?: string[]; // Verfügbare Dienststellen aus den Daten
  viewMode?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  
  // Prop für Inline-Modus im Header (Desktop)
  isInline?: boolean;
  
  // Prop für Toggle-Handler im Inline-Modus
  onToggle?: () => void;
  
  // Prop für nur FilterChips anzeigen (ohne Filter-Felder)
  showChipsOnly?: boolean;

}



/**
 * FilterPanel Component
 * Sticky Filter-Panel das direkt am Header angeklebt ist
 * Übernimmt das komplette Verhalten vom Header (sticky, Animationen, Scroll-Erkennung)
 * Verwendet die existierende CompactFilter-Komponente
 */
export default function FilterPanel({ 

  isOpen, 

  onClose, 

  isMobile = false,

  onFilterChange,

  defaultValues,

  headerRef,
  
  resultCount,

  availableLocations = [],

  availableStations = [],

  viewMode,

  onViewChange,
  
  isInline = false,
  
  onToggle: _onToggle,
  
  showChipsOnly = false,

}: FilterPanelProps) {

  const filterPanelRef = useRef<HTMLDivElement | HTMLDialogElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);



  const { filters: globalFilters, setFilters: setGlobalFilters } = useFilter();

  // Konvertiere ModernFilterState zu CompactFilterState für defaultValues
  const currentDefaultValues: Partial<CompactFilterState> = useMemo(() => ({
    searchTerm: globalFilters.searchTerm,
    stations: globalFilters.stations,
    types: globalFilters.types,
    timeRange: globalFilters.timeRange,
    dateFrom: globalFilters.dateFrom,
    dateTo: globalFilters.dateTo,
    neu: globalFilters.neu,
    lka: globalFilters.lka,
    bka: globalFilters.bka,
  }), [globalFilters]);

  const handleFilterChange = useCallback((filters: CompactFilterState) => {
    // Aktualisiere globalen Filter-State
    setGlobalFilters(filters);
    // Aktualisiere auch lokalen Callback falls vorhanden
    onFilterChange?.(filters);
  }, [onFilterChange, setGlobalFilters]);

  // Scroll zu Fahndungsübersicht-Bereich wenn Filter geöffnet wird
  useEffect(() => {
    if (!isOpen) return;

    // Warte kurz, damit das FilterPanel gerendert ist
    const scrollToFahndungsuebersicht = () => {
      // Versuche zuerst den Bereich unter "Fahndungsübersicht" zu finden
      const fahndungsuebersichtBereich = document.getElementById('fahndungsuebersicht-bereich');
      if (!fahndungsuebersichtBereich) {
        // Fallback: Falls nicht gefunden, verwende die Trennlinie
        const fahndungskartenStart = document.getElementById('fahndungskarten-start');
        if (!fahndungskartenStart) return;
        
        const header = headerRef?.current;
        const filterPanel = filterPanelRef.current;
        
        let offset = 0;
        if (header) {
          const headerRect = header.getBoundingClientRect();
          offset += headerRect.height;
        }
        if (filterPanel) {
          const filterRect = filterPanel.getBoundingClientRect();
          offset += filterRect.height;
        }

        const elementPosition = fahndungskartenStart.getBoundingClientRect().top + window.scrollY;
        const scrollPosition = elementPosition - offset - 50; // Mittlerer Wert - 50px vor dem Element

        window.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
        return;
      }

      // Berechne die Position: Element-Position minus Header-Höhe minus FilterPanel-Höhe
      const header = headerRef?.current;
      const filterPanel = filterPanelRef.current;
      
      let offset = 0;
      if (header) {
        const headerRect = header.getBoundingClientRect();
        offset += headerRect.height;
      }
      if (filterPanel) {
        const filterRect = filterPanel.getBoundingClientRect();
        offset += filterRect.height;
      }

      // Scroll zu Element mit Offset - mittlerer Wert, nicht zu tief
      const elementPosition = fahndungsuebersichtBereich.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = elementPosition - offset - 50; // Mittlerer Wert - 50px vor dem Element

      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    };

    // Warte auf nächstes Frame, damit DOM aktualisiert ist
    requestAnimationFrame(() => {
      setTimeout(scrollToFahndungsuebersicht, 100);
    });
  }, [isOpen, headerRef]);



  useEffect(() => {

    // Im Inline-Modus keine Positionierung nötig
    if (isInline && !isMobile) return;
    
    if (!isOpen || !headerRef?.current || !filterPanelRef.current) return;

    // Sticky Panel unter Header - für Desktop und Mobile gleich

    const updatePosition = () => {
      const header = headerRef.current;
      const filterPanel = filterPanelRef.current;

      if (!header || !filterPanel) return;

      const headerRect = header.getBoundingClientRect();

      // Finde den Header-Container für exakte Positionierung
      const headerContainer = header.querySelector('.glass-header-container');
      
      if (!headerContainer || !(headerContainer instanceof HTMLElement)) return;

      const containerRect = headerContainer.getBoundingClientRect();
      const containerStyles = window.getComputedStyle(headerContainer);

      // KRITISCH: Keine Transitions auf Position - verursacht Verzögerung
      filterPanel.style.transition = 'none';
      filterPanel.style.willChange = 'transform';
      filterPanel.style.backfaceVisibility = 'hidden';
      
      // Fixed position für perfekte Synchronisation beim Scrollen
      filterPanel.style.position = 'fixed';
      
      // z-index niedriger als Header (50), damit Filterleiste hinter Header erscheint
      filterPanel.style.zIndex = '40';
      
      // Verwende transform für sofortige, GPU-beschleunigte Positionierung
      // Exakte Position wie Header-Container
      const leftPos = containerRect.left;
      const width = containerRect.width;
      
      // Top-Position: Direkt unter Header, nahtlos verbunden
      // headerBottom ist immer korrekt, auch beim Scrollen nach oben UND nach unten
      // Wichtig: Funktioniert auch wenn Header von "scrolled" zurück zu "nicht-scrolled" geht
      const headerBottom = headerRect.bottom;
      
      // Prüfe ob ein Dropdown-Menü geöffnet ist
      const dropdownMenus = document.querySelectorAll('[role="menu"]');
      let maxDropdownBottom = 0;
      dropdownMenus.forEach((menu) => {
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.bottom > maxDropdownBottom) {
          maxDropdownBottom = menuRect.bottom;
        }
      });
      
      // Position: Direkt unter Header oder Dropdown
      // Immer nahtlos, ohne Spalt - auch beim Zurückscrollen
      let topPos: number;
      if (maxDropdownBottom > headerBottom) {
        topPos = maxDropdownBottom;
      } else {
        // Direkt unter Header - nahtlos, ohne Abstand
        // Funktioniert in beiden Richtungen: nach oben UND nach unten scrollen
        topPos = headerBottom;
      }
      
      // Sicherstellen, dass topPos immer >= 0 ist
      topPos = Math.max(topPos, 0);
      
      // Mobile: KEIN transform, nur top/left
      if (isMobile) {
        filterPanel.style.transform = 'none';
        filterPanel.style.top = `${topPos}px`;
        filterPanel.style.left = `${leftPos}px`;
      } else {
        // Transform für sofortige Positionierung ohne Verzögerung
        filterPanel.style.transform = `translate3d(${leftPos}px, ${topPos}px, 0)`;
        // Wichtig: left/top auf 0, damit transform funktioniert
        filterPanel.style.left = '0';
        filterPanel.style.top = '0';
      }
      
      filterPanel.style.width = `${width}px`;
      filterPanel.style.maxWidth = containerStyles.maxWidth || '1273px';
      filterPanel.style.right = 'auto';
      
      // Zentrierte Ausrichtung wie Header-Container
      if (!isMobile) {
        filterPanel.style.marginLeft = 'auto';
        filterPanel.style.marginRight = 'auto';
      } else {
        filterPanel.style.marginLeft = '0';
        filterPanel.style.marginRight = '0';
      }
      
      // Sichtbarkeit - immer sichtbar wenn geöffnet
      filterPanel.style.visibility = 'visible';
      filterPanel.style.opacity = '1';
      filterPanel.style.display = 'block';
      
      // Einfacher Hintergrund ohne Backdrop-Effekte - Dark Mode unterstützt
      const isDarkMode = document.documentElement.classList.contains('dark');
      filterPanel.style.background = isDarkMode 
        ? 'rgba(15, 25, 45, 0.95)' // Navy-Blau für Dark Mode (passend zu glass-header)
        : 'rgba(255, 255, 255, 0.95)'; // Weiß für Light Mode
      // Entferne alle Backdrop-Filter
      filterPanel.style.backdropFilter = 'none';
      filterPanel.style.setProperty('webkitBackdropFilter', 'none');
      
      // Border für Dark Mode anpassen
      if (isDarkMode) {
        filterPanel.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      } else {
        filterPanel.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      }
      
      // Border-radius: Nur unten für nahtlose Verbindung
      filterPanel.style.borderTopLeftRadius = '0';
      filterPanel.style.borderTopRightRadius = '0';
      const borderRadius = containerStyles.borderRadius;
      if (borderRadius) {
        filterPanel.style.borderBottomLeftRadius = borderRadius;
        filterPanel.style.borderBottomRightRadius = borderRadius;
      } else {
        filterPanel.style.borderBottomLeftRadius = '0';
        filterPanel.style.borderBottomRightRadius = '0';
      }

      
      // Synchronisiere scrolled-Klasse mit Header
      // WICHTIG: Auch beim Zurückscrollen (Header zurück in Standard-Position) muss Filterleiste nahtlos bleiben
      const isScrolled = header.classList.contains("scrolled");
      
      // Hole margin-top vom Header-Container für exakte Synchronisation
      const containerMarginTop = containerStyles.marginTop;
      
      if (isScrolled) {
        filterPanel.classList.add("scrolled");
        filterPanel.style.marginTop = '0';
      } else {
        filterPanel.classList.remove("scrolled");
        // Verwende exakt die gleiche margin-top wie Header-Container
        if (!isMobile) {
          filterPanel.style.marginTop = containerMarginTop || '1rem'; // mt-4 - genau wie Header-Container
        } else {
          filterPanel.style.marginTop = '0';
        }
      }
      
      // Kein Padding oben - nahtlose Verbindung ohne Spalt
      filterPanel.style.paddingTop = '0';
      
      // Stelle sicher, dass Filterleiste immer direkt am Header klebt
      // Auch beim Zurückscrollen von "scrolled" zu "nicht-scrolled"
      // Die topPos wird bereits korrekt berechnet (headerBottom), 
      // margin-top wird exakt synchronisiert mit Header-Container, damit kein Spalt entsteht

    };



    // Sofort beim Öffnen

    updatePosition();



    // MutationObserver für Header-Klassenänderungen
    // WICHTIG: Aktualisiert Position sofort wenn Header zwischen "scrolled" und "nicht-scrolled" wechselt
    const observer = new MutationObserver(() => {
      // Sofortige Positionierung ohne Verzögerung
      // Besonders wichtig beim Zurückscrollen (Header zurück in Standard-Position)
      updatePosition();
    });

    observer.observe(headerRef.current, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    // Theme-Observer: Aktualisiere Hintergrund wenn Dark Mode wechselt
    const themeObserver = new MutationObserver(() => {
      updatePosition(); // updatePosition aktualisiert auch den Hintergrund
    });
    
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    // Beobachte auch Header-Container für margin-top Änderungen
    const headerContainerForObserver = headerRef.current.querySelector('.glass-header-container');
    if (headerContainerForObserver) {
      observer.observe(headerContainerForObserver, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    // Beobachte auch Dropdown-Menüs für Position-Updates
    const dropdownObserver = new MutationObserver(() => {
      // Sofortige Positionierung ohne Verzögerung
      updatePosition();
    });

    // Beobachte das gesamte Dokument auf Dropdown-Änderungen
    dropdownObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    // Zusätzlich: Interval für Position-Updates (falls Dropdowns dynamisch erscheinen)
    // Reduziert auf 16ms für 60fps Updates
    const positionUpdateInterval = setInterval(() => {
      if (isOpen) {
        updatePosition();
      }
    }, 16);



    // ResizeObserver für Header-Größenänderungen

    const resizeObserver = new ResizeObserver(updatePosition);

    resizeObserver.observe(headerRef.current);



    // Scroll-Updates - SOFORT ohne Verzögerung
    // WICHTIG: Filterleiste muss sofort am Header kleben, keine Verzögerung beim Scrollen
    const handleScroll = () => {
      // Direkte Positionierung ohne requestAnimationFrame für sofortige Reaktion
      updatePosition();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    window.addEventListener("resize", updatePosition, { passive: true });



    return () => {

      observer.disconnect();

      resizeObserver.disconnect();

      dropdownObserver.disconnect();

      themeObserver.disconnect();

      clearInterval(positionUpdateInterval);

      window.removeEventListener("scroll", handleScroll);

      window.removeEventListener("resize", updatePosition);

    };

  }, [isOpen, headerRef, isMobile, isInline]);

  // Click-Outside-Handler und Keyboard-Events
  useEffect(() => {
    if (!isOpen) return;

    // Speichere das zuvor fokussierte Element
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

    // Click-Outside-Handler entfernt - Filterleiste schließt nicht mehr bei Klick außerhalb

    // Escape-Taste Handler
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    // Focus-Trap: Tab-Navigation innerhalb des Panels
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !filterPanelRef.current) return;

      const focusableElements = filterPanelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement || document.activeElement === filterPanelRef.current) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Event-Listener hinzufügen (nur Keyboard-Events, kein Click-Outside mehr)
    document.addEventListener('keydown', handleEscape, true);
    document.addEventListener('keydown', handleTabKey, true);

    return () => {
      document.removeEventListener('keydown', handleEscape, true);
      document.removeEventListener('keydown', handleTabKey, true);

      // Focus wiederherstellen
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Hooks für showChipsOnly-Modus - müssen immer aufgerufen werden (Rules of Hooks)
  const [ppSegments, setPPSegments] = React.useState<string[]>([]);
  
  // Lade PP-Segmente aus localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSegments = localStorage.getItem('fahndung-selected-segments');
      if (savedSegments) {
        try {
          const segments = JSON.parse(savedSegments) as string[];
          setPPSegments(segments);
        } catch (e) {
          console.error('Fehler beim Laden der gespeicherten Segmente:', e);
        }
      }
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fahndung-selected-segments' && e.newValue) {
        try {
          const segments = JSON.parse(e.newValue) as string[];
          setPPSegments(segments);
        } catch (e) {
          console.error('Fehler beim Laden der gespeicherten Segmente:', e);
        }
      }
    };
    
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; value: string }>;
      if (customEvent.detail?.key === 'fahndung-selected-segments') {
        try {
          const segments = JSON.parse(customEvent.detail.value) as string[];
          setPPSegments(segments);
        } catch (e) {
          console.error('Fehler beim Laden der gespeicherten Segmente:', e);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fahndung-filter-change', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fahndung-filter-change', handleCustomEvent);
    };
  }, []);
  
  const modernFilterState: ModernFilterState = useMemo(() => ({
    stations: globalFilters.stations,
    locations: [],
    types: globalFilters.types,
    neu: globalFilters.neu,
    timeRange: globalFilters.timeRange,
    searchTerm: globalFilters.searchTerm,
    lka: globalFilters.lka,
    bka: globalFilters.bka,
  }), [globalFilters]);
  
  const removePPSegment = useCallback((segmentId: string) => {
    if (typeof window !== 'undefined') {
      const newSegments = ppSegments.filter(id => id !== segmentId);
      setPPSegments(newSegments);
      const segmentsStr = JSON.stringify(newSegments);
      localStorage.setItem('fahndung-selected-segments', segmentsStr);
      window.dispatchEvent(new CustomEvent('fahndung-filter-change', { 
        detail: { key: 'fahndung-selected-segments', value: segmentsStr } 
      }));
    }
  }, [ppSegments]);
  
  const resetFilters = useCallback(() => {
    const resetState: CompactFilterState = {
      searchTerm: "",
      stations: [],
      types: [],
      timeRange: "all",
      dateFrom: undefined,
      dateTo: undefined,
      neu: false,
      sortBy: "date",
      sortOrder: "desc",
      region: [],
      lka: false,
      bka: false,
    };
    handleFilterChange(resetState);
    
    if (typeof window !== 'undefined') {
      setPPSegments([]);
      localStorage.setItem('fahndung-selected-segments', JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('fahndung-filter-change', { 
        detail: { key: 'fahndung-selected-segments', value: JSON.stringify([]) } 
      }));
    }
  }, [handleFilterChange]);
  
  const toggleArrayFilter = useCallback((
    filterType: keyof Pick<CompactFilterState, "stations" | "types">,
    value: string,
  ) => {
    const currentArray = globalFilters[filterType === "types" ? "types" : "stations"];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    const newFilters: CompactFilterState = {
      searchTerm: globalFilters.searchTerm ?? "",
      stations: filterType === "stations" ? newArray : (globalFilters.stations ?? []),
      types: filterType === "types" ? newArray : (globalFilters.types ?? []),
      timeRange: globalFilters.timeRange ?? "all",
      dateFrom: globalFilters.dateFrom,
      dateTo: globalFilters.dateTo,
      neu: globalFilters.neu ?? false,
      sortBy: "date",
      sortOrder: "desc",
      region: [],
      lka: globalFilters.lka ?? false,
      bka: globalFilters.bka ?? false,
    };
    handleFilterChange(newFilters);
  }, [globalFilters, handleFilterChange]);

  // Desktop: Immer rendern wenn nicht Mobile, Mobile: nur wenn isOpen
  if (isMobile && !isOpen) return null;

  // Inline-Modus für Desktop: Filter direkt im Header
  if (isInline && !isMobile) {
    // Nur FilterChips anzeigen (ohne Filter-Felder) - für zweite Zeile
    if (showChipsOnly) {
      
      return (
        <div className="flex items-center justify-between gap-3 w-full">
          {/* FilterChips - links */}
          <div className="flex-1 flex flex-wrap gap-2">
            <FilterChips
              filters={modernFilterState}
              onRemoveFilter={(filterType, value) => {
                if (filterType === "types") {
                  toggleArrayFilter("types", value);
                }
              }}
              onRemoveTimeFilter={() => {
                const newFilters: CompactFilterState = {
                  searchTerm: globalFilters.searchTerm ?? "",
                  stations: globalFilters.stations ?? [],
                  types: globalFilters.types ?? [],
                  timeRange: "all",
                  dateFrom: globalFilters.dateFrom,
                  dateTo: globalFilters.dateTo,
                  neu: globalFilters.neu ?? false,
                  sortBy: "date",
                  sortOrder: "desc",
                  region: [],
                  lka: globalFilters.lka ?? false,
                  bka: globalFilters.bka ?? false,
                };
                handleFilterChange(newFilters);
              }}
              onRemoveSearchTerm={() => {
                const newFilters: CompactFilterState = {
                  searchTerm: "",
                  stations: globalFilters.stations ?? [],
                  types: globalFilters.types ?? [],
                  timeRange: globalFilters.timeRange ?? "all",
                  dateFrom: globalFilters.dateFrom,
                  dateTo: globalFilters.dateTo,
                  neu: globalFilters.neu ?? false,
                  sortBy: "date",
                  sortOrder: "desc",
                  region: [],
                  lka: globalFilters.lka ?? false,
                  bka: globalFilters.bka ?? false,
                };
                handleFilterChange(newFilters);
              }}
              onRemoveNeuFilter={() => {
                const newFilters: CompactFilterState = {
                  searchTerm: globalFilters.searchTerm ?? "",
                  stations: globalFilters.stations ?? [],
                  types: globalFilters.types ?? [],
                  timeRange: globalFilters.timeRange ?? "all",
                  dateFrom: globalFilters.dateFrom,
                  dateTo: globalFilters.dateTo,
                  neu: false,
                  sortBy: "date",
                  sortOrder: "desc",
                  region: [],
                  lka: globalFilters.lka ?? false,
                  bka: globalFilters.bka ?? false,
                };
                handleFilterChange(newFilters);
              }}
              onRemovePPSegment={removePPSegment}
              onRemoveLkaFilter={() => {
                const newFilters: CompactFilterState = {
                  searchTerm: globalFilters.searchTerm ?? "",
                  stations: globalFilters.stations ?? [],
                  types: globalFilters.types ?? [],
                  timeRange: globalFilters.timeRange ?? "all",
                  dateFrom: globalFilters.dateFrom,
                  dateTo: globalFilters.dateTo,
                  neu: globalFilters.neu ?? false,
                  sortBy: "date",
                  sortOrder: "desc",
                  region: [],
                  lka: false,
                  bka: globalFilters.bka ?? false,
                };
                handleFilterChange(newFilters);
              }}
              onRemoveBkaFilter={() => {
                const newFilters: CompactFilterState = {
                  searchTerm: globalFilters.searchTerm ?? "",
                  stations: globalFilters.stations ?? [],
                  types: globalFilters.types ?? [],
                  timeRange: globalFilters.timeRange ?? "all",
                  dateFrom: globalFilters.dateFrom,
                  dateTo: globalFilters.dateTo,
                  neu: globalFilters.neu ?? false,
                  sortBy: "date",
                  sortOrder: "desc",
                  region: [],
                  lka: globalFilters.lka ?? false,
                  bka: false,
                };
                handleFilterChange(newFilters);
              }}
              ppSegments={ppSegments}
            />
          </div>
          
          {/* Zurücksetzen Button - rechts */}
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 flex-shrink-0 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-2 border-border"
            type="button"
            aria-label="Alle Filter zurücksetzen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            <span>Zurücksetzen</span>
          </button>
        </div>
      );
    }
    
    // Normale Filter-Felder (ohne FilterChips)
    return (
      <div className="flex-1 flex items-center gap-2 max-w-4xl">
        <CompactFilter
          onFilterChange={handleFilterChange}
          showRegionFilter={false}
          defaultValues={defaultValues ?? currentDefaultValues}
          availableLocations={availableLocations}
          availableStations={availableStations}
          onClose={undefined}
          viewMode={viewMode}
          onViewChange={onViewChange}
          className="border-0 bg-transparent p-0 shadow-none w-full"
          isInline={true}
        />
      </div>
    );
  }

  // Auf mobilen Geräten <div> verwenden, auf Desktop <dialog> für bessere Accessibility
  // Das <dialog> Element erzeugt auf mobilen Geräten ein natives Backdrop, das die Interaktion blockiert
  const commonProps = {
    'aria-modal': 'true' as const,
    className: `
        fixed z-[40]
        glass-header glass-header-container
        ${isMobile 
          ? "mx-0 rounded-none max-h-[85vh]" 
          : "mx-auto rounded-b-[10px] rounded-t-none max-w-[1273px]"
        }
        border-t-0
        ${isMobile ? "overflow-hidden flex flex-col" : "overflow-visible"}
      `,
    style: { 
      // Position wird über transform in updatePosition() gesetzt
      // Keine inline top/left - verhindert Konflikte
      // Dark Mode wird dynamisch in updatePosition() gesetzt
      touchAction: 'pan-y' as const,
      pointerEvents: 'auto' as const,
      ...(isMobile && isOpen ? { display: 'block' } : {}),
    },
    'aria-describedby': 'filter-panel-description',
  };

  const content = (
    <>
      {/* Screenreader-Beschreibung */}
      <div id="filter-panel-description" className="sr-only">
        Verwenden Sie die Filteroptionen, um Fahndungen nach verschiedenen Kriterien zu durchsuchen. 
        Drücken Sie Escape, um das Filter-Panel zu schließen.
      </div>

      {/* Mobile: Tab-basierte Filter */}
      {isMobile ? (
        <MobileFilterTabs
          onFilterChange={handleFilterChange}
          defaultValues={defaultValues ?? currentDefaultValues}
          availableLocations={availableLocations}
          availableStations={availableStations}
          onClose={onClose}
          resultCount={resultCount}
        />
      ) : (
        /* Desktop: Kompaktes Filter-Layout */
        <CompactFilter
          onFilterChange={handleFilterChange}
          showRegionFilter={true}
          defaultValues={defaultValues ?? currentDefaultValues}
          availableLocations={availableLocations}
          availableStations={availableStations}
          onClose={onClose}
          viewMode={viewMode}
          onViewChange={onViewChange}
          className="border-0 bg-transparent p-0 shadow-none"
        />
      )}
    </>
  );

  if (isMobile) {
    // Auf mobilen Geräten verwenden wir <div> statt <dialog>, da das native Backdrop
    // des <dialog> Elements die Touch-Interaktion blockiert (siehe Commit bf7fa08)
    return (
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      <div
        ref={filterPanelRef as React.Ref<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        className={commonProps.className}
        style={commonProps.style}
        aria-describedby={commonProps['aria-describedby']}
      >
        {content}
      </div>
    );
  }

  return (
    <dialog
      ref={filterPanelRef as React.Ref<HTMLDialogElement>}
      aria-modal="true"
      className={commonProps.className}
      style={commonProps.style}
      aria-describedby={commonProps['aria-describedby']}
      open={isOpen}
    >
      {content}
    </dialog>
  );

}