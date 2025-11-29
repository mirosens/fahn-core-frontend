// app/loading.tsx - Skeleton für Startseite

export default function HomeLoading() {
  return (
    <div
      className="container mx-auto px-4 py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 h-12 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mb-8 h-6 w-full animate-pulse rounded bg-muted" />
        <div className="mb-8 h-6 w-5/6 animate-pulse rounded bg-muted" />

        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
