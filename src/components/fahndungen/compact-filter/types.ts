import type { ViewMode } from "@/types/fahndungskarte";

// Filter-Datentypen - erweitert um alle Funktionen von ModernFahndungFilter
export interface CompactFilterState {
  searchTerm: string;
  // Multi-Select für Dienststellen (statt Single-Select)
  stations: string[];
  // Multi-Select für Fahndungsarten (statt Single-Select)
  types: string[];
  // Zeitraum-Filter (neu)
  timeRange: "all" | "24h" | "7d" | "30d";
  // Datum-Filter (von/bis)
  dateFrom?: string;
  dateTo?: string;
  // Neu Filter
  neu: boolean;
  // Sortierung
  sortBy: "date" | "priority" | "relevance";
  sortOrder: "asc" | "desc";
  // Regionen (optional, für Kompatibilität)
  region: string[];
  // LKA/BKA Filter
  lka: boolean;
  bka: boolean;
}

// Props Interface
export interface CompactFilterProps {
  onFilterChange: (filters: CompactFilterState) => void;
  className?: string;
  showRegionFilter?: boolean;
  defaultValues?: Partial<CompactFilterState>;
  // Neue Props für alle Funktionen von ModernFahndungFilter
  availableLocations?: string[]; // Verfügbare Tatorte aus den Daten
  availableStations?: string[]; // Verfügbare Dienststellen aus den Daten
  viewMode?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  onClose?: () => void; // Für Close-Button in der Filterleiste
  isInline?: boolean; // Für Inline-Modus im Header
}

