// app/(public)/fahndungen/loading.tsx - Skeleton für Listenansicht

export default function FahndungenLoading() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mb-6 h-10 w-64 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
