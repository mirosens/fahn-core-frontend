// components/fahndungen/FahndungenFilter.tsx - WCAG 2.2 AA konformer Filter
"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterProps {
  className?: string;
}

export function FahndungenFilter({ className }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Aktuelle Filter-Werte aus URL
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    region: searchParams.get("region") || "",
    delikt: searchParams.get("delikt") || "",
  });

  // Filter-Optionen
  const filterOptions = {
    status: [
      { value: "", label: "Alle Status" },
      { value: "active", label: "Aktiv" },
      { value: "completed", label: "Erledigt" },
      { value: "archived", label: "Archiviert" },
    ],
    region: [
      { value: "", label: "Alle Regionen" },
      { value: "stuttgart", label: "Stuttgart" },
      { value: "karlsruhe", label: "Karlsruhe" },
      { value: "mannheim", label: "Mannheim" },
      { value: "freiburg", label: "Freiburg" },
      { value: "tuebingen", label: "Tübingen" },
      { value: "ulm", label: "Ulm" },
    ],
    delikt: [
      { value: "", label: "Alle Delikte" },
      { value: "diebstahl", label: "Diebstahl" },
      { value: "betrug", label: "Betrug" },
      { value: "koerperverletzung", label: "Körperverletzung" },
      { value: "sachbeschaedigung", label: "Sachbeschädigung" },
      { value: "verkehr", label: "Verkehrsdelikte" },
    ],
  };

  const updateUrl = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      // Reset page when filters change
      const url = params.toString() ? `/?${params.toString()}` : "/";
      router.push(url);
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      updateUrl(newFilters);
    },
    [filters, updateUrl]
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Kompakte Filter-Steuerungen */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div>
          <label
            htmlFor="filter-status"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-describedby="filter-status-description"
          >
            {filterOptions.status.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p id="filter-status-description" className="sr-only">
            Filtern Sie Fahndungen nach ihrem aktuellen Status
          </p>
        </div>

        {/* Region Filter */}
        <div>
          <label
            htmlFor="filter-region"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Region
          </label>
          <select
            id="filter-region"
            value={filters.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-describedby="filter-region-description"
          >
            {filterOptions.region.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p id="filter-region-description" className="sr-only">
            Filtern Sie Fahndungen nach der Region in Baden-Württemberg
          </p>
        </div>

        {/* Delikt Filter */}
        <div>
          <label
            htmlFor="filter-delikt"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Delikt
          </label>
          <select
            id="filter-delikt"
            value={filters.delikt}
            onChange={(e) => handleFilterChange("delikt", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-describedby="filter-delikt-description"
          >
            {filterOptions.delikt.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p id="filter-delikt-description" className="sr-only">
            Filtern Sie Fahndungen nach der Art des Delikts
          </p>
        </div>
      </div>

      {/* Aktive Filter Anzeige */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Aktive Filter:
          </h3>
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                role="status"
                aria-label={`Aktueller Status-Filter: ${filterOptions.status.find((o) => o.value === filters.status)?.label}`}
              >
                Status:{" "}
                {
                  filterOptions.status.find((o) => o.value === filters.status)
                    ?.label
                }
                <button
                  onClick={() => handleFilterChange("status", "")}
                  className="ml-1 hover:text-primary/80 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                  aria-label="Status-Filter entfernen"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.region && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                role="status"
                aria-label={`Aktuelle Region-Filter: ${filterOptions.region.find((o) => o.value === filters.region)?.label}`}
              >
                Region:{" "}
                {
                  filterOptions.region.find((o) => o.value === filters.region)
                    ?.label
                }
                <button
                  onClick={() => handleFilterChange("region", "")}
                  className="ml-1 hover:text-primary/80 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                  aria-label="Region-Filter entfernen"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.delikt && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                role="status"
                aria-label={`Aktueller Delikt-Filter: ${filterOptions.delikt.find((o) => o.value === filters.delikt)?.label}`}
              >
                Delikt:{" "}
                {
                  filterOptions.delikt.find((o) => o.value === filters.delikt)
                    ?.label
                }
                <button
                  onClick={() => handleFilterChange("delikt", "")}
                  className="ml-1 hover:text-primary/80 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                  aria-label="Delikt-Filter entfernen"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
