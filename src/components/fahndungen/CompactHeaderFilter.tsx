"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, X } from "lucide-react";
import { PolizeipraesidienTile } from "./PolizeipraesidienTile";

interface CompactHeaderFilterProps {
  className?: string;
}

export function CompactHeaderFilter({ className }: CompactHeaderFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Aktuelle Filter-Werte aus URL
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("q") || searchParams.get("search") || ""
  );
  const [fahndungsart, setFahndungsart] = useState(
    searchParams.get("fahndungsart") || "alle"
  );
  const [dienststelle, setDienststelle] = useState(
    searchParams.get("dienststelle") || "alle"
  );

  // Filter-Optionen - genau wie im Referenzprojekt
  const fahndungsartOptions = [
    { value: "alle", label: "Fahndungsart" },
    { value: "straftaeter", label: "Straftäter" },
    { value: "vermisste", label: "Vermisste" },
    { value: "unbekannte_tote", label: "Unbekannte Tote" },
    { value: "sachen", label: "Sachen" },
  ];

  // Mapping für PP-Codes zu Städtenamen
  const ppCodeToCity: Record<string, string> = {
    ma: "mannheim",
    hn: "heilbronn",
    ka: "karlsruhe",
    pf: "pforzheim",
    og: "offenburg",
    lb: "ludwigsburg",
    s: "stuttgart",
    aa: "aalen",
    rt: "reutlingen",
    ul: "ulm",
    kn: "konstanz",
    fr: "freiburg",
    rv: "ravensburg",
  };

  // URL aktualisieren
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    }
    if (fahndungsart && fahndungsart !== "alle") {
      params.set("fahndungsart", fahndungsart);
    }
    if (dienststelle && dienststelle !== "alle") {
      params.set("dienststelle", dienststelle);
    }

    const url = params.toString() ? `/?${params.toString()}` : "/";
    router.push(url);
  }, [router, searchTerm, fahndungsart, dienststelle]);

  // URL-Parameter beim Laden synchronisieren
  useEffect(() => {
    const urlSearch = searchParams.get("q") || searchParams.get("search") || "";
    const urlFahndungsart = searchParams.get("fahndungsart") || "alle";
    const urlDienststelle = searchParams.get("dienststelle") || "alle";

    // Verwende setTimeout, um setState außerhalb des synchronen Effekt-Bodies aufzurufen
    setTimeout(() => {
      setSearchTerm(urlSearch);
      setFahndungsart(urlFahndungsart);
      setDienststelle(urlDienststelle);
    }, 0);
  }, [searchParams]);

  const handleFahndungsartChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFahndungsart(e.target.value);
      // Sofort URL aktualisieren
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      }
      if (e.target.value !== "alle") {
        params.set("fahndungsart", e.target.value);
      }
      if (dienststelle !== "alle") {
        params.set("dienststelle", dienststelle);
      }
      const url = params.toString() ? `/?${params.toString()}` : "/";
      router.push(url);
    },
    [router, searchTerm, dienststelle]
  );

  const handleDienststelleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setDienststelle(e.target.value);
      // Sofort URL aktualisieren
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      }
      if (fahndungsart !== "alle") {
        params.set("fahndungsart", fahndungsart);
      }
      if (e.target.value !== "alle") {
        params.set("dienststelle", e.target.value);
      }
      const url = params.toString() ? `/?${params.toString()}` : "/";
      router.push(url);
    },
    [router, searchTerm, fahndungsart]
  );

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Fahndungssuche - Suchfeld mit Zeit/Datum-Icon */}
      <div className="relative flex-1 min-w-0">
        <label htmlFor="compact-filter-search" className="sr-only">
          Fahndungssuche
        </label>
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/70 pointer-events-none" />
        <input
          id="compact-filter-search"
          type="text"
          placeholder="Fahndungssuche..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onBlur={updateUrl}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              updateUrl();
            }
          }}
          className="h-9 pl-8 pr-10 text-sm w-full rounded-md border border-border bg-background text-foreground placeholder:text-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden"
        />
        {/* Zeit/Datum-Icon im Suchfeld rechts */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Calendar className="h-4 w-4 text-foreground/70 pointer-events-none" />
        </div>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              updateUrl();
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground z-10"
            aria-label="Suche löschen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Fahndungsart - Dropdown */}
      <div className="flex-1 min-w-0 overflow-visible">
        <select
          value={fahndungsart}
          onChange={handleFahndungsartChange}
          className="h-9 w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-w-[180px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right-2 bg-[length:16px] pr-8"
        >
          {fahndungsartOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dienststellen - Interaktive Karte mit Liste */}
      <div className="flex-1 min-w-0 overflow-visible">
        <PolizeipraesidienTile
          availableStations={[]}
          onSegmentChange={(segments) => {
            // Konvertiere Segmente zu Dienststellen-URL-Parameter
            const segmentArray = Array.from(segments);
            if (segmentArray.length > 0) {
              // Verwende das erste Segment als Dienststelle (vereinfacht)
              const firstSegment = segmentArray[0];
              const parts = firstSegment.split("-");
              const ppCode = parts.length >= 2 ? parts[1] : "";
              const cityName = ppCodeToCity[ppCode] || "";
              if (cityName) {
                handleDienststelleChange({
                  target: { value: cityName.toLowerCase() },
                } as React.ChangeEvent<HTMLSelectElement>);
              }
            } else {
              handleDienststelleChange({
                target: { value: "alle" },
              } as React.ChangeEvent<HTMLSelectElement>);
            }
          }}
        />
      </div>
    </div>
  );
}
