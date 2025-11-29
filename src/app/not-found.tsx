// app/not-found.tsx - Globale 404-Seite

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Seite nicht gefunden</h2>
        <p className="mb-8 text-muted-foreground">
          Die angeforderte Seite konnte nicht gefunden werden. Möglicherweise
          wurde sie verschoben oder gelöscht.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Zur Startseite
          </Link>
          <Link
            href="/fahndungen"
            className="inline-block rounded-md border border-border px-6 py-3 transition-colors hover:bg-accent"
          >
            Zu den Fahndungen
          </Link>
        </div>
      </div>
    </div>
  );
}
