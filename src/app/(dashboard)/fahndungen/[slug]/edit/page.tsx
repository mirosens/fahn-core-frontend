// app/(dashboard)/fahndungen/[id]/edit/page.tsx - Bearbeitung einzelner Fahndungen

// Dynamisches Rendering: keine Caching, Formulare sind dynamisch
export const dynamic = "force-dynamic";

interface FahndungEditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FahndungEditPage({
  params,
}: FahndungEditPageProps) {
  const { slug } = await params;

  // TODO: Fahndung laden und Bearbeitungsformular anzeigen
  // TODO: Implementierung in späterer Phase

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Fahndung bearbeiten</h1>
      <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 shadow-sm">
        <p className="mb-4 text-muted-foreground">
          Bearbeitung der Fahndung: <strong>{slug}</strong>
        </p>
        <p className="text-muted-foreground">
          Das Bearbeitungsformular wird in einer späteren Phase implementiert.
        </p>
      </div>
    </div>
  );
}
