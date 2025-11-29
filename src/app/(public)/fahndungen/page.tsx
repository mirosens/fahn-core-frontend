// app/(public)/fahndungen/page.tsx

import { typo3Client } from "@/lib/typo3Client";
import { ApiError } from "@/lib/api-error";

/* eslint-disable react-hooks/error-boundaries */
export default async function FahndungenPage() {
  try {
    const data = await typo3Client.getFahndungen();

    if (!data.items.length) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-4 text-2xl font-bold">Öffentliche Fahndungen</h1>
          <p className="text-muted-foreground">
            Aktuell liegen keine öffentlichen Fahndungen vor.
          </p>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Öffentliche Fahndungen</h1>
        <div className="space-y-4">
          {data.items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <h2 className="mb-2 text-xl font-semibold">{item.title}</h2>
              {item.description && (
                <p className="mb-4 text-muted-foreground">{item.description}</p>
              )}
              {item.status && (
                <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm">
                  {item.status}
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status && error.status >= 500) {
        return (
          <div className="container mx-auto px-4 py-8">
            <h1 className="mb-4 text-2xl font-bold">Fahndungsportal</h1>
            <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
              <p className="text-destructive">
                Das Fahndungsportal ist derzeit nicht vollständig erreichbar.
                Bitte versuchen Sie es später erneut.
              </p>
            </div>
          </div>
        );
      }

      if (error.status === 404) {
        return (
          <div className="container mx-auto px-4 py-8">
            <h1 className="mb-4 text-2xl font-bold">Fahndungen</h1>
            <p className="text-muted-foreground">
              Die angeforderte Seite wurde nicht gefunden.
            </p>
          </div>
        );
      }
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Fahndungsportal</h1>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <p className="text-destructive">
            Es ist ein unerwarteter Fehler aufgetreten.
          </p>
        </div>
      </div>
    );
  }
}
