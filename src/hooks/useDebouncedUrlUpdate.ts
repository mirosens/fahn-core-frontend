"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface UrlUpdateParams {
  searchTerm?: string;
  fahndungsart?: string;
  dienststelle?: string;
}

/**
 * Hook für debounced URL-Updates
 *
 * Verhindert zu häufige URL-Updates und damit Endlosschleifen.
 * Updates werden um 300ms verzögert, um mehrere schnelle Änderungen
 * zu bündeln.
 *
 * @returns Funktion zum Aktualisieren der URL mit Debouncing
 */
export function useDebouncedUrlUpdate() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);

  const updateUrl = useCallback(
    (params: UrlUpdateParams) => {
      // Lösche vorherigen Timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Setze Flag, dass Update läuft
      isUpdatingRef.current = true;

      // Debounce das Update
      timeoutRef.current = setTimeout(() => {
        const urlParams = new URLSearchParams();

        if (params.searchTerm?.trim()) {
          urlParams.set("q", params.searchTerm.trim());
        }
        if (params.fahndungsart && params.fahndungsart !== "alle") {
          urlParams.set("fahndungsart", params.fahndungsart);
        }
        if (params.dienststelle && params.dienststelle !== "alle") {
          urlParams.set("dienststelle", params.dienststelle);
        }

        const url = urlParams.toString() ? `/?${urlParams.toString()}` : "/";

        // Ändere URL mit window.history.replaceState - das scrollt nicht
        // Dann aktualisiere Next.js Router ohne Navigation
        if (typeof window !== "undefined") {
          window.history.replaceState({ ...window.history.state }, "", url);
          // Trigger Router-Update ohne Navigation (kein Scroll)
          router.refresh();
        }

        // Reset Flag nach kurzer Verzögerung
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }, 300);
    },
    [router]
  );

  return {
    updateUrl,
    isUpdating: () => isUpdatingRef.current,
  };
}
