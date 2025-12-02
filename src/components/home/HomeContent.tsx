"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { typo3Client, type FahndungItem } from "@/lib/typo3Client";
import { FlipCard } from "@/components/fahndungen/FlipCard";
import { FahndungModal } from "@/components/fahndungen/FahndungModal";
import { FahndungenFilter } from "@/components/fahndungen/FahndungenFilter";

export default function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [fahndungen, setFahndungen] = useState<FahndungItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFahndung, setSelectedFahndung] = useState<FahndungItem | null>(
    null
  );
  const searchParams = useSearchParams();

  // Hydration-Sicherheit
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lade Fahndungen
  useEffect(() => {
    if (!mounted) return;

    const fetchFahndungen = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await typo3Client.getFahndungen(searchParams);
        setFahndungen(response.items);
      } catch (err) {
        console.error("Fehler beim Laden der Fahndungen:", err);
        setError("Die Fahndungen konnten nicht geladen werden.");
        setFahndungen([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFahndungen();
  }, [mounted, searchParams]);

  // Gefilterte Fahndungen basierend auf URL-Parametern
  const filteredFahndungen = useMemo(() => {
    if (!fahndungen.length) return [];

    const searchTerm = searchParams.get("q") || searchParams.get("search");
    const fahndungsart = searchParams.get("fahndungsart");
    const dienststelle = searchParams.get("dienststelle");

    // Lade ausgewählte Segmente aus localStorage
    let selectedSegments: Set<string> = new Set();
    if (typeof window !== "undefined") {
      const savedSegments = localStorage.getItem("fahndung-selected-segments");
      if (savedSegments) {
        try {
          const segments = JSON.parse(savedSegments) as string[];
          selectedSegments = new Set(segments);
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

      // Dienststellen-Filter über Segmente (wenn Segmente ausgewählt sind)
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
  }, [fahndungen, searchParams]);

  // Dispatch Ergebnisanzahl-Update Event
  useEffect(() => {
    if (typeof window !== "undefined" && mounted) {
      window.dispatchEvent(
        new CustomEvent("fahndung-result-count-update", {
          detail: { count: filteredFahndungen.length },
        })
      );
    }
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
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
              Die Polizei bittet um Ihre Mithilfe
            </h1>
            <p className="text-lg opacity-90 lg:text-xl">
              Das Fahndungsportal der Polizei Baden-Württemberg unterstützt die
              Öffentlichkeit bei der Aufklärung von Straftaten. Bitte melden Sie
              sich, wenn Sie Hinweise zu den hier veröffentlichten Fahndungen
              haben.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900 -mt-2">
        <div className="container mx-auto px-4 pt-12 lg:pt-16 pb-8">
          {/* Fahndungsübersicht Titel */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground dark:text-white">
              Fahndungsübersicht
              {filteredFahndungen.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredFahndungen.length}{" "}
                  {filteredFahndungen.length === 1 ? "Ergebnis" : "Ergebnisse"})
                </span>
              )}
            </h2>
          </div>

          {/* Filter */}
          <div id="fahndungsuebersicht-bereich" className="mb-6">
            <FahndungenFilter />
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

          {/* Fahndungen Grid */}
          {!isLoading && !error && (
            <div className="space-y-6">
              {filteredFahndungen.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredFahndungen.map((fahndung) => (
                    <FlipCard
                      key={fahndung.id}
                      fahndung={fahndung}
                      onDetailsClick={() => setSelectedFahndung(fahndung)}
                    />
                  ))}
                </div>
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
