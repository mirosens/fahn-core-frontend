// src/hooks/useAuth.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { typo3Client } from "@/lib/typo3-client";
import { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await typo3Client.getSession();

      if (response.data && response.data.authenticated && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err: unknown) {
      // 404 bedeutet, dass der Endpunkt nicht existiert (Backend-Problem)
      // In diesem Fall sollten wir den User als nicht authentifiziert behandeln
      const error = err as { status?: number; message?: string };
      if (error?.status === 404) {
        console.warn(
          "Session endpoint not found (404) - Backend may not be configured correctly"
        );
        setUser(null);
        setError(
          "Backend-Endpunkt nicht gefunden. Bitte prüfen Sie die Backend-Konfiguration."
        );
      } else {
        console.error("Session check failed", err);
        setUser(null);
        // Nur kritische Fehler anzeigen, nicht 404 (die sind Backend-Probleme)
        if (error?.status !== 404) {
          setError(error?.message || "Session-Check fehlgeschlagen");
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initiale Session-Prüfung
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await typo3Client.login({ username, password });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        router.push("/dashboard");
        router.refresh(); // Wichtig: Router Cache invalidieren für Middleware-Update
      } else {
        setError(response.error || "Login fehlgeschlagen");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await typo3Client.logout();
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
      // Trotzdem zur Login-Seite weiterleiten
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  return { user, loading, error, login, logout, checkSession };
}
