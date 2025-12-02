import type { Metadata } from "next";
import { Languages } from "lucide-react";

export const metadata: Metadata = {
  title: "Leichte Sprache – Polizei Baden-Württemberg",
  description: "Informationen in einfacher, verständlicher Sprache",
};

export default function LeichteSprachePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
            <Languages className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Leichte Sprache
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Informationen in einfacher, verständlicher Sprache
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Willkommen auf der Fahndungs-Seite
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            Diese Seite ist in Leichter Sprache geschrieben.
            <br />
            Leichte Sprache hilft Menschen mit Lern-Schwierigkeiten.
            <br />
            Leichte Sprache hilft auch anderen Menschen.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">Was finden Sie hier?</h2>
          <ul className="space-y-3 text-lg leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Aktuelle Fahndungen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Vermissten-Meldungen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Möglichkeit, Hinweise zu geben</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">Hinweise geben</h2>
          <p className="text-lg leading-relaxed">
            Haben Sie Informationen zu einer Fahndung?
            <br />
            Dann können Sie uns kontaktieren.
            <br />
            Ihre Hinweise helfen der Polizei.
          </p>
        </div>
      </div>
    </div>
  );
}
