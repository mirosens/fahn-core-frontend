"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

interface MapFilterContextType {
  selectedDistrict: string | null;
  setSelectedDistrict: (districtId: string | null) => void;
  getFilteredStations: () => string[];
  getFilteredLocations: () => string[];
  clearFilter: () => void;
  setResetAllFilters: (callback: (() => void) | null) => void;
}

const MapFilterContext = createContext<MapFilterContextType | undefined>(
  undefined
);

export function MapFilterProvider({ children }: { children: ReactNode }) {
  const [selectedDistrict, setSelectedDistrictState] = useState<string | null>(
    null
  );
  // Verwende nur useRef, um State-Updates während des Renderings komplett zu vermeiden
  const resetAllFiltersCallbackRef = useRef<(() => void) | null>(null);

  const setSelectedDistrict = useCallback((districtId: string | null) => {
    setSelectedDistrictState(districtId);
  }, []);

  const getFilteredStations = useCallback((): string[] => {
    if (!selectedDistrict) return [];
    // TODO: Implementiere Mapping falls benötigt
    return [];
  }, [selectedDistrict]);

  const getFilteredLocations = useCallback((): string[] => {
    if (!selectedDistrict) return [];
    // TODO: Implementiere Mapping falls benötigt
    return [];
  }, [selectedDistrict]);

  const clearFilter = useCallback(() => {
    setSelectedDistrictState(null);
    // Rufe auch die resetAllFilters Callback-Funktion auf, falls vorhanden
    // Verwende setTimeout, um sicherzustellen, dass dies nicht während des Renderings passiert
    const callback = resetAllFiltersCallbackRef.current;
    if (callback) {
      setTimeout(() => {
        callback();
      }, 0);
    }
  }, []);

  const setResetAllFilters = useCallback((callback: (() => void) | null) => {
    // Aktualisiere nur den Ref (kein State-Update während des Renderings)
    resetAllFiltersCallbackRef.current = callback;
  }, []);

  return (
    <MapFilterContext.Provider
      value={{
        selectedDistrict,
        setSelectedDistrict,
        getFilteredStations,
        getFilteredLocations,
        clearFilter,
        setResetAllFilters,
      }}
    >
      {children}
    </MapFilterContext.Provider>
  );
}

export function useMapFilter() {
  const context = useContext(MapFilterContext);
  if (context === undefined) {
    throw new Error("useMapFilter must be used within a MapFilterProvider");
  }
  return context;
}
