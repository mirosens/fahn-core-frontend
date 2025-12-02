"use client";

import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";

// Dynamisches Rendering: keine Caching, immer frische Daten
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  // Provisorische Dashboard-Daten
  const stats = [
    {
      title: "Aktive Fahndungen",
      value: "0",
      description: "Noch nicht implementiert",
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Offene Hinweise",
      value: "0",
      description: "Noch nicht implementiert",
      icon: AlertCircle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      title: "Letzte Aktivität",
      value: "-",
      description: "Noch nicht implementiert",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
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
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
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

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => {
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
          <h2 className="text-xl font-semibold mb-4">Informationen</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Dies ist eine provisorische Dashboard-Ansicht. Die finale
              Implementierung erfolgt in einer späteren Phase.
            </p>
            <p className="text-sm">
              Hier werden später Statistiken, aktive Fahndungen und weitere
              relevante Informationen angezeigt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
