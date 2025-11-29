// src/lib/t3Fetch.ts

import { ApiError } from "./api-error";
import { t3ApiBaseUrl } from "./config";

export type T3FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  requestId?: string;
};

const DEFAULT_TIMEOUT_MS = 8000;

export async function t3Fetch<TResponse = unknown>(
  path: string,
  options: T3FetchOptions = {}
): Promise<TResponse> {
  const { method = "GET", headers = {}, body, timeoutMs, requestId } = options;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  const url = new URL(path, t3ApiBaseUrl).toString();
  const effectiveRequestId =
    requestId ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : undefined);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(effectiveRequestId ? { "X-Request-ID": effectiveRequestId } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store", // Caching-Strategie wird in späterer Phase (B.4) feinjustiert
    });

    if (!response.ok) {
      const text = await safeReadText(response);

      throw new ApiError({
        message: `Request to TYPO3 failed with status ${response.status}`,
        status: response.status,
        code: "T3_HTTP_ERROR",
        requestId: effectiveRequestId,
        url,
        cause: text,
      });
    }

    const json = (await response.json()) as TResponse;
    return json;
  } catch (error) {
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

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      message: "Unexpected error during TYPO3 request",
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
