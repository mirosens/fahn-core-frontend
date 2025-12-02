"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { typo3Client, type FahndungItem } from "@/lib/typo3Client";
import { useStableSearchParams } from "./useStableSearchParams";

interface UseFahndungenOptions {
  enabled?: boolean;
}

interface UseFahndungenResult {
  fahndungen: FahndungItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom Hook für das Laden von Fahndungen
 *
 * Kapselt die gesamte Data-Fetching-Logik und verhindert
 * Endlosschleifen durch stabile searchParams-Dependencies.
 *
 * @param options - Optionen für den Hook
 * @returns Fahndungen-Daten, Loading-State, Error-State und Refetch-Funktion
 */
export function useFahndungen(
  options: UseFahndungenOptions = {}
): UseFahndungenResult {
  const { enabled = true } = options;
  const [fahndungen, setFahndungen] = useState<FahndungItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verwende stabilisierte searchParams
  const { searchParams, searchTerm, fahndungsart, dienststelle } =
    useStableSearchParams();

  // Ref für den letzten Fetch-Key, um Duplikate zu vermeiden
  const lastFetchKeyRef = useRef<string>("");
  const isFetchingRef = useRef(false);

  // Erstelle einen stabilen Key für den Fetch mit useMemo
  const fetchKey = useMemo(
    () => `${searchTerm}|${fahndungsart}|${dienststelle}`,
    [searchTerm, fahndungsart, dienststelle]
  );

  // Lade Fahndungen aus localStorage (provisorisch)
  const loadLocalStorageFahndungen = (): FahndungItem[] => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem("fahndungen");
      if (!stored) return [];

      const investigations = JSON.parse(stored) as Array<{
        id: string;
        title: string;
        category: string;
        description?: string;
        sachverhalt?: string;
        personenbeschreibung?: string;
        caseNumber?: string;
        office?: string;
        delikt?: string;
        eventTime?: string;
        mainLocation?: { address?: string; lat?: number; lng?: number } | null;
        mainImage?: string;
        publishStatus?: string;
        createdAt?: string;
      }>;

      // Konvertiere zu FahndungItem-Format
      return investigations.map((inv) => {
        // Mappe Kategorie zu type
        const categoryToType: Record<string, FahndungItem["type"]> = {
          WANTED_PERSON: "wanted",
          MISSING_PERSON: "missing_person",
          UNKNOWN_DEAD: "wanted",
          STOLEN_GOODS: "wanted",
        };

        const type = categoryToType[inv.category] || "wanted";

        // Erstelle Slug aus Titel
        const slug = inv.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        // Kombiniere Beschreibungen
        const description = inv.description || inv.sachverhalt || "";
        const summary =
          description.length > 150
            ? description.substring(0, 150) + "..."
            : description;

        return {
          id: parseInt(inv.id.replace(/\D/g, "")) || Date.now(),
          title: inv.title,
          description: description,
          summary: summary,
          status: inv.publishStatus === "immediate" ? "active" : "active",
          type: type,
          location: inv.mainLocation?.address,
          delikt: inv.delikt,
          publishedAt: inv.createdAt || new Date().toISOString(),
          slug: slug,
          image: inv.mainImage
            ? {
                url: inv.mainImage,
                alternative: inv.title,
              }
            : undefined,
          isNew: true,
          date: inv.eventTime,
          kategorie: inv.category,
          tatzeit: inv.eventTime,
          dienststelle: inv.office,
        } as FahndungItem;
      });
    } catch (err) {
      console.error("[useFahndungen] Fehler beim Laden aus localStorage:", err);
      return [];
    }
  };

  const fetchFahndungen = async () => {
    // Verhindere parallele Fetches
    if (isFetchingRef.current) {
      return;
    }

    // Verhindere Duplikate
    if (fetchKey === lastFetchKeyRef.current) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchKeyRef.current = fetchKey;

    setIsLoading(true);
    setError(null);

    try {
      const response = await typo3Client.getFahndungen(searchParams);

      console.log(
        "[useFahndungen] Geladene Fahndungen:",
        response.items.length,
        response.items
      );

      // Lade auch Fahndungen aus localStorage und kombiniere sie
      const localFahndungen = loadLocalStorageFahndungen();
      console.log(
        "[useFahndungen] Fahndungen aus localStorage:",
        localFahndungen.length
      );

      // Kombiniere Typo3-Fahndungen mit localStorage-Fahndungen
      // localStorage-Fahndungen haben Priorität (werden zuerst angezeigt)
      const allFahndungen = [...localFahndungen, ...(response.items || [])];

      setFahndungen(allFahndungen);
    } catch (err) {
      console.error("[useFahndungen] Fehler beim Laden der Fahndungen:", err);
      setError("Die Fahndungen konnten nicht geladen werden.");

      // Bei Fehler: Lade nur localStorage-Fahndungen
      const localFahndungen = loadLocalStorageFahndungen();
      if (localFahndungen.length > 0) {
        setFahndungen(localFahndungen);
        setError(null); // Kein Fehler, wenn localStorage-Fahndungen vorhanden sind
      } else {
        // Fallback: Mock-Daten verwenden
        try {
          const { mockFahndungen } = await import("@/lib/mockFahndungen");
          setFahndungen(mockFahndungen);
        } catch (mockError) {
          console.error(
            "[useFahndungen] Fehler beim Laden der Mock-Daten:",
            mockError
          );
          setFahndungen([]);
        }
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Fetch beim Mount und wenn sich die Parameter ändern
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    void fetchFahndungen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fetchKey]);

  return {
    fahndungen,
    isLoading,
    error,
    refetch: fetchFahndungen,
  };
}
