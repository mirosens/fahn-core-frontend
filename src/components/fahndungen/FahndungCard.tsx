// components/fahndungen/FahndungCard.tsx - WCAG 2.2 AA konforme Fahndung-Karte
import Link from "next/link";

interface FahndungItem {
  id: number;
  title: string;
  description?: string;
  summary: string;
  status: "active" | "completed" | "archived";
  type: "missing_person" | "witness_appeal" | "wanted";
  location?: string;
  delikt?: string;
  publishedAt: string;
  slug: string;
  image?: {
    url: string;
    alternative: string;
  };
}

interface FahndungCardProps {
  fahndung: FahndungItem;
  priority?: boolean; // Für LCP-Optimierung
}

export function FahndungCard({
  fahndung,
  priority = false,
}: FahndungCardProps) {
  // Status-Styling mit ausreichendem Kontrast für WCAG 2.2 AA
  const getStatusColor = (status: FahndungItem["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "archived":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Typ-Styling mit ausreichendem Kontrast
  const getTypeColor = (type: FahndungItem["type"]) => {
    switch (type) {
      case "missing_person":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "witness_appeal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "wanted":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Typ-Labels
  const getTypeLabel = (type: FahndungItem["type"]) => {
    switch (type) {
      case "missing_person":
        return "Vermisste Person";
      case "witness_appeal":
        return "Zeugenaufruf";
      case "wanted":
        return "Fahndung";
      default:
        return type;
    }
  };

  // Status-Labels
  const getStatusLabel = (status: FahndungItem["status"]) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "completed":
        return "Erledigt";
      case "archived":
        return "Archiviert";
      default:
        return status;
    }
  };

  // Datum formatieren
  const formatPublishDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "Heute";
      } else if (diffDays === 1) {
        return "Gestern";
      } else if (diffDays < 7) {
        return `vor ${diffDays} Tagen`;
      } else if (diffDays < 30) {
        return `vor ${Math.floor(diffDays / 7)} Woche${Math.floor(diffDays / 7) === 1 ? "" : "n"}`;
      } else {
        return date.toLocaleDateString("de-DE");
      }
    } catch {
      return new Date(dateString).toLocaleDateString("de-DE");
    }
  };

  return (
    <article className="@container group h-full">
      <div className="h-full rounded-lg border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20 focus-within:shadow-md focus-within:border-primary/20">
        {/* Bild-Container (falls vorhanden) */}
        {fahndung.image && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <img
              src={fahndung.image.url}
              alt={fahndung.image.alternative}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 @sm:p-6 flex flex-col h-full">
          {/* Header mit Badges */}
          <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getTypeColor(fahndung.type)}`}
              aria-label={`Fahndungstyp: ${getTypeLabel(fahndung.type)}`}
            >
              {getTypeLabel(fahndung.type)}
            </span>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getStatusColor(fahndung.status)}`}
              aria-label={`Status: ${getStatusLabel(fahndung.status)}`}
            >
              {getStatusLabel(fahndung.status)}
            </span>
          </header>

          {/* Titel */}
          <h2 className="mb-3 text-lg font-semibold leading-tight group-hover:text-primary transition-colors @sm:text-xl">
            <Link
              href={`/fahndungen/${fahndung.slug}`}
              className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
              aria-describedby={`fahndung-${fahndung.id}-meta`}
            >
              <span
                className="after:absolute after:inset-0"
                aria-hidden="true"
              />
              {fahndung.title}
            </Link>
          </h2>

          {/* Beschreibung */}
          <div className="mb-4 flex-grow">
            {fahndung.description ? (
              <p className="text-sm text-muted-foreground line-clamp-3 @sm:text-base">
                {fahndung.description}
              </p>
            ) : fahndung.summary ? (
              <p className="text-sm text-muted-foreground line-clamp-3 @sm:text-base">
                {fahndung.summary}
              </p>
            ) : null}
          </div>

          {/* Meta-Informationen */}
          <div
            id={`fahndung-${fahndung.id}-meta`}
            className="space-y-1 text-xs text-muted-foreground @sm:text-sm"
          >
            {fahndung.location && (
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{fahndung.location}</span>
              </div>
            )}
            {fahndung.delikt && (
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
                <span>{fahndung.delikt}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <time dateTime={fahndung.publishedAt}>
                {formatPublishDate(fahndung.publishedAt)}
              </time>
            </div>
          </div>

          {/* Call-to-Action */}
          <div className="mt-4 pt-4 border-t">
            <span
              className="inline-flex items-center text-sm font-medium text-primary group-hover:text-primary/80 transition-colors relative z-10"
              aria-hidden="true"
            >
              Details anzeigen
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
