// app/(auth)/reset-password/page.tsx - Passwort-Reset (reduziertes Layout)

// Dynamisches Rendering: keine Caching, Formulare sind dynamisch
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  // TODO: Passwort-Reset-Formular in späterer Phase implementieren

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-3xl font-bold">Passwort zurücksetzen</h1>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-muted-foreground">
            Das Passwort-Reset-Formular wird in einer späteren Phase
            implementiert.
          </p>
        </div>
      </div>
    </div>
  );
}
