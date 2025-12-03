"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Users, MapPin, Search, Clock, X, RotateCcw } from "lucide-react";
import type { CompactFilterState } from "@/components/fahndungen/compact-filter/types";
import { FAHNDUNGSTYPEN, TIME_RANGE_OPTIONS } from "@/components/fahndungen/compact-filter/constants";
import { PolizeipraesidienTile } from "@/components/fahndungen/compact-filter/PolizeipraesidienTile";
import FilterChips from "@/components/filtersystem/FilterChips";
import { type ModernFilterState } from "@/components/filtersystem/ModernFahndungFilter";

interface MobileFilterTabsProps {
  onFilterChange: (filters: CompactFilterState) => void;
  defaultValues?: Partial<CompactFilterState>;
  availableLocations?: string[];
  availableStations?: string[];
  onClose?: () => void;
  resultCount?: number; // Echte Anzahl gefilterter Fahndungen
}

type TabType = "search" | "date" | "type" | "pp" | null;

export function MobileFilterTabs({
  onFilterChange,
  defaultValues = {},
  availableStations = [],
  onClose,
  resultCount,
}: MobileFilterTabsProps) {
  const [filters, setFilters] = useState<CompactFilterState>({
    searchTerm: defaultValues.searchTerm ?? "",
    stations: defaultValues.stations ?? [],
    types: defaultValues.types ?? [],
    timeRange: defaultValues.timeRange ?? "all",
    dateFrom: defaultValues.dateFrom,
    dateTo: defaultValues.dateTo,
    neu: defaultValues.neu ?? false,
    sortBy: defaultValues.sortBy ?? "date",
    sortOrder: defaultValues.sortOrder ?? "desc",
    region: defaultValues.region ?? [],
    lka: defaultValues.lka ?? false,
    bka: defaultValues.bka ?? false,
  });

  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [ppSegments, setPPSegments] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fahndung-selected-segments");
        return saved ? (JSON.parse(saved) as string[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // State für Ergebnisanzahl
  const [currentResultCount, setCurrentResultCount] = React.useState<number | undefined>(resultCount);

  // Lade PP-Segmente aus localStorage beim Mount
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; value: string }>;
      if (customEvent.detail?.key === "fahndung-selected-segments") {
        try {
          const segments = JSON.parse(customEvent.detail.value ?? "[]") as string[];
          setPPSegments(segments);
        } catch {
          // ignore
        }
      }
    };

    // Höre auf Ergebnisanzahl-Updates
    const handleResultCountUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      if (customEvent.detail?.count !== undefined) {
        setCurrentResultCount(customEvent.detail.count);
      }
    };

    window.addEventListener("fahndung-filter-change", handleStorageChange);
    window.addEventListener("fahndung-result-count-update", handleResultCountUpdate);
    return () => {
      window.removeEventListener("fahndung-filter-change", handleStorageChange);
      window.removeEventListener("fahndung-result-count-update", handleResultCountUpdate);
    };
  }, []);

  // Aktualisiere Ergebnisanzahl wenn Prop sich ändert
  React.useEffect(() => {
    if (resultCount !== undefined) {
      setCurrentResultCount(resultCount);
    }
  }, [resultCount]);

  // Aktualisiere Filter wenn defaultValues sich ändern (z.B. beim erneuten Öffnen des Panels)
  // Verwende useRef um Endlosschleifen zu vermeiden
  const prevDefaultValuesRef = React.useRef<Partial<CompactFilterState>>(defaultValues);

  React.useEffect(() => {
    // Vergleiche Werte und aktualisiere nur wenn sich etwas geändert hat
    const hasChanged = 
      defaultValues.searchTerm !== prevDefaultValuesRef.current.searchTerm ||
      defaultValues.timeRange !== prevDefaultValuesRef.current.timeRange ||
      defaultValues.dateFrom !== prevDefaultValuesRef.current.dateFrom ||
      defaultValues.dateTo !== prevDefaultValuesRef.current.dateTo ||
      defaultValues.neu !== prevDefaultValuesRef.current.neu ||
      defaultValues.lka !== prevDefaultValuesRef.current.lka ||
      defaultValues.bka !== prevDefaultValuesRef.current.bka ||
      JSON.stringify(defaultValues.stations) !== JSON.stringify(prevDefaultValuesRef.current.stations) ||
      JSON.stringify(defaultValues.types) !== JSON.stringify(prevDefaultValuesRef.current.types);

    if (hasChanged) {
      prevDefaultValuesRef.current = defaultValues;
      setFilters((prev) => ({
        ...prev,
        searchTerm: defaultValues.searchTerm ?? prev.searchTerm,
        stations: defaultValues.stations ?? prev.stations,
        types: defaultValues.types ?? prev.types,
        timeRange: defaultValues.timeRange ?? prev.timeRange,
        dateFrom: defaultValues.dateFrom ?? prev.dateFrom,
        dateTo: defaultValues.dateTo ?? prev.dateTo,
        neu: defaultValues.neu ?? prev.neu,
        lka: defaultValues.lka ?? prev.lka,
        bka: defaultValues.bka ?? prev.bka,
      }));
    }
  }, [defaultValues]);

  // Filter-Updates
  const updateFilter = useCallback((key: keyof CompactFilterState, value: unknown) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value as CompactFilterState[keyof CompactFilterState],
      };
      return newFilters;
    });
  }, []);

  // Überwache Filter-Änderungen
  React.useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Multi-Select Toggle
  const toggleArrayFilter = useCallback((
    filterType: keyof Pick<CompactFilterState, "stations" | "types">,
    value: string,
  ) => {
    setFilters((prev) => {
      const currentArray = prev[filterType];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [filterType]: newArray,
      };
    });
  }, []);

  // Zeit-Filter entfernen
  const removeTimeFilter = useCallback(() => {
    updateFilter("timeRange", "all");
    updateFilter("dateFrom", undefined);
    updateFilter("dateTo", undefined);
  }, [updateFilter]);

  // Suchbegriff entfernen
  const removeSearchTerm = useCallback(() => {
    updateFilter("searchTerm", "");
  }, [updateFilter]);

  // PP-Segment entfernen
  const removePPSegment = useCallback((segmentId: string) => {
    const newSegments = ppSegments.filter((id) => id !== segmentId);
    setPPSegments(newSegments);
    if (typeof window !== "undefined") {
      localStorage.setItem("fahndung-selected-segments", JSON.stringify(newSegments));
      window.dispatchEvent(
        new CustomEvent("fahndung-filter-change", {
          detail: { key: "fahndung-selected-segments", value: JSON.stringify(newSegments) },
        })
      );
    }
  }, [ppSegments]);

  // Alle Filter zurücksetzen
  const resetAllFilters = useCallback(() => {
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
    setFilters(resetState);
    onFilterChange(resetState);
    
    // PP-Segmente zurücksetzen
    if (typeof window !== "undefined") {
      setPPSegments([]);
      localStorage.setItem("fahndung-selected-segments", JSON.stringify([]));
      window.dispatchEvent(
        new CustomEvent("fahndung-filter-change", {
          detail: { key: "fahndung-selected-segments", value: JSON.stringify([]) },
        })
      );
    }
  }, [onFilterChange]);

  // Konvertiere zu ModernFilterState für FilterChips
  const modernFilterState: ModernFilterState = useMemo(
    () => ({
      stations: filters.stations,
      locations: [],
      types: filters.types,
      neu: filters.neu,
      timeRange: filters.timeRange,
      searchTerm: filters.searchTerm,
      lka: filters.lka,
      bka: filters.bka,
    }),
    [filters]
  );

  // Aktive Filter zählen
  const activeFilterCount =
    filters.types.length +
    (filters.neu ? 1 : 0) +
    (filters.timeRange !== "all" ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0) +
    (filters.searchTerm ? 1 : 0) +
    (filters.lka ? 1 : 0) +
    (filters.bka ? 1 : 0) +
    ppSegments.length;

  const tabs = [
    {
      id: "search" as TabType,
      label: "Suche",
      icon: Search,
      hasActiveFilter: filters.searchTerm.length > 0,
    },
    {
      id: "date" as TabType,
      label: "Letzte",
      icon: Clock,
      hasActiveFilter: filters.timeRange !== "all" || filters.dateFrom !== undefined || filters.dateTo !== undefined,
    },
    {
      id: "type" as TabType,
      label: "Fahndungsart",
      icon: Users,
      hasActiveFilter: filters.types.length > 0,
    },
    {
      id: "pp" as TabType,
      label: "Dienststellen",
      icon: MapPin,
      hasActiveFilter: filters.lka || filters.bka || ppSegments.length > 0,
    },
  ];

  const toggleTab = (tabId: TabType) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  return (
    <div className="flex flex-col h-full" style={{ 
      minHeight: activeTab ? (activeTab === "pp" ? '60vh' : '40vh') : 'auto',
      touchAction: 'pan-y', 
      pointerEvents: 'auto' 
    }}>
      {/* Filter-Chips Bereich - oben mit Buttons */}
      {(activeFilterCount > 0 || onClose) && (
        <div className="border-b bg-background/50 p-3 space-y-3">
          {/* Filter-Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              <FilterChips
                filters={modernFilterState}
                onRemoveFilter={(filterType, value) => {
                  if (filterType === "types") {
                    toggleArrayFilter("types", value);
                  }
                }}
                onRemoveTimeFilter={removeTimeFilter}
                onRemoveSearchTerm={removeSearchTerm}
                onRemoveNeuFilter={() => updateFilter("neu", false)}
                onRemovePPSegment={removePPSegment}
                onRemoveLkaFilter={() => updateFilter("lka", false)}
                onRemoveBkaFilter={() => updateFilter("bka", false)}
                ppSegments={ppSegments}
              />
            </div>
          )}
          {/* Buttons - horizontal, kompakt */}
          {(activeFilterCount > 0 || onClose) && (
            <div className="flex gap-2">
              {/* Alles zurücksetzen Button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="flex items-center justify-center gap-1.5 flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-2 border-border"
                  aria-label="Alle Filter zurücksetzen"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Zurücksetzen</span>
                </button>
              )}
              {/* Schließen-Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-2 border-border"
                  aria-label="Filter schließen"
                >
                  <X className="h-4 w-4" />
                  <span>Schließen</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ergebnis-Anzeige - kompakt, horizontal - IMMER wenn Ergebnisse da sind */}
      {currentResultCount !== undefined && currentResultCount >= 0 && (
        <div className="bg-primary/10 text-primary text-center py-2.5 px-4 border-b border-border/30">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-2xl font-bold">{currentResultCount}</span>
            <span className="text-sm font-semibold">
              Fahndung{currentResultCount !== 1 ? 'en' : ''} {activeFilterCount > 0 ? 'gefunden' : 'verfügbar'}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b bg-background">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => toggleTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.hasActiveFilter && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dropdown Content */}
      {activeTab && (
        <div className="flex-1 overflow-hidden bg-background flex flex-col min-h-0" style={{ 
          minHeight: activeTab === "pp" ? '50vh' : '30vh',
          maxHeight: activeTab === "pp" ? '70vh' : '50vh',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch'
        }}>
          {activeTab === "pp" ? (
            <div className="h-full flex flex-col min-h-0 flex-1" style={{ touchAction: 'pan-y' }}>
              <PolizeipraesidienTile
                lka={filters.lka}
                bka={filters.bka}
                onLkaChange={(value) => updateFilter("lka", value)}
                onBkaChange={(value) => updateFilter("bka", value)}
                availableStations={availableStations}
                inlineMode={true}
              />
            </div>
          ) : (
            <div className="p-4 space-y-4 overflow-y-auto" style={{ 
              touchAction: 'pan-y', 
              WebkitOverflowScrolling: 'touch' 
            }}>
            {/* Suche Tab */}
            {activeTab === "search" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="mobile-search-input" className="mb-2 block text-sm font-medium">Suchbegriff</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="mobile-search-input"
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => updateFilter("searchTerm", e.target.value)}
                      placeholder="Fahndungen durchsuchen..."
                      className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                      style={{
                        fontSize: '16px', // Verhindert Zoom auf iOS
                        WebkitAppearance: 'none',
                        WebkitUserSelect: 'text'
                      }}
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-accent/50">
                  <input
                    type="checkbox"
                    checked={filters.neu}
                    onChange={(e) => updateFilter("neu", e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span>Nur neue Fahndungen</span>
                </label>
              </div>
            )}

            {/* Datum Tab */}
            {activeTab === "date" && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 block text-sm font-medium">Zeitraum</div>
                  <div className="space-y-2">
                    {TIME_RANGE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                          filters.timeRange === option.value
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeRange"
                          value={option.value}
                          checked={filters.timeRange === option.value}
                          onChange={() => updateFilter("timeRange", option.value)}
                          className="h-4 w-4"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="mobile-date-from" className="mb-1 block text-xs text-muted-foreground">Von</label>
                    <input
                      id="mobile-date-from"
                      type="date"
                      value={filters.dateFrom ?? ""}
                      onChange={(e) => updateFilter("dateFrom", e.target.value || undefined)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobile-date-to" className="mb-1 block text-xs text-muted-foreground">Bis</label>
                    <input
                      id="mobile-date-to"
                      type="date"
                      value={filters.dateTo ?? ""}
                      onChange={(e) => updateFilter("dateTo", e.target.value || undefined)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fahndungsart Tab */}
            {activeTab === "type" && (
              <div className="space-y-2">
                {FAHNDUNGSTYPEN.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors ${
                        filters.types.includes(type.value) ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type.value)}
                        onChange={() => toggleArrayFilter("types", type.value)}
                        className="h-4 w-4 rounded"
                      />
                      <TypeIcon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          )}
        </div>
      )}

    </div>
  );
}

