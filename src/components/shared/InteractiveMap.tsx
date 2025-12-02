"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

// Leaflet Typen definieren
interface LeafletMap {
  remove(): void;
  setView(center: [number, number], zoom: number): LeafletMap;
  whenReady(callback: () => void): void;
  on(event: string, handler: (e: unknown) => void): void;
}

interface LeafletStatic {
  map(element: HTMLElement, options?: Record<string, unknown>): LeafletMap;
  Map?: unknown;
  tileLayer(
    url: string,
    options: Record<string, unknown>
  ): {
    addTo(map: LeafletMap): void;
  };
  circleMarker(
    latlng: [number, number],
    options: Record<string, unknown>
  ): {
    addTo(map: LeafletMap): void;
    bindPopup(content: string): void;
    on(event: string, handler: () => void): void;
  };
  circle(
    latlng: [number, number],
    options: Record<string, unknown>
  ): {
    addTo(map: LeafletMap): void;
  };
}

declare global {
  interface Window {
    L: LeafletStatic;
  }
}

export interface MapLocation {
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

interface InteractiveMapProps {
  locations: MapLocation[];
  center: [number, number];
  zoom: number;
  height: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  onLocationClick?: (location: MapLocation) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  center,
  zoom = 13,
  height,
  searchRadius = 5,
  showRadius = true,
  editable = false,
  onLocationClick,
  onMapClick,
}) => {
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Array<{ remove: () => void }>>([]);

  const getLocationTypeLabel = (type: MapLocation["type"]) => {
    const labels = {
      main: "Hauptort",
      tatort: "Tatort",
      wohnort: "Wohnort",
      arbeitsplatz: "Arbeitsplatz",
      sichtung: "Sichtung",
      sonstiges: "Sonstiges",
    };
    return labels[type] ?? "Sonstiges";
  };

  const getLocationTypeColor = (type: MapLocation["type"]) => {
    const colors = {
      main: "#3b82f6", // blue-500
      tatort: "#ef4444", // red-500
      wohnort: "#22c55e", // green-500
      arbeitsplatz: "#eab308", // yellow-500
      sichtung: "#f97316", // orange-500
      sonstiges: "#6b7280", // gray-500
    };
    return colors[type] ?? "#6b7280";
  };

  const mainLocation = locations.find((loc) => loc.type === "main");

  // Lade Leaflet dynamisch
  const loadLeaflet = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      // Lade Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      // Lade Leaflet JS
      if (!window.L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
    } catch {
      setMapError(true);
    }
  }, []);

  // Initialisiere Karte
  const initMap = useCallback(async () => {
    if (!mapRef.current || typeof window === "undefined") return;

    try {
      await loadLeaflet();
      const L = window.L;
      if (!L) {
        setMapError(true);
        return;
      }

      // Entferne alte Karte
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Entferne alte Marker
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Erstelle neue Karte
      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Füge Tile Layer hinzu (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Warte bis Karte bereit ist
      map.whenReady(() => {
        setIsLoading(false);
        setMapError(false);
      });

      // Marker für alle Standorte
      locations.forEach((location) => {
        const marker = L.circleMarker([location.lat, location.lng], {
          radius: 8,
          fillColor: getLocationTypeColor(location.type),
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        });

        marker
          .bindPopup(
            `<div class="p-2">
              <p class="font-semibold">${getLocationTypeLabel(location.type)}</p>
              <p class="text-sm">${location.address}</p>
            </div>`
          )
          .addTo(map);

        if (onLocationClick) {
          marker.on("click", () => {
            onLocationClick(location);
          });
        }

        markersRef.current.push(marker);
      });

      // Karten-Klick-Handler
      if (editable && onMapClick) {
        map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Radius-Kreis für Hauptstandort
      if (showRadius && mainLocation) {
        const circle = L.circle([mainLocation.lat, mainLocation.lng], {
          radius: searchRadius * 1000, // in Metern
          color: getLocationTypeColor("main"),
          fillColor: getLocationTypeColor("main"),
          fillOpacity: 0.1,
          weight: 2,
        });
        circle.addTo(map);
      }
    } catch (error) {
      console.error("Fehler beim Initialisieren der Karte:", error);
      setMapError(true);
      setIsLoading(false);
    }
  }, [
    center,
    zoom,
    locations,
    editable,
    onMapClick,
    onLocationClick,
    showRadius,
    searchRadius,
    mainLocation,
    loadLeaflet,
  ]);

  // Initialisiere Karte beim Mount
  useEffect(() => {
    // Verwende setTimeout, um setState nicht synchron im Effect aufzurufen
    const timeoutId = setTimeout(() => {
      void initMap();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [initMap]);

  // Aktualisiere Karte bei Änderungen
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading && !mapError) {
      // Verwende setTimeout, um setState nicht synchron im Effect aufzurufen
      const timeoutId = setTimeout(() => {
        void initMap();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [locations, center, zoom, initMap, isLoading, mapError]);

  if (mapError) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-muted dark:border-border">
        <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Karte konnte nicht geladen werden
        </p>
        <button
          onClick={() => {
            setMapError(false);
            setIsLoading(true);
            void initMap();
          }}
          className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: "100%",
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
      className="bg-muted"
    />
  );
};

export default InteractiveMap;
