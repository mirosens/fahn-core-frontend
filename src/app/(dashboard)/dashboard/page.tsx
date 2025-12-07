"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { typo3Client } from "@/lib/typo3-client";
import { Fahndung } from "@/lib/types";

// Dynamisches Rendering: keine Caching, immer frische Daten
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [fahndungen, setFahndungen] = useState<Fahndung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recent: 0,
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (authLoading || !user) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Abruf der Fahndungen für Statistiken
        const response = await typo3Client.getFahndungen(1, 100);

        if (response.success && response.data) {
          const fahndungenList = Array.isArray(response.data)
            ? response.data
            : [response.data];

          setFahndungen(fahndungenList);
          setStats({
            total: response.pagination?.total || fahndungenList.length,
            active: fahndungenList.filter((f) => f.isPublished).length,
            recent: fahndungenList.length,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Fehler beim Laden der Daten";
        setError(errorMessage);
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboardData();
  }, [user, authLoading]);

  const statsDisplay = [
    {
      title: "Gesamt Fahndungen",
      value: stats.total.toString(),
      description: "Alle Fahndungen",
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Veröffentlicht",
      value: stats.active.toString(),
      description: "Aktive Fahndungen",
      icon: AlertCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Letzte Aktivität",
      value: stats.recent.toString(),
      description: "Neueste Einträge",
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              {user && (
                <p className="text-sm text-muted-foreground">
                  Willkommen, {user.name || user.username}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/fahndungen/neu"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Neue Fahndung
          </Link>
        </div>
        <p className="text-lg text-muted-foreground">
          Übersicht über Fahndungen und Aktivitäten
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-8 text-center text-muted-foreground">
          Lade Daten...
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {statsDisplay.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-lg ${stat.bgColor} p-2`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <h2 className="mb-2 text-lg font-semibold text-foreground">
                  {stat.title}
                </h2>
                <p className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
          <div className="space-y-3">
            <Link
              href="/fahndungen/neu"
              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted"
            >
              <span className="font-medium">Neue Fahndung erstellen</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/fahndungen"
              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted"
            >
              <span className="font-medium">Alle Fahndungen anzeigen</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Neueste Fahndungen</h2>
          {loading ? (
            <div className="text-sm text-muted-foreground">Lade Daten...</div>
          ) : fahndungen.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Keine Fahndungen vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {fahndungen.slice(0, 5).map((f) => (
                <div
                  key={f.uid}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{f.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {f.caseId} | {f.location}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      f.isPublished
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }`}
                  >
                    {f.isPublished ? "Aktiv" : "Entwurf"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
