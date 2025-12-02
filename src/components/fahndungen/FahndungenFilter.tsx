// components/fahndungen/FahndungenFilter.tsx - WCAG 2.2 AA konformer Filter
"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterProps {
  className?: string;
}

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
    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors
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
      ✕
    </button>
  </span>
);

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

  // Filter zurücksetzen
  const resetFilters = useCallback(() => {
    const newFilters = {
      status: "",
      region: "",
      delikt: "",
    };
    setFilters(newFilters);
    updateUrl(newFilters);
  }, [updateUrl]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Alle Filter zurücksetzen
          </button>
        </div>
      )}

      {/* Aktive Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <FilterChip
              label={`Status: ${filterOptions.status.find((o) => o.value === filters.status)?.label}`}
              onRemove={() => handleFilterChange("status", "")}
              color="blue"
            />
          )}
          {filters.region && (
            <FilterChip
              label={`Region: ${filterOptions.region.find((o) => o.value === filters.region)?.label}`}
              onRemove={() => handleFilterChange("region", "")}
              color="green"
            />
          )}
          {filters.delikt && (
            <FilterChip
              label={`Delikt: ${filterOptions.delikt.find((o) => o.value === filters.delikt)?.label}`}
              onRemove={() => handleFilterChange("delikt", "")}
              color="purple"
            />
          )}
        </div>
      )}

      {/* Filter-Steuerungen */}
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
    </div>
  );
}
