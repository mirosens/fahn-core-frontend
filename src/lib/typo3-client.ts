// src/lib/api/typo3-client.ts
import { ApiResponse, Fahndung, User, SessionResponse } from "@/lib/types";
import { ApiError } from "@/lib/api-error";
import { t3ApiBaseUrl } from "@/lib/config";

const API_BASE_URL = t3ApiBaseUrl;

/**
 * Generischer Request Wrapper
 */
async function client<T>(
  endpoint: string,
  { body, ...customConfig }: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = { "Content-Type": "application/json" };

  const config: RequestInit = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    credentials: "include", // KRITISCH: Sendet fe_typo_user Cookie mit
  };

  if (body) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let response: Response;
  const isClient = typeof window !== "undefined";

  // Auf dem Client: Verwende Proxy-Route, um CORS zu vermeiden
  // Auf dem Server: Direkte URL verwenden
  let fullUrl: string;
  if (isClient) {
    // Endpoint beginnt mit '?', daher Proxy-Route verwenden
    fullUrl = `/api/typo3${endpoint}`;
  } else {
    // Server-seitig: Direkte URL
    fullUrl = `${API_BASE_URL}${endpoint}`;
  }

  try {
    response = await fetch(fullUrl, config);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unbekannter Fehler";

    throw new ApiError({
      message: `Netzwerkfehler: Das TYPO3-Backend ist unter ${fullUrl} nicht erreichbar. Bitte prüfen Sie, ob das Backend läuft (ddev start) und die URL in .env.local korrekt ist. Fehler: ${errorMessage}`,
      status: 0,
      url: fullUrl,
      cause: error,
    });
  }

  // Handle 401 Unauthorized global
  if (response.status === 401) {
    throw new ApiError({
      message: "Nicht autorisiert",
      status: 401,
    });
  }

  let data: ApiResponse<T>;
  try {
    // Handle 204 No Content for successful logout etc.
    if (response.status === 204) {
      return { data: null } as ApiResponse<T>;
    }
    data = await response.json();
  } catch (error) {
    throw new ApiError({
      message: "Ungültige JSON-Antwort vom Server",
      status: response.status,
      cause: error,
    });
  }

  if (!response.ok) {
    // Wenn es ein 404 ist, stammt dieser vom TYPO3-Backend.
    if (response.status === 404) {
      throw new ApiError({
        message:
          data.error ||
          `Route nicht gefunden: Das TYPO3-Backend meldet 404 Not Found für die URL ${fullUrl}. Mögliche Ursachen: TypoScript-Konfiguration nicht geladen, Endpunkt deaktiviert oder URL-Parameter inkorrekt.`,
        status: 404,
        url: fullUrl,
      });
    }

    throw new ApiError({
      message: data.error || "Ein unbekannter Fehler ist aufgetreten",
      status: response.status,
      url: fullUrl,
    });
  }

  return data;
}

// --- API METHODEN ---

export const typo3Client = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    client<{ user: User }>("?tx_fahncore_login[action]=login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    client<void>("?tx_fahncore_login[action]=logout", {
      method: "POST",
    }),

  getSession: () =>
    client<SessionResponse>("?tx_fahncore_login[action]=session"),

  // Fahndungen
  getFahndungen: (page = 1, limit = 10, search = "") => {
    const params = new URLSearchParams({
      "tx_fahncorefahndung_api[action]": "list",
      "tx_fahncorefahndung_api[page]": page.toString(),
      "tx_fahncorefahndung_api[limit]": limit.toString(),
    });
    if (search) {
      params.append("tx_fahncorefahndung_api[search]", search);
    }
    return client<Fahndung[]>(`?${params.toString()}`);
  },

  getFahndung: (uid: number) =>
    client<Fahndung>(
      `?tx_fahncorefahndung_api[action]=show&tx_fahncorefahndung_api[uid]=${uid}`
    ),

  createFahndung: (data: Partial<Fahndung>) =>
    client<Fahndung>("?tx_fahncorefahndung_api[action]=create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateFahndung: (uid: number, data: Partial<Fahndung>) =>
    client<Fahndung>(
      `?tx_fahncorefahndung_api[action]=update&tx_fahncorefahndung_api[uid]=${uid}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  deleteFahndung: (uid: number) =>
    client<void>(
      `?tx_fahncorefahndung_api[action]=delete&tx_fahncorefahndung_api[uid]=${uid}`,
      {
        method: "DELETE",
      }
    ),
};
