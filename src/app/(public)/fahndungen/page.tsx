// app/(public)/fahndungen/page.tsx - Listenansicht mit ISR

import { typo3Client } from "@/lib/typo3Client";
import { ApiError } from "@/lib/api-error";
import Link from "next/link";

// ISR: Revalidation alle 60 Sekunden
export const revalidate = 60;

export default async function FahndungenPage() {
  let data;
  let hasError = false;
  let errorMessage: string | null = null;

  try {
    data = await typo3Client.getFahndungen(undefined, {
      cache: "force-cache",
      next: { tags: ["fahndungen:list"] },
    });
  } catch (error) {
    // Fehlerbehandlung: Zeige benutzerfreundliche Meldung
    hasError = true;
    if (error instanceof ApiError) {
      if (error.code === "T3_NETWORK_ERROR" || error.code === "T3_TIMEOUT") {
        errorMessage =
          "Die Verbindung zum Fahndungsportal konnte nicht hergestellt werden. Bitte versuchen Sie es später erneut.";
      } else {
        errorMessage =
          "Die Fahndungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.";
      }
    } else {
      errorMessage =
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
    }
    console.error("Fehler beim Laden der Fahndungen:", error);
    data = { items: [] };
  }

  if (!data.items.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Öffentliche Fahndungen</h1>
        <p className="text-muted-foreground">
          Aktuell liegen keine öffentlichen Fahndungen vor. Bitte prüfen Sie zu
          einem späteren Zeitpunkt erneut oder kontaktieren Sie bei akuten
          Hinweisen unmittelbar den Polizeinotruf 110.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Öffentliche Fahndungen</h1>

      {hasError && errorMessage && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{errorMessage}</p>
        </div>
      )}

      {!hasError && !data.items.length && (
        <div className="mb-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-muted-foreground">
            Aktuell liegen keine öffentlichen Fahndungen vor. Bitte prüfen Sie
            zu einem späteren Zeitpunkt erneut oder kontaktieren Sie bei akuten
            Hinweisen unmittelbar den Polizeinotruf 110.
          </p>
        </div>
      )}

      {data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="mb-2 text-xl font-semibold">
                <Link
                  href={`/fahndungen/${item.slug}`}
                  className="hover:underline"
                >
                  {item.title}
                </Link>
              </h2>
              {item.description && (
                <p className="mb-4 text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                {item.status && (
                  <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm">
                    {item.status}
                  </span>
                )}
                <Link
                  href={`/fahndungen/${item.slug}`}
                  className="text-primary hover:underline"
                >
                  Details anzeigen →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
