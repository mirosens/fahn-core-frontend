"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Search } from "lucide-react";

// Segmente-Daten (vereinfacht - später aus PolizeiSVGComplete importieren)
export const segments = [
  { id: "pp-ma-1", label: "Stadtkreis Mannheim" },
  { id: "pp-ma-2", label: "Stadtkreis Heidelberg, Rhein-Neckar-Kreis" },
  { id: "pp-hn-1", label: "Stadt- und Landkreis Heilbronn" },
  { id: "pp-hn-2", label: "Hohenlohekreis" },
  { id: "pp-hn-3", label: "Main-Tauber-Kreis" },
  { id: "pp-hn-4", label: "Neckar-Odenwald-Kreis" },
  { id: "pp-ka-1", label: "Stadt- und Landkreis Karlsruhe" },
  { id: "pp-ka-2", label: "Karlsruhe" },
  { id: "pp-pf-1", label: "Stadtkreis Pforzheim, Enzkreis" },
  { id: "pp-pf-2", label: "Landkreis Calw" },
  { id: "pp-pf-3", label: "Landkreis Freudenstadt" },
  { id: "pp-og-1", label: "Stadtkreis Baden-Baden" },
  { id: "pp-og-2", label: "Landkreis Rastatt" },
  { id: "pp-og-3", label: "Ortenaukreis" },
  { id: "pp-lb-1", label: "Landkreis Ludwigsburg" },
  { id: "pp-lb-2", label: "Landkreis Böblingen" },
  { id: "pp-s-1", label: "Stadtkreis Stuttgart" },
  { id: "pp-aa-1", label: "Ostalbkreis" },
  { id: "pp-aa-2", label: "Landkreis Heidenheim" },
  { id: "pp-aa-3", label: "Landkreis Schwäbisch Hall" },
  { id: "pp-rt-1", label: "Landkreis Esslingen" },
  { id: "pp-rt-2", label: "Landkreis Reutlingen" },
  { id: "pp-rt-3", label: "Landkreis Tübingen" },
  { id: "pp-rt-4", label: "Zollernalbkreis" },
  { id: "pp-ul-1", label: "Stadtkreis Ulm, Alb-Donau-Kreis" },
  { id: "pp-ul-2", label: "Landkreis Göppingen" },
  { id: "pp-ul-3", label: "Landkreis Heidenheim" },
  { id: "pp-ul-4", label: "Stadtkreis Ulm" },
  { id: "pp-ul-5", label: "Landkreis Biberach" },
  { id: "pp-kn-1", label: "Landkreis Konstanz" },
  { id: "pp-kn-2", label: "Landkreis Tuttlingen" },
  { id: "pp-kn-3", label: "Landkreis Rottweil" },
  { id: "pp-kn-4", label: "Schwarzwald-Baar-Kreis" },
  {
    id: "pp-fr-1",
    label: "Stadtkreis Freiburg, Landkreis Breisgau-Hochschwarzwald",
  },
  { id: "pp-fr-2", label: "Landkreis Emmendingen" },
  { id: "pp-fr-3", label: "Landkreis Lörrach" },
  { id: "pp-fr-4", label: "Landkreis Waldshut" },
  { id: "pp-rv-1", label: "Bodenseekreis" },
  { id: "pp-rv-2", label: "Landkreis Ravensburg" },
  { id: "pp-rv-3", label: "Landkreis Sigmaringen" },
];

interface PolizeipraesidienTileProps {
  lka?: boolean;
  bka?: boolean;
  onLkaChange?: (value: boolean) => void;
  onBkaChange?: (value: boolean) => void;
  availableStations?: string[];
  inlineMode?: boolean;
  onSegmentChange?: (segments: Set<string>) => void;
}

export const PolizeipraesidienTile: React.FC<PolizeipraesidienTileProps> = ({
  lka = false,
  bka = false,
  onLkaChange,
  onBkaChange,
  inlineMode = false,
  onSegmentChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedPPs, setExpandedPPs] = useState<Set<string>>(new Set());
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(
    new Set()
  );
  const [allSegments] =
    useState<Array<{ id: string; label: string }>>(segments);

  // Lade gespeicherte Segmente aus localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSegments = localStorage.getItem("fahndung-selected-segments");
      if (savedSegments) {
        try {
          const segments = JSON.parse(savedSegments) as string[];
          setSelectedSegments(new Set(segments));
        } catch (e) {
          console.error("Fehler beim Laden der gespeicherten Segmente:", e);
        }
      }
    }
  }, []);

  // Benachrichtige Parent über Änderungen
  useEffect(() => {
    onSegmentChange?.(selectedSegments);

    // Speichere in localStorage
    if (typeof window !== "undefined") {
      const segmentsStr = JSON.stringify(Array.from(selectedSegments));
      localStorage.setItem("fahndung-selected-segments", segmentsStr);

      // Dispatch Event für andere Komponenten
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("fahndung-filter-change", {
            detail: { key: "fahndung-selected-segments", value: segmentsStr },
          })
        );
      }, 0);
    }
  }, [selectedSegments, onSegmentChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        void clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleSegmentToggle = useCallback((segmentId: string) => {
    setSelectedSegments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId);
      } else {
        newSet.add(segmentId);
      }
      return newSet;
    });
  }, []);

  // Mapping von PP-Codes zu vollständigen PP-Namen
  const ppCodeToFullName: Record<string, string> = {
    ma: "Polizeipräsidium Mannheim",
    hn: "Polizeipräsidium Heilbronn",
    ka: "Polizeipräsidium Karlsruhe",
    pf: "Polizeipräsidium Pforzheim",
    og: "Polizeipräsidium Offenburg",
    lb: "Polizeipräsidium Ludwigsburg",
    s: "Polizeipräsidium Stuttgart",
    aa: "Polizeipräsidium Aalen",
    rt: "Polizeipräsidium Reutlingen",
    ul: "Polizeipräsidium Ulm",
    kn: "Polizeipräsidium Konstanz",
    fr: "Polizeipräsidium Freiburg",
    rv: "Polizeipräsidium Ravensburg",
  };

  // Gruppiere Segmente nach PP
  const groupedByPP = allSegments.reduce(
    (acc, segment) => {
      const parts = segment.id.split("-");
      const ppId = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : segment.id;
      const segmentArray = (acc[ppId] ??= []);
      segmentArray.push(segment);
      return acc;
    },
    {} as Record<string, Array<{ id: string; label: string }>>
  );

  // Filtere PP basierend auf Suchbegriff
  const filteredPPs = Object.entries(groupedByPP).filter(([ppId, segments]) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const ppCode = ppId.replace(/^pp-/, "").split("-")[0] ?? "";
    const fullName =
      ppCodeToFullName[ppCode] ?? ppId.replace(/^pp-/, "PP ").toUpperCase();
    return (
      fullName.toLowerCase().includes(term) ||
      segments.some(
        (s) =>
          s.label.toLowerCase().includes(term) ||
          s.id.toLowerCase().includes(term)
      )
    );
  });

  const isPPFullySelected = (
    segments: Array<{ id: string; label: string }>
  ) => {
    return segments.every((s) => selectedSegments.has(s.id));
  };

  const handlePPToggle = (segments: Array<{ id: string; label: string }>) => {
    const allSelected = isPPFullySelected(segments);
    if (allSelected) {
      segments.forEach((s) => {
        if (selectedSegments.has(s.id)) {
          handleSegmentToggle(s.id);
        }
      });
    } else {
      segments.forEach((s) => {
        if (!selectedSegments.has(s.id)) {
          handleSegmentToggle(s.id);
        }
      });
    }
  };

  const handlePPAccordionToggle = (ppId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPPs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ppId)) {
        newSet.delete(ppId);
      } else {
        newSet.add(ppId);
      }
      return newSet;
    });
  };

  // Render Liste
  const renderListContent = () => (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-shrink-0 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Dienststellen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredPPs.length > 0 ? (
          <div className="space-y-2">
            {filteredPPs.map(([ppId, segments]) => {
              const ppCode = ppId.replace(/^pp-/, "").split("-")[0] ?? "";
              const fullName =
                ppCodeToFullName[ppCode] ??
                ppId.replace(/^pp-/, "PP ").toUpperCase();
              const allSelected = isPPFullySelected(segments);
              const someSelected = segments.some((s) =>
                selectedSegments.has(s.id)
              );
              const filteredSegs = searchTerm.trim()
                ? segments.filter((s) => {
                    const term = searchTerm.toLowerCase();
                    return (
                      s.label.toLowerCase().includes(term) ||
                      s.id.toLowerCase().includes(term)
                    );
                  })
                : segments;
              const isExpanded = expandedPPs.has(ppId);

              return (
                <div
                  key={ppId}
                  className="border-b border-slate-200 dark:border-slate-700 pb-0.5 last:border-b-0"
                >
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePPToggle(segments)}
                      className={`flex-1 px-2 py-2.5 rounded transition-colors text-sm font-semibold text-left flex items-center justify-between cursor-pointer min-h-[44px] ${
                        allSelected
                          ? "bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                          : someSelected
                            ? "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 hover:bg-blue-300 dark:hover:bg-blue-700"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                      type="button"
                    >
                      <span className="truncate">{fullName}</span>
                      <div className="flex items-center gap-1">
                        {allSelected && (
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {someSelected && !allSelected && (
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            opacity="0.7"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
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
                            type="button"
                          >
                            <span className="truncate">{segment.label}</span>
                            {isSelected && (
                              <svg
                                className="w-3 h-3 ml-1 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
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
            <div className="text-sm text-muted-foreground">
              Keine Dienststellen gefunden
            </div>
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
              onChange={(e) => onLkaChange?.(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-foreground">LKA</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={bka}
              onChange={(e) => onBkaChange?.(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-foreground">BKA</span>
          </label>
        </div>
      </div>
    </div>
  );

  if (inlineMode) {
    return (
      <div
        className="relative w-full flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-800"
        style={{ minHeight: "45vh" }}
      >
        {renderListContent()}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-visible"
      ref={dropdownRef}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-md border border-border bg-background px-3 text-left font-medium text-foreground transition-all duration-200 hover:bg-accent focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer h-9 ${
          selectedSegments.size > 0
            ? "border-primary bg-primary/10 text-foreground font-semibold"
            : "text-foreground"
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium whitespace-nowrap truncate text-foreground">
            Dienststellen
            {selectedSegments.size > 0 ? ` (${selectedSegments.size})` : ""}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="hidden md:block absolute z-[60] mt-1 right-0 rounded-lg border border-border bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
          <div className="flex flex-row">
            {/* Rechte Seite: Liste mit Suche */}
            <div
              className="flex-shrink-0 bg-white dark:bg-slate-800 flex flex-col"
              style={{
                width: "420px",
                height: "372px",
              }}
            >
              <div className="p-2 border-b border-border flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
                  <input
                    type="text"
                    placeholder="Dienststellen suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm font-medium text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Liste - Segmente */}
              <div className="flex-1 overflow-y-auto p-1.5 min-h-0">
                {renderListContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
