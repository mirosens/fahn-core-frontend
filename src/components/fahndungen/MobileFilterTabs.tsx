"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Users, MapPin, Search, Clock, X, RotateCcw } from "lucide-react";
import { useStableSearchParams } from "@/hooks/useStableSearchParams";
import { useDebouncedUrlUpdate } from "@/hooks/useDebouncedUrlUpdate";
import { PolizeipraesidienTile } from "./PolizeipraesidienTile";

interface MobileFilterTabsProps {
  onClose?: () => void;
  className?: string;
}

// Zeit-Filter Optionen wie in der Referenz
const TIME_RANGE_OPTIONS = [
  { value: "all", label: "Alle Zeiträume" },
  { value: "24h", label: "Letzte 24h" },
  { value: "7d", label: "Letzte 7 Tage" },
  { value: "30d", label: "Letzte 30 Tage" },
];

// Fahndungsarten wie in der Referenz
const FAHNDUNGSTYPEN = [
  { value: "straftaeter", label: "Straftäter", icon: Users },
  { value: "vermisste", label: "Vermisste", icon: Users },
  { value: "unbekannte_tote", label: "Unbekannte Tote", icon: Users },
  { value: "sachen", label: "Sachen", icon: Users },
];

// Dienststellen vereinfacht
const DIENSTSTELLEN = [
  { value: "aalen", label: "PP Aalen" },
  { value: "freiburg", label: "PP Freiburg" },
  { value: "heilbronn", label: "PP Heilbronn" },
  { value: "karlsruhe", label: "PP Karlsruhe" },
  { value: "konstanz", label: "PP Konstanz" },
  { value: "ludwigsburg", label: "PP Ludwigsburg" },
  { value: "mannheim", label: "PP Mannheim" },
  { value: "offenburg", label: "PP Offenburg" },
  { value: "pforzheim", label: "PP Pforzheim" },
  { value: "ravensburg", label: "PP Ravensburg" },
  { value: "reutlingen", label: "PP Reutlingen" },
  { value: "stuttgart", label: "PP Stuttgart" },
  { value: "ulm", label: "PP Ulm" },
];

type TabType = "search" | "date" | "type" | "pp" | null;

// Filter-Chip Komponente
const FilterChip = ({
  label,
  onRemove,
  color = "blue",
}: {
  label: string;
  onRemove: () => void;
  color?: string;
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors
      ${
        color === "red"
          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          : color === "blue"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            : color === "green"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : color === "gray"
                ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                : color === "orange"
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      }`}
  >
    {label}
    <button
      onClick={onRemove}
      className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
      aria-label={`${label} entfernen`}
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

export function MobileFilterTabs({
  onClose,
  className,
}: MobileFilterTabsProps) {
  // Verwende stabilisierte searchParams
  const {
    searchTerm: urlSearch,
    fahndungsart: urlFahndungsart,
    dienststelle: urlDienststelle,
  } = useStableSearchParams();

  // Verwende debounced URL-Update
  const { updateUrl } = useDebouncedUrlUpdate();

  // Lokaler State (nur für UI-Zustand, nicht für URL-synchronisierte Werte)
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [timeRange, setTimeRange] = useState<"all" | "24h" | "7d" | "30d">(
    "all"
  );
  const [neu, setNeu] = useState(false);

  // Werte direkt aus URL-Parametern ableiten
  const searchTerm = urlSearch;
  const fahndungsarten = useMemo(
    () =>
      urlFahndungsart && urlFahndungsart !== "alle" ? [urlFahndungsart] : [],
    [urlFahndungsart]
  );
  const dienststellen = useMemo(
    () =>
      urlDienststelle && urlDienststelle !== "alle" ? [urlDienststelle] : [],
    [urlDienststelle]
  );

  // Aktive Filter zählen
  const activeFilterCount = useMemo(() => {
    return (
      (searchTerm ? 1 : 0) +
      fahndungsarten.length +
      dienststellen.length +
      (timeRange !== "all" ? 1 : 0) +
      (neu ? 1 : 0)
    );
  }, [searchTerm, fahndungsarten, dienststellen, timeRange, neu]);

  // Tabs-Konfiguration
  const tabs = useMemo(
    () => [
      {
        id: "search" as TabType,
        label: "Suche",
        icon: Search,
        hasActiveFilter: searchTerm.length > 0 || neu,
      },
      {
        id: "date" as TabType,
        label: "Letzte",
        icon: Clock,
        hasActiveFilter: timeRange !== "all",
      },
      {
        id: "type" as TabType,
        label: "Fahndungsart",
        icon: Users,
        hasActiveFilter: fahndungsarten.length > 0,
      },
      {
        id: "pp" as TabType,
        label: "Dienststellen",
        icon: MapPin,
        hasActiveFilter: dienststellen.length > 0,
      },
    ],
    [searchTerm, neu, timeRange, fahndungsarten, dienststellen]
  );

  // Tab togglen
  const toggleTab = (tabId: TabType) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  // Filter-Updates
  const handleSearchTermChange = useCallback(
    (value: string) => {
      updateUrl({
        searchTerm: value,
        fahndungsart: fahndungsarten[0] || "alle",
        dienststelle: dienststellen[0] || "alle",
      });
    },
    [updateUrl, fahndungsarten, dienststellen]
  );

  const toggleFahndungsart = useCallback(
    (value: string) => {
      const newFahndungsarten = fahndungsarten.includes(value)
        ? fahndungsarten.filter((f) => f !== value)
        : [...fahndungsarten, value];

      updateUrl({
        searchTerm,
        fahndungsart: newFahndungsarten[0] || "alle",
        dienststelle: dienststellen[0] || "alle",
      });
    },
    [updateUrl, searchTerm, fahndungsarten, dienststellen]
  );

  const toggleDienststelle = useCallback(
    (value: string) => {
      const newDienststellen = dienststellen.includes(value)
        ? dienststellen.filter((d) => d !== value)
        : [...dienststellen, value];

      updateUrl({
        searchTerm,
        fahndungsart: fahndungsarten[0] || "alle",
        dienststelle: newDienststellen[0] || "alle",
      });
    },
    [updateUrl, searchTerm, fahndungsarten, dienststellen]
  );

  const handleTimeRangeChange = useCallback((value: typeof timeRange) => {
    setTimeRange(value);
    // Zeit-Filter wird nicht in URL gespeichert, nur lokal
  }, []);

  // Alle Filter zurücksetzen
  const resetAllFilters = useCallback(() => {
    setTimeRange("all");
    setNeu(false);
    updateUrl({
      searchTerm: "",
      fahndungsart: "alle",
      dienststelle: "alle",
    });
  }, [updateUrl]);

  return (
    <div
      className={`flex flex-col h-full ${className}`}
      style={{
        minHeight: activeTab ? (activeTab === "pp" ? "60vh" : "40vh") : "auto",
        touchAction: "pan-y",
        pointerEvents: "auto",
      }}
    >
      {/* Filter-Chips Bereich */}
      {(activeFilterCount > 0 || onClose) && (
        <div className="border-b bg-background/50 p-3 space-y-3">
          {/* Filter-Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <FilterChip
                  label={`Suche: "${searchTerm}"`}
                  onRemove={() => handleSearchTermChange("")}
                  color="blue"
                />
              )}
              {fahndungsarten.map((typ) => (
                <FilterChip
                  key={typ}
                  label={
                    FAHNDUNGSTYPEN.find((t) => t.value === typ)?.label || typ
                  }
                  onRemove={() => toggleFahndungsart(typ)}
                  color="green"
                />
              ))}
              {dienststellen.map((stelle) => (
                <FilterChip
                  key={stelle}
                  label={
                    DIENSTSTELLEN.find((d) => d.value === stelle)?.label ||
                    stelle
                  }
                  onRemove={() => toggleDienststelle(stelle)}
                  color="purple"
                />
              ))}
              {timeRange !== "all" && (
                <FilterChip
                  label={
                    TIME_RANGE_OPTIONS.find((t) => t.value === timeRange)
                      ?.label || timeRange
                  }
                  onRemove={() => handleTimeRangeChange("all")}
                  color="orange"
                />
              )}
              {neu && (
                <FilterChip
                  label="Nur neue Fahndungen"
                  onRemove={() => setNeu(false)}
                  color="red"
                />
              )}
            </div>
          )}

          {/* Action Buttons - optimiert nach Referenz */}
          {(activeFilterCount > 0 || onClose) && (
            <div className="flex gap-2">
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

      {/* Tab Content */}
      {activeTab && (
        <div
          className="flex-1 overflow-hidden bg-background flex flex-col min-h-0"
          style={{
            minHeight: activeTab === "pp" ? "50vh" : "30vh",
            maxHeight: activeTab === "pp" ? "70vh" : "50vh",
            touchAction: "pan-y",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {activeTab === "pp" ? (
            <div
              className="h-full flex flex-col min-h-0 -m-4"
              style={{ touchAction: "pan-y" }}
            >
              <PolizeipraesidienTile availableStations={[]} inlineMode={true} />
            </div>
          ) : (
            <div
              className="p-4 space-y-4 overflow-y-auto"
              style={{
                touchAction: "pan-y",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Suche Tab */}
              {activeTab === "search" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="mobile-search-input"
                      className="mb-2 block text-sm font-medium"
                    >
                      Suchbegriff
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="mobile-search-input"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchTermChange(e.target.value)}
                        placeholder="Fahndungen durchsuchen..."
                        className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                        style={{
                          fontSize: "16px",
                          WebkitAppearance: "none",
                          WebkitUserSelect: "text",
                        }}
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-accent/50">
                    <input
                      type="checkbox"
                      checked={neu}
                      onChange={(e) => setNeu(e.target.checked)}
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
                    <div className="mb-2 block text-sm font-medium">
                      Zeitraum
                    </div>
                    <div className="space-y-2">
                      {TIME_RANGE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                            timeRange === option.value
                              ? "bg-accent"
                              : "hover:bg-accent/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="timeRange"
                            value={option.value}
                            checked={timeRange === option.value}
                            onChange={() =>
                              handleTimeRangeChange(
                                option.value as typeof timeRange
                              )
                            }
                            className="h-4 w-4"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
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
                          fahndungsarten.includes(type.value)
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={fahndungsarten.includes(type.value)}
                          onChange={() => toggleFahndungsart(type.value)}
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
