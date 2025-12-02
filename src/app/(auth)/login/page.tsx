"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock } from "lucide-react";

// Dynamisches Rendering: keine Caching, Formulare sind dynamisch
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Provisorische Login-Logik (später durch Typo3 ersetzt)
      // Simuliere Login-Prozess
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Setze auth_token Cookie (provisorisch)
      document.cookie = `auth_token=provisional_token_${Date.now()}; path=/; max-age=86400`;

      // Weiterleitung
      router.push(redirectUrl);
    } catch {
      setError("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <LogIn className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Anmelden</h1>
          <p className="text-muted-foreground">
            Als Polizeibeamter anmelden
            <br />
            <span className="text-sm">
              (Provisorische Anmeldung - später über Typo3)
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="ihre.email@polizei-bw.de"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Hinweis:</strong> Dies ist eine provisorische
              Anmeldungsseite. Die finale Implementierung erfolgt über Typo3.
              Für Testzwecke können Sie beliebige Daten eingeben.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
