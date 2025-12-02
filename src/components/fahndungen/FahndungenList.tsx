// components/fahndungen/FahndungenList.tsx - WCAG 2.2 AA konforme Listendarstellung
"use client";

import { FahndungCard } from "./FahndungCard";

interface FahndungItem {
  id: number;
  title: string;
  description?: string;
  summary: string;
  status: "active" | "completed" | "archived";
  type: "missing_person" | "witness_appeal" | "wanted";
  location?: string;
  delikt?: string;
  publishedAt: string;
  slug: string;
  image?: {
    url: string;
    alternative: string;
  };
}

interface FahndungenListProps {
  fahndungen: FahndungItem[];
  totalCount?: number;
  isLoading?: boolean;
  error?: string | null;
  emptyStateMessage?: string;
  className?: string;
}

export function FahndungenList({
  fahndungen,
  totalCount,
  isLoading = false,
  error = null,
  emptyStateMessage = "Keine Fahndungen gefunden",
  className,
}: FahndungenListProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="sr-only" aria-live="polite">
          Fahndungen werden geladen...
        </div>
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-label="Lade Fahndungen"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-card p-4"
            >
              <div className="mb-3 h-4 w-24 rounded bg-muted"></div>
              <div className="mb-2 h-6 w-full rounded bg-muted"></div>
              <div className="mb-4 space-y-2">
                <div className="h-3 w-full rounded bg-muted"></div>
                <div className="h-3 w-3/4 rounded bg-muted"></div>
              </div>
              <div className="h-4 w-32 rounded bg-muted"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-6"
          role="alert"
          aria-labelledby="fahndungen-error-title"
        >
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0">
              <svg
                className="h-6 w-6 text-destructive"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2
                id="fahndungen-error-title"
                className="text-lg font-semibold text-destructive"
              >
                Fehler beim Laden der Fahndungen
              </h2>
              <p className="mt-2 text-sm text-destructive/80">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center rounded-md border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (!fahndungen.length) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
          <div className="mx-auto max-w-md">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286"
              />
            </svg>
            <h2 className="mt-4 text-lg font-semibold">
              Keine Fahndungen gefunden
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {emptyStateMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Live Region für Screen Reader */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {fahndungen.length} Fahndung{fahndungen.length !== 1 ? "en" : ""}
        {totalCount ? ` von insgesamt ${totalCount}` : ""} geladen
      </div>

      {/* Ergebnis-Header */}
      {totalCount !== undefined && (
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">
            Fahndungen
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({totalCount} {totalCount === 1 ? "Ergebnis" : "Ergebnisse"})
            </span>
          </h2>
        </div>
      )}

      {/* Fahndungen-Grid mit Container Queries */}
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 @4xl:grid-cols-4"
        role="main"
        aria-label={`Liste mit ${fahndungen.length} Fahndung${fahndungen.length !== 1 ? "en" : ""}`}
      >
        {fahndungen.map((fahndung, index) => (
          <FahndungCard
            key={fahndung.id}
            fahndung={fahndung}
            priority={index < 3} // LCP-Optimierung für erste 3 Items
          />
        ))}
      </div>

      {/* Accessibility: Skip Link für viele Ergebnisse */}
      {fahndungen.length > 12 && (
        <div className="text-center pt-6">
          <a
            href="#fahndungen-pagination"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Zur Navigation springen
          </a>
        </div>
      )}
    </div>
  );
}
