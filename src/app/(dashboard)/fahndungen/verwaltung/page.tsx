// app/(dashboard)/fahndungen/verwaltung/page.tsx - Verwaltung, Filter, Statuspflege

// Dynamisches Rendering: keine Caching, personalisierte Inhalte
export const dynamic = "force-dynamic";

export default async function FahndungenVerwaltungPage() {
  // TODO: Verwaltungs-Interface in späterer Phase

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Fahndungen verwalten</h1>
      <div className="mx-auto max-w-4xl rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">
          Die Verwaltungsfunktionen für Fahndungen (Filter, Statuspflege) werden
          in einer späteren Phase implementiert.
        </p>
      </div>
    </div>
  );
}
