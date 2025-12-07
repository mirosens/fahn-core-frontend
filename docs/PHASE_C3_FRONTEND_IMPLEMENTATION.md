# Phase C3 – Frontend (Next.js) Implementation Plan

**Stand:** Dokumentation erstellt am 2025-01-XX  
**Projekt:** FAHN-CORE Frontend (Headless TYPO3 v13)  
**Status:** In Planung

## Übersicht bisheriger Phasen

### Phase C0 – Cleanup

Entfernung aller Altlasten wie JWT‑Middleware, Supabase‑Code und überflüssige TypoScript‑Endpunkte. Composer‑Abhängigkeiten (`lcobucci/jwt`) und Supabase‑Pakete wurden aus dem Projekt entfernt, die Middleware‑Konfigurationen und Testdateien gelöscht und das Setup für die TypoScript‑Konfiguration vorbereitet.

### Phase C1 – Backend Core

Stärkung der Domain‑Modelle und des Repository‑Layers. Das Fahndung‑Domain‑Model wurde auf PHP‑8‑Attribute umgestellt und um notwendige Validatoren (`NotEmpty`, `DateTime`) ergänzt. Das Repository erhielt neue Methoden (`findActive`, `findBySearchTerm`, `countAll`), die Paginierung, Suche über mehrere Felder und sichere Filterung nach veröffentlichten Datensätzen ermöglichen.

### Phase C2 – Backend API

Implementierung der Extbase‑Controller (`FahndungController` und `LoginController`) zur Bereitstellung einer JSON‑API. Es wurden Endpunkte für das Listen, Anzeigen, Anlegen, Aktualisieren und Löschen von Fahndungen entwickelt, einschließlich Authentifizierungs‑Check und XSS‑Prävention. Der `LoginController` nutzt das native TYPO3‑Session‑Handling und implementiert einen IP‑basierten Rate‑Limiter. Die TypoScript‑Konfiguration wurde auf eine „Single Entry Point"‑API mit CORS‑ und Sicherheits‑Headern umgestellt. Plugins wurden mit non‑cacheable Actions registriert und ein Cache für den Rate‑Limiter eingerichtet.

## Ziel von Phase C3

In Phase C3 wird das entkoppelte Next.js‑Frontend an die neue TYPO3‑API angebunden. Dies umfasst die Implementierung eines schlanken TYPO3‑Clients in TypeScript, eines Auth‑Hooks zur Verwaltung der Session und die Integration dieser Mechanismen in die vorhandenen Frontend‑Seiten.

## Aktueller Stand der Codebase

### Bereits vorhandene Komponenten

1. **`src/lib/typo3-client.ts`** ✅
   - Enthält bereits alle benötigten API-Methoden:
     - `getFahndungen(page, limit, search?)`
     - `getFahndung(uid)`
     - `createFahndung(data)`
     - `updateFahndung(uid, data)`
     - `deleteFahndung(uid)`
     - `login(username, password)`
     - `getSession()`
     - `logout()`
   - Verwendet bereits `credentials: 'include'` für Cookie-Weitergabe
   - Nutzt korrekte TYPO3-API-Endpunkte mit `tx_fahncorefahndung_api[action]` und `tx_fahncore_login[action]`

2. **`src/lib/typo3Client.ts`** ✅
   - Produktionsreifer Client für öffentliche Seiten (Navigation, Pages, Fahndungen-Listen)
   - Nutzt `t3Fetch` mit Caching-Strategien
   - Separate Implementierung für Content-APIs

3. **`src/lib/t3Fetch.ts`** ✅
   - Basis-Fetch-Funktion mit Proxy-Routing für Client-Side
   - Unterstützt Caching-Optionen
   - Fehlerbehandlung implementiert

### Zu implementierende/anzupassende Komponenten

1. **`src/hooks/useAuth.ts`** ⚠️
   - Aktuell: Placeholder-Implementation
   - Muss vollständig implementiert werden mit:
     - State Management für `user`, `loading`, `error`
     - Login/Logout-Funktionalität
     - Session-Check beim Mounten
     - Integration mit `typo3-client.ts`

2. **`src/app/(auth)/login/page.tsx`** ⚠️
   - Aktuell: Provisorische Implementierung mit `auth_token` Cookie
   - Muss angepasst werden:
     - Integration mit `useAuth` Hook
     - Verwendung von `typo3-client.login()`
     - Entfernung der provisorischen Cookie-Logik
     - Fehlerbehandlung für API-Antworten

3. **`src/app/(dashboard)/dashboard/page.tsx`** ⚠️
   - Aktuell: Zeigt provisorische Statistik-Daten
   - Muss angepasst werden:
     - Abruf echter Daten über `typo3-client.getFahndungen()`
     - Anzeige von Statistiken (aktive Fahndungen, etc.)
     - Integration mit Update/Delete-Workflow

4. **`src/proxy.ts`** ⚠️
   - Aktuell: Prüft auf `auth_token` Cookie
   - Muss angepasst werden:
     - Prüfung auf `fe_typo_user` Cookie (TYPO3 Session Cookie)
     - Optional: Session-Validierung über API-Endpunkt

5. **Weitere Seiten** ⚠️
   - `/fahndungen/verwaltung` - Muss CRUD-Operationen nutzen
   - `/fahndungen/neu` - Muss `createFahndung` verwenden
   - `/fahndungen/[id]/edit` - Muss `updateFahndung` verwenden

## Detaillierte Implementierungs-Schritte

### 1. Entwicklung des TYPO3‑Clients (typo3-client.ts)

**Status:** ✅ Bereits vorhanden, aber ggf. Anpassungen nötig

**Funktion:** Der Client kapselt alle HTTP‑Anfragen an das TYPO3‑Backend. Jede Methode fügt `credentials: 'include'` hinzu, damit das `fe_typo_user`‑Cookie bei jedem Request mitgeschickt wird.

**Bereits implementierte Methoden:**

```typescript
// src/lib/typo3-client.ts
- getFahndungen(page, limit, search?)
- getFahndung(uid)
- createFahndung(data)
- updateFahndung(uid, data)
- deleteFahndung(uid)
- login(username, password)
- getSession()
- logout()
```

**Zu prüfende/anzupassende Punkte:**

- [ ] **Cookie-Handling:** Sicherstellen, dass `credentials: 'include'` korrekt gesetzt ist (✅ bereits vorhanden)
- [ ] **Error-Handling:** API-Fehler müssen strukturiert behandelt werden
- [ ] **Response-Parsing:** TYPO3-API-Antworten müssen korrekt geparst werden
- [ ] **TypeScript-Typen:** Typen für API-Responses müssen definiert werden

**Empfohlene Anpassungen:**

1. **Erweiterte Fehlerbehandlung:**
   ```typescript
   // Beispiel für strukturierte Fehlerbehandlung
   if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     throw new ApiError({
       message: errorData.message || 'API request failed',
       code: errorData.code || 'UNKNOWN_ERROR',
       status: response.status,
     });
   }
   ```

2. **Session-Response-Typen:**
   ```typescript
   interface SessionResponse {
     authenticated: boolean;
     user?: {
       uid: number;
       username: string;
       // weitere Felder
     };
   }
   ```

### 2. Auth‑Hook (useAuth.ts)

**Status:** ⚠️ Muss vollständig implementiert werden

**Aktueller Stand:**
```typescript
// src/hooks/useAuth.ts - PLACEHOLDER
export function useAuth() {
  return {
    session: null,
    loading: true,
    error: null,
    signOut: async () => { /* TODO */ },
    checkSession: async () => { /* TODO */ },
  };
}
```

**Zu implementieren:**

**State Management:**
- `user`: Benutzer-Objekt oder `null`
- `loading`: Boolean für initialen Session-Check
- `error`: Fehler-Objekt oder `null`

**Funktionen:**
- `login(username, password)`: Aufruf von `typo3-client.login()`, bei Erfolg Session-Check und Redirect zum Dashboard
- `logout()`: Aufruf von `typo3-client.logout()`, State zurücksetzen, Redirect zur Login-Seite
- `checkSession()`: Beim Mounten der Anwendung aufrufen, prüft über `typo3-client.getSession()` ob aktive Session existiert

**Implementierungs-Vorlage:**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin, logout as apiLogout, getSession } from "@/lib/typo3-client";

interface User {
  uid: number;
  username: string;
  // weitere Felder je nach TYPO3-Response
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await getSession();
      if (session.authenticated && session.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session-Check fehlgeschlagen");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiLogin(username, password);
      // Nach erfolgreichem Login Session prüfen
      await checkSession();
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Anmeldung fehlgeschlagen";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkSession, router]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await apiLogout();
      setUser(null);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Abmeldung fehlgeschlagen");
      // Trotzdem zur Login-Seite weiterleiten
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Session-Check beim Mounten
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkSession,
  };
}
```

**Wichtige Punkte:**

- [ ] Session-Check beim Mounten der Anwendung
- [ ] Fehlerbehandlung für alle API-Aufrufe
- [ ] Redirect-Logik nach Login/Logout
- [ ] State-Synchronisation zwischen Hook und Cookie

### 3. Middleware / Route‑Schutz (proxy.ts → middleware.ts)

**Status:** ⚠️ Muss angepasst werden

**Aktueller Stand:**
```typescript
// src/proxy.ts - prüft auf auth_token Cookie
const token = request.cookies.get("auth_token")?.value;
```

**Zu ändern:**

1. **Cookie-Name:** Von `auth_token` zu `fe_typo_user` ändern
2. **Optional:** Session-Validierung über API-Endpunkt (kann Performance-Impact haben)
3. **Redirect-Logik:** Authentifizierte Benutzer von `/login` zum Dashboard umleiten

**Angepasste Implementierung:**

```typescript
// src/middleware.ts (oder proxy.ts anpassen)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/fahndungen/neu",
  "/fahndungen/verwaltung",
];

const AUTH_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prüfe ob der Pfad geschützt ist
  const isProtected =
    PROTECTED_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.match(/^\/fahndungen\/[^/]+\/edit$/);

  // Prüfe ob es eine Auth-Route ist
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Prüfe auf fe_typo_user Cookie (TYPO3 Session Cookie)
  const typo3SessionCookie = request.cookies.get("fe_typo_user")?.value;
  const isAuthenticated = !!typo3SessionCookie;

  // Geschützte Routen: Redirect zu Login wenn nicht authentifiziert
  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Auth-Routen: Redirect zum Dashboard wenn bereits authentifiziert
  if (isAuthPath && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Header-Weitergabe für Server Components (optional)
  const response = NextResponse.next();
  if (typo3SessionCookie) {
    response.headers.set("X-TYPO3-Session", "authenticated");
  }
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/fahndungen/neu",
    "/fahndungen/verwaltung/:path*",
    "/fahndungen/:id/edit",
    "/login",
  ],
};
```

**Wichtige Punkte:**

- [ ] Cookie-Name von `auth_token` zu `fe_typo_user` ändern
- [ ] Redirect-Logik für authentifizierte Benutzer auf Login-Seite
- [ ] Optional: Header für Server Components setzen

### 4. Anpassung der Frontend‑Seiten

#### 4.1 Login‑Seite (`src/app/(auth)/login/page.tsx`)

**Status:** ⚠️ Muss angepasst werden

**Aktuelle Probleme:**
- Verwendet provisorische Cookie-Logik (`auth_token`)
- Keine Integration mit `useAuth` Hook
- Keine echte API-Kommunikation

**Anpassungen:**

```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading: authLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState("admin@ptls.de");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      // Redirect wird im useAuth Hook durchgeführt
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // ... Rest der Komponente
}
```

**Wichtige Punkte:**

- [ ] Integration mit `useAuth` Hook
- [ ] Entfernung der provisorischen Cookie-Logik
- [ ] Fehlerbehandlung für API-Antworten
- [ ] Loading-States korrekt anzeigen

#### 4.2 Dashboard (`src/app/(dashboard)/dashboard/page.tsx`)

**Status:** ⚠️ Muss angepasst werden

**Aktuelle Probleme:**
- Zeigt provisorische Statistik-Daten
- Keine echte API-Integration
- Keine CRUD-Operationen

**Anpassungen:**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getFahndungen } from "@/lib/typo3-client";
// ... weitere Imports

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    active: 0,
    total: 0,
    recent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Abruf der Fahndungen für Statistiken
        const response = await getFahndungen(1, 100); // Erste 100 für Statistik
        
        setStats({
          active: response.items.filter(f => f.status === "active").length,
          total: response.meta.total,
          recent: response.items.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden der Daten");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      void loadDashboardData();
    }
  }, [user, authLoading]);

  // ... Rest der Komponente mit echten Daten
}
```

**Wichtige Punkte:**

- [ ] Abruf echter Daten über `typo3-client.getFahndungen()`
- [ ] Anzeige von Statistiken basierend auf API-Daten
- [ ] Loading- und Error-States
- [ ] Integration mit Update/Delete-Workflow

#### 4.3 Weitere Seiten

**Fahndungen-Verwaltung (`/fahndungen/verwaltung`):**
- [ ] Liste der Fahndungen über `getFahndungen()` abrufen
- [ ] Delete-Funktionalität über `deleteFahndung()` implementieren
- [ ] Filter und Suche integrieren

**Neue Fahndung (`/fahndungen/neu`):**
- [ ] Formular-Validierung
- [ ] Submit über `createFahndung()` implementieren
- [ ] Erfolgsmeldung und Redirect

**Fahndung bearbeiten (`/fahndungen/[id]/edit`):**
- [ ] Daten über `getFahndung(uid)` laden
- [ ] Update über `updateFahndung(uid, data)` implementieren
- [ ] Validierung und Fehlerbehandlung

### 5. Fehlermeldungen

**Einheitliche Darstellung von Fehlern:**

- [ ] **Unautorisierte Zugriffe:** 401/403 Fehler abfangen und zur Login-Seite weiterleiten
- [ ] **Validierungsfehler:** 400 Fehler mit Feld-spezifischen Meldungen anzeigen
- [ ] **Server-Fehler:** 500 Fehler mit generischer Meldung behandeln
- [ ] **Network-Fehler:** Timeout und Verbindungsfehler abfangen

**Beispiel für Error-Boundary:**

```typescript
// src/components/ErrorDisplay.tsx
interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
      <div className="flex items-center justify-between">
        <span>{error}</span>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-2">×</button>
        )}
      </div>
    </div>
  );
}
```

### 6. Tests

#### 6.1 Manuelle Tests

**In `npm run dev` prüfen:**

- [ ] **Login-Funktionalität:**
  - Login mit gültigen Credentials funktioniert
  - Nach Login erscheint Dashboard
  - `fe_typo_user` Cookie wird gesetzt
  - Bei ungültigen Credentials wird Fehler angezeigt

- [ ] **Session-Management:**
  - Beim Neuladen der Seite bleibt Session erhalten
  - Logout funktioniert und Cookie wird entfernt
  - Nach Logout Redirect zur Login-Seite

- [ ] **Route-Schutz:**
  - Zugriff auf `/dashboard` ohne Login → Redirect zu `/login`
  - Zugriff auf `/login` mit aktiver Session → Redirect zu `/dashboard`
  - Geschützte Routen sind nur mit Session erreichbar

- [ ] **CRUD-Operationen:**
  - Fahndungen-Liste wird korrekt angezeigt
  - Neue Fahndung kann erstellt werden
  - Fahndung kann bearbeitet werden
  - Fahndung kann gelöscht werden

#### 6.2 cURL‑Tests

**Wiederholen der Tests aus Phase C2, diesmal mit Fokus auf das Verhalten des Frontends:**

```bash
# Session-Check
curl -v -X GET "http://localhost:8080/?tx_fahncore_login[action]=session" \
  -H "Cookie: fe_typo_user=..." \
  -H "Origin: http://localhost:3000"

# Login
curl -v -X POST "http://localhost:8080/?tx_fahncore_login[action]=login" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# Fahndungen abrufen (mit Cookie)
curl -v -X GET "http://localhost:8080/?tx_fahncorefahndung_api[action]=list&tx_fahncorefahndung_api[page]=1&tx_fahncorefahndung_api[limit]=10" \
  -H "Cookie: fe_typo_user=..." \
  -H "Origin: http://localhost:3000"
```

#### 6.3 Cross‑Origin‑Tests

**Überprüfen, ob CORS‑Header korrekt gesetzt sind:**

- [ ] `Access-Control-Allow-Origin` enthält Frontend-URL
- [ ] `Access-Control-Allow-Credentials: true` ist gesetzt
- [ ] `credentials: 'include'` funktioniert im Browser
- [ ] Preflight-Requests (OPTIONS) werden korrekt behandelt

**Browser-Console prüfen:**
```javascript
// In Browser-Console testen
fetch('http://localhost:8080/?tx_fahncore_login[action]=session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

## Definition of Done – PHASE C3

### ✅ TYPO3-Client
- [ ] `typo3-client.ts` ist vollständig implementiert und getestet
- [ ] Alle CRUD-Methoden funktionieren korrekt
- [ ] Login/Logout/Session-Methoden sind implementiert
- [ ] `credentials: 'include'` ist bei allen Requests gesetzt
- [ ] Fehlerbehandlung ist strukturiert implementiert

### ✅ Auth-Hook
- [ ] `useAuth.ts` ist vollständig implementiert
- [ ] State Management für `user`, `loading`, `error` funktioniert
- [ ] Session-Check beim Mounten funktioniert
- [ ] Login/Logout mit Redirect-Logik implementiert
- [ ] Fehlerbehandlung für alle API-Aufrufe vorhanden

### ✅ Middleware / Route-Schutz
- [ ] `middleware.ts` (oder `proxy.ts`) prüft auf `fe_typo_user` Cookie
- [ ] Geschützte Routen leiten nicht-authentifizierte Benutzer um
- [ ] Authentifizierte Benutzer werden von `/login` umgeleitet
- [ ] Optional: Header-Weitergabe für Server Components

### ✅ Frontend-Seiten
- [ ] Login-Seite nutzt `useAuth` Hook
- [ ] Login-Seite entfernt alle Supabase-Reste
- [ ] Dashboard zeigt echte Statistiken und Fahndungen
- [ ] Dashboard integriert Update/Delete-Workflow
- [ ] Fahndungen-Verwaltung nutzt CRUD-Operationen
- [ ] Neue Fahndung nutzt `createFahndung`
- [ ] Fahndung bearbeiten nutzt `updateFahndung`

### ✅ Fehlermeldungen
- [ ] Einheitliche Darstellung von Fehlern im UI
- [ ] Unautorisierte Zugriffe werden korrekt behandelt
- [ ] Validierungsfehler werden angezeigt
- [ ] Network-Fehler werden abgefangen

### ✅ Tests
- [ ] Manuelle Tests in `npm run dev` erfolgreich
- [ ] Login/Logout funktioniert end-to-end
- [ ] CRUD-Operationen funktionieren
- [ ] Route-Schutz funktioniert korrekt
- [ ] cURL-Tests mit Cookie-Weitergabe erfolgreich
- [ ] CORS-Header sind korrekt gesetzt
- [ ] `credentials: 'include'` funktioniert

### ✅ Code-Qualität
- [ ] TypeScript-Build ohne Fehler
- [ ] Lint-Checks ohne kritische Fehler
- [ ] Keine Console-Logs in Production-Code
- [ ] Provisorische Implementierungen entfernt

## Ausblick auf Phase C4 (Deployment)

Phase C4 wird sich mit dem Server‑Setup und der automatischen Bereitstellung beschäftigen. Schwerpunkte sind:

1. **Umgebungsvariablen:**
   - Erstellung einer `.env.local` für das Frontend mit `NEXT_PUBLIC_T3_API_BASE_URL`
   - Anpassungen für die Produktionsdomäne
   - Separate Konfigurationen für Development/Staging/Production

2. **CI/CD‑Skripte:**
   - Erstellung von `.gitlab-ci.yml` für Backend und Frontend
   - Build‑Schritte für Next.js (`pnpm build`)
   - Deployment auf den Netcup‑Server
   - Automatische Tests in CI-Pipeline

3. **Produktionsumgebung:**
   - Sicherstellung, dass CORS‑Header korrekt gesetzt sind
   - Cookie‑Sicherheit (SameSite, Secure, HttpOnly)
   - Rate‑Limiter‑Cache funktioniert in Produktion
   - Monitoring und Logging

4. **Performance:**
   - Next.js Build-Optimierungen
   - Caching-Strategien für Produktion
   - CDN-Integration (falls nötig)

## Technische Notizen

### Cookie-Handling

TYPO3 setzt das Session-Cookie `fe_typo_user` automatisch beim Login. Dieses Cookie muss bei jedem Request an die TYPO3-API mitgeschickt werden. Im Browser geschieht dies automatisch durch `credentials: 'include'` in den Fetch-Requests.

**Wichtig:**
- Cookie wird von TYPO3 gesetzt (HttpOnly, SameSite, Secure je nach Konfiguration)
- Frontend kann Cookie nicht direkt lesen (HttpOnly)
- Session-Status muss über API-Endpunkt geprüft werden (`getSession()`)

### API-Endpunkte

Die TYPO3-API nutzt Query-Parameter für Actions:

- **Fahndungen:** `/?tx_fahncorefahndung_api[action]=list|show|create|update|delete`
- **Login:** `/?tx_fahncore_login[action]=login|logout|session`

**Beispiel-URLs:**
```
GET  /?tx_fahncorefahndung_api[action]=list&tx_fahncorefahndung_api[page]=1&tx_fahncorefahndung_api[limit]=10
GET  /?tx_fahncorefahndung_api[action]=show&tx_fahncorefahndung_api[uid]=123
POST /?tx_fahncorefahndung_api[action]=create
POST /?tx_fahncorefahndung_api[action]=update&tx_fahncorefahndung_api[uid]=123
DELETE /?tx_fahncorefahndung_api[action]=delete&tx_fahncorefahndung_api[uid]=123

POST /?tx_fahncore_login[action]=login
POST /?tx_fahncore_login[action]=logout
GET  /?tx_fahncore_login[action]=session
```

### CORS-Konfiguration

Die TYPO3-API muss folgende CORS-Header setzen:

```
Access-Control-Allow-Origin: http://localhost:3000 (Development)
Access-Control-Allow-Origin: https://fahndungen.polizei-bw.de (Production)
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Diese Konfiguration sollte bereits in Phase C2 im TypoScript implementiert worden sein.

## Zusammenfassung

Durch die Arbeiten in Phase C3 soll das Next.js‑Frontend vollständig an die neu implementierte Backend‑API angebunden werden. Die Hauptaufgaben sind:

1. ✅ TYPO3-Client ist bereits vorhanden, muss ggf. angepasst werden
2. ⚠️ `useAuth` Hook muss vollständig implementiert werden
3. ⚠️ Middleware muss auf `fe_typo_user` Cookie umgestellt werden
4. ⚠️ Login-Seite muss `useAuth` integrieren
5. ⚠️ Dashboard muss echte Daten anzeigen
6. ⚠️ Weitere Seiten müssen CRUD-Operationen nutzen
7. ⚠️ Fehlerbehandlung muss einheitlich implementiert werden
8. ⚠️ Tests müssen durchgeführt werden

Nach Abschluss von Phase C3 kann das System intern getestet und anschließend in Phase C4 ausgerollt werden.


