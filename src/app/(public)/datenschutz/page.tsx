// app/(public)/datenschutz/page.tsx - Platzhalter

// Statische Seite, kann beliebig lange gecacht werden
export const revalidate = false;

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Datenschutzerklärung</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          Dieser Inhalt wird von TYPO3 bereitgestellt und in einer späteren
          Phase implementiert.
        </p>
        <p>
          Wir legen großen Wert auf den Schutz Ihrer Daten. Nachfolgend
          informieren wir Sie über die Verarbeitung Ihrer personenbezogenen
          Daten bei der Nutzung unseres Fahndungsportals.
        </p>
        <h2>1. Verantwortliche Stelle</h2>
        <p>
          Verantwortlich für die Datenverarbeitung ist die Polizei
          Baden-Württemberg.
        </p>
        <h2>2. Datenverarbeitung bei Hinweisabgabe</h2>
        <p>
          Wenn Sie einen Hinweis zu einer Fahndung abgeben, werden die von Ihnen
          gemachten Angaben ausschließlich für polizeiliche Ermittlungszwecke
          verwendet.
        </p>
      </div>
    </div>
  );
}
