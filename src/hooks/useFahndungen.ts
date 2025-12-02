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

      setFahndungen(response.items || []);
    } catch (err) {
      console.error("[useFahndungen] Fehler beim Laden der Fahndungen:", err);
      setError("Die Fahndungen konnten nicht geladen werden.");

      // Bei Fehler Mock-Daten verwenden
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
