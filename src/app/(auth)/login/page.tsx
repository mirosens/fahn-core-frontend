"use client";

import { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Dynamisches Rendering: keine Caching, Formulare sind dynamisch
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { login, loading: authLoading, error: authError } = useAuth();
  // Demo-Admin-Daten automatisch vorausfüllen (Test-Polizist als Standard)
  const [username, setUsername] = useState("testpolizist");
  const [password, setPassword] = useState("Polizei2024!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Demo-Daten erneut ausfüllen
  const fillDemoData1 = () => {
    // Test-Polizist (Standard)
    setUsername("testpolizist");
    setPassword("Polizei2024!");
  };

  const fillDemoData2 = () => {
    // Alternative Demo-Daten (Admin)
    setUsername("admin");
    setPassword("admin123");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(username, password);
      // Redirect wird im useAuth Hook durchgeführt
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const displayError = error || authError;

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
          <p className="text-muted-foreground">Als Polizeibeamter anmelden</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {displayError}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Benutzername
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading || authLoading}
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  placeholder="Benutzername oder E-Mail"
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
                  disabled={isLoading || authLoading}
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading || authLoading ? "Wird angemeldet..." : "Anmelden"}
            </button>

            {/* Demo-Daten Buttons */}
            {process.env.NODE_ENV === "development" && (
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={fillDemoData1}
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Test-Polizist
                </button>
                <span className="text-sm text-muted-foreground">|</span>
                <button
                  type="button"
                  onClick={fillDemoData2}
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Admin (admin)
                </button>
              </div>
            )}
          </form>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-xs font-medium text-foreground mb-2">
                Demo-Zugangsdaten (automatisch ausgefüllt):
              </p>
              <div className="space-y-2">
                <div className="rounded bg-primary/10 p-2">
                  <p className="text-xs font-medium text-foreground mb-1">
                    1. Test-Polizist (Standard):
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Benutzername: testpolizist
                    <br />
                    Passwort: Polizei2024!
                  </p>
                </div>
                <div className="rounded bg-primary/10 p-2">
                  <p className="text-xs font-medium text-foreground mb-1">
                    2. Admin (Alternative):
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Benutzername: admin
                    <br />
                    Passwort: admin123
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
