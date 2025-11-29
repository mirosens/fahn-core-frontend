// app/(public)/informationen/page.tsx - Informationen (öffentliche Seite)

// ISR: Revalidation alle 300 Sekunden (statische Inhalte)
export const revalidate = 300;

export default async function InformationenPage() {
  // TODO: In späterer Phase: Inhalte von TYPO3 laden
  // const page = await typo3Client.getPage("informationen");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Informationen</h1>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            Über das Fahndungsportal
          </h2>
          <p className="mb-4 text-muted-foreground">
            Das Fahndungsportal der Polizei Baden-Württemberg ermöglicht es der
            Öffentlichkeit, aktiv bei der Aufklärung von Straftaten zu helfen.
          </p>
        </section>

        <section className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Wie funktioniert es?</h2>
          <ol className="space-y-3 text-muted-foreground">
            <li>
              <strong>Fahndungen einsehen:</strong> Durchsuchen Sie die Liste
              der öffentlichen Fahndungen.
            </li>
            <li>
              <strong>Hinweise geben:</strong> Wenn Sie relevante Informationen
              haben, können Sie diese über das Kontaktformular übermitteln.
            </li>
            <li>
              <strong>Vertraulichkeit:</strong> Alle Hinweise werden streng
              vertraulich behandelt.
            </li>
          </ol>
        </section>

        <section className="mb-8 rounded-lg border bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Kontakt</h2>
          <p className="mb-4 text-muted-foreground">
            Bei Fragen zum Fahndungsportal oder für allgemeine Informationen
            wenden Sie sich bitte an:
          </p>
          <div className="space-y-2 text-muted-foreground">
            <p>
              <strong>Polizei Baden-Württemberg</strong>
            </p>
            <p>Fahndungsportal</p>
            <p className="mt-4">
              <strong>Notfall:</strong> Polizeinotruf 110
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
