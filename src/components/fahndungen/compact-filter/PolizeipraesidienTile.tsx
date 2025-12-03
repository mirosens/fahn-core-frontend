import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Map, Search, Check } from "lucide-react";
import Image from "next/image";
import { MapFilterProvider } from "@/contexts/MapFilterContext";
import { getWappenForCity } from "@/lib/wappen/wappen-mapping";

interface PolizeipraesidienTileProps {
  lka?: boolean;
  bka?: boolean;
  onLkaChange?: (value: boolean) => void;
  onBkaChange?: (value: boolean) => void;
  availableStations?: string[]; // Verfügbare Dienststellen aus den Fahndungen
  inlineMode?: boolean; // Wenn true, wird die Liste direkt angezeigt ohne Button/Dropdown (für MobileFilterTabs)
}

export const PolizeipraesidienTile: React.FC<PolizeipraesidienTileProps> = ({
  lka = false,
  bka = false,
  onLkaChange,
  onBkaChange,
  availableStations = [],
  inlineMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedPPs, setExpandedPPs] = useState<Set<string>>(new Set());
  // State für Kartenanzeige - standardmäßig true für Desktop (Checkbox angeklickt)
  const [showMap, setShowMap] = useState(true);
  // State für Flip-Verhalten im mobilen Modus
  const [isFlipped, setIsFlipped] = useState(false);
  // State für mobile Kartenladen - nur wenn Benutzer explizit auf "Karte" klickt
  const [mobileMapLoaded, setMobileMapLoaded] = useState(false);
  
  // Dynamische Imports für Karten-Komponenten
  const [InteractiveMapComponent, setInteractiveMapComponent] = useState<React.ComponentType<{
    showPPFilter?: boolean;
    showInfoPanel?: boolean;
    selectedSegments?: Set<string>;
    onSegmentToggle?: (segmentId: string) => void;
  }> | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [allSegments, setAllSegments] = useState<Array<{ id: string; label: string }>>([]);
  
  // Filtere Segmente basierend auf verfügbaren Dienststellen
  const getRelevantSegments = useCallback((segments: Array<{ id: string; label: string }>): Array<{ id: string; label: string }> => {
    if (availableStations.length === 0) {
      // Wenn keine Dienststellen vorhanden, zeige alle Segmente
      return segments;
    }
    
    // Mapping von PP-Codes zu Städten
    const ppCodeToCity: Record<string, string> = {
      'ma': 'mannheim',
      'hn': 'heilbronn',
      'ka': 'karlsruhe',
      'pf': 'pforzheim',
      'og': 'offenburg',
      'lb': 'ludwigsburg',
      's': 'stuttgart',
      'aa': 'aalen',
      'rt': 'reutlingen',
      'ul': 'ulm',
      'kn': 'konstanz',
      'fr': 'freiburg',
      'rv': 'ravensburg',
    };
    
    // Erstelle Set von relevanten Städten aus verfügbaren Dienststellen
    const relevantCities = new Set<string>();
    const stationsLower = availableStations.map(s => s.toLowerCase());
    
    stationsLower.forEach(station => {
      // Prüfe ob Station eine PP-Stadt enthält
      Object.entries(ppCodeToCity).forEach(([code, city]) => {
        if (station.includes(city) || station.includes(`pp ${code}`) || station.includes(`polizeipräsidium ${city}`)) {
          relevantCities.add(city);
        }
      });
      
      // Prüfe auch auf Segment-Labels (Kreise)
      segments.forEach(segment => {
        const segmentLabelLower = segment.label.toLowerCase();
        if (station.includes(segmentLabelLower) || segmentLabelLower.includes(station)) {
          relevantCities.add(segmentLabelLower);
        }
      });
    });
    
    // Filtere Segmente: zeige nur wenn relevant oder wenn keine Filterung möglich
    if (relevantCities.size === 0) {
      return segments; // Zeige alle wenn keine Übereinstimmung
    }
    
    return segments.filter(segment => {
      const parts = segment.id.split('-');
      const ppCode = parts.length >= 2 ? parts[1] : '';
      const cityName = ppCode && ppCode in ppCodeToCity ? ppCodeToCity[ppCode] : '';
      const segmentLabelLower = segment.label.toLowerCase();
      
      // Prüfe ob Segment zu einer relevanten Stadt gehört
      const matchesCity = cityName ? relevantCities.has(cityName) : false;
      const matchesLabel = Array.from(relevantCities).some(city => segmentLabelLower.includes(city) || city.includes(segmentLabelLower));
      return matchesCity || matchesLabel;
    });
  }, [availableStations]);
  
  // Lade Segmente immer (für Liste)
  useEffect(() => {
      void import("@/components/map/PolizeiSVGComplete").then(m => ({ segments: m.segments }))
      .then((MapData) => {
        const relevantSegs = getRelevantSegments(MapData.segments);
        setAllSegments(relevantSegs);
      });
  }, [getRelevantSegments]);

  // Lade Karte nur wenn benötigt
  useEffect(() => {
    // Prüfe ob wir im mobilen Modus sind (nur für Kartenladen)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Im mobilen Modus: Lade Karte nur wenn mobileMapLoaded true ist
    // Im Desktop: Lade Karte wenn showMap true ist
    const shouldLoadMap = isMobile ? mobileMapLoaded : showMap;
    
    if (shouldLoadMap) {
      // Lade Karte
      void import("@/components/map/PolizeiSVGComplete").then(m => ({ Complete: m.PolizeiSVGComplete }))
        .then((CompleteMapData) => {
          // Setze die Komponente mit Props
          setInteractiveMapComponent(() => CompleteMapData.Complete);
        });
    } else {
      // Im mobilen Modus: Setze Komponente auf null wenn nicht geladen
      if (isMobile && !mobileMapLoaded) {
        setInteractiveMapComponent(null);
      }
    }
  }, [showMap, mobileMapLoaded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Mouse leave handler mit Verzögerung
  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      void clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  // Cleanup Timeout beim Unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        void clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);


  const handleSegmentToggle = useCallback((segmentId: string) => {
    setSelectedSegments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId);
      } else {
        newSet.add(segmentId);
      }
      
      // Speichere in localStorage und dispatch Event mit setTimeout, um React-Fehler zu vermeiden
      if (typeof window !== 'undefined') {
        const segmentsStr = JSON.stringify(Array.from(newSet));
        localStorage.setItem('fahndung-selected-segments', segmentsStr);
        // Verwende setTimeout, um State-Update während des Renderings zu vermeiden
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('fahndung-filter-change', { 
            detail: { key: 'fahndung-selected-segments', value: segmentsStr } 
          }));
        }, 0);
      }
      
      // Force re-render der Karte durch State-Update
      return newSet;
    });
  }, []);

  // Lade gespeicherte Segmente aus localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSegments = localStorage.getItem('fahndung-selected-segments');
      if (savedSegments) {
        try {
          setSelectedSegments(new Set(JSON.parse(savedSegments) as string[]));
        } catch (e) {
          console.error('Fehler beim Laden der gespeicherten Segmente:', e);
        }
      }
    }

    // Höre auf localStorage-Änderungen von anderen Tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fahndung-selected-segments' && e.newValue) {
        try {
          const segments = JSON.parse(e.newValue) as string[];
          setSelectedSegments(new Set(segments));
        } catch (e) {
          console.error('Fehler beim Laden der gespeicherten Segmente:', e);
        }
      }
    };

    // Höre auf Custom Events für Zurücksetzen (nur wenn der Wert leer ist, um Konflikte zu vermeiden)
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; value: string }>;
      if (customEvent.detail?.key === 'fahndung-selected-segments') {
        try {
          const segments = JSON.parse(customEvent.detail.value) as string[];
          // Nur aktualisieren wenn es ein Zurücksetzen ist (leeres Array) oder wenn der State wirklich anders ist
          setSelectedSegments(prev => {
            const newSet = new Set(segments);
            // Wenn Zurücksetzen (leer) oder wenn sich wirklich etwas geändert hat
            if (segments.length === 0 || segments.length !== prev.size || 
                !Array.from(prev).every(id => segments.includes(id))) {
              return newSet;
            }
            return prev;
          });
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

  // Funktion zum Rendern der Liste (wird sowohl im inlineMode als auch im normalen Modus verwendet)
  const renderListContent = (showKarteButton = false) => {
    // Gruppiere Segmente nach PP
    const groupedByPP = allSegments.reduce((acc, segment) => {
      const parts = segment.id.split('-');
      const ppId = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : segment.id;
      const segmentArray = acc[ppId] ??= [];
      segmentArray.push(segment);
      return acc;
    }, {} as Record<string, Array<{ id: string; label: string }>>);

    // Mapping von PP-Codes zu vollständigen PP-Namen
    const ppCodeToFullName: Record<string, string> = {
      'ma': 'Polizeipräsidium Mannheim',
      'hn': 'Polizeipräsidium Heilbronn',
      'ka': 'Polizeipräsidium Karlsruhe',
      'pf': 'Polizeipräsidium Pforzheim',
      'og': 'Polizeipräsidium Offenburg',
      'lb': 'Polizeipräsidium Ludwigsburg',
      's': 'Polizeipräsidium Stuttgart',
      'aa': 'Polizeipräsidium Aalen',
      'rt': 'Polizeipräsidium Reutlingen',
      'ul': 'Polizeipräsidium Ulm',
      'kn': 'Polizeipräsidium Konstanz',
      'fr': 'Polizeipräsidium Freiburg',
      'rv': 'Polizeipräsidium Ravensburg',
    };

    // Filtere PP basierend auf Suchbegriff
    const filteredPPs = Object.entries(groupedByPP).filter(([ppId, segments]) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const ppCode = ppId.replace(/^pp-/, '').split('-')[0] ?? '';
      const fullName = ppCodeToFullName[ppCode] ?? ppId.replace(/^pp-/, 'PP ').toUpperCase();
      return fullName.toLowerCase().includes(term) || 
             segments.some(s => s.label.toLowerCase().includes(term) || s.id.toLowerCase().includes(term));
    });

    // Prüfe ob alle Segmente eines PP ausgewählt sind
    const isPPFullySelected = (segments: Array<{ id: string; label: string }>) => {
      return segments.every(s => selectedSegments.has(s.id));
    };

    // Toggle für PP (alle Segmente auswählen/abwählen)
    const handlePPToggle = (segments: Array<{ id: string; label: string }>) => {
      const allSelected = isPPFullySelected(segments);
      if (allSelected) {
        segments.forEach(s => {
          if (selectedSegments.has(s.id)) {
            handleSegmentToggle(s.id);
          }
        });
      } else {
        segments.forEach(s => {
          if (!selectedSegments.has(s.id)) {
            handleSegmentToggle(s.id);
          }
        });
      }
    };

    // Toggle für Akkordeon (PP auf-/zuklappen)
    const handlePPAccordionToggle = (ppId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedPPs(prev => {
        const newSet = new Set(prev);
        if (newSet.has(ppId)) {
          newSet.delete(ppId);
        } else {
          newSet.add(ppId);
        }
        return newSet;
      });
    };

    const ppCodeToCity: Record<string, string> = {
      'ma': 'Mannheim',
      'hn': 'Heilbronn',
      'ka': 'Karlsruhe',
      'pf': 'Pforzheim',
      'og': 'Offenburg',
      'lb': 'Ludwigsburg',
      's': 'Stuttgart',
      'aa': 'Aalen',
      'rt': 'Reutlingen',
      'ul': 'Ulm',
      'kn': 'Konstanz',
      'fr': 'Freiburg',
      'rv': 'Ravensburg',
    };

    return (
        <div className="h-full flex flex-col min-h-0">
        {/* Suche mit optionalem Karte-Button */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Dienststellen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                style={{
                  fontSize: '16px', // Verhindert Zoom auf iOS
                  WebkitAppearance: 'none'
                }}
              />
            </div>
            {showKarteButton && (
              <button
                onClick={() => {
                  // Lade Karte im mobilen Modus
                  if (!mobileMapLoaded) {
                    setMobileMapLoaded(true);
                    // Warte kurz, damit die Karte geladen wird, bevor wir flippen
                    setTimeout(() => {
                      setIsFlipped(true);
                    }, 200);
                  } else {
                    setIsFlipped(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors flex-shrink-0"
                type="button"
              >
                <Map className="h-4 w-4" />
                <span className="whitespace-nowrap">Karte</span>
              </button>
            )}
          </div>
        </div>

        {/* SCROLL-CONTAINER für PP-Liste */}
        <div 
          className="flex-1 overflow-y-auto min-h-0"
          style={{ 
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'manipulation',
            willChange: 'scroll-position',
            transform: 'translateZ(0)'
          }}
        >
          {allSegments.length === 0 ? (
            <div className="flex items-center justify-center h-full py-8">
              <div className="text-sm font-medium text-foreground/70">Lade Dienststellen...</div>
            </div>
          ) : filteredPPs.length > 0 ? (
            <div className="space-y-2">
              {filteredPPs.map(([ppId, segments]) => {
                const ppCode = ppId.replace(/^pp-/, '').split('-')[0] ?? '';
                const cityName = ppCodeToCity[ppCode] ?? ppCode;
                const fullName = ppCodeToFullName[ppCode] ?? ppId.replace(/^pp-/, 'PP ').toUpperCase();
                const wappenInfo = getWappenForCity(cityName);
                const allSelected = isPPFullySelected(segments);
                const someSelected = segments.some(s => selectedSegments.has(s.id));
                const filteredSegs = searchTerm.trim() 
                  ? segments.filter(s => {
                      const term = searchTerm.toLowerCase();
                      return s.label.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
                    })
                  : segments;
                const isExpanded = expandedPPs.has(ppId);
                
                return (
                  <div key={ppId} className="border-b border-slate-200 dark:border-slate-700 pb-0.5 last:border-b-0">
                    <div className="flex items-center gap-1">
                      {wappenInfo && (
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative">
                          <Image
                            src={wappenInfo.path}
                            alt={wappenInfo.alt}
                            fill
                            style={{ objectFit: 'contain' }}
                            className="object-contain"
                            sizes="32px"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => handlePPToggle(segments)}
                        className={`flex-1 px-2 py-2.5 rounded transition-colors text-sm font-semibold text-left flex items-center justify-between cursor-pointer min-h-[44px] ${
                          allSelected
                            ? "bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                            : someSelected
                            ? "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 hover:bg-blue-300 dark:hover:bg-blue-700"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                        style={{ cursor: "pointer" }}
                        type="button"
                      >
                        <span className="truncate">
                          {fullName}
                        </span>
                        <div className="flex items-center gap-1">
                          {allSelected && (
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {someSelected && !allSelected && (
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" opacity="0.7">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={(e) => handlePPAccordionToggle(ppId, e)}
                        className="flex-shrink-0 px-2 py-1.5 rounded transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        type="button"
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                    {isExpanded && filteredSegs.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {filteredSegs.map((segment) => {
                          const isSelected = selectedSegments.has(segment.id);
                          return (
                            <button
                              key={segment.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSegmentToggle(segment.id);
                              }}
                              className={`w-full px-2 py-2 rounded transition-colors text-sm text-left flex items-center justify-between cursor-pointer min-h-[44px] ${
                                isSelected
                                  ? "bg-blue-500 dark:bg-blue-600 text-white dark:text-white font-medium hover:bg-blue-600 dark:hover:bg-blue-700"
                                  : "bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                              style={{ cursor: "pointer" }}
                              type="button"
                            >
                              <span className="truncate">{segment.label}</span>
                              {isSelected && (
                                <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-muted-foreground">Keine Dienststellen gefunden</div>
            </div>
          )}
        </div>

        {/* LKA/BKA Checkboxen */}
        <div className="flex-shrink-0 pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lka}
                onChange={(e) => {
                  onLkaChange?.(e.target.checked);
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-foreground">LKA</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bka}
                onChange={(e) => {
                  onBkaChange?.(e.target.checked);
                }}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-foreground">BKA</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  // Im inlineMode: Direkt die Liste anzeigen ohne Button/Dropdown
  if (inlineMode) {
    return (
      <MapFilterProvider>
        <div className="relative w-full flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-800" style={{ minHeight: '45vh' }}>
          {/* Flip Container für mobile Ansicht */}
          <div className="flip-container relative w-full flex-1 min-h-0" style={{ minHeight: '45vh' }}>
            {!isFlipped ? (
              /* Vorderseite: Liste */
              <div 
                className="absolute inset-0 w-full h-full flex flex-col p-4"
                style={{ minHeight: '45vh' }}
              >
                {renderListContent(true)}
              </div>
            ) : (
              /* Rückseite: Karte */
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden bg-white dark:bg-slate-800"
                style={{ minHeight: '45vh' }}
              >
                <div className="h-full flex flex-col">
                  {/* Header kompakt - Dienststellen links, Zurück rechts */}
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between flex-shrink-0">
                    <h3 className="text-base font-semibold">Dienststellen</h3>
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="rounded-lg px-2 py-1 hover:bg-accent text-sm"
                      type="button"
                    >
                      <span>Zurück</span>
                    </button>
                  </div>

                  {/* Karte - optimiert für mobile Sichtbarkeit */}
                  <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-y-auto overflow-x-hidden relative w-full" style={{ 
                    minHeight: '40vh', // Höhere Mindesthöhe für bessere Sichtbarkeit
                    touchAction: 'pan-y',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain'
                  }}>
                    {InteractiveMapComponent ? (
                      <div style={{ 
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        position: 'relative',
                        padding: '16px 8px'
                      }}>
                        <div style={{ 
                          width: '100%',
                          maxWidth: '438.56px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center'
                        }}>
                          <div style={{ 
                            width: '100%',
                            maxWidth: '438.56px',
                            aspectRatio: '438.56 / 494.44',
                            position: 'relative',
                            transformOrigin: 'center top'
                          }}>
                            <InteractiveMapComponent 
                              key={`map-mobile-flip-${Array.from(selectedSegments).sort().join('-')}`}
                              showPPFilter={false} 
                              showInfoPanel={false}
                              selectedSegments={selectedSegments}
                              onSegmentToggle={handleSegmentToggle}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <div className="text-sm font-medium text-foreground/70">Lade Karte...</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MapFilterProvider>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div 
      className="relative overflow-visible" 
      ref={dropdownRef}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          // Beim Öffnen im mobilen Modus: Zurück zur Vorderseite (Liste)
          if (!isOpen) {
            setIsFlipped(false);
            // Karte nicht automatisch laden im mobilen Modus
            setMobileMapLoaded(false);
          }
        }}
        className={`flex w-full items-center justify-between rounded-md border border-border bg-background px-3 text-left font-medium text-foreground transition-all duration-200 hover:bg-accent focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer h-9 ${
          selectedSegments.size > 0 ? "border-primary bg-primary/10 text-foreground font-semibold" : "text-foreground"
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium whitespace-nowrap truncate text-foreground">
            Dienststellen{selectedSegments.size > 0 ? ` (${selectedSegments.size})` : ""}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <MapFilterProvider>
          {/* Desktop Layout */}
          <div className="hidden md:block absolute z-[60] mt-1 right-0 rounded-lg border border-border bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
            <div className={`flex flex-row ${showMap ? '' : 'flex-row'}`}>
              {/* Linke Seite: Interaktive Karte - nur wenn showMap true */}
              {showMap && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-r border-border" style={{ 
                  width: '330px',
                  height: '372px',
                  padding: '8px 8px 4px 8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {InteractiveMapComponent ? (
                    <div style={{ 
                      width: '438.56px',
                      height: '494.44px',
                      transform: 'scale(1.1)',
                      transformOrigin: 'top center'
                    }}>
                      <InteractiveMapComponent 
                        key={`map-${Array.from(selectedSegments).sort().join('-')}`}
                        showPPFilter={false} 
                        showInfoPanel={false}
                        selectedSegments={selectedSegments}
                        onSegmentToggle={handleSegmentToggle}
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {/* Rechte Seite: Liste mit Suche */}
              <div className={`flex-shrink-0 bg-white dark:bg-slate-800 flex flex-col ${showMap ? '' : 'border-l-0'}`} style={{ 
                width: showMap ? '420px' : '750px',
                height: '372px'
              }}>
                <div className="p-2 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
                      <input
                        type="text"
                        placeholder="Dienststellen suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm font-medium text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    {/* Checkbox für Kartenanzeige */}
                    <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={showMap}
                        onChange={(e) => setShowMap(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-foreground whitespace-nowrap">Karte</span>
                    </label>
                  </div>
                </div>

                {/* Liste - Segmente */}
                <div 
                  className="flex-1 overflow-y-auto p-1.5 min-h-0" 
                  style={{
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y'
                  }}
                >
                  {(() => {
                    // Gruppiere Segmente nach PP
                    const groupedByPP = allSegments.reduce((acc, segment) => {
                      const parts = segment.id.split('-');
                      const ppId = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : segment.id;
                      const segmentArray = acc[ppId] ??= [];
                      segmentArray.push(segment);
                      return acc;
                    }, {} as Record<string, Array<{ id: string; label: string }>>);

                    // Filtere PP basierend auf Suchbegriff
                    const filteredPPs = Object.entries(groupedByPP).filter(([ppId, segments]) => {
                      if (!searchTerm.trim()) return true;
                      const term = searchTerm.toLowerCase();
                      const ppName = ppId.replace(/^pp-/, 'PP ').toUpperCase();
                      return ppName.toLowerCase().includes(term) || 
                             segments.some(s => s.label.toLowerCase().includes(term) || s.id.toLowerCase().includes(term));
                    });

                    // Prüfe ob alle Segmente eines PP ausgewählt sind
                    const isPPFullySelected = (segments: Array<{ id: string; label: string }>) => {
                      return segments.every(s => selectedSegments.has(s.id));
                    };

                    // Toggle für PP (alle Segmente auswählen/abwählen)
                    const handlePPToggle = (segments: Array<{ id: string; label: string }>) => {
                      const allSelected = isPPFullySelected(segments);
                      if (allSelected) {
                        // Alle Segmente abwählen
                        segments.forEach(s => {
                          if (selectedSegments.has(s.id)) {
                            handleSegmentToggle(s.id);
                          }
                        });
                      } else {
                        // Alle Segmente auswählen
                        segments.forEach(s => {
                          if (!selectedSegments.has(s.id)) {
                            handleSegmentToggle(s.id);
                          }
                        });
                      }
                    };

                    // Toggle für Akkordeon (PP auf-/zuklappen)
                    const handlePPAccordionToggle = (ppId: string, e: React.MouseEvent) => {
                      e.stopPropagation();
                      setExpandedPPs(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(ppId)) {
                          newSet.delete(ppId);
                        } else {
                          newSet.add(ppId);
                        }
                        return newSet;
                      });
                    };

                    return filteredPPs.length > 0 ? (
                      <div className="space-y-0.5">
                        {filteredPPs.map(([ppId, segments]) => {
                          // Mapping von PP-Kürzeln zu Stadtnamen
                          const ppCodeToCity: Record<string, string> = {
                            'ma': 'Mannheim',
                            'hn': 'Heilbronn',
                            'ka': 'Karlsruhe',
                            'pf': 'Pforzheim',
                            'og': 'Offenburg',
                            'lb': 'Ludwigsburg',
                            's': 'Stuttgart',
                            'aa': 'Aalen',
                            'rt': 'Reutlingen',
                            'ul': 'Ulm',
                            'kn': 'Konstanz',
                            'fr': 'Freiburg',
                            'rv': 'Ravensburg',
                          };
                          // Mapping von PP-Codes zu vollständigen PP-Namen
                          const ppCodeToFullName: Record<string, string> = {
                            'ma': 'Polizeipräsidium Mannheim',
                            'hn': 'Polizeipräsidium Heilbronn',
                            'ka': 'Polizeipräsidium Karlsruhe',
                            'pf': 'Polizeipräsidium Pforzheim',
                            'og': 'Polizeipräsidium Offenburg',
                            'lb': 'Polizeipräsidium Ludwigsburg',
                            's': 'Polizeipräsidium Stuttgart',
                            'aa': 'Polizeipräsidium Aalen',
                            'rt': 'Polizeipräsidium Reutlingen',
                            'ul': 'Polizeipräsidium Ulm',
                            'kn': 'Polizeipräsidium Konstanz',
                            'fr': 'Polizeipräsidium Freiburg',
                            'rv': 'Polizeipräsidium Ravensburg',
                          };
                          // Extrahiere Kürzel aus PP-ID (z.B. "pp-ma" -> "ma")
                          const ppCode = ppId.replace(/^pp-/, '').split('-')[0] ?? '';
                          const cityName = ppCodeToCity[ppCode] ?? ppCode;
                          const fullName = ppCodeToFullName[ppCode] ?? ppId.replace(/^pp-/, 'PP ').toUpperCase();
                          const wappenInfo = getWappenForCity(cityName);
                          const allSelected = isPPFullySelected(segments);
                          const someSelected = segments.some(s => selectedSegments.has(s.id));
                          const filteredSegs = searchTerm.trim() 
                            ? segments.filter(s => {
                                const term = searchTerm.toLowerCase();
                                return s.label.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
                              })
                            : segments;

                          const isExpanded = expandedPPs.has(ppId);
                          
                          return (
                            <div key={ppId} className="border-b border-slate-200 dark:border-slate-700 pb-0.5 last:border-b-0">
                              {/* PP Header mit Akkordeon */}
                              <div className="flex items-center gap-1">
                                {/* Wappen links */}
                                {wappenInfo && (
                                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative">
                                    <Image
                                      src={wappenInfo.path}
                                      alt={wappenInfo.alt}
                                      fill
                                      style={{ objectFit: 'contain' }}
                                      className="object-contain"
                                      sizes="32px"
                                    />
                                  </div>
                                )}
                                
                                {/* PP Auswahl Button */}
                                <button
                                  onClick={() => handlePPToggle(segments)}
                                  className={`flex-1 px-2 py-2 rounded transition-colors text-sm font-medium text-left flex items-center justify-between cursor-pointer ${
                                    allSelected
                                      ? "bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                                      : someSelected
                                      ? "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 hover:bg-blue-300 dark:hover:bg-blue-700"
                                      : "bg-background text-foreground hover:bg-accent border border-border"
                                  }`}
                                  style={{ cursor: "pointer" }}
                                  type="button"
                                >
                                  <span className={`truncate text-sm font-medium ${
                                    allSelected
                                      ? "text-white dark:text-white"
                                      : someSelected
                                      ? "text-blue-900 dark:text-blue-100"
                                      : "text-foreground"
                                  }`}>
                                    {fullName}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {allSelected && (
                                      <Check className="w-4 h-4 flex-shrink-0 text-white dark:text-white" />
                                    )}
                                    {someSelected && !allSelected && (
                                      <Check className="w-4 h-4 flex-shrink-0 text-blue-900 dark:text-blue-100" />
                                    )}
                                  </div>
                                </button>
                                {/* Akkordeon Toggle Button rechts - außerhalb des PP-Auswahl-Buttons */}
                                <button
                                  onClick={(e) => handlePPAccordionToggle(ppId, e)}
                                  className="flex-shrink-0 px-2 py-2 rounded transition-colors text-foreground/70 hover:bg-accent hover:text-foreground"
                                  type="button"
                                  aria-expanded={isExpanded}
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>
                              </div>
                              
                              {/* Segmente unter PP - nur anzeigen wenn erweitert */}
                              {isExpanded && filteredSegs.length > 0 && (
                                <div className="ml-6 mt-0.5 space-y-0.5">
                                  {filteredSegs.map((segment) => {
                                    const isSelected = selectedSegments.has(segment.id);
                                    return (
                                      <button
                                        key={segment.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSegmentToggle(segment.id);
                                        }}
                                        className={`w-full px-2 py-2 rounded transition-colors text-sm font-medium text-left flex items-center justify-between cursor-pointer ${
                                          isSelected
                                            ? "bg-blue-500 dark:bg-blue-600 text-white dark:text-white hover:bg-blue-600 dark:hover:bg-blue-700"
                                            : "bg-background text-foreground hover:bg-accent border border-border"
                                        }`}
                                        style={{ cursor: "pointer" }}
                                        type="button"
                                      >
                                        <span className={`truncate text-sm font-medium ${
                                          isSelected
                                            ? "text-white dark:text-white"
                                            : "text-foreground"
                                        }`}>{segment.label}</span>
                                        {isSelected && (
                                          <Check className="w-4 h-4 ml-1 flex-shrink-0 text-white dark:text-white" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm font-medium text-foreground/70">Keine Dienststellen gefunden</div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* LKA/BKA Checkboxen - unten */}
                <div className="p-2 border-t border-border flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lka}
                        onChange={(e) => {
                          onLkaChange?.(e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-foreground">LKA</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bka}
                        onChange={(e) => {
                          onBkaChange?.(e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-foreground">BKA</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className="md:hidden fixed inset-0 z-[60] bg-black/50 border-0 p-0 cursor-default"
            onClick={(e) => {
              // Nur schließen, wenn direkt auf den Overlay geklickt wurde, nicht auf den Content
              if (e.target === e.currentTarget) {
                setIsOpen(false);
                setIsFlipped(false);
                setMobileMapLoaded(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && e.target === e.currentTarget) {
                setIsOpen(false);
                setIsFlipped(false);
                setMobileMapLoaded(false);
              }
            }}
            tabIndex={-1}
            aria-label="Overlay schließen"
          >
            <div 
              className="absolute bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Flip Container für mobile Ansicht */}
              <div className="flip-container relative h-full" style={{ height: '90vh', perspective: '1200px' }}>
                <div 
                  className="flip-inner relative h-full w-full"
                  style={{
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    transformStyle: "preserve-3d",
                    pointerEvents: 'none'
                  }}
                >
                  {/* Vorderseite: Liste mit Suche, LKA, BKA */}
                  <div 
                    className="flip-front absolute inset-0 h-full w-full flex flex-col"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      pointerEvents: 'auto',
                    }}
                  >
                    <div className="flex flex-col h-full p-4">
                      {/* Mobile Header mit Schließen-Button */}
                      <div className="flex-shrink-0 mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Polizeipräsidien</h3>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            setIsFlipped(false);
                            setMobileMapLoaded(false);
                          }}
                          className="rounded-lg p-2 hover:bg-accent"
                          type="button"
                        >
                          <ChevronDown className="h-5 w-5 rotate-180" />
                        </button>
                      </div>

                      {/* Mobile: Suche mit Karte-Button */}
                      <div className="flex-shrink-0 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Dienststellen suchen..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                          </div>
                          {/* Button für Kartenanzeige */}
                          <button
                            onClick={() => {
                              // Lade Karte im mobilen Modus
                              if (!mobileMapLoaded) {
                                setMobileMapLoaded(true);
                                // Warte kurz, damit die Karte geladen wird, bevor wir flippen
                                setTimeout(() => {
                                  setIsFlipped(true);
                                }, 200);
                              } else {
                                setIsFlipped(true);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors flex-shrink-0"
                            type="button"
                          >
                            <Map className="h-4 w-4" />
                            <span className="whitespace-nowrap">Karte</span>
                          </button>
                        </div>
                      </div>

                {/* Mobile: Liste - mit korrektem Scroll-Verhalten */}
                <div 
                  className="flex-1 overflow-y-auto min-h-0"
                  style={{ 
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y'
                  }}
                >
                  {(() => {
                    // Gruppiere Segmente nach PP
                    const groupedByPP = allSegments.reduce((acc, segment) => {
                      const parts = segment.id.split('-');
                      const ppId = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : segment.id;
                      const segmentArray = acc[ppId] ??= [];
                      segmentArray.push(segment);
                      return acc;
                    }, {} as Record<string, Array<{ id: string; label: string }>>);

                    // Filtere PP basierend auf Suchbegriff
                    const filteredPPs = Object.entries(groupedByPP).filter(([ppId, segments]) => {
                      if (!searchTerm.trim()) return true;
                      const term = searchTerm.toLowerCase();
                      const ppName = ppId.replace(/^pp-/, 'PP ').toUpperCase();
                      return ppName.toLowerCase().includes(term) || 
                             segments.some(s => s.label.toLowerCase().includes(term) || s.id.toLowerCase().includes(term));
                    });

                    // Prüfe ob alle Segmente eines PP ausgewählt sind
                    const isPPFullySelected = (segments: Array<{ id: string; label: string }>) => {
                      return segments.every(s => selectedSegments.has(s.id));
                    };

                    // Toggle für PP (alle Segmente auswählen/abwählen)
                    const handlePPToggle = (segments: Array<{ id: string; label: string }>) => {
                      const allSelected = isPPFullySelected(segments);
                      if (allSelected) {
                        segments.forEach(s => {
                          if (selectedSegments.has(s.id)) {
                            handleSegmentToggle(s.id);
                          }
                        });
                      } else {
                        segments.forEach(s => {
                          if (!selectedSegments.has(s.id)) {
                            handleSegmentToggle(s.id);
                          }
                        });
                      }
                    };

                    // Toggle für Akkordeon (PP auf-/zuklappen)
                    const handlePPAccordionToggle = (ppId: string, e: React.MouseEvent) => {
                      e.stopPropagation();
                      setExpandedPPs(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(ppId)) {
                          newSet.delete(ppId);
                        } else {
                          newSet.add(ppId);
                        }
                        return newSet;
                      });
                    };

                    return filteredPPs.length > 0 ? (
                      <div className="space-y-0.5">
                        {filteredPPs.map(([ppId, segments]) => {
                          const ppCodeToCity: Record<string, string> = {
                            'ma': 'Mannheim',
                            'hn': 'Heilbronn',
                            'ka': 'Karlsruhe',
                            'pf': 'Pforzheim',
                            'og': 'Offenburg',
                            'lb': 'Ludwigsburg',
                            's': 'Stuttgart',
                            'aa': 'Aalen',
                            'rt': 'Reutlingen',
                            'ul': 'Ulm',
                            'kn': 'Konstanz',
                            'fr': 'Freiburg',
                            'rv': 'Ravensburg',
                          };
                          // Mapping von PP-Codes zu vollständigen PP-Namen
                          const ppCodeToFullName: Record<string, string> = {
                            'ma': 'Polizeipräsidium Mannheim',
                            'hn': 'Polizeipräsidium Heilbronn',
                            'ka': 'Polizeipräsidium Karlsruhe',
                            'pf': 'Polizeipräsidium Pforzheim',
                            'og': 'Polizeipräsidium Offenburg',
                            'lb': 'Polizeipräsidium Ludwigsburg',
                            's': 'Polizeipräsidium Stuttgart',
                            'aa': 'Polizeipräsidium Aalen',
                            'rt': 'Polizeipräsidium Reutlingen',
                            'ul': 'Polizeipräsidium Ulm',
                            'kn': 'Polizeipräsidium Konstanz',
                            'fr': 'Polizeipräsidium Freiburg',
                            'rv': 'Polizeipräsidium Ravensburg',
                          };
                          const ppCode = ppId.replace(/^pp-/, '').split('-')[0] ?? '';
                          const cityName = ppCodeToCity[ppCode] ?? ppCode;
                          const fullName = ppCodeToFullName[ppCode] ?? ppId.replace(/^pp-/, 'PP ').toUpperCase();
                          const wappenInfo = getWappenForCity(cityName);
                          const allSelected = isPPFullySelected(segments);
                          const someSelected = segments.some(s => selectedSegments.has(s.id));
                          const filteredSegs = searchTerm.trim() 
                            ? segments.filter(s => {
                                const term = searchTerm.toLowerCase();
                                return s.label.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
                              })
                            : segments;
                          const isExpanded = expandedPPs.has(ppId);
                          
                          return (
                            <div key={ppId} className="border-b border-slate-200 dark:border-slate-700 pb-0.5 last:border-b-0">
                              <div className="flex items-center gap-1">
                                {wappenInfo && (
                                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative">
                                    <Image
                                      src={wappenInfo.path}
                                      alt={wappenInfo.alt}
                                      fill
                                      style={{ objectFit: 'contain' }}
                                      className="object-contain"
                                      sizes="32px"
                                    />
                                  </div>
                                )}
                                <button
                                  onClick={() => handlePPToggle(segments)}
                                  className={`flex-1 px-2 py-2 rounded transition-colors text-sm font-medium text-left flex items-center justify-between cursor-pointer ${
                                    allSelected
                                      ? "bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                                      : someSelected
                                      ? "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 hover:bg-blue-300 dark:hover:bg-blue-700"
                                      : "bg-background text-foreground hover:bg-accent border border-border"
                                  }`}
                                  style={{ cursor: "pointer" }}
                                  type="button"
                                >
                                  <span className={`truncate text-sm font-medium ${
                                    allSelected
                                      ? "text-white dark:text-white"
                                      : someSelected
                                      ? "text-blue-900 dark:text-blue-100"
                                      : "text-foreground"
                                  }`}>
                                    {fullName}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {allSelected && (
                                      <Check className="w-4 h-4 flex-shrink-0 text-white dark:text-white" />
                                    )}
                                    {someSelected && !allSelected && (
                                      <Check className="w-4 h-4 flex-shrink-0 text-blue-900 dark:text-blue-100" />
                                    )}
                                  </div>
                                </button>
                                {/* Akkordeon Toggle Button rechts - außerhalb des PP-Auswahl-Buttons */}
                                <button
                                  onClick={(e) => handlePPAccordionToggle(ppId, e)}
                                  className="flex-shrink-0 px-2 py-2 rounded transition-colors text-foreground/70 hover:bg-accent hover:text-foreground"
                                  type="button"
                                  aria-expanded={isExpanded}
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>
                              </div>
                              {isExpanded && filteredSegs.length > 0 && (
                                <div className="ml-6 mt-0.5 space-y-0.5">
                                  {filteredSegs.map((segment) => {
                                    const isSelected = selectedSegments.has(segment.id);
                                    return (
                                      <button
                                        key={segment.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSegmentToggle(segment.id);
                                        }}
                                        className={`w-full px-2 py-2 rounded transition-colors text-sm font-medium text-left flex items-center justify-between cursor-pointer ${
                                          isSelected
                                            ? "bg-blue-500 dark:bg-blue-600 text-white dark:text-white hover:bg-blue-600 dark:hover:bg-blue-700"
                                            : "bg-background text-foreground hover:bg-accent border border-border"
                                        }`}
                                        style={{ cursor: "pointer" }}
                                        type="button"
                                      >
                                        <span className={`truncate text-sm font-medium ${
                                          isSelected
                                            ? "text-white dark:text-white"
                                            : "text-foreground"
                                        }`}>{segment.label}</span>
                                        {isSelected && (
                                          <Check className="w-4 h-4 ml-1 flex-shrink-0 text-white dark:text-white" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm font-medium text-foreground/70">Keine Dienststellen gefunden</div>
                      </div>
                    );
                  })()}
                </div>
                
                      {/* Mobile: LKA/BKA Checkboxen - unten */}
                      <div className="flex-shrink-0 p-4 border-t border-border">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lka}
                              onChange={(e) => {
                                onLkaChange?.(e.target.checked);
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-foreground">LKA</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bka}
                              onChange={(e) => {
                                onBkaChange?.(e.target.checked);
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-foreground">BKA</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rückseite: Karte */}
                  <div 
                    className="flip-back absolute inset-0 h-full w-full overflow-hidden bg-white dark:bg-slate-800"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      pointerEvents: 'auto',
                    }}
                  >
                    <div className="h-full flex flex-col">
                      {/* Header kompakt - Dienststellen links, Zurück rechts */}
                      <div className="px-3 py-2 border-b border-border flex items-center justify-between flex-shrink-0">
                        <h3 className="text-base font-semibold">Dienststellen</h3>
                        <button
                          onClick={() => setIsFlipped(false)}
                          className="rounded-lg px-2 py-1 hover:bg-accent text-sm"
                          type="button"
                        >
                          <span>Zurück</span>
                        </button>
                      </div>

                      {/* Karte - scrollbar, oben startend */}
                      <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-y-auto overflow-x-hidden relative w-full" style={{ 
                        minHeight: 0,
                        touchAction: 'pan-y',
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain'
                      }}>
                        {InteractiveMapComponent ? (
                          <div style={{ 
                            width: '100%',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            position: 'relative',
                            padding: '16px 8px'
                          }}>
                            <div style={{ 
                              width: '100%',
                              maxWidth: '438.56px',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'center'
                            }}>
                              <div style={{ 
                                width: '100%',
                                maxWidth: '438.56px',
                                aspectRatio: '438.56 / 494.44',
                                position: 'relative',
                                transformOrigin: 'center top'
                              }}>
                                <InteractiveMapComponent 
                                  key={`map-mobile-flip-${Array.from(selectedSegments).sort().join('-')}`}
                                  showPPFilter={false} 
                                  showInfoPanel={false}
                                  selectedSegments={selectedSegments}
                                  onSegmentToggle={handleSegmentToggle}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-sm font-medium text-foreground/70">Lade Karte...</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MapFilterProvider>
      )}
    </div>
  );
};

