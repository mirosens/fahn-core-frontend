"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Stabilisierter Hook für searchParams
 *
 * Next.js useSearchParams() gibt bei jedem Render ein neues Objekt zurück,
 * auch wenn sich die Werte nicht geändert haben. Dieser Hook extrahiert
 * die Parameter-Werte und gibt nur dann neue Werte zurück, wenn sie sich
 * tatsächlich geändert haben.
 *
 * @returns Stabilisierte Parameter-Werte
 */
export function useStableSearchParams() {
  const searchParams = useSearchParams();

  // Extrahiere Parameter-Werte
  const searchTerm = searchParams.get("q") || searchParams.get("search") || "";
  const fahndungsart = searchParams.get("fahndungsart") || null;
  const dienststelle = searchParams.get("dienststelle") || null;

  // Verwende useMemo mit den tatsächlichen Werten als Dependencies
  // Das stellt sicher, dass nur bei echten Änderungen neu berechnet wird
  return useMemo(
    () => ({
      searchTerm,
      fahndungsart,
      dienststelle,
      searchParams, // Behalte die originale searchParams-Instanz für API-Calls
    }),
    [searchTerm, fahndungsart, dienststelle, searchParams]
  );
}
