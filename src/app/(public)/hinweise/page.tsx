// app/(public)/hinweise/page.tsx - Hinweise geben (öffentliche Seite)

// ISR: Revalidation alle 300 Sekunden (statische Inhalte)
export const revalidate = 300;

export default async function HinweisePage() {
  // TODO: In späterer Phase: Formular-Definition von TYPO3 laden
  // const formDefinition = await typo3Client.getFormDefinition("hinweis-formular");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Hinweise geben</h1>

        <section className="mb-8">
          <p className="mb-4 text-lg text-muted-foreground">
            Wenn Sie Informationen zu einer Fahndung haben, können Sie diese
            hier übermitteln. Ihre Hinweise werden vertraulich behandelt und nur
            für polizeiliche Zwecke verwendet.
          </p>

          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="font-semibold text-destructive">
              ⚠️ Bei akuten Notfällen wählen Sie bitte sofort den{" "}
              <strong>Polizeinotruf 110</strong>
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">
            Hinweis zu einer Fahndung übermitteln
          </h2>
          <p className="mb-4 text-muted-foreground">
            Bitte wählen Sie zunächst die Fahndung aus, zu der Sie einen Hinweis
            haben:
          </p>
          <div className="rounded-md border border-dashed border-muted-foreground/30 p-8 text-center">
            <p className="text-muted-foreground">
              Das Hinweisformular wird in einer späteren Phase implementiert.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Bitte nutzen Sie vorerst die Kontaktformulare auf den Detailseiten
              der Fahndungen.
            </p>
          </div>
        </section>

        <section className="rounded-lg border bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Wichtige Informationen</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>
              <strong>Vertraulichkeit:</strong> Alle Hinweise werden streng
              vertraulich behandelt.
            </li>
            <li>
              <strong>Anonymität:</strong> Sie können Hinweise auch anonym
              übermitteln.
            </li>
            <li>
              <strong>Verwendung:</strong> Ihre Informationen werden
              ausschließlich für polizeiliche Zwecke verwendet.
            </li>
            <li>
              <strong>Rückmeldung:</strong> Aufgrund der hohen Anzahl von
              Hinweisen können wir nicht auf jeden Hinweis individuell
              antworten.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
