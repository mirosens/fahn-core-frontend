import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import FilterChips from "@/components/filtersystem/FilterChips";
import { type ModernFilterState } from "@/components/filtersystem/ModernFahndungFilter";
import type { CompactFilterState, CompactFilterProps } from "./types";
import { FAHNDUNGSTYPEN, TIME_RANGE_OPTIONS, REGIONEN } from "./constants";
import { DateRangeDropdown } from "./DateRangeDropdown";
import { PolizeipraesidienTile } from "./PolizeipraesidienTile";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

// Hauptkomponente
export const CompactFilter: React.FC<CompactFilterProps> = ({
  onFilterChange,
  className = "",
  showRegionFilter = true,
  defaultValues = {},
  availableLocations: _availableLocations = [],
  availableStations = [],
  viewMode: _viewMode = "grid-3",
  onViewChange: _onViewChange,
  onClose: _onClose,
  isInline = false,
}) => {
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

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [ppSegments, setPPSegments] = useState<string[]>([]);

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

  // Callback für Filter-Änderungen
  const handleFilterChange = useCallback(
    (newFilters: CompactFilterState) => {
      void onFilterChange(newFilters);
    },
    [onFilterChange],
  );

  // Aktualisiere Filter wenn defaultValues sich ändern (z.B. beim erneuten Öffnen des Panels)
  // Verwende useRef um Endlosschleifen zu vermeiden
  const prevDefaultValuesRef = useRef<Partial<CompactFilterState>>(defaultValues);
  const isTypingRef = useRef(false);

  useEffect(() => {
    // Überspringe Update wenn Benutzer gerade tippt
    if (isTypingRef.current) {
      return;
    }

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

  // Überwache Filter-Änderungen und benachrichtige Parent
  useEffect(() => {
    void handleFilterChange(filters);
  }, [filters, handleFilterChange]);

  // Multi-Select Toggle für Arrays
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

  // Filter entfernen (für FilterChips) - Wrapper für ModernFilterState Kompatibilität
  const removeFilter = useCallback((filterType: keyof ModernFilterState, value: string) => {
    setFilters((prev) => {
      const compactKey = filterType as keyof CompactFilterState;
      const currentValue = prev[compactKey];
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [compactKey]: (currentValue).filter((v: string) => v !== value),
        };
      }
      return prev;
    });
  }, []);

  // Zeit-Filter entfernen
  const removeTimeFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, timeRange: "all" }));
  }, []);

  // Suchbegriff entfernen
  const removeSearchTerm = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchTerm: "" }));
  }, []);

  // Lade PP-Segmente aus localStorage
  useEffect(() => {
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

    // Höre auf Änderungen in localStorage
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

    // Höre auf Custom Events (wenn localStorage im gleichen Tab geändert wird)
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

  // Aktive Filter zählen
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    // stations wird nicht mehr verwendet - PP-Segmente ersetzen Dienststellen
    if (filters.types.length > 0) count += filters.types.length;
    if (filters.timeRange !== "all") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.neu) count++;
    if (filters.region.length > 0) count += filters.region.length;
    if (ppSegments.length > 0) count += ppSegments.length;
    if (filters.lka) count++;
    if (filters.bka) count++;
    return count;
  }, [filters, ppSegments]);

  // PP-Segment entfernen
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

  // Reset
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
    void setFilters(resetState);
    void handleFilterChange(resetState);
    
    // PP-Segmente zurücksetzen
    if (typeof window !== 'undefined') {
      setPPSegments([]);
      localStorage.setItem('fahndung-selected-segments', JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('fahndung-filter-change', { 
        detail: { key: 'fahndung-selected-segments', value: JSON.stringify([]) } 
      }));
    }
  }, [handleFilterChange]);

  // Konvertiere CompactFilterState zu ModernFilterState für FilterChips
  const modernFilterState: ModernFilterState = useMemo(() => ({
    stations: filters.stations,
    locations: [],
    types: filters.types,
    neu: filters.neu,
    timeRange: filters.timeRange,
    searchTerm: filters.searchTerm,
    lka: filters.lka,
    bka: filters.bka,
  }), [filters]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && activeFilterCount > 0) {
        void resetFilters();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [activeFilterCount, resetFilters]);

  return (
    <div className={`compact-filter ${className}`}>
      {/* Desktop Layout - Kompaktes 3-Spalten-Layout */}
      <div className="hidden md:block">
        <div className={`w-full ${isInline ? 'p-0' : 'rounded-lg p-2.5 mx-auto px-4 sm:px-6 lg:px-8'}`} style={isInline ? {} : { maxWidth: '1273px' }}>
          {/* Kompakte Filter-Zeile mit 3 gleich breiten Spalten */}
          <div className="flex items-center justify-center gap-4 h-9 px-8 overflow-visible">
            {/* Fahndungssuche - Suchfeld mit Zeit/Datum-Icon */}
            <div className="relative flex-1 min-w-0">
              <label htmlFor="compact-filter-search" className="sr-only">
                Fahndungssuche
              </label>
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/70" />
              <input
                id="compact-filter-search"
                ref={searchRef}
                type="text"
                value={filters.searchTerm}
                onChange={(e) => {
                  isTypingRef.current = true;
                  updateFilter("searchTerm", e.target.value);
                  // Reset nach kurzer Verzögerung
                  setTimeout(() => {
                    isTypingRef.current = false;
                  }, 500);
                }}
                onBlur={() => {
                  isTypingRef.current = false;
                }}
                placeholder="Fahndungssuche..."
                className="h-9 pl-8 pr-10 text-sm w-full rounded-md border border-border bg-background text-foreground placeholder:text-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden"
              />
              {/* Zeit/Datum-Icon im Suchfeld rechts */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <DateRangeDropdown
                  title="Datum/Zeitraum"
                  timeRange={filters.timeRange}
                  dateFrom={filters.dateFrom}
                  dateTo={filters.dateTo}
                  onTimeRangeChange={(value) => updateFilter("timeRange", value)}
                  onDateFromChange={(value) => updateFilter("dateFrom", value)}
                  onDateToChange={(value) => updateFilter("dateTo", value)}
                  icon={Calendar}
                  isIconOnly={true}
                  iconSize="h-4 w-4"
                />
              </div>
              {filters.searchTerm && (
                <button
                  onClick={() => updateFilter("searchTerm", "")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Fahndungsart - Dropdown */}
            <div className="flex-1 min-w-0 overflow-visible">
              <MultiSelectDropdown
                title="Fahndungsart"
                options={FAHNDUNGSTYPEN}
                selectedValues={filters.types}
                onToggle={(value) => toggleArrayFilter("types", value)}
                placeholder="Fahndungsart"
              />
            </div>

            {/* Dienststellen - ersetzt PP-Karte */}
            <div className="flex-1 min-w-0 overflow-visible">
              <PolizeipraesidienTile 
                lka={filters.lka}
                bka={filters.bka}
                onLkaChange={(value) => updateFilter("lka", value)}
                onBkaChange={(value) => updateFilter("bka", value)}
                availableStations={availableStations}
              />
            </div>
          </div>

          {/* Ausgewählte Filter Anzeige mit "Alle zurücksetzen" - nicht im Inline-Modus */}
          {activeFilterCount > 0 && !isInline && (
            <div className="mt-3 flex flex-col gap-3">
              {/* FilterChips - Anzeige aktiver Filter */}
              <div className="flex flex-wrap gap-2">
                <FilterChips
                  filters={modernFilterState}
                  onRemoveFilter={(filterType, value) => {
                    // stations wird nicht mehr verwendet - PP-Segmente ersetzen Dienststellen
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
              
              {/* Zurücksetzen Button - nur wenn inline */}
              {isInline && (
                <div className="flex gap-2">
                  <button
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-1.5 flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border-2 border-border"
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
              )}
              
              {/* Alle zurücksetzen Button - rechts (nur wenn nicht inline) */}
              {!isInline && (
                <button
                  onClick={resetFilters}
                  className="flex-shrink-0 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-accent hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  type="button"
                >
                  Alle zurücksetzen
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 rounded-lg bg-card p-3">
          {/* Mobile Suchfeld */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              placeholder="Suchen..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className={`flex items-center justify-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground ${
              activeFilterCount > 0 ? "ring-2 ring-ring" : ""
            }`}
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileFilterOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsMobileFilterOpen(false);
                }
              }}
              role="button"
              tabIndex={0}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-popover">
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filter</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="rounded-lg p-2 hover:bg-accent"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Mobile Filter Controls */}
                  {/* Dienststellen - ersetzt PP-Karte */}
                  <div>
                    <label htmlFor="pp-karte-group" className="mb-2 block text-sm font-medium">Dienststellen</label>
                    <div id="pp-karte-group" className="max-h-40 space-y-2 overflow-y-auto">
                      <PolizeipraesidienTile 
                        lka={filters.lka}
                        bka={filters.bka}
                        onLkaChange={(value) => updateFilter("lka", value)}
                        onBkaChange={(value) => updateFilter("bka", value)}
                        availableStations={availableStations}
                      />
                    </div>
                  </div>

                  {/* Fahndungsarten - Multi-Select */}
                  <div>
                    <label htmlFor="types-group" className="mb-2 block text-sm font-medium">Fahndungsart</label>
                    <div id="types-group" className="space-y-2">
                      {FAHNDUNGSTYPEN.map((type) => (
                        <label
                          key={type.value}
                          htmlFor={`type-${type.value}`}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 ${
                            filters.types.includes(type.value) ? "bg-accent" : ""
                          }`}
                        >
                          <input
                            id={`type-${type.value}`}
                            type="checkbox"
                            checked={filters.types.includes(type.value)}
                            onChange={() => toggleArrayFilter("types", type.value)}
                            className="h-4 w-4 rounded"
                          />
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Datum-Filter */}
                  <div>
                    <label htmlFor="date-filter-group" className="mb-2 block text-sm font-medium">Datum</label>
                    <div id="date-filter-group" className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="date-from" className="mb-1 block text-xs text-muted-foreground">Von</label>
                        <input
                          id="date-from"
                          type="date"
                          value={filters.dateFrom ?? ""}
                          onChange={(e) => updateFilter("dateFrom", e.target.value || undefined)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label htmlFor="date-to" className="mb-1 block text-xs text-muted-foreground">Bis</label>
                        <input
                          id="date-to"
                          type="date"
                          value={filters.dateTo ?? ""}
                          onChange={(e) => updateFilter("dateTo", e.target.value || undefined)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Zeitraum-Filter */}
                  <div>
                    <label htmlFor="timerange-group" className="mb-2 block text-sm font-medium">Zeitraum</label>
                    <div id="timerange-group" className="space-y-2">
                      {TIME_RANGE_OPTIONS.map((option) => (
                        <label key={option.value} htmlFor={`timerange-${option.value}`} className="flex items-center gap-2">
                          <input
                            id={`timerange-${option.value}`}
                            type="radio"
                            name="timeRange"
                            value={option.value}
                            checked={filters.timeRange === option.value}
                            onChange={() => updateFilter("timeRange", option.value as CompactFilterState["timeRange"])}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {showRegionFilter && (
                    <div>
                      <label htmlFor="region-group" className="mb-2 block text-sm font-medium">Regionen</label>
                      <div id="region-group" className="max-h-40 space-y-2 overflow-y-auto">
                        {REGIONEN.map((region) => (
                          <label key={region} htmlFor={`region-${region}`} className="flex items-center gap-3 p-2">
                            <input
                              id={`region-${region}`}
                              type="checkbox"
                              checked={filters.region.includes(region)}
                              onChange={() => {
                                if (filters.region.includes(region)) {
                                  updateFilter(
                                    "region",
                                    filters.region.filter((r) => r !== region),
                                  );
                                } else {
                                  updateFilter("region", [...filters.region, region]);
                                }
                              }}
                              className="h-4 w-4 rounded"
                            />
                            <span className="text-sm">{region}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FilterChips - Anzeige aktiver Filter */}
                  <FilterChips
                    filters={modernFilterState}
                    onRemoveFilter={removeFilter}
                    onRemoveTimeFilter={removeTimeFilter}
                    onRemoveSearchTerm={removeSearchTerm}
                    onRemoveNeuFilter={() => updateFilter("neu", false)}
                    onRemovePPSegment={removePPSegment}
                    onRemoveLkaFilter={() => updateFilter("lka", false)}
                    onRemoveBkaFilter={() => updateFilter("bka", false)}
                    ppSegments={ppSegments}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={resetFilters}
                    className="flex-1 rounded-lg bg-muted py-3 font-medium text-muted-foreground hover:text-foreground"
                  >
                    Zurücksetzen
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 rounded-lg bg-primary py-3 font-medium text-primary-foreground"
                  >
                    Anwenden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

