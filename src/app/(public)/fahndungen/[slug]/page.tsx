// app/(public)/fahndungen/[slug]/page.tsx - Fahndung-Detailseite mit ISR
import { notFound } from "next/navigation";
import { typo3Client } from "@/lib/typo3Client";
import { ApiError } from "@/lib/api-error";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

interface ContentElement {
  type: string;
  content?:
    | string
    | {
        src?: string;
        url?: string;
        alt?: string;
        alternative?: string;
        caption?: string;
      };
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR: 5 Minuten Revalidation für Detailseiten
export const revalidate = 300;

// Dynamische Metadata-Generierung
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const fahndung = await typo3Client.getFahndungById(slug, {
      cache: "force-cache",
      next: { tags: [`fahndung:${slug}`] },
    });

    return {
      title: `${fahndung.title} - Polizei Baden-Württemberg`,
      description: `Fahndungsdetails: ${fahndung.title}`,
      openGraph: {
        title: fahndung.title,
        description: `Fahndungsdetails der Polizei Baden-Württemberg`,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Fahndung - Polizei Baden-Württemberg",
      description: "Fahndungsdetails der Polizei Baden-Württemberg",
    };
  }
}

// Hauptkomponente
export default async function FahndungDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let fahndung;
  let hasError = false;
  let errorMessage: string | null = null;

  try {
    fahndung = await typo3Client.getFahndungById(slug, {
      cache: "force-cache",
      next: {
        tags: [`fahndung:${slug}`, "fahndungen"],
      },
    });
  } catch (error) {
    hasError = true;

    if (error instanceof ApiError) {
      switch (error.code) {
        case "T3_NETWORK_ERROR":
        case "T3_TIMEOUT":
          errorMessage =
            "Die Verbindung zum Fahndungsportal konnte nicht hergestellt werden. Bitte versuchen Sie es später erneut.";
          break;
        case "T3_JSON_PARSE_ERROR":
          errorMessage =
            "Die Fahndungsdaten konnten nicht verarbeitet werden. Bitte versuchen Sie es später erneut.";
          break;
        default:
          errorMessage =
            "Die Fahndung konnte nicht geladen werden. Bitte versuchen Sie es später erneut.";
      }
    } else {
      errorMessage =
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
    }

    console.error(`Fehler beim Laden der Fahndung ${slug}:`, error);

    // Bei Fehlern die 404-Seite anzeigen, außer bei Netzwerkfehlern
    if (
      error instanceof ApiError &&
      (error.code === "T3_NETWORK_ERROR" || error.code === "T3_TIMEOUT")
    ) {
      // Bei Netzwerkfehlern Fallback anzeigen statt 404
      fahndung = null;
    } else {
      notFound();
    }
  }

  // Netzwerkfehler-Fallback
  if (hasError && !fahndung) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary">
                  Start
                </Link>
              </li>
              <li>→</li>
              <li className="text-foreground">Fehler</li>
            </ol>
          </nav>

          {/* Fehlermeldung */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex-shrink-0">
                <svg
                  className="h-6 w-6 text-destructive"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-destructive">
                  Fahndung konnte nicht geladen werden
                </h1>
                <p className="mt-2 text-sm text-destructive/80">
                  {errorMessage}
                </p>
                <div className="mt-4 flex space-x-3">
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Zurück zur Übersicht
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center rounded-md border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Seite neu laden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!fahndung) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary">
                Start
              </Link>
            </li>
            <li>→</li>
            <li className="text-foreground">{fahndung.title}</li>
          </ol>
        </nav>

        {/* Hauptinhalt */}
        <article className="space-y-8">
          {/* Header */}
          <header className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
              {fahndung.title}
            </h1>
          </header>

          {/* Content-Bereiche */}
          <div className="space-y-8">
            {/* Main Content Column (0) */}
            {fahndung.content?.["0"] &&
              Array.isArray(fahndung.content["0"]) && (
                <div className="space-y-6">
                  {fahndung.content["0"].map(
                    (element: ContentElement, index: number) => (
                      <div key={index} className="prose prose-lg max-w-none">
                        {/* Text-Element */}
                        {element.type === "text" && element.content && (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: element.content,
                            }}
                          />
                        )}

                        {/* Header-Element */}
                        {element.type === "header" && element.content && (
                          <h2 className="text-2xl font-semibold">
                            {element.content}
                          </h2>
                        )}

                        {/* Image-Element */}
                        {element.type === "image" && element.content && (
                          <figure className="not-prose">
                            <Image
                              src={
                                element.content.src || element.content.url || ""
                              }
                              alt={
                                element.content.alt ||
                                element.content.alternative ||
                                ""
                              }
                              width={800}
                              height={600}
                              className="w-full rounded-lg border"
                            />
                            {(element.content.caption ||
                              element.content.alternative) && (
                              <figcaption className="mt-2 text-sm text-muted-foreground">
                                {element.content.caption ||
                                  element.content.alternative}
                              </figcaption>
                            )}
                          </figure>
                        )}

                        {/* Fallback für andere Element-Typen */}
                        {!["text", "header", "image"].includes(element.type) &&
                          element.content && (
                            <div className="rounded-md border bg-muted/50 p-4">
                              <pre className="text-sm overflow-x-auto">
                                {JSON.stringify(element, null, 2)}
                              </pre>
                            </div>
                          )}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Sidebar Content (falls vorhanden in colPos 1) */}
            {fahndung.content?.["1"] &&
              Array.isArray(fahndung.content["1"]) && (
                <aside className="rounded-lg border bg-muted/50 p-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Zusätzliche Informationen
                  </h3>
                  <div className="space-y-4">
                    {fahndung.content["1"].map(
                      (element: ContentElement, index: number) => (
                        <div key={index}>
                          {element.type === "text" && element.content && (
                            <div
                              className="text-sm"
                              dangerouslySetInnerHTML={{
                                __html: element.content,
                              }}
                            />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </aside>
              )}
          </div>

          {/* Kontakt-Hinweise */}
          <div className="rounded-lg border bg-primary/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Haben Sie Hinweise zu dieser Fahndung?
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Notruf:</strong> Bei akuten Notfällen wählen Sie bitte
                sofort <strong className="text-primary">110</strong>
              </p>
              <p>
                <strong>Hinweise:</strong> Teilen Sie Ihre Beobachtungen oder
                Informationen mit der zuständigen Polizeidienststelle oder
                nutzen Sie das Online-Hinweisformular.
              </p>
              <div className="flex space-x-3 pt-2">
                <Link
                  href="/hinweise"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Hinweis melden
                </Link>
                <Link
                  href="/informationen"
                  className="inline-flex items-center rounded-md border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Kontaktinformationen
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex justify-between border-t pt-6">
            <Link
              href="/"
              className="inline-flex items-center rounded-md border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              ← Zurück zur Übersicht
            </Link>

            <Link
              href="/hinweise"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Hinweis melden →
            </Link>
          </nav>
        </article>
      </div>
    </div>
  );
}
