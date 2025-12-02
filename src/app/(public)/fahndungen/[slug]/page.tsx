// app/(public)/fahndungen/[id]/page.tsx - Detailansicht mit ISR + Tag-basierter Revalidation

import { typo3Client } from "@/lib/typo3Client";
import { ApiError } from "@/lib/api-error";
import { notFound } from "next/navigation";
import Link from "next/link";

// ISR: Revalidation alle 300 Sekunden
export const revalidate = 300;

interface FahndungDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FahndungDetailPage({
  params,
}: FahndungDetailPageProps) {
  const { slug } = await params;

  let item;
  try {
    // Fetch via slug. For revalidation, we remove the specific tag to avoid
    // slug/id mismatch issues. The page will revalidate via ISR or when the
    // "fahndungen:list" tag is cleared.
    item = await typo3Client.getFahndungById(slug, {
      cache: "force-cache",
      next: {
        tags: ["fahndungen:list"],
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/fahndungen"
        className="mb-6 inline-block text-primary hover:underline"
      >
        ← Zurück zur Übersicht
      </Link>

      <article className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="mb-4 text-3xl font-bold">{item.title}</h1>
          {item.status && (
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm">
              {item.status}
            </span>
          )}
          {item.publishedAt && (
            <p className="mt-2 text-sm text-muted-foreground">
              Veröffentlicht am:{" "}
              {new Date(item.publishedAt).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </header>

        {item.description && (
          <div className="prose prose-lg dark:prose-invert mb-8">
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        )}

        {/* TODO: Weitere Inhalte gemäß A.8-Schema (Bilder, Orte, Personenbeschreibung, etc.) */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Hinweise melden</h2>
          <p className="mb-4 text-muted-foreground">
            Wenn Sie Informationen zu dieser Fahndung haben, nutzen Sie bitte
            das Kontaktformular oder wenden Sie sich direkt an die Polizei.
          </p>
          <p className="text-sm font-semibold text-destructive">
            Bei akuten Notfällen: Polizeinotruf 110
          </p>
        </div>
      </article>
    </div>
  );
}
