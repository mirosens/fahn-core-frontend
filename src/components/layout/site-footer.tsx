import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      className="mt-8 border-t border-border-subtle bg-surface/80"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-fg/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Polizei Baden-Württemberg</p>
        <nav
          className="flex flex-wrap items-center gap-4"
          aria-label="Fußnavigation"
        >
          <Link
            href="/impressum"
            className="hover:underline focus-visible:underline"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="hover:underline focus-visible:underline"
          >
            Datenschutz
          </Link>
          <Link
            href="/barrierefreiheit"
            className="hover:underline focus-visible:underline"
          >
            Barrierefreiheitserklärung
          </Link>
        </nav>
      </div>
    </footer>
  );
}
