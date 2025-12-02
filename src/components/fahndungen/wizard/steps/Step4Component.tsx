"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  MapPin,
  Search,
  Trash2,
  AlertCircle,
  Info,
  WandSparkles,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { Step4Data, WizardData } from "../types/WizardTypes";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

// Dynamic import für Leaflet Map (SSR-safe)
const InteractiveMap = dynamic(
  () =>
    import("@/components/shared/InteractiveMap").catch(() => {
      // Fallback: Einfache Karten-Komponente
      return {
        default: () => (
          <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted">
            <div className="text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Karte wird geladen...
              </p>
            </div>
          </div>
        ),
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] animate-pulse items-center justify-center rounded-lg bg-muted">
        <MapPin className="h-8 w-8 text-muted-foreground" />
      </div>
    ),
  }
);

interface MapLocation {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type:
    | "main"
    | "tatort"
    | "wohnort"
    | "arbeitsplatz"
    | "sichtung"
    | "sonstiges";
  description?: string;
  timestamp?: Date;
}

interface Step4ComponentProps {
  data: Step4Data;
  onChange: (data: Step4Data) => void;
  wizard?: Partial<WizardData>;
  showValidation?: boolean;
}

// Vereinfachtes Geocoding (provisorisch)
async function geocodeAddress(
  query: string
): Promise<{ address: string; lat: number; lng: number } | null> {
  try {
    // Provisorisch: Verwende Nominatim OpenStreetMap API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          "User-Agent": "FAHN-CORE Frontend",
        },
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;
    if (data.length === 0) return null;

    return {
      address: data[0]!.display_name,
      lat: parseFloat(data[0]!.lat),
      lng: parseFloat(data[0]!.lon),
    };
  } catch {
    return null;
  }
}

// Reverse Geocoding (Koordinaten → Adresse)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "FAHN-CORE Frontend",
        },
      }
    );

    if (!response.ok) return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    const data = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    if (data.display_name) {
      return data.display_name;
    }

    if (data.address) {
      const addr = data.address;
      const street = `${addr.road || ""} ${addr.house_number || ""}`.trim();
      const zip = addr.postcode || "";
      const city = addr.city || addr.town || addr.village || "";
      const country = addr.country || "Deutschland";

      return (
        `${street}, ${zip} ${city}, ${country}`.trim() ||
        `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      );
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

const Step4Component: React.FC<Step4ComponentProps> = ({
  data,
  onChange,
  showValidation = false,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      address: string;
      lat: number;
      lng: number;
    }>
  >([]);
  const [clickedLocation, setClickedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Adresseingabe-Felder
  const [addressStreet, setAddressStreet] = useState("");
  const [addressZip, setAddressZip] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressCountry, setAddressCountry] = useState("Deutschland");

  const locationTypes = [
    { value: "main", label: "Hauptort", color: "bg-blue-500" },
    { value: "tatort", label: "Tatort", color: "bg-red-500" },
    { value: "wohnort", label: "Wohnort", color: "bg-green-500" },
    { value: "arbeitsplatz", label: "Arbeitsplatz", color: "bg-yellow-500" },
    { value: "sichtung", label: "Sichtung", color: "bg-purple-500" },
    { value: "sonstiges", label: "Sonstiges", color: "bg-muted" },
  ];

  const generateId = () =>
    `location-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Karten-Center und Zoom
  const mapCenter = useMemo<[number, number]>(() => {
    if (data.mainLocation) {
      return [data.mainLocation.lat, data.mainLocation.lng];
    }
    return [48.7758, 9.1829]; // Stuttgart
  }, [data.mainLocation]);

  const mapZoom = useMemo(() => {
    return data.mainLocation ? 12 : 13;
  }, [data.mainLocation]);

  // Standort suchen
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchError("Bitte geben Sie einen Suchbegriff ein");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const result = await geocodeAddress(query);
      if (result) {
        setSearchResults([result]);
      } else {
        setSearchError(
          "Keine Ergebnisse gefunden. Bitte versuchen Sie eine andere Suche."
        );
      }
    } catch {
      setSearchError("Fehler bei der Suche. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Standort hinzufügen
  const addLocation = useCallback(
    (
      address: string,
      lat: number,
      lng: number,
      type: MapLocation["type"] = "main"
    ) => {
      const newLocation: MapLocation = {
        id: generateId(),
        address,
        lat,
        lng,
        type,
        timestamp: new Date(),
      };

      if (type === "main") {
        onChange({
          ...data,
          mainLocation: newLocation,
        });
      } else {
        onChange({
          ...data,
          additionalLocations: [...data.additionalLocations, newLocation],
        });
      }
    },
    [data, onChange]
  );

  const removeLocation = (id: string) => {
    if (data.mainLocation?.id === id) {
      onChange({
        ...data,
        mainLocation: null,
      });
    } else {
      onChange({
        ...data,
        additionalLocations: data.additionalLocations.filter(
          (loc) => loc.id !== id
        ),
      });
    }
  };

  const getLocationTypeColor = (type: MapLocation["type"]) => {
    return locationTypes.find((t) => t.value === type)?.color ?? "bg-muted";
  };

  const getLocationTypeLabel = (type: MapLocation["type"]) => {
    return locationTypes.find((t) => t.value === type)?.label ?? "Sonstiges";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void searchLocation(searchQuery);
  };

  // Karten-Klick-Handler
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      try {
        const address = await reverseGeocode(lat, lng);
        setClickedLocation({ address, lat, lng });
        addLocation(address, lat, lng, "main");
        setTimeout(() => {
          setClickedLocation(null);
        }, 3000);
      } catch {
        const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setClickedLocation({ address: fallbackAddress, lat, lng });
        addLocation(fallbackAddress, lat, lng, "main");
        setTimeout(() => {
          setClickedLocation(null);
        }, 3000);
      }
    },
    [addLocation]
  );

  // Adresse suchen (Geocoding)
  const handleGeocodeAddress = useCallback(async () => {
    const fullAddress =
      `${addressStreet}, ${addressZip} ${addressCity}, ${addressCountry}`.trim();
    if (!fullAddress) {
      setSearchError("Bitte geben Sie eine Adresse ein");
      return;
    }
    await searchLocation(fullAddress);
  }, [addressStreet, addressZip, addressCity, addressCountry, searchLocation]);

  // Demo-Daten generieren
  const generateDemoLocation = async () => {
    setIsSearching(true);
    try {
      const badenWuerttembergCities = [
        "Stuttgart, Baden-Württemberg",
        "Karlsruhe, Baden-Württemberg",
        "Mannheim, Baden-Württemberg",
        "Freiburg, Baden-Württemberg",
        "Heidelberg, Baden-Württemberg",
        "Ulm, Baden-Württemberg",
        "Heilbronn, Baden-Württemberg",
        "Pforzheim, Baden-Württemberg",
      ];
      const randomCity =
        badenWuerttembergCities[
          Math.floor(Math.random() * badenWuerttembergCities.length)
        ]!;

      const result = await geocodeAddress(randomCity);
      if (result) {
        addLocation(result.address, result.lat, result.lng, "main");
      } else {
        // Fallback: Stuttgart
        addLocation(
          "Stuttgart, Baden-Württemberg, Deutschland",
          48.7758,
          9.1829,
          "main"
        );
      }
    } catch {
      // Fallback: Stuttgart
      addLocation(
        "Stuttgart, Baden-Württemberg, Deutschland",
        48.7758,
        9.1829,
        "main"
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto max-w-4xl",
        isMobile ? "space-y-4 px-4" : isTablet ? "space-y-5 px-6" : "space-y-6"
      )}
      style={{ position: "relative", zIndex: 1 }}
    >
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2
          className={cn(
            "mb-2 font-semibold text-muted-foreground dark:text-white",
            isMobile ? "text-xl" : "text-2xl"
          )}
        >
          Schritt 4: Standort
          <span className="ml-2 inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
            PFLICHTFELD
          </span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-muted-foreground">
          Definieren Sie den Hauptstandort und weitere relevante Orte.
        </p>
      </div>

      {/* Schnellstart: Demo-Standort */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/50 dark:to-blue-800/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <WandSparkles
              className={cn(
                "flex-shrink-0 text-blue-600 dark:text-blue-400",
                isMobile ? "h-4 w-4" : "h-5 w-5"
              )}
            />
            <span
              className={cn(
                "font-semibold text-blue-900 dark:text-blue-100",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Schnellstart: Demo-Standort generieren
            </span>
          </div>
          <button
            onClick={generateDemoLocation}
            disabled={isSearching}
            className={cn(
              "rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              isMobile && "w-full"
            )}
          >
            {isSearching ? "Suche..." : "Ausfüllen"}
          </button>
        </div>
      </div>

      {/* Hinweise-Box */}
      <div
        role="note"
        className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30"
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Hinweise
            </h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-900 dark:text-blue-300">
              <li>
                Der Hauptstandort wird als primärer Ort für die Fahndung
                verwendet
              </li>
              <li>
                Weitere Standorte können für zusätzliche Informationen
                hinzugefügt werden
              </li>
              <li>Klicken Sie auf die Karte, um einen Standort zu markieren</li>
              <li>
                Verwenden Sie spezifische Adressen für genauere Ergebnisse
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validierungsfehler */}
      {!data.mainLocation && showValidation && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Bitte geben Sie einen Standort an (Pflichtfeld)</span>
          </div>
        </div>
      )}

      {/* Adresseingabe */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="address-street"
            className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground"
          >
            📍 Adresse eingeben oder auf Karte markieren
          </label>

          <div className="space-y-3">
            <input
              id="address-street"
              type="text"
              value={addressStreet}
              onChange={(e) => setAddressStreet(e.target.value)}
              placeholder="z.B. Musterstraße 123"
              className="w-full rounded-lg border border-border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
            />

            <div className="flex gap-3">
              <input
                type="text"
                value={addressZip}
                onChange={(e) => setAddressZip(e.target.value)}
                placeholder="z.B. 75175"
                className="w-[30%] rounded-lg border border-border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
              />
              <input
                type="text"
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
                placeholder="z.B. Pforzheim"
                className="flex-1 rounded-lg border border-border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
              />
            </div>

            <input
              type="text"
              value={addressCountry}
              onChange={(e) => setAddressCountry(e.target.value)}
              placeholder="Deutschland"
              className="w-full rounded-lg border border-border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={isSearching}
                className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-muted dark:text-muted-foreground"
              >
                <Search className="h-4 w-4" />
                Adresse suchen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suchleiste */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="location-search"
            className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground"
          >
            Standort suchen
          </label>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="location-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Adresse oder Ort eingeben (z.B. 'Berlin, Alexanderplatz')"
                className="w-full rounded-lg border border-border py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-border dark:bg-muted dark:text-white"
                disabled={isSearching}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Suchen
            </button>
          </form>

          {/* Fehlermeldung */}
          {searchError && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{searchError}</span>
              </div>
            </div>
          )}

          {/* Suchergebnisse */}
          {searchResults.length > 0 && (
            <div className="mt-2 rounded-lg border border-border bg-white dark:border-border dark:bg-muted">
              <div className="p-4">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  Suchergebnisse ({searchResults.length})
                </h4>
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        addLocation(
                          result.address,
                          result.lat,
                          result.lng,
                          "main"
                        );
                        setSearchResults([]);
                        setSearchQuery("");
                        setSearchError("");
                      }}
                      className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted dark:hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground dark:text-white">
                          {result.address}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Standort-Liste */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Festgelegte Standorte (
            {data.additionalLocations.length + (data.mainLocation ? 1 : 0)})
          </h4>
        </div>

        {/* Hauptstandort */}
        {data.mainLocation && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${getLocationTypeColor(data.mainLocation.type)}`}
                />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Hauptstandort
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {data.mainLocation.address}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {data.mainLocation.lat.toFixed(6)},{" "}
                    {data.mainLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  data.mainLocation && removeLocation(data.mainLocation.id)
                }
                className="rounded p-1 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900"
                title="Hauptstandort entfernen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Weitere Standorte */}
        {data.additionalLocations.length > 0 && (
          <div className="space-y-2">
            {data.additionalLocations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 dark:border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${getLocationTypeColor(location.type)}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground dark:text-white">
                      {getLocationTypeLabel(location.type)}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {location.address}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeLocation(location.id)}
                  className="rounded p-1 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900"
                  title="Standort entfernen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!data.mainLocation && data.additionalLocations.length === 0 && (
          <div className="rounded-lg border border-border bg-muted p-4 text-center dark:border-border dark:bg-muted">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
              Noch keine Standorte festgelegt
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Suchen Sie nach einem Ort oder klicken Sie auf die Karte
            </p>
          </div>
        )}
      </div>

      {/* Interaktive Karte */}
      <div
        className="space-y-4 pb-32"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div>
          <div className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            Interaktive Karte
          </div>
          <p className="mb-4 text-xs text-muted-foreground dark:text-muted-foreground">
            Klicken Sie auf die Karte, um einen Standort hinzuzufügen.
          </p>
        </div>

        <div className="relative">
          <div
            className="rounded-lg border border-border dark:border-border"
            data-map-container
            style={{ position: "relative", zIndex: 1 }}
          >
            <InteractiveMap
              locations={[
                ...(data.mainLocation ? [data.mainLocation] : []),
                ...data.additionalLocations,
              ]}
              height="400px"
              center={mapCenter}
              zoom={mapZoom}
              editable={true}
              showRadius={false}
              onMapClick={handleMapClick}
              onLocationClick={() => {
                // Optional: Weitere Aktionen bei Marker-Klick
              }}
            />
          </div>

          {/* Info-Box beim Klick auf Karte */}
          {clickedLocation && (
            <div
              className="absolute top-4 left-1/2 z-[101] -translate-x-1/2 pointer-events-auto"
              style={{ zIndex: 101 }}
            >
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 shadow-lg dark:border-blue-800 dark:bg-blue-900/95">
                <div className="flex items-start gap-2 max-w-xs">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                      Standort hinzugefügt
                    </p>
                    <p className="mt-0.5 line-clamp-2 break-words text-xs text-blue-800 dark:text-blue-200">
                      {clickedLocation.address}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedLocation(null);
                    }}
                    className="ml-2 flex-shrink-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    aria-label="Schließen"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
          💡 Klicken Sie auf die Karte, um einen Standort zu markieren.
        </p>
      </div>
    </div>
  );
};

export default Step4Component;
