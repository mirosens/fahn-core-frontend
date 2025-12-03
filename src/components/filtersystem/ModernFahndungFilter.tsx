"use client";

import { useState, useEffect } from "react";
// Icons für zukünftige Verwendung
// import { 
//   Users, 
//   UserX, 
//   Skull, 
//   Package
// } from "lucide-react";
import FilterChips from "./FilterChips";
import { type ViewMode } from "@/types/fahndungskarte";

interface ModernFahndungFilterProps {
  onFilterChange: (filters: ModernFilterState) => void;
  className?: string;
  availableLocations?: string[]; // Verfügbare Tatorte aus den Daten
  availableStations?: string[]; // Verfügbare Dienststellen aus den Daten
  filteredCount?: number; // Anzahl gefilterter Fahndungen
  totalCount?: number; // Gesamtanzahl Fahndungen
  viewMode?: ViewMode; // Aktuelle Ansicht
  onViewChange?: (view: ViewMode) => void; // Callback für Ansichtsänderung
}

export interface ModernFilterState {
  // Neue Filter für Ort und Dienststelle
  stations: string[];        // Dienststellen (Aalen, Freiburg, etc.)
  locations: string[];       // Tatorte (wo es passiert ist)
  types: string[];          // Fahndungsarten (Straftäter, Vermisste, etc.)
  
  // Bestehende Filter
  neu: boolean;             // Nur neue Fahndungen anzeigen
  timeRange: "all" | "24h" | "7d" | "30d";
  searchTerm: string;
  // Datumsfilter
  dateFrom?: string;        // Datum von (YYYY-MM-DD)
  dateTo?: string;          // Datum bis (YYYY-MM-DD)
  // LKA/BKA Filter
  lka?: boolean;            // Landeskriminalamt Filter
  bka?: boolean;            // Bundeskriminalamt Filter
}

// LKA BW Dienststellen - erweitert um häufige Varianten
// const LKA_STATIONS = [
//   "Aalen",
//   "Freiburg", 
//   "Heilbronn",
//   "Karlsruhe",
//   "Konstanz",
//   "Ludwigsburg",
//   "Mannheim",
//   "Offenburg",
//   "Pforzheim",
//   "Ravensburg",
//   "Reutlingen",
//   "Stuttgart",
//   "Ulm",
//   // Häufige Varianten und Abkürzungen
//   "LKA",
//   "Allgemein",
//   "Zentral",
//   "Hauptstelle",
//   "Polizeipräsidium"
// ];

// Fahndungsarten
// const FAHNDUNGS_TYPES = [
//   { value: "straftaeter", label: "Straftäter", icon: Users, color: "red" },
//   { value: "vermisste", label: "Vermisste", icon: UserX, color: "blue" },
//   { value: "unbekannte_tote", label: "Unbekannte Tote", icon: Skull, color: "gray" },
//   { value: "sachen", label: "Sachen", icon: Package, color: "green" }
// ];

// Bestehende Filteroptionen
// const filterOptions = {
//   timeRange: [
//     { value: "all", label: "Alle" },
//     { value: "24h", label: "Letzte 24h" },
//     { value: "7d", label: "Letzte 7 Tage" },
//     { value: "30d", label: "Letzte 30 Tage" },
//   ],
// };

export default function ModernFahndungFilter({ 
  onFilterChange, 
  className = "",
  availableLocations: _availableLocations = [],
  availableStations: _availableStations = [],
  filteredCount: _filteredCount = 0,
  totalCount: _totalCount = 0,
  viewMode: _viewMode,
  onViewChange: _onViewChange
}: ModernFahndungFilterProps) {
  const [mounted, setMounted] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ModernFilterState>({
    stations: [],
    locations: [],
    types: [],
    neu: false,
    timeRange: "all",
    searchTerm: "",
  });

  // Hydration-Sicherheit
  useEffect(() => {
    setMounted(true);
  }, []);

  // Multi-Select Toggle für Arrays
  // const toggleArrayFilter = (
  //   filterType: keyof Pick<ModernFilterState, "stations" | "locations" | "types">,
  //   value: string,
  // ) => {
  //   const newFilters = {
  //     ...activeFilters,
  //     [filterType]: activeFilters[filterType].includes(value)
  //       ? activeFilters[filterType].filter((v) => v !== value)
  //       : [...activeFilters[filterType], value],
  //   };
  //   setActiveFilters(newFilters);
  //   onFilterChange(newFilters);
  // };

  // Neu-Filter Toggle
  // const toggleNeuFilter = () => {
  //   const newFilters = { ...activeFilters, neu: !activeFilters.neu };
  //   setActiveFilters(newFilters);
  //   onFilterChange(newFilters);
  // };

  // Filter entfernen
  const removeFilter = (filterType: keyof ModernFilterState, value: string) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: Array.isArray(activeFilters[filterType]) 
        ? (activeFilters[filterType] as string[]).filter((v: string) => v !== value)
        : activeFilters[filterType],
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Neu-Filter entfernen
  const removeNeuFilter = () => {
    const newFilters = { ...activeFilters, neu: false };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Zeit-Filter entfernen
  const removeTimeFilter = () => {
    const newFilters = { ...activeFilters, timeRange: "all" as const };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Suchbegriff entfernen
  const removeSearchTerm = () => {
    const newFilters = { ...activeFilters, searchTerm: "" };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Zeit-Filter setzen
  // const setTimeFilter = (timeRange: ModernFilterState["timeRange"]) => {
  //   const newFilters = { ...activeFilters, timeRange };
  //   setActiveFilters(newFilters);
  //   onFilterChange(newFilters);
  // };

  // Suchbegriff setzen
  // const setSearchTerm = (searchTerm: string) => {
  //   const newFilters = { ...activeFilters, searchTerm };
  //   setActiveFilters(newFilters);
  //   onFilterChange(newFilters);
  // };

  // Filter zurücksetzen
  const resetFilters = () => {
    const newFilters: ModernFilterState = {
      stations: [],
      locations: [],
      types: [],
      neu: false,
      timeRange: "all",
      searchTerm: "",
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Aktive Filter zählen
  const activeFilterCount =
    [...activeFilters.stations, ...activeFilters.locations, ...activeFilters.types].length +
    (activeFilters.neu ? 1 : 0) +
    (activeFilters.timeRange !== "all" ? 1 : 0) +
    (activeFilters.searchTerm ? 1 : 0);

  if (!mounted) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 rounded-lg bg-muted"></div>
      </div>
    );
  }

  return (
    <div className={`modern-fahndung-filter ${className}`}>
      {/* Hauptfilter-Bereich */}
      <div className="space-y-4">
        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Zurücksetzen
            </button>
          </div>
        )}

        {/* Aktive Filter Chips */}
        <FilterChips
          filters={activeFilters}
          onRemoveFilter={removeFilter}
          onRemoveTimeFilter={removeTimeFilter}
          onRemoveSearchTerm={removeSearchTerm}
          onRemoveNeuFilter={removeNeuFilter}
        />
      </div>
    </div>
  );
}
