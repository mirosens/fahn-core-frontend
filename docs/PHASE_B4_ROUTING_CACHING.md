# PHASE B.4 – Routing, Seitenstruktur & Caching

**Stand:** Implementiert am 29.11.2025  
**Projekt:** FAHN-CORE Frontend (Headless TYPO3 v13)

## Übersicht

Diese Dokumentation beschreibt die implementierte Routing-Struktur, Caching-Strategien und Seitenarchitektur für das Fahndungsportal.

## Routing-Struktur

### Route Groups

Das Projekt nutzt Next.js Route Groups zur klaren Trennung von Layouts:

- `(public)` - Öffentlicher Bereich mit Hauptlayout (Header/Footer)
- `(auth)` - Login/Passwort-Reset mit reduziertem Layout
- `(dashboard)` - Geschützter Bereich (Dashboard, Verwaltung, Edit)

### Kernrouten

#### Öffentliche Routen

| Route | Beschreibung | Caching | Revalidation |
|-------|--------------|---------|--------------|
| `/` | Startseite "Die Polizei bittet um Ihre Mithilfe" | ISR | 120s |
| `/fahndungen` | Öffentliche Fahndungen (Listenansicht) | ISR | 60s |
| `/fahndungen/[id]` | Öffentliche Detailansicht (SEO/Deep-Link) | ISR + Tags | 300s |

#### Geschützte Routen

| Route | Beschreibung | Caching | Auth |
|-------|--------------|---------|------|
| `/dashboard` | Geschützter Bereich (Übersicht) | `force-dynamic` | ✅ |
| `/fahndungen/neu` | Wizard (Anlage neuer Fahndungen) | `force-dynamic` | ✅ |
| `/fahndungen/verwaltung` | Verwaltung, Filter, Statuspflege | `force-dynamic` | ✅ |
| `/fahndungen/[id]/edit` | Bearbeitung einzelner Fahndungen | `force-dynamic` | ✅ |

#### Auth-Routen

| Route | Beschreibung | Caching |
|-------|--------------|---------|
| `/login` | Login-Seite | `force-dynamic` |
| `/reset-password` | Passwort-Reset | `force-dynamic` |

## Caching-Strategien

### Vier-Schichten-Caching-Architektur

1. **Request Memoization (Deduplication)**
   - Innerhalb eines Render-Zyklus wird dieselbe fetch-URL mit identischen Optionen nur einmal ausgeführt
   - `typo3Client`/`t3Fetch` sortieren Parameter deterministisch

2. **Data Cache (Persistente Datenebene)**
   - Nutzung von `next: { tags: [...] }` für semantische Gruppierung:
     - `page:{id}` - Einzelne Seiten
     - `fahndungen:list` - Fahndungen-Liste
     - `fahndung:{id}` - Einzelne Fahndung
     - `navigation:main` - Hauptnavigation

3. **Full Route Cache (HTML + RSC-Payload)**
   - Gilt für statische Content-Routen ohne dynamische Funktionen (`cookies`/`headers`) in Page/Layout
   - Öffentliche Routen nutzen Full Route Cache für extrem schnelle TTFB

4. **Router Cache (Client-Side Cache)**
   - Browser-intern, speichert besuchte Routen für kurze Zeit
   - Für Redakteurstests: `router.refresh()` nutzen

### Caching-Strategie pro Route

#### Startseite `/` (app/page.tsx)
- **Rendering:** Server Component
- **Caching:** ISR
- **Konfiguration:** `export const revalidate = 120;`
- **Begründung:** Mischung aus statischen Infos + dynamischer Liste "aktuelle Fahndungen"

#### Listenansicht `/fahndungen` (app/(public)/fahndungen/page.tsx)
- **Rendering:** Server Component
- **Caching:** ISR
- **Konfiguration:** `export const revalidate = 60;`
- **Begründung:** Änderungen sollen zeitnah sichtbar sein, ohne TYPO3 bei jedem Request zu treffen

#### Detailansicht `/fahndungen/[id]` (app/(public)/fahndungen/[id]/page.tsx)
- **Rendering:** Server Component
- **Caching:** ISR + Tag-basierte Revalidation
- **Konfiguration:**
  - `export const revalidate = 300;`
  - Fetch mit `next: { tags: ["fahndung:" + id, "fahndungen:list"] }`
- **Begründung:** Details ändern sich selten, Änderungen sollen gezielt invalidiert werden können

#### Dashboard `/dashboard` (app/(dashboard)/dashboard/page.tsx)
- **Rendering:** dynamisch, Auth-abhängig
- **Caching:** `force-dynamic` / Dynamic Rendering
- **Konfiguration:** `export const dynamic = "force-dynamic";`
- **Begründung:** Personalisierte Inhalte, Live-Status

#### Wizard, Verwaltung, Edit
- **Rendering:** dynamisch mit Zugriffsprüfung
- **Caching:** `force-dynamic` / `no-store`
- **Begründung:** Formulareingaben, sensible Daten, keine Reuse der Response

## On-Demand Revalidation

### API-Route: `/api/revalidate`

Die Revalidation-API ermöglicht gezielte Cache-Invalidierung über Tags:

```typescript
POST /api/revalidate
Headers:
  x-revalidation-token: <REVALIDATION_TOKEN>

Body:
{
  "tags": ["fahndung:123", "fahndungen:list"]
}
```

**Sicherheit:**
- Secret-Check über `x-revalidation-token` Header
- Token muss in `REVALIDATION_TOKEN` Environment-Variable gesetzt sein

**Verwendung:**
- TYPO3 sendet bei Inhaltsspeicherung Webhooks an diese Route
- Manuelle Revalidation für Tests möglich

## Loading & Fallbacks

### Loading-Komponenten

Jede Haupt-Route hat eine `loading.tsx` mit Skeleton-Layout:

- `app/loading.tsx` - Startseite
- `app/(public)/fahndungen/loading.tsx` - Liste
- `app/(public)/fahndungen/[id]/loading.tsx` - Detailansicht
- `app/(dashboard)/dashboard/loading.tsx` - Dashboard

**A11y-Features:**
- `aria-busy="true"` und `aria-live="polite"` für relevante Bereiche
- Skeleton-Layouts entsprechen der finalen Struktur

### Fehlerbehandlung

**Globale Fehlerseite:**
- `app/error.tsx` - Globale Error Boundary für App-Ebene

**Spezifische Fehlerseiten:**
- `app/(public)/fahndungen/error.tsx` - Fehler für Listenansicht
- `app/(public)/fahndungen/[id]/error.tsx` - Fehler für Detailansicht
- `app/(dashboard)/dashboard/error.tsx` - Fehler für Dashboard

**Features:**
- Nutzen `ApiError` aus B.3 für differenzierte Fehlermeldungen
- Bieten "Erneut versuchen"-Button
- Müssen als Client Components deklariert werden (`"use client"`)

### Not-Found-Handling

**Globale 404:**
- `app/not-found.tsx` - 404 für globale App

**Spezifische 404:**
- `app/(public)/fahndungen/[id]/not-found.tsx` - 404 für Detailansicht
- Nutzung von `notFound()` in `app/(public)/fahndungen/[id]/page.tsx` bei 404-Fehlern

## Sicherheit & Middleware

### Middleware-Strategie

Die `middleware.ts` prüft für geschützte Pfade auf das Vorhandensein eines `auth_token` Cookies:

**Geschützte Pfade:**
- `/dashboard`
- `/fahndungen/neu`
- `/fahndungen/verwaltung`
- `/fahndungen/[slug]/edit`

**Verhalten:**
- Bei fehlendem Token: Redirect auf `/login` mit `redirect` Query-Parameter
- Edge-Middleware nur für leichte Checks, schwere Logik in Server Components

### Token-Weitergabe an TYPO3

Authentifizierte Requests an TYPO3 über `typo3Client`/`t3Fetch`:

```typescript
import { cookies } from "next/headers";

const cookieStore = await cookies();
const token = cookieStore.get("auth_token")?.value;

// Token wird in Authorization Header übergeben
```

## Content Element Factory

### Pattern

Die `ContentElementFactory` mappt TYPO3-Inhaltselemente (CType-basiert) auf React-Komponenten:

**Implementierte CTypes:**
- `text` / `textmedia` → `TextElement` (Server Component)
- `image` / `imagegallery` → `ImageElement` (Server Component)
- `header` / `headline` → `HeadingElement` (Server Component)

**Erweiterbar:**
- Interaktive Komponenten (Map, Form) als Client Components
- Weitere CTypes in späteren Phasen

## Next.js 15 Async-Pattern

### Architekturvorgaben

- Alle Page-Komponenten mit `params`/`searchParams` müssen als `async function` implementiert werden
- `generateMetadata`/`generateViewport` erhalten `params` nun als Promise und müssen ebenfalls async arbeiten
- Zugriff auf `cookies()` und `headers()` ist nur noch asynchron erlaubt

**Beispiel:**
```typescript
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // ...
}
```

**Architekturvorgabe:**
- Auf Content-Routen (öffentlicher Bereich) möglichst keine `cookies()`/`headers()`-Zugriffe in Page/Layout, um Full Route Cache zu ermöglichen
- Personalisierung über Client Components nachladen

## Technische Details

### t3Fetch Erweiterungen

`t3Fetch` wurde erweitert um Caching-Optionen:

```typescript
export type T3FetchOptions = {
  // ... bestehende Optionen
  cache?: RequestCache;
  next?: {
    tags?: string[];
    revalidate?: number | false;
  };
};
```

### typo3Client Erweiterungen

Alle GET-Methoden unterstützen jetzt Caching-Optionen:

```typescript
await typo3Client.getFahndungById(id, {
  cache: "force-cache",
  next: {
    tags: [`fahndung:${id}`, "fahndungen:list"],
  },
});
```

## Definition of Done – PHASE B.4

✅ **Routing**
- Alle Kernrouten sind vorhanden und lauffähig
- Route Groups für klare Trennung implementiert
- Alte Redirect-/Prototyp-Logik konsolidiert

✅ **Caching & Rendering**
- ISR aktiviert für Startseite, Listenansicht, Detailansicht
- Personalisierte Seiten verwenden `force-dynamic`
- Caching-Strategie pro Route dokumentiert
- Revalidation-API existiert und ist testbar

✅ **Loading & Fallbacks**
- `loading.tsx` für alle Haupt-Routen implementiert
- "Keine Treffer"-Zustände mit verständlichen Texten
- `error.tsx` pro Hauptgruppe vorhanden
- Not-Found-Flow korrekt implementiert

✅ **Architektur-Compliance**
- Async-Pattern von Next.js 15 eingehalten
- Content-Routen verwenden keine Auth-Lesezugriffe in Page/Layout
- Typisierung konsistent mit Zod-Schemata aus B.3

✅ **Qualität**
- TypeScript-Build ohne Fehler
- Lint-Checks ohne kritische Fehler

## Nächste Schritte

- Implementierung der Formulare (Wizard, Edit) in späteren Phasen
- Sidebar-Navigation für Dashboard-Bereich
- Erweiterung der Content Element Factory um weitere CTypes
- Integration von TYPO3-Webhooks für automatische Revalidation

