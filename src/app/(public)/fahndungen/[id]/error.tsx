// app/(public)/fahndungen/[id]/error.tsx - Fehler für Detailansicht

"use client";

import { useEffect } from "react";
import { ApiError } from "@/lib/api-error";
import Link from "next/link";

export default function FahndungDetailError({
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

  const isServerError =
    apiError && apiError.status !== undefined && apiError.status >= 500;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">
        Fehler beim Laden der Fahndung
      </h1>
      <div
        className="rounded-lg border border-destructive bg-destructive/10 p-6"
        role="alert"
      >
        <p className="mb-4 text-destructive">
          {isServerError
            ? "Das Fahndungsportal ist derzeit nicht vollständig erreichbar. Bitte versuchen Sie es später erneut."
            : "Es ist ein unerwarteter Fehler aufgetreten."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Erneut versuchen
          </button>
          <Link
            href="/fahndungen"
            className="rounded-md border border-border px-4 py-2 text-center transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Zur Übersicht
          </Link>
        </div>
      </div>
    </div>
  );
}
