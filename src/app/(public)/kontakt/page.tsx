import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt – Polizei Baden-Württemberg",
  description: "Kontaktinformationen und Ansprechpartner",
};

export default function KontaktPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-3">
          Kontakt
        </h1>
        <p className="text-lg text-muted-foreground">
          Landeskriminalamt Baden-Württemberg
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-6">Kontaktdaten</h2>

          <div className="space-y-6">
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Adresse
                </p>
                <p className="text-foreground">
                  Taubenheimstraße 85
                  <br />
                  70372 Stuttgart
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Telefon
                </p>
                <a
                  href="tel:+4971154010"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  +49 711 5401-0
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  E-Mail
                </p>
                <a
                  href="mailto:info@polizei-bw.de"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  info@polizei-bw.de
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-6">Nachricht senden</h2>
          <p className="text-muted-foreground mb-6">
            Kontaktformular wird später implementiert. Bitte nutzen Sie die
            E-Mail-Adresse für direkten Kontakt.
          </p>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Formular-Funktionalität folgt in Kürze
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
