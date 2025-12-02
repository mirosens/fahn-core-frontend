"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header
      className="w-full border-b border-border-subtle bg-surface/80 backdrop-blur"
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-md bg-primary-soft"
            aria-hidden="true"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-widest text-fg/70">
              Polizei Baden-Württemberg
            </span>
            <span className="text-sm font-semibold text-fg">
              Fahndungsportal
            </span>
          </div>
        </div>

        <nav
          className="hidden items-center gap-6 text-sm font-medium md:flex"
          aria-label="Hauptnavigation Fahndungsportal"
        >
          <Link href="/" className="hover:underline focus-visible:underline">
            Zur Startseite
          </Link>
          <Link
            href="/hinweise"
            className="hover:underline focus-visible:underline"
          >
            Hinweise geben
          </Link>
          <Link
            href="/informationen"
            className="hover:underline focus-visible:underline"
          >
            Informationen
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Platzhalter für Login, Sprache, A11y-Links */}
          <button
            type="button"
            className="text-xs underline focus-visible:outline-none"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
