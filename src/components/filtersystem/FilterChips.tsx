"use client";

import { X } from "lucide-react";
import { type ModernFilterState } from "./ModernFahndungFilter";
import { segments } from "@/components/map/PolizeiSVGComplete";

interface FilterChipsProps {
  filters: ModernFilterState;
  onRemoveFilter: (filterType: keyof ModernFilterState, value: string) => void;
  onRemoveTimeFilter: () => void;
  onRemoveSearchTerm: () => void;
  onRemoveNeuFilter?: () => void;
  onRemovePPSegment?: (segmentId: string) => void;
  onRemoveLkaFilter?: () => void;
  onRemoveBkaFilter?: () => void;
  ppSegments?: string[];
  className?: string;
}

// LKA BW Dienststellen - für zukünftige Verwendung
// const LKA_STATIONS = [
//   "Aalen", "Freiburg", "Heilbronn", "Karlsruhe", "Konstanz", 
//   "Ludwigsburg", "Mannheim", "Offenburg", "Pforzheim", 
//   "Ravensburg", "Reutlingen", "Stuttgart", "Ulm"
// ];

// Fahndungsarten
const FAHNDUNGS_TYPES = [
  { value: "straftaeter", label: "Straftäter", color: "red" },
  { value: "vermisste", label: "Vermisste", color: "blue" },
  { value: "unbekannte_tote", label: "Unbekannte Tote", color: "gray" },
  { value: "sachen", label: "Sachen", color: "green" }
];

// Bestehende Filteroptionen
const filterOptions = {
  timeRange: [
    { value: "all", label: "Alle Zeiträume" },
    { value: "24h", label: "Letzte 24h" },
    { value: "7d", label: "Letzte 7 Tage" },
    { value: "30d", label: "Letzte 30 Tage" },
  ],
};

export default function FilterChips({
  filters,
  onRemoveFilter,
  onRemoveTimeFilter,
  onRemoveSearchTerm,
  onRemoveNeuFilter,
  onRemovePPSegment,
  onRemoveLkaFilter,
  onRemoveBkaFilter,
  ppSegments = [],
  className = ""
}: FilterChipsProps) {
  // Aktive Filter zählen
  const activeFilterCount =
    [...filters.locations, ...filters.types].length +
    (filters.neu ? 1 : 0) +
    (filters.timeRange !== "all" ? 1 : 0) +
    (filters.searchTerm ?? "" ? 1 : 0) +
    (filters.lka ? 1 : 0) +
    (filters.bka ? 1 : 0) +
    ppSegments.length;

  if (activeFilterCount === 0) {
    return null;
  }

  // Kompakte Filter-Chip Komponente
  const FilterChip = ({ 
    label, 
    onRemove, 
    color = "blue" 
  }: { 
    label: string; 
    onRemove: () => void; 
    color?: string;
  }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors
        ${color === "red" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
          color === "blue" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
          color === "green" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
          color === "gray" ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" :
          color === "orange" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" :
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"}`}
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

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* PP-Karte Segmente - ersetzt Dienststellen */}
      {ppSegments.length > 0 && onRemovePPSegment && ppSegments.map((segmentId) => {
        const segment = segments.find(s => s.id === segmentId);
        return (
          <FilterChip
            key={`pp-segment-${segmentId}`}
            label={segment?.label ?? segmentId}
            onRemove={() => onRemovePPSegment(segmentId)}
            color="purple"
          />
        );
      })}

      {/* Tatorte */}
      {filters.locations.map((location) => (
        <FilterChip
          key={`location-${location}`}
          label={`Tatort: ${location}`}
          onRemove={() => onRemoveFilter("locations", location)}
          color="green"
        />
      ))}

      {/* Fahndungsarten */}
      {filters.types.map((type) => {
        const typeOption = FAHNDUNGS_TYPES.find(t => t.value === type);
        return (
          <FilterChip
            key={`type-${type}`}
            label={typeOption?.label ?? type}
            onRemove={() => onRemoveFilter("types", type)}
            color={typeOption?.color ?? "blue"}
          />
        );
      })}

      {/* Neu Filter */}
      {filters.neu && onRemoveNeuFilter && (
        <FilterChip
          label="Neu"
          onRemove={onRemoveNeuFilter}
          color="orange"
        />
      )}

      {/* Zeitraum */}
      {filters.timeRange !== "all" && (
        <FilterChip
          label={filterOptions.timeRange.find(t => t.value === filters.timeRange)?.label ?? ""}
          onRemove={onRemoveTimeFilter}
          color="purple"
        />
      )}

      {/* Suchbegriff */}
      {filters.searchTerm && (
        <FilterChip
          label={`Suche: "${filters.searchTerm}"`}
          onRemove={onRemoveSearchTerm}
          color="blue"
        />
      )}

      {/* LKA Filter */}
      {filters.lka && onRemoveLkaFilter && (
        <FilterChip
          label="LKA"
          onRemove={onRemoveLkaFilter}
          color="blue"
        />
      )}

      {/* BKA Filter */}
      {filters.bka && onRemoveBkaFilter && (
        <FilterChip
          label="BKA"
          onRemove={onRemoveBkaFilter}
          color="blue"
        />
      )}
    </div>
  );
}
