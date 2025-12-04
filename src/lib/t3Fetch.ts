// src/lib/t3Fetch.ts

import { ApiError } from "./api-error";
import { t3ApiBaseUrl } from "./config";

export type T3FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  requestId?: string;
  cache?: RequestCache;
  next?: {
    tags?: string[];
    revalidate?: number | false;
  };
};

const DEFAULT_TIMEOUT_MS = 8000;

export async function t3Fetch<TResponse = unknown>(
  path: string,
  options: T3FetchOptions = {}
): Promise<TResponse> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs,
    requestId,
    cache,
    next,
  } = options;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  let url: string;
  const isClient = typeof window !== "undefined";

  try {
    // Prüfe ob path bereits eine vollständige URL ist
    if (path.startsWith("http://") || path.startsWith("https://")) {
      // Auf dem Client: Verwende Proxy-Route, um CORS zu vermeiden
      if (isClient) {
        // Extrahiere den Pfad und Query-Parameter aus der vollständigen URL
        const fullUrl = new URL(path);
        const queryString = fullUrl.search;

        // Für Root-Pfad (z.B. /?type=10000) verwenden wir einen speziellen Pfad
        if (fullUrl.pathname === "/" || fullUrl.pathname === "") {
          url = `/api/typo3${queryString}`;
        } else {
          const pathParts = fullUrl.pathname.split("/").filter(Boolean);
          url = `/api/typo3/${pathParts.join("/")}${queryString}`;
        }
      } else {
        // Auf dem Server: Direkte URL verwenden
        url = path;
      }
    } else {
      // Normalisiere Base-URL: Stelle sicher, dass sie mit / endet
      const normalizedBase = t3ApiBaseUrl.endsWith("/")
        ? t3ApiBaseUrl
        : `${t3ApiBaseUrl}/`;

      // Entferne führendes / vom Pfad, damit er relativ zur Base-URL ist
      const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

      const targetUrl = new URL(normalizedPath, normalizedBase);

      // Auf dem Client: Verwende Proxy-Route
      if (isClient) {
        const pathParts = targetUrl.pathname.split("/").filter(Boolean);
        const queryString = targetUrl.search;
        if (pathParts.length === 0) {
          url = `/api/typo3${queryString}`;
        } else {
          url = `/api/typo3/${pathParts.join("/")}${queryString}`;
        }
      } else {
        // Auf dem Server: Direkte URL verwenden
        url = targetUrl.toString();
      }
    }
  } catch (urlError) {
    throw new ApiError({
      message: `Invalid URL construction: ${path} with base ${t3ApiBaseUrl}`,
      code: "T3_INVALID_URL",
      requestId,
      cause: urlError,
    });
  }

  const effectiveRequestId =
    requestId ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : undefined);

  // Debug logging (nur in Development)
  if (process.env.NODE_ENV === "development") {
    console.log("[t3Fetch] Requesting URL:", url);
    console.log("[t3Fetch] Method:", method);
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(effectiveRequestId ? { "X-Request-ID": effectiveRequestId } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: cache ?? "no-store",
    };

    // Next.js 15: next-Optionen für Caching-Tags und Revalidation
    if (next) {
      (
        fetchOptions as RequestInit & {
          next?: { tags?: string[]; revalidate?: number | false };
        }
      ).next = next;
    }

    const response = await fetch(url, fetchOptions);

    if (process.env.NODE_ENV === "development") {
      console.log("[t3Fetch] Response status:", response.status);
      console.log(
        "[t3Fetch] Response headers:",
        Object.fromEntries(response.headers.entries())
      );
    }

    if (!response.ok) {
      const text = await safeReadText(response);
      if (process.env.NODE_ENV === "development") {
        console.error("[t3Fetch] Error response:", text);
      }

      throw new ApiError({
        message: `Request to TYPO3 failed with status ${response.status}`,
        status: response.status,
        code: "T3_HTTP_ERROR",
        requestId: effectiveRequestId,
        url,
        cause: text,
      });
    }

    let json: TResponse;
    try {
      json = (await response.json()) as TResponse;
    } catch (jsonError) {
      throw new ApiError({
        message: "Failed to parse JSON response from TYPO3",
        status: response.status,
        code: "T3_JSON_PARSE_ERROR",
        requestId: effectiveRequestId,
        url,
        cause: jsonError,
      });
    }
    return json;
  } catch (error) {
    // AbortError (Timeout)
    if ((error as Error).name === "AbortError") {
      throw new ApiError({
        message: "Request to TYPO3 timed out",
        status: 504,
        code: "T3_TIMEOUT",
        requestId: effectiveRequestId,
        url,
        cause: error,
      });
    }

    // Network-Fehler (ECONNREFUSED, ENOTFOUND, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError({
        message: `Network error: Unable to connect to TYPO3 API at ${url}. Please check if the API is running and T3_API_BASE_URL is correct.`,
        code: "T3_NETWORK_ERROR",
        requestId: effectiveRequestId,
        url,
        cause: error,
      });
    }

    // Bereits ApiError - weiterwerfen
    if (error instanceof ApiError) {
      throw error;
    }

    // Unerwarteter Fehler mit mehr Details
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "UnknownError";

    throw new ApiError({
      message: `Unexpected error during TYPO3 request: ${errorName} - ${errorMessage}`,
      code: "T3_UNKNOWN_ERROR",
      requestId: effectiveRequestId,
      url,
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function safeReadText(response: Response): Promise<string | undefined> {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}
