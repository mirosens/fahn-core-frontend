// app/error.tsx - Globale Error Boundary

"use client";

import { useEffect } from "react";
import { ApiError } from "@/lib/api-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const apiError: ApiError | null = error instanceof ApiError ? error : null;

  useEffect(() => {
    // Log error to monitoring service in production
    if (apiError) {
      console.error("API Error:", {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
        requestId: apiError.requestId,
        url: apiError.url,
      });
    } else {
      console.error("Unexpected error:", error);
    }
  }, [error, apiError]);

  const isServerError =
    apiError && apiError.status !== undefined && apiError.status >= 500;
  const isZodError = apiError && apiError.code === "T3_ZOD_PARSE_ERROR";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Ein Fehler ist aufgetreten</h1>
      <div
        className="rounded-lg border border-destructive bg-destructive/10 p-6"
        role="alert"
      >
        <p className="mb-4 text-destructive">
          {isServerError
            ? "Das Fahndungsportal ist derzeit nicht vollständig erreichbar. Bitte versuchen Sie es später erneut."
            : isZodError
              ? "Die Daten konnten nicht korrekt verarbeitet werden. Bitte versuchen Sie es später erneut."
              : "Es ist ein unerwarteter Fehler aufgetreten."}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
