"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, X } from "lucide-react";

interface LocationFilterProps {
  locations: string[];
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationFilter({
  locations,
  selectedLocations,
  onLocationChange,
  placeholder = "Tatort auswählen...",
  className = ""
}: LocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Gefilterte Orte basierend auf Suchbegriff
  const filteredLocations = locations.filter(location =>
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ort hinzufügen/entfernen
  const toggleLocation = (location: string) => {
    const newSelected = selectedLocations.includes(location)
      ? selectedLocations.filter(l => l !== location)
      : [...selectedLocations, location];
    onLocationChange(newSelected);
  };

  // Alle Orte auswählen/abwählen
  const toggleAllLocations = () => {
    if (selectedLocations.length === filteredLocations.length) {
      onLocationChange([]);
    } else {
      onLocationChange(filteredLocations);
    }
  };

  // Schließen beim Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.location-filter')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`location-filter relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted dark:border-border dark:bg-muted dark:hover:bg-muted/80 ${
          selectedLocations.length > 0 ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Tatort</div>
            <div className="text-xs text-muted-foreground">
              {selectedLocations.length > 0 
                ? `${selectedLocations.length} ausgewählt` 
                : placeholder}
            </div>
          </div>
        </div>
        <svg className="h-4 w-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[60] mt-1 w-full rounded-lg border border-border bg-white shadow-lg dark:border-border dark:bg-muted max-h-64 overflow-hidden">
          {/* Suchfeld */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tatort suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-border bg-white px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-border dark:bg-muted dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Orte Liste */}
          <div className="max-h-48 overflow-y-auto">
            {filteredLocations.length > 0 ? (
              <>
                {/* Alle auswählen/abwählen */}
                <button
                  type="button"
                  onClick={toggleAllLocations}
                  className="flex w-full items-center gap-3 border-b border-border px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                >
                  <div className="flex h-4 w-4 items-center justify-center">
                    {selectedLocations.length === filteredLocations.length ? (
                      <svg className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="h-3 w-3 rounded border border-border" />
                    )}
                  </div>
                  <span className="text-blue-600 dark:text-blue-400">
                    {selectedLocations.length === filteredLocations.length ? "Alle abwählen" : "Alle auswählen"}
                  </span>
                </button>

                {/* Einzelne Orte */}
                {filteredLocations.map((location) => {
                  const isSelected = selectedLocations.includes(location);
                  
                  return (
                    <button
                      key={location}
                      type="button"
                      onClick={() => toggleLocation(location)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"

                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {isSelected ? (
                          <svg className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="h-3 w-3 rounded border border-border" />
                        )}
                      </div>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{location}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Keine Orte gefunden
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
