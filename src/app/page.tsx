// app/page.tsx - Startseite mit ISR
import { typo3Client } from "@/lib/typo3Client";
import { ApiError } from "@/lib/api-error";
import Link from "next/link";

// ISR: Revalidation alle 120 Sekunden
export const revalidate = 120;

export default async function HomePage() {
  // Aktuelle Fahndungen für Startseite (limitierte Anzahl)
  let fahndungen;
  let hasError = false;
  let errorMessage: string | null = null;

  try {
    fahndungen = await typo3Client.getFahndungen(
      new URLSearchParams({ limit: "3" }),
      {
        cache: "force-cache",
        next: { tags: ["fahndungen:list"] },
      }
    );
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
    fahndungen = { items: [] };
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold">
          Die Polizei bittet um Ihre Mithilfe
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Das Fahndungsportal der Polizei Baden-Württemberg unterstützt die
          Öffentlichkeit bei der Aufklärung von Straftaten. Bitte melden Sie
          sich, wenn Sie Hinweise zu den hier veröffentlichten Fahndungen haben.
        </p>

        {hasError && errorMessage && (
          <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-destructive">{errorMessage}</p>
          </div>
        )}

        {fahndungen.items.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Aktuelle Fahndungen</h2>
            <div className="space-y-4">
              {fahndungen.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="mb-2 text-xl font-semibold">
                    <Link
                      href={`/fahndungen/${item.slug}`}
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  {item.description && (
                    <p className="mb-4 text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <Link
                    href={`/fahndungen/${item.slug}`}
                    className="text-primary hover:underline"
                  >
                    Details anzeigen →
                  </Link>
                </article>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/fahndungen"
                className="inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Alle Fahndungen anzeigen
              </Link>
            </div>
          </section>
        )}

        <section className="rounded-lg border bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Wichtige Hinweise</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              • Bei akuten Notfällen wählen Sie bitte sofort den{" "}
              <strong>Polizeinotruf 110</strong>
            </li>
            <li>
              • Hinweise können Sie über das Kontaktformular auf den
              Detailseiten der Fahndungen übermitteln
            </li>
            <li>
              • Alle Informationen werden vertraulich behandelt und nur für
              polizeiliche Zwecke verwendet
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
