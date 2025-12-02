import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, Languages, Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Barrierefreiheit – Polizei Baden-Württemberg",
  description: "Leichte Sprache und Gebärdensprache",
};

// Statische Seite, kann beliebig lange gecacht werden
export const revalidate = false;

export default function BarrierefreiheitPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Accessibility className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Barrierefreiheit
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Unser Angebot für Menschen mit besonderen Bedürfnissen
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Leichte Sprache */}
        <Link
          href="/leichte-sprache"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
              <Languages className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold">Leichte Sprache</h2>
          </div>
          <p className="text-muted-foreground">
            Informationen in einfacher, verständlicher Sprache
          </p>
        </Link>

        {/* Gebärdensprache */}
        <Link
          href="/gebaerdensprache"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-lg bg-green-500/10 p-3 text-green-500 group-hover:bg-green-500/20 transition-colors">
              <Video className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold">Gebärdensprache</h2>
          </div>
          <p className="text-muted-foreground">
            Informationen in Deutscher Gebärdensprache (DGS)
          </p>
        </Link>
      </div>

      {/* Additional Information */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Weitere Barrierefreiheits-Features
        </h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Kontrastreiche Darstellung für bessere Lesbarkeit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Tastaturnavigation für alle Funktionen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Screenreader-Unterstützung</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
