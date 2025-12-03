# Modernes Filtersystem für Fahndungen

## Übersicht

Das neue Filtersystem wurde komplett überarbeitet, um eine intuitive, barrierefreie und mobile-optimierte Benutzererfahrung zu bieten. Es fokussiert sich auf die wichtigsten Filterkriterien: **Ort/Dienststelle** und **Fahndungsart**.

## Komponenten

### 1. ModernFahndungFilter
Die Hauptkomponente, die alle Filterfunktionen zusammenführt.

**Features:**
- **Dienststellen-Filter**: Alle LKA BW Dienststellen (Aalen, Freiburg, Heilbronn, etc.)
- **Tatort-Filter**: Dynamisch aus den Fahndungsdaten generiert
- **Fahndungsart-Filter**: Straftäter, Vermisste, Unbekannte Tote, Sachen
- **Status & Priorität**: Bestehende Filter erweitert
- **Zeit-Filter**: 24h, 7d, 30d
- **Live-Suche**: Echtzeit-Filterung

### 2. LocationFilter
Spezialisierte Komponente für die Tatort-Filterung.

**Features:**
- Dynamische Generierung aus Fahndungsdaten
- Suchfunktion innerhalb der Orte
- "Alle auswählen/abwählen" Funktion
- Barrierefreie Dropdown-Implementierung

### 3. FilterChips
Anzeige der aktiven Filter als entfernbare Chips.

**Features:**
- Farbkodierte Kategorien
- Einzelne Entfernung per Klick
- Responsive Design
- WCAG-konforme Implementierung

## Filter-Strategie

### Priorität 1: Ort & Fahndungsart
1. **Dienststellen**: LKA BW Standorte
2. **Tatorte**: Wo das Verbrechen passiert ist
3. **Fahndungsart**: Straftäter, Vermisste, Unbekannte Tote, Sachen

### Priorität 2: Status & Zeit
1. **Status**: Aktiv, Veröffentlicht, Entwurf
2. **Priorität**: Dringend, Normal, Neu
3. **Zeitraum**: Letzte 24h, 7 Tage, 30 Tage

## Barrierefreiheit (WCAG 2.1)

### Implementierte Features:
- ✅ **Labels**: Alle Eingabefelder haben sichtbare Labels
- ✅ **ARIA-Attribute**: `aria-expanded`, `aria-selected`, `aria-haspopup`
- ✅ **Fokusindikatoren**: Blaue Ringe bei Fokus
- ✅ **Kontrast**: Ausreichender Kontrast in Light/Dark Mode
- ✅ **Tastaturnavigation**: Vollständige Tastaturbedienung
- ✅ **Screen Reader**: Semantische HTML-Struktur

### Mobile Optimierung:
- ✅ **Touch-freundlich**: Große Touch-Targets (44px+)
- ✅ **Responsive**: Anpassung an verschiedene Bildschirmgrößen
- ✅ **Gesten**: Swipe-freundliche Dropdowns
- ✅ **Performance**: Optimierte Rendering-Performance

## Verwendung

```tsx
import { ModernFahndungFilter, type ModernFilterState } from "~/components/filtersystem";

// In Ihrer Komponente
const [filters, setFilters] = useState<ModernFilterState>({
  stations: [],
  locations: [],
  types: [],
  status: [],
  priority: [],
  timeRange: "all",
  searchTerm: "",
});

// Verfügbare Tatorte aus den Daten extrahieren
const availableLocations = useMemo(() => {
  // Extraktion der verfügbaren Orte aus Ihren Daten
}, [data]);

return (
  <ModernFahndungFilter
    onFilterChange={setFilters}
    availableLocations={availableLocations}
  />
);
```

## Filter-Logik

Die Filterlogik in `HomeContent.tsx` wurde erweitert:

```tsx
// Dienststellen Filter
if (activeFilters.stations.length > 0 && !activeFilters.stations.includes(inv.station)) {
  return false;
}

// Tatort Filter
if (activeFilters.locations.length > 0 && !activeFilters.locations.includes(inv.location)) {
  return false;
}

// Fahndungsart Filter (über Tags oder category)
if (activeFilters.types.length > 0) {
  const hasMatchingType = activeFilters.types.some((type) => {
    const typeLower = type.toLowerCase();
    const matchesTags = inv.tags?.some((tag: string) => tag.toLowerCase().includes(typeLower));
    const matchesCategory = inv.category?.toLowerCase().includes(typeLower);
    return matchesTags || matchesCategory;
  });
  if (!hasMatchingType) return false;
}
```

## LKA BW Dienststellen

Die folgenden Dienststellen sind verfügbar:
- Aalen
- Freiburg
- Heilbronn
- Karlsruhe
- Konstanz
- Ludwigsburg
- Mannheim
- Offenburg
- Pforzheim
- Ravensburg
- Reutlingen
- Stuttgart
- Ulm

## Fahndungsarten

- **Straftäter** (rot): Gesuchte Personen
- **Vermisste** (blau): Vermisste Personen
- **Unbekannte Tote** (grau): Unidentifizierte Tote
- **Sachen** (grün): Gestohlene oder gesuchte Gegenstände

## Performance-Optimierungen

1. **Memoization**: `useMemo` für gefilterte Ergebnisse
2. **Debouncing**: Suchbegriff-Filterung
3. **Lazy Loading**: Dropdown-Inhalte werden bei Bedarf geladen
4. **Virtual Scrolling**: Für große Listen vorbereitet

## Zukünftige Erweiterungen

- [ ] **URL-Parameter**: Filter-Zustand in URL speichern
- [ ] **Persistierung**: Filter-Einstellungen im Local Storage
- [ ] **Erweiterte Suche**: Volltext-Suche mit Highlighting
- [ ] **Filter-Vorschläge**: Intelligente Filter-Empfehlungen
- [ ] **Export-Funktionen**: Gefilterte Ergebnisse exportieren
