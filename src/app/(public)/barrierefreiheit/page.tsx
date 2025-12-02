// app/(public)/barrierefreiheit/page.tsx - Platzhalter

// Statische Seite, kann beliebig lange gecacht werden
export const revalidate = false;

export default function BarrierefreiheitPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        Erklärung zur Barrierefreiheit
      </h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          Dieser Inhalt wird von TYPO3 bereitgestellt und in einer späteren
          Phase implementiert.
        </p>
        <p>
          Die Polizei Baden-Württemberg ist bemüht, ihre Websites im Einklang
          mit den nationalen Rechtsvorschriften zur Umsetzung der Richtlinie
          (EU) 2016/2102 des Europäischen Parlaments und des Rates barrierefrei
          zugänglich zu machen.
        </p>
        <p>
          Diese Erklärung zur Barrierefreiheit gilt für das Fahndungsportal der
          Polizei Baden-Württemberg.
        </p>
        <h2>Stand der Vereinbarkeit mit den Anforderungen</h2>
        <p>
          Wir arbeiten kontinuierlich daran, die Zugänglichkeit dieses Portals
          zu verbessern.
        </p>
        <h2>Feedback und Kontaktangaben</h2>
        <p>
          Sollten Ihnen Mängel in Bezug auf die barrierefreie Gestaltung
          auffallen, können Sie sich an uns wenden.
        </p>
      </div>
    </div>
  );
}
