"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, Calendar, X } from "lucide-react";
import { PolizeipraesidienTile } from "./PolizeipraesidienTile";
import { useStableSearchParams } from "@/hooks/useStableSearchParams";
import { useDebouncedUrlUpdate } from "@/hooks/useDebouncedUrlUpdate";

interface CompactHeaderFilterProps {
  className?: string;
}

// Fahndungsarten-Optionen mit Chips
const FAHNDUNGSART_OPTIONS = [
  { value: "alle", label: "Fahndungsart" },
  { value: "straftaeter", label: "Straftäter", color: "red" },
  { value: "vermisste", label: "Vermisste", color: "blue" },
  { value: "unbekannte_tote", label: "Unbekannte Tote", color: "gray" },
  { value: "sachen", label: "Sachen", color: "green" },
];

// Zeit-Filter Optionen
const TIME_RANGE_OPTIONS = [
  { value: "all", label: "Alle Zeiträume" },
  { value: "24h", label: "Letzte 24h" },
  { value: "7d", label: "Letzte 7 Tage" },
  { value: "30d", label: "Letzte 30 Tage" },
];

// Filter-Chip Komponente (außerhalb der Komponente definiert)
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

export function CompactHeaderFilter({ className }: CompactHeaderFilterProps) {
  // Verwende stabilisierte searchParams
  const {
    searchTerm: urlSearch,
    fahndungsart: urlFahndungsart,
    dienststelle: urlDienststelle,
  } = useStableSearchParams();

  // Verwende debounced URL-Update
  const { updateUrl, isUpdating } = useDebouncedUrlUpdate();

  // Refs um zu tracken, ob wir gerade updaten (verhindert Loops)
  const isUpdatingRef = useRef(false);
  const prevUrlSearchRef = useRef(urlSearch);
  const prevUrlFahndungsartRef = useRef(urlFahndungsart);
  const prevUrlDienststelleRef = useRef(urlDienststelle);

  // Lokaler State für die Eingabefelder (für kontrollierte Komponenten)
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [fahndungsart, setFahndungsart] = useState(urlFahndungsart || "alle");
  const [dienststelle, setDienststelle] = useState(urlDienststelle || "alle");
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(
    new Set()
  );
  const [timeRange, setTimeRange] = useState<"all" | "24h" | "7d" | "30d">(
    "all"
  );
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // Synchronisiere lokalen State mit URL-Parametern
  useEffect(() => {
    if (isUpdating() || isUpdatingRef.current) return;

    const hasSearchChanged = prevUrlSearchRef.current !== urlSearch;
    const hasFahndungsartChanged =
      prevUrlFahndungsartRef.current !== urlFahndungsart;
    const hasDienststelleChanged =
      prevUrlDienststelleRef.current !== urlDienststelle;

    if (hasSearchChanged || hasFahndungsartChanged || hasDienststelleChanged) {
      // Aktualisiere Refs
      prevUrlSearchRef.current = urlSearch;
      prevUrlFahndungsartRef.current = urlFahndungsart;
      prevUrlDienststelleRef.current = urlDienststelle;

      setTimeout(() => {
        if (hasSearchChanged) {
          setSearchTerm(urlSearch);
        }
        if (hasFahndungsartChanged) {
          setFahndungsart(urlFahndungsart || "alle");
        }
        if (hasDienststelleChanged) {
          setDienststelle(urlDienststelle || "alle");
        }
      }, 0);
    }
  }, [urlSearch, urlFahndungsart, urlDienststelle, isUpdating]);

  // Filter zurücksetzen
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setFahndungsart("alle");
    setDienststelle("alle");
    setSelectedSegments(new Set());
    setTimeRange("all");
    updateUrl({
      searchTerm: "",
      fahndungsart: "alle",
      dienststelle: "alle",
      timeRange: "all",
    });
  }, [updateUrl]);

  // Aktive Filter zählen
  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (fahndungsart !== "alle" ? 1 : 0) +
    (dienststelle !== "alle" ? 1 : 0) +
    (timeRange !== "all" ? 1 : 0) +
    selectedSegments.size;

  // URL aktualisieren
  const handleUrlUpdate = useCallback(() => {
    updateUrl({
      searchTerm,
      fahndungsart,
      dienststelle,
    });
  }, [updateUrl, searchTerm, fahndungsart, dienststelle]);

  // Fahndungsart-Auswahl
  const handleFahndungsartSelect = useCallback(
    (value: string) => {
      const newValue = value === fahndungsart ? "alle" : value;
      setFahndungsart(newValue);
      updateUrl({
        searchTerm,
        fahndungsart: newValue,
        dienststelle,
      });
    },
    [updateUrl, searchTerm, dienststelle, fahndungsart]
  );

  // Segment-Änderung für Dienststellen
  const handleSegmentChange = useCallback(
    (segments: Set<string>) => {
      setSelectedSegments(segments);
      // Konvertiere erste Auswahl zu Dienststelle
      if (segments.size > 0) {
        const firstSegment = Array.from(segments)[0];
        const parts = firstSegment.split("-");
        const ppCode = parts.length >= 2 ? parts[1] : "";

        const ppCodeToCity: Record<string, string> = {
          ma: "mannheim",
          hn: "heilbronn",
          ka: "karlsruhe",
          pf: "pforzheim",
          og: "offenburg",
          lb: "ludwigsburg",
          s: "stuttgart",
          aa: "aalen",
          rt: "reutlingen",
          ul: "ulm",
          kn: "konstanz",
          fr: "freiburg",
          rv: "ravensburg",
        };

        const cityName = ppCodeToCity[ppCode] || "";
        if (cityName) {
          setDienststelle(cityName);
          updateUrl({
            searchTerm,
            fahndungsart,
            dienststelle: cityName,
          });
        }
      } else {
        setDienststelle("alle");
        updateUrl({
          searchTerm,
          fahndungsart,
          dienststelle: "alle",
        });
      }
    },
    [updateUrl, searchTerm, fahndungsart]
  );

  const isHeaderFilter = className?.includes("header-filter");
  const isChipsOnly = className?.includes("chips-only-mode");

  // Chips-Only Modus: Nur Filter-Chips und Reset-Button anzeigen
  if (isChipsOnly) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex flex-wrap gap-2">
          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mr-3"
            >
              Zurücksetzen
            </button>
          )}

          {/* Aktive Filter Chips */}
          {searchTerm && (
            <FilterChip
              label={`Suche: "${searchTerm}"`}
              onRemove={() => {
                setSearchTerm("");
                updateUrl({
                  searchTerm: "",
                  fahndungsart,
                  dienststelle,
                  timeRange,
                });
              }}
              color="blue"
            />
          )}

          {fahndungsart !== "alle" && (
            <FilterChip
              label={
                FAHNDUNGSART_OPTIONS.find((o) => o.value === fahndungsart)
                  ?.label || fahndungsart
              }
              onRemove={() => {
                setFahndungsart("alle");
                updateUrl({
                  searchTerm,
                  fahndungsart: "alle",
                  dienststelle,
                  timeRange,
                });
              }}
              color={
                FAHNDUNGSART_OPTIONS.find((o) => o.value === fahndungsart)
                  ?.color || "blue"
              }
            />
          )}

          {timeRange !== "all" && (
            <FilterChip
              label={
                TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label ||
                timeRange
              }
              onRemove={() => {
                setTimeRange("all");
                updateUrl({
                  searchTerm,
                  fahndungsart,
                  dienststelle,
                  timeRange: "all",
                });
              }}
              color="purple"
            />
          )}

          {selectedSegments.size > 0 &&
            Array.from(selectedSegments).map((segmentId) => (
              <FilterChip
                key={segmentId}
                label={`Dienststelle: ${segmentId.replace("polizeipraesidium-", "").toUpperCase()}`}
                onRemove={() => {
                  const newSegments = new Set(selectedSegments);
                  newSegments.delete(segmentId);
                  handleSegmentChange(newSegments);
                }}
                color="orange"
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isHeaderFilter ? "flex flex-col space-y-3" : "space-y-3"} ${className}`}
    >
      {/* Erste Zeile: Filter-Eingaben */}
      <div className="flex items-center gap-4">
        {/* Fahndungssuche */}
        <div className="relative flex-1 min-w-0">
          <label htmlFor="compact-filter-search" className="sr-only">
            Fahndungssuche
          </label>
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/70 pointer-events-none" />
          <input
            id="compact-filter-search"
            type="text"
            placeholder="Fahndungssuche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={handleUrlUpdate}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrlUpdate();
              }
            }}
            className="h-9 pl-8 pr-10 text-sm w-full rounded-md border border-border bg-background text-foreground placeholder:text-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          {/* Zeit/Datum-Icon im Suchfeld rechts - klickbar für Zeitfilter */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center justify-center w-6 h-6 text-foreground/70 hover:text-foreground rounded transition-colors"
              aria-label="Zeitfilter"
            >
              <Calendar className="h-4 w-4" />
            </button>
            {/* Dropdown für Zeitfilter */}
            {showTimeDropdown && (
              <div className="absolute right-0 top-8 z-50 bg-background border border-border rounded-md shadow-lg py-1 min-w-[140px]">
                {TIME_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeRange(option.value as typeof timeRange);
                      updateUrl({
                        searchTerm,
                        fahndungsart,
                        dienststelle,
                        timeRange: option.value,
                      });
                      setShowTimeDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                      timeRange === option.value ? "bg-accent font-medium" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                updateUrl({
                  searchTerm: "",
                  fahndungsart,
                  dienststelle,
                });
              }}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground z-10"
              aria-label="Suche löschen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Fahndungsart-Buttons */}
        <div className="flex items-center gap-2">
          {FAHNDUNGSART_OPTIONS.slice(1).map((option) => (
            <button
              key={option.value}
              onClick={() => handleFahndungsartSelect(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                fahndungsart === option.value
                  ? `bg-${option.color}-100 text-${option.color}-800 border-${option.color}-300 dark:bg-${option.color}-900/30 dark:text-${option.color}-300 dark:border-${option.color}-700`
                  : "bg-background border-border text-foreground hover:bg-accent"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Dienststellen - Karte */}
        <div className="flex-1 min-w-0 overflow-visible">
          <PolizeipraesidienTile
            availableStations={[]}
            onSegmentChange={handleSegmentChange}
          />
        </div>
      </div>

      {/* Zweite Zeile: Filter-Chips (nur wenn aktive Filter vorhanden) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/30">
          <div className="flex flex-wrap gap-2">
            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Zurücksetzen
            </button>

            {/* Aktive Filter Chips */}
            {searchTerm && (
              <FilterChip
                label={`Suche: "${searchTerm}"`}
                onRemove={() => {
                  setSearchTerm("");
                  updateUrl({ searchTerm: "", fahndungsart, dienststelle });
                }}
                color="blue"
              />
            )}

            {fahndungsart !== "alle" && (
              <FilterChip
                label={
                  FAHNDUNGSART_OPTIONS.find((o) => o.value === fahndungsart)
                    ?.label || fahndungsart
                }
                onRemove={() => {
                  setFahndungsart("alle");
                  updateUrl({ searchTerm, fahndungsart: "alle", dienststelle });
                }}
                color={
                  FAHNDUNGSART_OPTIONS.find((o) => o.value === fahndungsart)
                    ?.color || "blue"
                }
              />
            )}

            {timeRange !== "all" && (
              <FilterChip
                label={
                  TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)
                    ?.label || timeRange
                }
                onRemove={() => {
                  setTimeRange("all");
                  updateUrl({
                    searchTerm,
                    fahndungsart,
                    dienststelle,
                    timeRange: "all",
                  });
                }}
                color="purple"
              />
            )}

            {selectedSegments.size > 0 &&
              Array.from(selectedSegments).map((segmentId) => (
                <FilterChip
                  key={segmentId}
                  label={`Dienststelle: ${segmentId.replace("polizeipraesidium-", "").toUpperCase()}`}
                  onRemove={() => {
                    const newSegments = new Set(selectedSegments);
                    newSegments.delete(segmentId);
                    handleSegmentChange(newSegments);
                  }}
                  color="orange"
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
