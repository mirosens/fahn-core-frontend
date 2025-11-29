// app/(public)/informationen/loading.tsx - Skeleton für Informationen-Seite

export default function InformationenLoading() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="mb-8 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-8 h-48 animate-pulse rounded-lg border bg-muted" />
        <div className="h-32 animate-pulse rounded-lg border bg-muted" />
      </div>
    </div>
  );
}
