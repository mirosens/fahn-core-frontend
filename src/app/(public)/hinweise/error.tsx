// app/(public)/hinweise/error.tsx - Fehler für Hinweise-Seite

"use client";

import { useEffect } from "react";
import { ApiError } from "@/lib/api-error";

export default function HinweiseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const apiError: ApiError | null = error instanceof ApiError ? error : null;

  useEffect(() => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Fehler beim Laden der Seite</h1>
      <div
        className="rounded-lg border border-destructive bg-destructive/10 p-6"
        role="alert"
      >
        <p className="mb-4 text-destructive">
          Die Seite konnte nicht geladen werden. Bitte versuchen Sie es später
          erneut.
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
