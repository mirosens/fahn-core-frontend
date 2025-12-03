"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type CompactFilterState } from "@/components/fahndungen/compact-filter/types";
import { type ModernFilterState } from "@/components/filtersystem/ModernFahndungFilter";

interface FilterContextType {
  filters: ModernFilterState;
  setFilters: (filters: CompactFilterState | ModernFilterState) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Konvertiere CompactFilterState zu ModernFilterState
function convertToModernFilterState(filters: CompactFilterState | ModernFilterState): ModernFilterState {
  // Wenn es bereits ModernFilterState ist, zurückgeben
  if ('neu' in filters && 'locations' in filters && Array.isArray(filters.locations)) {
    return filters;
  }
  
  // Konvertiere CompactFilterState zu ModernFilterState
  const compactFilters = filters as CompactFilterState;
  return {
    stations: Array.isArray(compactFilters.stations) ? compactFilters.stations : [],
    locations: [], // CompactFilterState hat kein locations Feld, aber es muss ein Array sein
    types: Array.isArray(compactFilters.types) ? compactFilters.types : [],
    neu: typeof compactFilters.neu === "boolean" ? compactFilters.neu : false,
    timeRange: typeof compactFilters.timeRange === "string" ? compactFilters.timeRange : "all",
    searchTerm: typeof compactFilters.searchTerm === "string" ? compactFilters.searchTerm : "",
    dateFrom: typeof compactFilters.dateFrom === "string" ? compactFilters.dateFrom : undefined,
    dateTo: typeof compactFilters.dateTo === "string" ? compactFilters.dateTo : undefined,
    lka: typeof compactFilters.lka === "boolean" ? compactFilters.lka : false,
    bka: typeof compactFilters.bka === "boolean" ? compactFilters.bka : false,
  };
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<ModernFilterState>({
    stations: [],
    locations: [],
    types: [],
    neu: false,
    timeRange: "all",
    searchTerm: "",
    dateFrom: undefined,
    dateTo: undefined,
    lka: false,
    bka: false,
  });

  const setFilters = useCallback((newFilters: CompactFilterState | ModernFilterState) => {
    const modernFilters = convertToModernFilterState(newFilters);
    setFiltersState(modernFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({
      stations: [],
      locations: [],
      types: [],
      neu: false,
      timeRange: "all",
      searchTerm: "",
      dateFrom: undefined,
      dateTo: undefined,
      lka: false,
      bka: false,
    });
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}

