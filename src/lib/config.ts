// src/lib/config.ts

import { env } from "@/env";

/**
 * Ermittelt die T3 API Base URL basierend auf der Laufzeitumgebung.
 * Auf dem Server werden serverseitige Variablen verwendet,
 * auf dem Client die öffentlichen NEXT_PUBLIC_* Variablen.
 */
function getT3ApiBaseUrl(): string {
  // Prüfe ob wir auf dem Server sind
  if (typeof window === "undefined") {
    // Server-seitig: Verwende serverseitige Env-Variablen
    const serverUrl = env.T3_API_BASE_URL ?? env.TYPO3_BASE_URL;
    if (!serverUrl) {
      throw new Error(
        "T3_API_BASE_URL or TYPO3_BASE_URL must be set on the server – check environment configuration."
      );
    }
    return serverUrl;
  } else {
    // Client-seitig: Verwende öffentliche Env-Variablen
    // Fallback auf Standard-DDEV-URL wenn nicht gesetzt
    const clientUrl =
      env.NEXT_PUBLIC_T3_API_BASE_URL ?? "https://fahn-core-typo3.ddev.site";
    return clientUrl;
  }
}

export const t3ApiBaseUrl = getT3ApiBaseUrl();
