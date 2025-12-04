"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FahndungModal } from "@/components/fahndungen/FahndungModal";
import { ModernHeroSection } from "./ModernHeroSection";
import { FahndungenGridWithPagination } from "@/components/fahndungen/FahndungenGridWithPagination";
import {
  ViewModeDropdown,
  type ViewMode,
} from "@/components/ui/ViewModeDropdown";
import { CompactPagination } from "@/components/ui/CompactPagination";
import { useFahndungen } from "@/hooks/useFahndungen";
import { useStableSearchParams } from "@/hooks/useStableSearchParams";
import type { FahndungItem } from "@/lib/typo3Client";

// Helper function to get initial viewMode from localStorage (client-side only)
function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid-4";
  const savedViewMode = localStorage.getItem(
    "fahndung-view-mode"
  ) as ViewMode | null;
  if (
    savedViewMode &&
    (savedViewMode === "grid-3" || savedViewMode === "grid-4")
  ) {
    return savedViewMode;
  }
  return "grid-4";
}

export default function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [selectedFahndung, setSelectedFahndung] = useState<FahndungItem | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [currentPage, setCurrentPage] = useState(1);
  const lastCountRef = useRef<number | null>(null);

  // Verwende Custom Hooks für stabilisierte searchParams und Data Fetching
  const { searchTerm, fahndungsart, dienststelle } = useStableSearchParams();
  const { fahndungen, isLoading, error } = useFahndungen({ enabled: true });

  // Hydration-Sicherheit - verwende setTimeout um setState außerhalb des Effects zu machen
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Speichere viewMode in localStorage
  const handleViewModeChange = (view: ViewMode) => {
    setViewMode(view);
    if (typeof window !== "undefined") {
      localStorage.setItem("fahndung-view-mode", view);
    }
  };

  // Items pro Seite basierend auf Grid-Modus
  const itemsPerPage = viewMode === "grid-4" ? 8 : 6;

  // Gefilterte Fahndungen basierend auf URL-Parametern
  const filteredFahndungen = useMemo(() => {
    console.log(
      "[HomeContent] Filter-Logik: fahndungen.length =",
      fahndungen.length,
      "fahndungen =",
      fahndungen
    );
    if (!fahndungen || !fahndungen.length) {
      console.log("[HomeContent] Keine Fahndungen zum Filtern vorhanden");
      return [];
    }

    // Lade ausgewählte Segmente aus localStorage
    let selectedSegments: Set<string> = new Set();
    if (typeof window !== "undefined") {
      const savedSegments = localStorage.getItem("fahndung-selected-segments");
      if (savedSegments) {
        try {
          const segments = JSON.parse(savedSegments) as string[];
          selectedSegments = new Set(segments);
          console.log(
            "[HomeContent] Geladene Segmente aus localStorage:",
            Array.from(selectedSegments)
          );
        } catch (e) {
          console.error("Fehler beim Laden der Segmente:", e);
        }
      }
    }

    return fahndungen.filter((fahndung) => {
      // Suchbegriff-Filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          fahndung.title.toLowerCase().includes(searchLower) ||
          fahndung.description?.toLowerCase().includes(searchLower) ||
          fahndung.summary?.toLowerCase().includes(searchLower) ||
          fahndung.location?.toLowerCase().includes(searchLower);

        if (!matchesSearch) {
          return false;
        }
      }

      // Fahndungsart-Filter
      if (fahndungsart && fahndungsart !== "alle") {
        const typeMapping: Record<string, string[]> = {
          straftaeter: ["wanted"],
          vermisste: ["missing_person"],
          unbekannte_tote: ["wanted"], // Fallback zu wanted, da API diesen Typ nicht direkt unterstützt
          sachen: ["wanted"], // Fallback zu wanted, da API diesen Typ nicht direkt unterstützt
        };
        const mappedTypes = typeMapping[fahndungsart] || [];
        if (mappedTypes.length > 0 && !mappedTypes.includes(fahndung.type)) {
          return false;
        }
      }

      // Dienststellen-Filter über Segmente (nur wenn Segmente explizit ausgewählt sind)
      // WICHTIG: Wenn keine Segmente im localStorage sind, werden alle Fahndungen angezeigt
      if (selectedSegments.size > 0) {
        const locationLower = (fahndung.location || "").toLowerCase();
        const dienststelleLower = (fahndung.dienststelle || "").toLowerCase();

        // Mapping von Segment-IDs zu Städtenamen
        const segmentToCity: Record<string, string[]> = {
          "pp-ma-1": ["mannheim"],
          "pp-ma-2": ["heidelberg", "rhein-neckar"],
          "pp-hn-1": ["heilbronn"],
          "pp-hn-2": ["hohenlohe"],
          "pp-hn-3": ["main-tauber"],
          "pp-hn-4": ["neckar-odenwald"],
          "pp-ka-1": ["karlsruhe"],
          "pp-ka-2": ["karlsruhe"],
          "pp-pf-1": ["pforzheim"],
          "pp-pf-2": ["calw"],
          "pp-pf-3": ["freudenstadt"],
          "pp-og-1": ["baden-baden"],
          "pp-og-2": ["rastatt"],
          "pp-og-3": ["ortenau"],
          "pp-lb-1": ["ludwigsburg"],
          "pp-lb-2": ["böblingen"],
          "pp-s-1": ["stuttgart"],
          "pp-aa-1": ["ostalb"],
          "pp-aa-2": ["heidenheim"],
          "pp-aa-3": ["schwäbisch hall"],
          "pp-rt-1": ["esslingen"],
          "pp-rt-2": ["reutlingen"],
          "pp-rt-3": ["tübingen"],
          "pp-rt-4": ["zollernalb"],
          "pp-ul-1": ["ulm"],
          "pp-ul-2": ["göppingen"],
          "pp-ul-3": ["heidenheim"],
          "pp-ul-4": ["ulm"],
          "pp-ul-5": ["biberach"],
          "pp-kn-1": ["konstanz"],
          "pp-kn-2": ["tuttlingen"],
          "pp-kn-3": ["rottweil"],
          "pp-kn-4": ["schwarzwald-baar"],
          "pp-fr-1": ["freiburg"],
          "pp-fr-2": ["emmendingen"],
          "pp-fr-3": ["lörrach"],
          "pp-fr-4": ["waldshut"],
          "pp-rv-1": ["bodensee"],
          "pp-rv-2": ["ravensburg"],
          "pp-rv-3": ["sigmaringen"],
        };

        // Prüfe ob Fahndung zu einem ausgewählten Segment passt
        const matchesSegment = Array.from(selectedSegments).some(
          (segmentId) => {
            const cities = segmentToCity[segmentId] || [];
            return cities.some(
              (city) =>
                locationLower.includes(city) ||
                dienststelleLower.includes(city) ||
                city.includes(locationLower) ||
                city.includes(dienststelleLower)
            );
          }
        );

        if (!matchesSegment) {
          return false;
        }
      } else if (dienststelle && dienststelle !== "alle") {
        // Fallback: Alte Filter-Logik wenn keine Segmente ausgewählt sind
        const locationLower = (fahndung.location || "").toLowerCase();
        const dienststelleLower = (fahndung.dienststelle || "").toLowerCase();
        const filterLower = dienststelle.toLowerCase();

        if (
          !locationLower.includes(filterLower) &&
          !dienststelleLower.includes(filterLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [fahndungen, searchTerm, fahndungsart, dienststelle]);

  // Reset currentPage wenn sich die Gesamtanzahl der Items ändert
  useEffect(() => {
    if (!filteredFahndungen) return;
    const totalPages = Math.ceil(filteredFahndungen.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      // Verwende setTimeout, um setState asynchron aufzurufen
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [filteredFahndungen, itemsPerPage, currentPage]);

  // Debug: Log gefilterte Fahndungen
  useEffect(() => {
    if (mounted) {
      console.log(
        "[HomeContent] Gefilterte Fahndungen:",
        filteredFahndungen.length,
        "von",
        fahndungen.length
      );
      if (fahndungen.length > 0 && filteredFahndungen.length === 0) {
        console.warn(
          "[HomeContent] ⚠️ WARNUNG: Alle Fahndungen wurden herausgefiltert!"
        );
        const savedSegments =
          typeof window !== "undefined"
            ? localStorage.getItem("fahndung-selected-segments")
            : null;
        console.log("[HomeContent] Filter-Parameter:", {
          searchTerm,
          fahndungsart,
          dienststelle,
          selectedSegments: savedSegments,
        });
        if (savedSegments) {
          console.warn(
            "[HomeContent] 💡 TIPP: localStorage enthält Segmente, die möglicherweise alle Fahndungen herausfiltern. Versuchen Sie: localStorage.removeItem('fahndung-selected-segments')"
          );
        }
      }
    }
  }, [
    filteredFahndungen.length,
    fahndungen.length,
    mounted,
    searchTerm,
    fahndungsart,
    dienststelle,
  ]);

  // Dispatch Ergebnisanzahl-Update Event (nur wenn sich der Wert geändert hat)
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    const currentCount = filteredFahndungen.length;
    if (lastCountRef.current === currentCount) return;

    lastCountRef.current = currentCount;
    window.dispatchEvent(
      new CustomEvent("fahndung-result-count-update", {
        detail: { count: currentCount },
      })
    );
  }, [filteredFahndungen.length, mounted]);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section mit Carousel */}
      <ModernHeroSection fahndungen={fahndungen} />

      {/* Main Content */}
      <div className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900 -mt-2">
        <div className="container mx-auto px-4 pt-12 lg:pt-16 pb-8">
          {/* Fahndungsübersicht Titel */}
          <div className="mb-1 grid grid-cols-3 items-center">
            <h2 className="text-2xl font-bold text-foreground dark:text-white">
              Fahndungsübersicht
            </h2>
            {/* Kompakte Pagination - nur Desktop, zentriert */}
            <div className="hidden lg:flex justify-center">
              {!isLoading &&
                !error &&
                filteredFahndungen.length > itemsPerPage && (
                  <div className="rounded-lg border border-border bg-background pl-2.5 pr-1 py-1">
                    <CompactPagination
                      currentPage={currentPage}
                      totalItems={filteredFahndungen.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
            </div>
            <div className="flex justify-end min-w-[120px]">
              <ViewModeDropdown
                viewMode={viewMode}
                onViewChange={handleViewModeChange}
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-xs dark:border-red-800 dark:bg-red-900/20">
              <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
                Fehler beim Laden der Fahndungen
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
              >
                Seite neu laden
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Fahndungen Grid mit Pagination */}
          {!isLoading && !error && (
            <div className="space-y-1">
              {filteredFahndungen.length > 0 ? (
                <FahndungenGridWithPagination
                  fahndungen={filteredFahndungen}
                  viewMode={viewMode}
                  itemsPerPage={itemsPerPage}
                  showPagination={true}
                  showItemsInfo={true}
                  onFahndungClick={(fahndung) => setSelectedFahndung(fahndung)}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              ) : (
                <div className="rounded-lg border border-border bg-white p-8 text-center shadow-xs dark:border-border dark:bg-muted">
                  <h3 className="mb-2 text-lg font-semibold text-muted-foreground dark:text-white">
                    {fahndungen.length > 0
                      ? "Keine Fahndungen mit den aktuellen Filtern gefunden"
                      : "Keine Fahndungen gefunden"}
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    {fahndungen.length > 0
                      ? "Versuchen Sie andere Filter-Einstellungen oder löschen Sie die Filter."
                      : "Es sind noch keine Fahndungen in der Datenbank vorhanden."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Modal für Fahndungsdetails */}
          {selectedFahndung && (
            <FahndungModal
              fahndung={selectedFahndung}
              isOpen={!!selectedFahndung}
              onClose={() => setSelectedFahndung(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}
