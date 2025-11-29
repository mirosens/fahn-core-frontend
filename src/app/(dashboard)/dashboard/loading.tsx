// app/(dashboard)/dashboard/loading.tsx - Skeleton für Dashboard

export default function DashboardLoading() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mb-6 h-10 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
