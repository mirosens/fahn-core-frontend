// app/(dashboard)/fahndungen/neu/page.tsx - Wizard für neue Fahndungen

// Dynamisches Rendering: keine Caching, Formulare sind dynamisch
export const dynamic = "force-dynamic";

export default async function NeueFahndungPage() {
  // TODO: Wizard-Implementierung in späterer Phase

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Neue Fahndung anlegen</h1>
      <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">
          Der Wizard zur Anlage neuer Fahndungen wird in einer späteren Phase
          implementiert.
        </p>
      </div>
    </div>
  );
}
