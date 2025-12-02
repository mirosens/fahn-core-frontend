"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hook der die Scroll-Position erhält, wenn sich die URL ändert
 * Verhindert, dass Next.js Router-Navigation die Scroll-Position zurücksetzt
 * Vereinfachte und robuste Version ohne aggressives Intervall-Checking
 */
export function usePreserveScroll() {
  const scrollPositionRef = useRef<number>(0);
  const isRestoringRef = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlKeyRef = useRef<string>("");

  useEffect(() => {
    // Erstelle einen eindeutigen URL-Key
    const currentUrlKey = `${pathname}?${searchParams.toString()}`;

    // Wenn sich die URL geändert hat, speichere die aktuelle Scroll-Position
    if (urlKeyRef.current && urlKeyRef.current !== currentUrlKey) {
      scrollPositionRef.current = window.scrollY;
    }

    urlKeyRef.current = currentUrlKey;

    // Speichere Scroll-Position bei jedem Scroll-Event (nur wenn nicht am Wiederherstellen)
    const saveScrollPosition = () => {
      if (!isRestoringRef.current) {
        scrollPositionRef.current = window.scrollY;
      }
    };

    window.addEventListener("scroll", saveScrollPosition, { passive: true });

    // Stelle Scroll-Position nach URL-Änderung wieder her
    // Verwende requestAnimationFrame für zuverlässige Wiederherstellung
    const restoreScroll = () => {
      if (isRestoringRef.current) return;

      const savedScroll = scrollPositionRef.current;
      if (savedScroll > 0 && window.scrollY !== savedScroll) {
        isRestoringRef.current = true;

        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedScroll,
            behavior: "instant" as ScrollBehavior,
          });

          // Reset Flag nach kurzer Verzögerung
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
        });
      }
    };

    // Stelle Scroll-Position nach kurzer Verzögerung wieder her
    const timeoutId = setTimeout(restoreScroll, 0);

    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
      clearTimeout(timeoutId);
    };
  }, [pathname, searchParams]);
}
