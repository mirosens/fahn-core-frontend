import type { Metadata } from "next";
import { Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Gebärdensprache – Polizei Baden-Württemberg",
  description: "Informationen in Deutscher Gebärdensprache (DGS)",
};

export default function GebaerdensprachePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
            <Video className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Gebärdensprache
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Informationen in Deutscher Gebärdensprache (DGS)
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Videos in Gebärdensprache
          </h2>
          <p className="text-muted-foreground mb-6">
            Hier finden Sie Videos mit Informationen in Deutscher
            Gebärdensprache (DGS).
          </p>

          {/* Video Placeholder */}
          <div className="aspect-video rounded-lg border border-border bg-muted flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Video-Content wird später hinzugefügt
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">Weitere Informationen</h2>
          <p className="text-muted-foreground">
            Für weitere Informationen in Gebärdensprache kontaktieren Sie uns
            bitte über unsere Kontakt-Seite.
          </p>
        </div>
      </div>
    </div>
  );
}
