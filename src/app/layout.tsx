import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/glassmorphism-header.css";

import { ThemeProvider } from "@/components/theme-provider";
import ModernHeader from "@/components/layout/header/ModernHeader";
import { SiteFooter } from "@/components/layout/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fahndungsportal BW – Polizei Baden-Württemberg",
  description: "Die Polizei Baden-Württemberg bittet um Ihre Mithilfe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-bg text-fg antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="skip-link focus-visible:outline-none"
        >
          Zum Inhalt springen
        </a>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="layout-shell">
            <ModernHeader />

            <main
              id="main-content"
              className="layout-main"
              role="main"
              aria-label="Hauptinhalt Fahndungsportal"
            >
              {children}
            </main>

            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
