// app/(public)/fahndungen/not-found.tsx

export default function FahndungenNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Fahndung nicht gefunden</h1>
      <p className="text-muted-foreground">
        Die angeforderte Fahndung konnte nicht gefunden werden.
      </p>
    </div>
  );
}
