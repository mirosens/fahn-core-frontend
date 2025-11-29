// app/global-error.tsx - Globale Fallback-Fehlerkomponente
// Wird nur verwendet, wenn error.tsx im Root-Layout fehlschlägt

"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-bold">Kritischer Fehler</h1>
            <p className="mb-8 text-muted-foreground">
              Es ist ein schwerwiegender Fehler aufgetreten. Bitte versuchen Sie
              es später erneut oder kontaktieren Sie den Support.
            </p>
            <button
              onClick={reset}
              className="rounded-md bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
