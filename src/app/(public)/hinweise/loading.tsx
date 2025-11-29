// app/(public)/hinweise/loading.tsx - Skeleton für Hinweise-Seite

export default function HinweiseLoading() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="mb-8 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-8 h-32 animate-pulse rounded-lg border bg-muted" />
        <div className="h-48 animate-pulse rounded-lg border bg-muted" />
      </div>
    </div>
  );
}
