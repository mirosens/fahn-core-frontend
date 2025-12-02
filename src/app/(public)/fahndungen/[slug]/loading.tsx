// app/(public)/fahndungen/[id]/loading.tsx - Skeleton für Detailansicht

export default function FahndungDetailLoading() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mb-6 h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mb-6 h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="mb-8 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-48 animate-pulse rounded-lg border bg-muted" />
      </div>
    </div>
  );
}
