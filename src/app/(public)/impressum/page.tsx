// app/(public)/impressum/page.tsx - Platzhalter

// Statische Seite, kann beliebig lange gecacht werden
export const revalidate = false;

export default function ImpressumPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Impressum</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          Dieser Inhalt wird von TYPO3 bereitgestellt und in einer späteren
          Phase implementiert.
        </p>
        <p>
          <strong>Angaben gemäß § 5 TMG</strong>
        </p>
        <p>
          Polizei Baden-Württemberg
          <br />
          [Musterstraße 1, 70173 Stuttgart]
        </p>
        <p>
          <strong>Kontakt</strong>
        </p>
        <p>
          Telefon: [Muster-Telefonnummer]
          <br />
          E-Mail: [Muster-E-Mail]
        </p>
      </div>
    </div>
  );
}
