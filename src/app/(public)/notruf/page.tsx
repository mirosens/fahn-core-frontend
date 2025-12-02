import type { Metadata } from "next";
import { Clock, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Notruf – Polizei Baden-Württemberg",
  description: "24-Stunden Erreichbarkeiten und Notrufnummern",
};

export default function NotrufPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
            <Clock className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Notruf</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Rund um die Uhr erreichbar - Kontakt zu allen Polizeistationen in
          Baden-Württemberg
        </p>
      </div>

      {/* Notrufnummern */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
              Notruf 110
            </h2>
          </div>
          <p className="text-red-800 dark:text-red-200 mb-4">
            Für Notfälle und dringende polizeiliche Angelegenheiten
          </p>
          <a
            href="tel:110"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            <Phone className="h-4 w-4" />
            Jetzt anrufen
          </a>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Polizeidirektion
            </h2>
          </div>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            Zentrale Erreichbarkeit für nicht-dringende Angelegenheiten
          </p>
          <a
            href="tel:+4971154010"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Phone className="h-4 w-4" />
            +49 711 5401-0
          </a>
        </div>
      </div>

      {/* Weitere Informationen */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Wichtige Hinweise</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Der Notruf 110 ist für Notfälle und dringende polizeiliche
              Angelegenheiten gedacht
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Für nicht-dringende Angelegenheiten nutzen Sie bitte die
              Polizeidirektion
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Bei medizinischen Notfällen wählen Sie bitte die 112</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
