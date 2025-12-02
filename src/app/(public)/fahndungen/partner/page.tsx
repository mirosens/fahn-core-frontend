import type { Metadata } from "next";
import { Globe, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Fahndungslinks – Polizei Baden-Württemberg",
  description:
    "Weitere Fahndungsseiten - Bundesländer, BKA und internationale Partner",
};

export default function FahndungslinksPage() {
  const partners = [
    {
      category: "Bundesländer",
      links: [
        { name: "Bayern", url: "https://www.polizei.bayern.de/fahndung" },
        { name: "Berlin", url: "https://www.berlin.de/polizei/fahndung" },
        { name: "Hamburg", url: "https://www.polizei.hamburg.de/fahndung" },
        {
          name: "Nordrhein-Westfalen",
          url: "https://www.polizei.nrw.de/fahndung",
        },
      ],
    },
    {
      category: "Bundesbehörden",
      links: [
        { name: "Bundeskriminalamt (BKA)", url: "https://www.bka.de/fahndung" },
        { name: "Bundespolizei", url: "https://www.bundespolizei.de/fahndung" },
      ],
    },
    {
      category: "International",
      links: [
        { name: "Interpol", url: "https://www.interpol.int" },
        { name: "Europol", url: "https://www.europol.europa.eu" },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Globe className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Fahndungslinks</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Weitere Fahndungsseiten - Bundesländer, BKA und internationale Partner
        </p>
      </div>

      {/* Partners Grid */}
      <div className="space-y-8">
        {partners.map((partner) => (
          <div
            key={partner.category}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">{partner.category}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {partner.links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4 transition-all hover:border-primary hover:bg-muted"
                >
                  <span className="font-medium text-foreground group-hover:text-primary">
                    {link.name}
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
