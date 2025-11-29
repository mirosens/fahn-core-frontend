// app/(dashboard)/dashboard/page.tsx - Geschützter Dashboard-Bereich

// Dynamisches Rendering: keine Caching, immer frische Daten
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // TODO: Daten vom typo3Client holen (getDashboardData)
  // Authentifizierung wird über Middleware geprüft

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Aktive Fahndungen</h2>
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-muted-foreground">
            Noch nicht implementiert
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Offene Hinweise</h2>
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-muted-foreground">
            Noch nicht implementiert
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Letzte Aktivität</h2>
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-muted-foreground">
            Noch nicht implementiert
          </p>
        </div>
      </div>
    </div>
  );
}
